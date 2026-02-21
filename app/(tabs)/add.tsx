// T19: Add Visit Screen
import React, { useState, useCallback, useEffect, useRef } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { insertCafe, getAllCafes } from '@/db/cafes';
import { insertVisit } from '@/db/visits';
import { insertDrinks } from '@/db/drinks';
import { useAppStore } from '@/stores/useAppStore';
import { DrinkRow } from '@/components/DrinkRow';
import { RatingSlider } from '@/components/RatingSlider';
import { PhotoStrip } from '@/components/PhotoStrip';
import {
  getDimensionsByCategory,
  EXPERIENCE_CATEGORIES,
} from '@/constants/experienceDimensions';
import { generateUUID } from '@/utils/uuid';
import { computeOverallRating, computeCoffeeQuality } from '@/utils/ratings';
import type {
  Cafe,
  Visit,
  Drink,
  DrinkFormData,
  ExperienceDimensionKey,
  VisitFormData,
} from '@/types';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getDefaultFormData(): VisitFormData {
  return {
    cafe: null,
    visited_at: new Date().toISOString().split('T')[0],
    drinks: [
      { id: generateUUID(), name: '', type: '', rating: 0, notes: '' },
    ],
    experience_ratings: {},
    photos: [],
    notes: '',
  };
}

