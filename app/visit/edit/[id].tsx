// T28: Edit Visit Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { runInTransaction } from '@/db/database';
import { getVisitWithDetails, updateVisit } from '@/db/visits';
import { insertCafe, getCafeByGooglePlaceId } from '@/db/cafes';
import { insertDrink, updateDrink, deleteDrink } from '@/db/drinks';
import { insertPhoto, deletePhoto } from '@/db/photos';
import { pickPhotos, savePhotoToStorage, deletePhotoFile } from '@/utils/photos';
import { CafeSearchBar } from '@/components/CafeSearchBar';
import { DrinkRow } from '@/components/DrinkRow';
import { RatingSlider } from '@/components/RatingSlider';
import { PhotoStrip } from '@/components/PhotoStrip';
import {
  getDimensionsByCategory,
  EXPERIENCE_CATEGORIES,
} from '@/constants/experienceDimensions';
import { generateUUID } from '@/utils/uuid';
import { computeOverallRating, computeCoffeeQuality } from '@/utils/ratings';
import type { Cafe, Visit, Drink, DrinkFormData, ExperienceDimensionKey } from '@/types';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function EditVisitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Originals for reconciliation
  const [originalDrinkIds, setOriginalDrinkIds] = useState<Set<string>>(new Set());
  // Map of file_path → photo DB id for existing photos
  const [originalPhotoMap, setOriginalPhotoMap] = useState<Map<string, string>>(new Map());

  // Form state
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [googleCafeSelection, setGoogleCafeSelection] = useState<
    Omit<Cafe, 'id' | 'created_at' | 'updated_at'> | null
  >(null);
  const [cafeName, setCafeName] = useState('');
  const [cafeAddress, setCafeAddress] = useState('');
  const [cafeCity, setCafeCity] = useState('');
  const [cafeCountry, setCafeCountry] = useState('');
  const [visitedAt, setVisitedAt] = useState('');
  const [drinks, setDrinks] = useState<DrinkFormData[]>([]);
  const [experienceRatings, setExperienceRatings] = useState<
    Partial<Record<ExperienceDimensionKey, number>>
  >({});
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [ratingsExpanded, setRatingsExpanded] = useState(false);

  // Load existing visit on mount
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await getVisitWithDetails(id);
        if (!data) {
          setLoading(false);
          return;
        }

        // Cafe
        setSelectedCafe(data.cafe);
        setCafeName(data.cafe.name);
        setCafeAddress(data.cafe.address);
        setCafeCity(data.cafe.city);
        setCafeCountry(data.cafe.country);

        // Date
        setVisitedAt(data.visited_at);

        // Drinks — preserve original UUIDs for reconciliation
        setDrinks(
          data.drinks.map((d) => ({
            id: d.id,
            name: d.name,
            type: d.type,
            rating: d.rating,
            notes: d.notes ?? '',
          }))
        );
        setOriginalDrinkIds(new Set(data.drinks.map((d) => d.id)));

        // Experience ratings — only non-null values
        const ratings: Partial<Record<ExperienceDimensionKey, number>> = {};
        const ratingKeys: ExperienceDimensionKey[] = [
          'coffee_quality',
          'interior_design',
          'vibe',
          'work_friendliness',
          'location_surroundings',
          'value',
          'wait_time',
          'food_pastries',
        ];
        for (const key of ratingKeys) {
          const val = data[key as keyof typeof data];
          if (typeof val === 'number') ratings[key] = val;
        }
        setExperienceRatings(ratings);

        // Photos — file paths already on disk
        const pathToId = new Map<string, string>();
        data.photos.forEach((p) => pathToId.set(p.file_path, p.id));
        setOriginalPhotoMap(pathToId);
        setPhotos(data.photos.map((p) => p.file_path));

        setNotes(data.notes ?? '');
      } catch (err) {
        console.error('Failed to load visit for editing:', err);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleClearCafe = () => {
    setSelectedCafe(null);
    setGoogleCafeSelection(null);
    setCafeName('');
    setCafeAddress('');
    setCafeCity('');
    setCafeCountry('');
    setShowManualEntry(false);
  };

  const handleCafeSelectFromGoogle = async (
    cafeData: Omit<Cafe, 'id' | 'created_at' | 'updated_at'>
  ) => {
    if (cafeData.google_place_id) {
      try {
        const existing = await getCafeByGooglePlaceId(cafeData.google_place_id);
        if (existing) {
          setSelectedCafe(existing);
          setGoogleCafeSelection(null);
          setCafeName(existing.name);
          setCafeAddress(existing.address);
          setCafeCity(existing.city);
          setCafeCountry(existing.country);
          return;
        }
      } catch (err) {
        console.error('[EditVisit] cafe lookup error:', err);
      }
    }
    setSelectedCafe(null);
    setGoogleCafeSelection(cafeData);
    setCafeName(cafeData.name);
    setCafeAddress(cafeData.address);
    setCafeCity(cafeData.city);
    setCafeCountry(cafeData.country);
  };

  const handleAddPhotos = async () => {
    try {
      const uris = await pickPhotos();
      if (uris.length > 0) {
        setPhotos((prev) => [...prev, ...uris]);
      }
    } catch (err) {
      const code = (err as Error & { code?: string }).code;
      if (code === 'PERMISSION_DENIED') {
        Alert.alert(
          'Photos Access Denied',
          'BrewLog needs access to your photo library. Please enable it in Settings.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Failed to pick photos. Please try again.');
      }
    }
  };

  const handleSave = async () => {
    if (!id || typeof id !== 'string') {
      return;
    }
    if (cafeName.trim().length === 0) {
      Alert.alert('Missing Info', 'Please enter a cafe name.');
      return;
    }
    const validDrinks = drinks.filter((d) => d.type.length > 0);
    if (validDrinks.length === 0) {
      Alert.alert('Missing Info', 'Please add at least one drink with a type selected.');
      return;
    }

    setSaving(true);
    try {
      // 1. Resolve cafe ID
      let cafeId: string;
      if (selectedCafe) {
        cafeId = selectedCafe.id;
      } else if (googleCafeSelection) {
        if (googleCafeSelection.google_place_id) {
          const existing = await getCafeByGooglePlaceId(
            googleCafeSelection.google_place_id
          );
          cafeId = existing ? existing.id : generateUUID();
          if (!existing) {
            await insertCafe({ id: cafeId, ...googleCafeSelection });
          }
        } else {
          cafeId = generateUUID();
          await insertCafe({ id: cafeId, ...googleCafeSelection });
        }
      } else {
        cafeId = generateUUID();
        await insertCafe({
          id: cafeId,
          google_place_id: null,
          name: cafeName.trim(),
          address: cafeAddress.trim(),
          city: cafeCity.trim(),
          country: cafeCountry.trim(),
          latitude: 0,
          longitude: 0,
        });
      }

      // 2. Build temp Visit for rating computation
      const tempVisit: Visit = {
        id: id!,
        cafe_id: cafeId,
        visited_at: visitedAt,
        notes: notes.trim() || null,
        overall_rating: null,
        coffee_quality: experienceRatings.coffee_quality ?? null,
        interior_design: experienceRatings.interior_design ?? null,
        vibe: experienceRatings.vibe ?? null,
        work_friendliness: experienceRatings.work_friendliness ?? null,
        location_surroundings: experienceRatings.location_surroundings ?? null,
        value: experienceRatings.value ?? null,
        wait_time: experienceRatings.wait_time ?? null,
        food_pastries: experienceRatings.food_pastries ?? null,
        created_at: '',
        updated_at: '',
      };

      const drinkObjects: Drink[] = validDrinks.map((d) => ({
        id: d.id,
        visit_id: id!,
        name: d.name.trim() || d.type,
        type: d.type,
        rating: d.rating || 5,
        notes: d.notes.trim() || null,
        created_at: '',
      }));

      if (tempVisit.coffee_quality == null) {
        tempVisit.coffee_quality = computeCoffeeQuality(drinkObjects);
      }
      tempVisit.overall_rating = computeOverallRating(tempVisit);

      // 3-5. Pre-compute photo file work before atomic DB transaction
      const currentPhotoPaths = new Set(photos);

      // Save new picker URIs to storage first (file I/O outside transaction)
      const survivingOriginalCount = [...originalPhotoMap.keys()].filter(
        (p) => currentPhotoPaths.has(p)
      ).length;
      let nextSortOrder = survivingOriginalCount;
      type NewPhotoEntry = { savedPath: string; sortOrder: number };
      const newPhotoEntries: NewPhotoEntry[] = [];
      const newlySavedPaths: string[] = [];

      try {
        for (const photoPath of photos) {
          if (!originalPhotoMap.has(photoPath)) {
            const savedPath = await savePhotoToStorage(photoPath);
            newlySavedPaths.push(savedPath);
            newPhotoEntries.push({ savedPath, sortOrder: nextSortOrder });
            nextSortOrder++;
          }
        }
      } catch (photoErr) {
        for (const fp of newlySavedPaths) {
          deletePhotoFile(fp);
        }
        throw photoErr;
      }

      // Collect paths to delete from disk after DB commit
      const pathsToDeleteFromDisk: string[] = [];
      for (const origPath of originalPhotoMap.keys()) {
        if (!currentPhotoPaths.has(origPath)) {
          pathsToDeleteFromDisk.push(origPath);
        }
      }

      // Atomic DB transaction — steps 3, 4, 5 (DB only)
      await runInTransaction(async () => {
        // 3. Update visit row
        await updateVisit(id!, {
          cafe_id: cafeId,
          visited_at: tempVisit.visited_at,
          notes: tempVisit.notes,
          overall_rating: tempVisit.overall_rating,
          coffee_quality: tempVisit.coffee_quality,
          interior_design: tempVisit.interior_design,
          vibe: tempVisit.vibe,
          work_friendliness: tempVisit.work_friendliness,
          location_surroundings: tempVisit.location_surroundings,
          value: tempVisit.value,
          wait_time: tempVisit.wait_time,
          food_pastries: tempVisit.food_pastries,
        });

        // 4. Reconcile drinks
        const currentDrinkIds = new Set(drinkObjects.map((d) => d.id));
        for (const origId of originalDrinkIds) {
          if (!currentDrinkIds.has(origId)) {
            await deleteDrink(origId);
          }
        }
        for (const drink of drinkObjects) {
          if (originalDrinkIds.has(drink.id)) {
            await updateDrink(drink.id, {
              name: drink.name,
              type: drink.type,
              rating: drink.rating,
              notes: drink.notes,
            });
          } else {
            await insertDrink({
              id: drink.id,
              visit_id: id!,
              name: drink.name,
              type: drink.type,
              rating: drink.rating,
              notes: drink.notes,
            });
          }
        }

        // 5. Photo DB ops (file I/O already done above)
        for (const [origPath, photoDbId] of originalPhotoMap.entries()) {
          if (!currentPhotoPaths.has(origPath)) {
            await deletePhoto(photoDbId);
          }
        }
        for (const { savedPath, sortOrder } of newPhotoEntries) {
          await insertPhoto({
            id: generateUUID(),
            visit_id: id!,
            file_path: savedPath,
            sort_order: sortOrder,
          });
        }
      });

      // After DB commit: delete removed photo files from disk
      for (const origPath of pathsToDeleteFromDisk) {
        try {
          deletePhotoFile(origPath);
        } catch (fileErr) {
          console.error('[EditVisit] failed to delete photo file:', origPath, fileErr);
        }
      }

      router.back();
    } catch (err) {
      console.error('Failed to save edit:', err);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const dimensionsByCategory = getDimensionsByCategory();
  const dateParts = visitedAt.split('-');
  const displayYear = dateParts[0] ?? String(new Date().getFullYear());
  const displayMonth = dateParts[1]
    ? MONTHS[parseInt(dateParts[1], 10) - 1] ?? 'January'
    : 'January';
  const displayDay = dateParts[2] ?? '1';

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#8B5E3C" />
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color="#D4C4B0" />
        <Text style={styles.errorText}>Failed to load visit</Text>
      </View>
    );
  }

  if (!visitedAt) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color="#D4C4B0" />
        <Text style={styles.errorText}>Visit not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Cafe */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cafe</Text>
            {selectedCafe || googleCafeSelection ? (
              <View style={styles.selectedCafeCard}>
                <View style={styles.selectedCafeInfo}>
                  <Text style={styles.selectedCafeName}>
                    {selectedCafe ? selectedCafe.name : googleCafeSelection!.name}
                  </Text>
                  <Text style={styles.selectedCafeAddress}>
                    {selectedCafe
                      ? `${selectedCafe.address}${selectedCafe.city ? `, ${selectedCafe.city}` : ''}`
                      : `${googleCafeSelection!.address}${googleCafeSelection!.city ? `, ${googleCafeSelection!.city}` : ''}`}
                  </Text>
                </View>
                <TouchableOpacity onPress={handleClearCafe} activeOpacity={0.7}>
                  <Ionicons name="close-circle" size={24} color="#B0A090" />
                </TouchableOpacity>
              </View>
            ) : showManualEntry ? (
              <>
                <TextInput
                  style={styles.input}
                  value={cafeName}
                  onChangeText={setCafeName}
                  placeholder="Cafe name"
                  placeholderTextColor="#B0A090"
                />
                <TextInput
                  style={styles.input}
                  value={cafeAddress}
                  onChangeText={setCafeAddress}
                  placeholder="Address"
                  placeholderTextColor="#B0A090"
                />
                <View style={styles.rowInputs}>
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    value={cafeCity}
                    onChangeText={setCafeCity}
                    placeholder="City"
                    placeholderTextColor="#B0A090"
                  />
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    value={cafeCountry}
                    onChangeText={setCafeCountry}
                    placeholder="Country"
                    placeholderTextColor="#B0A090"
                  />
                </View>
                <TouchableOpacity
                  onPress={() => setShowManualEntry(false)}
                  style={styles.backToSearchButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="search-outline" size={15} color="#8B5E3C" />
                  <Text style={styles.backToSearchText}>Search instead</Text>
                </TouchableOpacity>
              </>
            ) : (
              <CafeSearchBar
                onSelect={(cafeData) => {
                  handleCafeSelectFromGoogle(cafeData).catch((err) =>
                    console.error('[EditVisit] cafe select error:', err)
                  );
                }}
                onManualEntry={() => setShowManualEntry(true)}
              />
            )}
          </View>

          {/* Date */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="calendar-outline" size={18} color="#8B5E3C" />
              <Text style={styles.dateButtonText}>
                {displayMonth} {displayDay}, {displayYear}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#8B5E3C" />
            </TouchableOpacity>
          </View>

          <DatePickerModal
            visible={showDatePicker}
            value={visitedAt}
            onConfirm={(date) => {
              setVisitedAt(date);
              setShowDatePicker(false);
            }}
            onCancel={() => setShowDatePicker(false)}
          />

          {/* Drinks */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Drinks</Text>
            {drinks.map((drink, index) => (
              <DrinkRow
                key={drink.id}
                drink={drink}
                onChange={(updated) =>
                  setDrinks((prev) => prev.map((d, i) => (i === index ? updated : d)))
                }
                onDelete={() => {
                  if (drinks.length <= 1) {
                    Alert.alert('Required', 'At least one drink is required.');
                    return;
                  }
                  setDrinks((prev) => prev.filter((_, i) => i !== index));
                }}
              />
            ))}
            <TouchableOpacity
              onPress={() =>
                setDrinks((prev) => [
                  ...prev,
                  { id: generateUUID(), name: '', type: '', rating: 0, notes: '' },
                ])
              }
              style={styles.addDrinkButton}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={20} color="#8B5E3C" />
              <Text style={styles.addDrinkText}>Add Drink</Text>
            </TouchableOpacity>
          </View>

          {/* Experience Ratings */}
          <View style={styles.section}>
            <TouchableOpacity
              onPress={() => setRatingsExpanded((prev) => !prev)}
              style={styles.collapsibleHeader}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionTitle}>Experience Ratings</Text>
              <Ionicons
                name={ratingsExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#8B5E3C"
              />
            </TouchableOpacity>
            {!ratingsExpanded && (
              <Text style={styles.collapsedHint}>
                Tap to rate the cafe experience (optional)
              </Text>
            )}
            {ratingsExpanded &&
              EXPERIENCE_CATEGORIES.map((category) => (
                <View key={category} style={styles.ratingCategory}>
                  <Text style={styles.ratingCategoryTitle}>{category}</Text>
                  {dimensionsByCategory[category].map((dim) => (
                    <RatingSlider
                      key={dim.key}
                      label={dim.label}
                      value={experienceRatings[dim.key] ?? null}
                      onChange={(val) =>
                        setExperienceRatings((prev) => {
                          const next = { ...prev };
                          if (val == null) delete next[dim.key];
                          else next[dim.key] = val;
                          return next;
                        })
                      }
                      optional
                    />
                  ))}
                </View>
              ))}
          </View>

          {/* Photos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <PhotoStrip
              photos={photos}
              editable
              onAdd={handleAddPhotos}
              onDelete={(index) =>
                setPhotos((prev) => prev.filter((_, i) => i !== index))
              }
            />
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="How was it?"
              placeholderTextColor="#B0A090"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        <View style={styles.saveContainer}>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            activeOpacity={0.8}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Identical date picker to Add Visit (no shared component — YAGNI)
function DatePickerModal({
  visible,
  value,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  value: string;
  onConfirm: (date: string) => void;
  onCancel: () => void;
}) {
  const parts = value.split('-');
  const [year, setYear] = useState(parseInt(parts[0] ?? '2026', 10));
  const [month, setMonth] = useState(parseInt(parts[1] ?? '1', 10));
  const [day, setDay] = useState(parseInt(parts[2] ?? '1', 10));

  useEffect(() => {
    const p = value.split('-');
    setYear(parseInt(p[0] ?? '2026', 10));
    setMonth(parseInt(p[1] ?? '1', 10));
    setDay(parseInt(p[2] ?? '1', 10));
  }, [value, visible]);

  const years: number[] = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= currentYear - 5; y--) years.push(y);

  const daysInMonth = new Date(year, month, 0).getDate();
  const days: number[] = [];
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const handleConfirm = () => {
    const clampedDay = Math.min(day, daysInMonth);
    onConfirm(
      `${year}-${String(month).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={dpStyles.overlay}>
        <View style={dpStyles.container}>
          <Text style={dpStyles.title}>Select Date</Text>
          <View style={dpStyles.pickerRow}>
            {/* Year */}
            <View style={dpStyles.pickerColumn}>
              <Text style={dpStyles.pickerLabel}>Year</Text>
              <FlatList
                data={years}
                keyExtractor={(item) => String(item)}
                style={dpStyles.list}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => setYear(item)}
                    style={[dpStyles.option, year === item && dpStyles.optionSelected]}
                  >
                    <Text style={[dpStyles.optionText, year === item && dpStyles.optionTextSelected]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
            {/* Month */}
            <View style={dpStyles.pickerColumn}>
              <Text style={dpStyles.pickerLabel}>Month</Text>
              <FlatList
                data={MONTHS.map((m, i) => ({ name: m, num: i + 1 }))}
                keyExtractor={(item) => String(item.num)}
                style={dpStyles.list}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => setMonth(item.num)}
                    style={[dpStyles.option, month === item.num && dpStyles.optionSelected]}
                  >
                    <Text style={[dpStyles.optionText, month === item.num && dpStyles.optionTextSelected]}>
                      {item.name.slice(0, 3)}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
            {/* Day */}
            <View style={dpStyles.pickerColumn}>
              <Text style={dpStyles.pickerLabel}>Day</Text>
              <FlatList
                data={days}
                keyExtractor={(item) => String(item)}
                style={dpStyles.list}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => setDay(item)}
                    style={[dpStyles.option, day === item && dpStyles.optionSelected]}
                  >
                    <Text style={[dpStyles.optionText, day === item && dpStyles.optionTextSelected]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
          <View style={dpStyles.buttons}>
            <TouchableOpacity onPress={onCancel} style={dpStyles.cancelButton}>
              <Text style={dpStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={dpStyles.confirmButton}>
              <Text style={dpStyles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const dpStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  container: { backgroundColor: '#FFFAF5', borderRadius: 16, padding: 20, width: '85%', maxHeight: '60%' },
  title: { fontSize: 18, fontWeight: '700', color: '#3C2A1A', textAlign: 'center', marginBottom: 16 },
  pickerRow: { flexDirection: 'row', gap: 8 },
  pickerColumn: { flex: 1 },
  pickerLabel: { fontSize: 12, fontWeight: '600', color: '#8B7B6B', textAlign: 'center', marginBottom: 8 },
  list: { maxHeight: 200 },
  option: { paddingVertical: 8, paddingHorizontal: 6, borderRadius: 6, alignItems: 'center' },
  optionSelected: { backgroundColor: '#8B5E3C' },
  optionText: { fontSize: 14, color: '#3C2A1A' },
  optionTextSelected: { color: '#FFFFFF', fontWeight: '700' },
  buttons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 20 },
  cancelButton: { paddingVertical: 10, paddingHorizontal: 20 },
  cancelText: { fontSize: 15, color: '#8B7B6B', fontWeight: '600' },
  confirmButton: { backgroundColor: '#8B5E3C', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20 },
  confirmText: { fontSize: 15, color: '#FFFFFF', fontWeight: '700' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFAF5' },
  flex: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFAF5' },
  errorText: { fontSize: 16, color: '#8B7B6B', marginTop: 12 },
  scrollContent: { paddingBottom: 20 },
  section: { paddingHorizontal: 16, paddingVertical: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#3C2A1A', marginBottom: 10 },
  input: {
    backgroundColor: '#F5EDE3', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: '#3C2A1A', marginBottom: 10,
  },
  rowInputs: { flexDirection: 'row', gap: 10 },
  halfInput: { flex: 1 },
  selectedCafeCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F5EDE3', borderRadius: 10, padding: 12,
  },
  selectedCafeInfo: { flex: 1, marginRight: 8 },
  selectedCafeName: { fontSize: 16, fontWeight: '700', color: '#3C2A1A' },
  selectedCafeAddress: { fontSize: 13, color: '#8B7B6B', marginTop: 2 },
  backToSearchButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 8 },
  backToSearchText: { fontSize: 13, fontWeight: '600', color: '#8B5E3C' },
  dateButton: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F5EDE3', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, gap: 8,
  },
  dateButtonText: { fontSize: 15, color: '#3C2A1A', flex: 1 },
  addDrinkButton: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 12, gap: 6,
  },
  addDrinkText: { fontSize: 15, fontWeight: '600', color: '#8B5E3C' },
  collapsibleHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  collapsedHint: { fontSize: 13, color: '#B0A090', marginTop: 4 },
  ratingCategory: { marginTop: 16 },
  ratingCategoryTitle: {
    fontSize: 14, fontWeight: '700', color: '#8B5E3C',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10,
  },
  notesInput: {
    backgroundColor: '#F5EDE3', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: '#3C2A1A', minHeight: 100,
  },
  bottomSpacer: { height: 80 },
  saveContainer: {
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#FFFAF5',
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E8DDD0',
  },
  saveButton: { backgroundColor: '#6B4226', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
});