export default function AddVisitScreen() {
  const { visitFormDraft, setVisitFormDraft, clearVisitFormDraft } =
    useAppStore();

  const [cafeName, setCafeName] = useState('');
  const [cafeAddress, setCafeAddress] = useState('');
  const [cafeCity, setCafeCity] = useState('');
  const [cafeCountry, setCafeCountry] = useState('');
  const [matchingCafes, setMatchingCafes] = useState<Cafe[]>([]);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [visitedAt, setVisitedAt] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [drinks, setDrinks] = useState<DrinkFormData[]>([
    { id: generateUUID(), name: '', type: '', rating: 0, notes: '' },
  ]);
  const [experienceRatings, setExperienceRatings] = useState<
    Partial<Record<ExperienceDimensionKey, number>>
  >({});
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [ratingsExpanded, setRatingsExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const draftSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasRestoredDraft = useRef(false);

  // Restore draft on mount
  useEffect(() => {
    if (hasRestoredDraft.current) return;
    hasRestoredDraft.current = true;

    if (visitFormDraft) {
      if (visitFormDraft.cafe) {
        setSelectedCafe(visitFormDraft.cafe);
        setCafeName(visitFormDraft.cafe.name);
        setCafeAddress(visitFormDraft.cafe.address);
        setCafeCity(visitFormDraft.cafe.city);
        setCafeCountry(visitFormDraft.cafe.country);
      }
      if (visitFormDraft.visited_at) setVisitedAt(visitFormDraft.visited_at);
      if (visitFormDraft.drinks && visitFormDraft.drinks.length > 0) {
        setDrinks(visitFormDraft.drinks);
      }
      if (visitFormDraft.experience_ratings) {
        setExperienceRatings(visitFormDraft.experience_ratings);
      }
      if (visitFormDraft.photos) setPhotos(visitFormDraft.photos);
      if (visitFormDraft.notes) setNotes(visitFormDraft.notes);
    }
  }, [visitFormDraft]);

  // Auto-save draft (debounced)
  useEffect(() => {
    if (draftSaveTimer.current) {
      clearTimeout(draftSaveTimer.current);
    }
    draftSaveTimer.current = setTimeout(() => {
      setVisitFormDraft({
        cafe: selectedCafe,
        visited_at: visitedAt,
        drinks,
        experience_ratings: experienceRatings,
        photos,
        notes,
      });
    }, 500);

    return () => {
      if (draftSaveTimer.current) {
        clearTimeout(draftSaveTimer.current);
      }
    };
  }, [
    cafeName,
    cafeAddress,
    cafeCity,
    cafeCountry,
    selectedCafe,
    visitedAt,
    drinks,
    experienceRatings,
    photos,
    notes,
    setVisitFormDraft,
  ]);

  // Search for matching cafes when name changes
  useEffect(() => {
    if (cafeName.length < 2 || selectedCafe) {
      setMatchingCafes([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const allCafes = await getAllCafes();
        const lowerName = cafeName.toLowerCase();
        const matches = allCafes.filter((c) =>
          c.name.toLowerCase().includes(lowerName)
        );
        if (!cancelled) {
          setMatchingCafes(matches.slice(0, 5));
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cafeName, selectedCafe]);

  const handleSelectExistingCafe = (cafe: Cafe) => {
    setSelectedCafe(cafe);
    setCafeName(cafe.name);
    setCafeAddress(cafe.address);
    setCafeCity(cafe.city);
    setCafeCountry(cafe.country);
    setMatchingCafes([]);
  };

  const handleClearSelectedCafe = () => {
    setSelectedCafe(null);
    setCafeName('');
    setCafeAddress('');
    setCafeCity('');
    setCafeCountry('');
  };

  const handleAddDrink = () => {
    setDrinks((prev) => [
      ...prev,
      { id: generateUUID(), name: '', type: '', rating: 0, notes: '' },
    ]);
  };

  const handleUpdateDrink = (index: number, updated: DrinkFormData) => {
    setDrinks((prev) => prev.map((d, i) => (i === index ? updated : d)));
  };

  const handleDeleteDrink = (index: number) => {
    if (drinks.length <= 1) {
      Alert.alert('Required', 'At least one drink is required.');
      return;
    }
    setDrinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExperienceRatingChange = (
    key: ExperienceDimensionKey,
    value: number | null
  ) => {
    setExperienceRatings((prev) => {
      const next = { ...prev };
      if (value == null) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  };

  const handleSave = async () => {
    // Validate cafe name
    if (cafeName.trim().length === 0) {
      Alert.alert('Missing Info', 'Please enter a cafe name.');
      return;
    }

    // Validate at least 1 drink with type
    const validDrinks = drinks.filter((d) => d.type.length > 0);
    if (validDrinks.length === 0) {
      Alert.alert(
        'Missing Info',
        'Please add at least one drink with a type selected.'
      );
      return;
    }

    setSaving(true);

    try {
      // Create or reuse cafe
      let cafeId: string;
      if (selectedCafe) {
        cafeId = selectedCafe.id;
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

      // Generate visit ID
      const visitId = generateUUID();

      // Build a temporary Visit object for rating computation
      const tempVisit: Visit = {
        id: visitId,
        cafe_id: cafeId,
        visited_at: visitedAt,
        notes: notes.trim() || null,
        overall_rating: null,
        coffee_quality: null,
        interior_design: experienceRatings.interior_design ?? null,
        vibe: experienceRatings.vibe ?? null,
        work_friendliness: experienceRatings.work_friendliness ?? null,
        location_surroundings:
          experienceRatings.location_surroundings ?? null,
        value: experienceRatings.value ?? null,
        wait_time: experienceRatings.wait_time ?? null,
        food_pastries: experienceRatings.food_pastries ?? null,
        created_at: '',
        updated_at: '',
      };

      // Build drink objects for coffee quality computation
      const drinkObjects: Drink[] = validDrinks.map((d) => ({
        id: d.id,
        visit_id: visitId,
        name: d.name.trim() || d.type,
        type: d.type,
        rating: d.rating || 5,
        notes: d.notes.trim() || null,
        created_at: '',
      }));

      // Compute ratings
      // Set coffee_quality from experience ratings if provided, otherwise compute from drinks
      tempVisit.coffee_quality =
        experienceRatings.coffee_quality ??
        computeCoffeeQuality(drinkObjects);
      tempVisit.overall_rating = computeOverallRating(tempVisit);

      // Insert visit
      await insertVisit({
        id: tempVisit.id,
        cafe_id: tempVisit.cafe_id,
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

      // Insert drinks
      await insertDrinks(
        drinkObjects.map((d) => ({
          id: d.id,
          visit_id: d.visit_id,
          name: d.name,
          type: d.type,
          rating: d.rating,
          notes: d.notes,
        }))
      );

      // Clear draft and navigate
      clearVisitFormDraft();
      resetForm();
      router.push('/(tabs)/');
    } catch (error) {
      console.error('Failed to save visit:', error);
      Alert.alert('Error', 'Failed to save visit. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setCafeName('');
    setCafeAddress('');
    setCafeCity('');
    setCafeCountry('');
    setSelectedCafe(null);
    setVisitedAt(new Date().toISOString().split('T')[0]);
    setDrinks([
      { id: generateUUID(), name: '', type: '', rating: 0, notes: '' },
    ]);
    setExperienceRatings({});
    setPhotos([]);
    setNotes('');
    setRatingsExpanded(false);
  };

  const dimensionsByCategory = getDimensionsByCategory();

  // Parse date for display
  const dateParts = visitedAt.split('-');
  const displayYear = dateParts[0] ?? String(new Date().getFullYear());
  const displayMonth = dateParts[1]
    ? MONTHS[parseInt(dateParts[1], 10) - 1] ?? 'January'
    : 'January';
  const displayDay = dateParts[2] ?? '1';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
          {/* Header */}
          <View style={styles.headerSection}>
            <Text style={styles.headerTitle}>Log a Visit</Text>
          </View>

          {/* Cafe Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cafe</Text>
            {selectedCafe ? (
              <View style={styles.selectedCafeCard}>
                <View style={styles.selectedCafeInfo}>
                  <Text style={styles.selectedCafeName}>
                    {selectedCafe.name}
                  </Text>
                  <Text style={styles.selectedCafeAddress}>
                    {selectedCafe.address}
                    {selectedCafe.city ? `, ${selectedCafe.city}` : ''}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleClearSelectedCafe}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={24} color="#B0A090" />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <TextInput
                  style={styles.input}
                  value={cafeName}
                  onChangeText={setCafeName}
                  placeholder="Cafe name"
                  placeholderTextColor="#B0A090"
                />
                {matchingCafes.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    {matchingCafes.map((c) => (
                      <TouchableOpacity
                        key={c.id}
                        style={styles.suggestionRow}
                        onPress={() => handleSelectExistingCafe(c)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="cafe"
                          size={16}
                          color="#8B5E3C"
                        />
                        <View style={styles.suggestionText}>
                          <Text style={styles.suggestionName}>
                            {c.name}
                          </Text>
                          <Text style={styles.suggestionAddress}>
                            {c.address}
                            {c.city ? `, ${c.city}` : ''}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
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
              </>
            )}
          </View>

          {/* Date Picker */}
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

          {/* Date Picker Modal */}
          <DatePickerModal
            visible={showDatePicker}
            value={visitedAt}
            onConfirm={(date) => {
              setVisitedAt(date);
              setShowDatePicker(false);
            }}
            onCancel={() => setShowDatePicker(false)}
          />

          {/* Drinks Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Drinks</Text>
            {drinks.map((drink, index) => (
              <DrinkRow
                key={drink.id}
                drink={drink}
                onChange={(updated) => handleUpdateDrink(index, updated)}
                onDelete={() => handleDeleteDrink(index)}
              />
            ))}
            <TouchableOpacity
              onPress={handleAddDrink}
              style={styles.addDrinkButton}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={20} color="#8B5E3C" />
              <Text style={styles.addDrinkText}>Add Drink</Text>
            </TouchableOpacity>
          </View>

          {/* Experience Ratings (Collapsible) */}
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
                        handleExperienceRatingChange(dim.key, val)
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
              onAdd={() => console.log('Add photos tapped')}
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

          {/* Spacer for save button */}
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Save Button */}
        <View style={styles.saveContainer}>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            activeOpacity={0.8}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save Visit'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Simple Date Picker Modal (no external dependencies)
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
  for (let y = currentYear; y >= currentYear - 5; y--) {
    years.push(y);
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  const days: number[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  const handleConfirm = () => {
    const clampedDay = Math.min(day, daysInMonth);
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`;
    onConfirm(dateStr);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={datePickerStyles.overlay}>
        <View style={datePickerStyles.container}>
          <Text style={datePickerStyles.title}>Select Date</Text>

          <View style={datePickerStyles.pickerRow}>
            {/* Year */}
            <View style={datePickerStyles.pickerColumn}>
              <Text style={datePickerStyles.pickerLabel}>Year</Text>
              <FlatList
                data={years}
                keyExtractor={(item) => String(item)}
                style={datePickerStyles.list}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => setYear(item)}
                    style={[
                      datePickerStyles.option,
                      year === item && datePickerStyles.optionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        datePickerStyles.optionText,
                        year === item && datePickerStyles.optionTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            {/* Month */}
            <View style={datePickerStyles.pickerColumn}>
              <Text style={datePickerStyles.pickerLabel}>Month</Text>
              <FlatList
                data={MONTHS.map((m, i) => ({ name: m, num: i + 1 }))}
                keyExtractor={(item) => String(item.num)}
                style={datePickerStyles.list}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => setMonth(item.num)}
                    style={[
                      datePickerStyles.option,
                      month === item.num && datePickerStyles.optionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        datePickerStyles.optionText,
                        month === item.num &&
                          datePickerStyles.optionTextSelected,
                      ]}
                    >
                      {item.name.slice(0, 3)}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            {/* Day */}
            <View style={datePickerStyles.pickerColumn}>
              <Text style={datePickerStyles.pickerLabel}>Day</Text>
              <FlatList
                data={days}
                keyExtractor={(item) => String(item)}
                style={datePickerStyles.list}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => setDay(item)}
                    style={[
                      datePickerStyles.option,
                      day === item && datePickerStyles.optionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        datePickerStyles.optionText,
                        day === item && datePickerStyles.optionTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>

          <View style={datePickerStyles.buttons}>
            <TouchableOpacity
              onPress={onCancel}
              style={datePickerStyles.cancelButton}
            >
              <Text style={datePickerStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              style={datePickerStyles.confirmButton}
            >
              <Text style={datePickerStyles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const datePickerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#FFFAF5',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxHeight: '60%',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3C2A1A',
    textAlign: 'center',
    marginBottom: 16,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B7B6B',
    textAlign: 'center',
    marginBottom: 8,
  },
  list: {
    maxHeight: 200,
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: '#8B5E3C',
  },
  optionText: {
    fontSize: 14,
    color: '#3C2A1A',
  },
  optionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelText: {
    fontSize: 15,
    color: '#8B7B6B',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#8B5E3C',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  confirmText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFAF5',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#3C2A1A',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#3C2A1A',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#F5EDE3',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#3C2A1A',
    marginBottom: 10,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8DDD0',
    overflow: 'hidden',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8DDD0',
    gap: 8,
  },
  suggestionText: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3C2A1A',
  },
  suggestionAddress: {
    fontSize: 12,
    color: '#8B7B6B',
    marginTop: 1,
  },
  selectedCafeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EDE3',
    borderRadius: 10,
    padding: 12,
  },
  selectedCafeInfo: {
    flex: 1,
    marginRight: 8,
  },
  selectedCafeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3C2A1A',
  },
  selectedCafeAddress: {
    fontSize: 13,
    color: '#8B7B6B',
    marginTop: 2,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EDE3',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  dateButtonText: {
    fontSize: 15,
    color: '#3C2A1A',
    flex: 1,
  },
  addDrinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  addDrinkText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8B5E3C',
  },
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  collapsedHint: {
    fontSize: 13,
    color: '#B0A090',
    marginTop: 4,
  },
  ratingCategory: {
    marginTop: 16,
  },
  ratingCategoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B5E3C',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  notesInput: {
    backgroundColor: '#F5EDE3',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#3C2A1A',
    minHeight: 100,
  },
  bottomSpacer: {
    height: 80,
  },
  saveContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFAF5',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E8DDD0',
  },
  saveButton: {
    backgroundColor: '#6B4226',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
