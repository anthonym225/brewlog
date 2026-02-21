// T21: Visit Detail Screen
import React, { useState, useCallback, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  useLocalSearchParams,
  router,
  useNavigation,
  useFocusEffect,
} from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getVisitWithDetails, deleteVisit } from '@/db/visits';
import { PhotoStrip } from '@/components/PhotoStrip';
import { EXPERIENCE_DIMENSIONS } from '@/constants/experienceDimensions';
import { formatDate, formatRating } from '@/utils/formatting';
import type { VisitWithDetails, ExperienceDimensionKey } from '@/types';

export default function VisitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const [visit, setVisit] = useState<VisitWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const loadVisit = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getVisitWithDetails(id);
      setVisit(data);
    } catch (error) {
      console.error('Failed to load visit:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadVisit();
    }, [loadVisit])
  );

  const handleDelete = useCallback(() => {
    if (!id) return;
    Alert.alert(
      'Delete Visit',
      'Are you sure you want to delete this visit? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVisit(id);
              router.back();
            } catch (error) {
              console.error('Failed to delete visit:', error);
              Alert.alert('Error', 'Failed to delete visit. Please try again.');
            }
          },
        },
      ]
    );
  }, [id]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={() => console.log('Edit visit', id)}
            style={styles.headerButton}
          >
            <Ionicons name="pencil-outline" size={22} color="#8B5E3C" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            style={styles.headerButton}
          >
            <Ionicons name="trash-outline" size={22} color="#C0392B" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, handleDelete, id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#8B5E3C" />
      </View>
    );
  }

  if (!visit) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color="#D4C4B0" />
        <Text style={styles.errorText}>Visit not found</Text>
      </View>
    );
  }

  const photoUris = visit.photos.map((p) => p.file_path);
  const ratedDimensions = EXPERIENCE_DIMENSIONS.filter(
    (dim) => visit[dim.key as ExperienceDimensionKey] != null
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Photos */}
      {photoUris.length > 0 && (
        <View style={styles.section}>
          <PhotoStrip photos={photoUris} />
        </View>
      )}

      {/* Cafe Info */}
      <View style={styles.section}>
        <TouchableOpacity
          onPress={() => router.push(`/cafe/${visit.cafe_id}`)}
          activeOpacity={0.7}
        >
          <Text style={styles.cafeName}>{visit.cafe.name}</Text>
          <View style={styles.cafeSubRow}>
            <Ionicons name="location-outline" size={14} color="#8B7B6B" />
            <Text style={styles.cafeAddress}>
              {visit.cafe.address}
            </Text>
          </View>
          <Text style={styles.cafeCity}>
            {visit.cafe.city}, {visit.cafe.country}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date */}
      <View style={styles.section}>
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={16} color="#8B7B6B" />
          <Text style={styles.dateText}>{formatDate(visit.visited_at)}</Text>
          {visit.overall_rating != null && (
            <View style={styles.overallBadge}>
              <Text style={styles.overallBadgeText}>
                {formatRating(visit.overall_rating)}/10
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Drinks */}
      {visit.drinks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Drinks</Text>
          {visit.drinks.map((drink) => (
            <View key={drink.id} style={styles.drinkRow}>
              <View style={styles.drinkInfo}>
                <Text style={styles.drinkName}>
                  {drink.name || drink.type}
                </Text>
                <Text style={styles.drinkType}>{drink.type}</Text>
              </View>
              <View style={styles.drinkRatingBadge}>
                <Text style={styles.drinkRatingText}>
                  {drink.rating}/10
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Experience Ratings */}
      {ratedDimensions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience Ratings</Text>
          {ratedDimensions.map((dim) => {
            const value = visit[dim.key as ExperienceDimensionKey];
            return (
              <View key={dim.key} style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>{dim.label}</Text>
                <View style={styles.ratingValueBadge}>
                  <Text style={styles.ratingValueText}>
                    {formatRating(value ?? null)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Notes */}
      {visit.notes != null && visit.notes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notesText}>{visit.notes}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFAF5',
  },
  content: {
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFAF5',
  },
  errorText: {
    fontSize: 16,
    color: '#8B7B6B',
    marginTop: 12,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 6,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8DDD0',
  },
  cafeName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3C2A1A',
    marginBottom: 4,
  },
  cafeSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  cafeAddress: {
    fontSize: 14,
    color: '#8B7B6B',
    flex: 1,
  },
  cafeCity: {
    fontSize: 14,
    color: '#8B7B6B',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 15,
    color: '#5C4A3A',
    flex: 1,
  },
  overallBadge: {
    backgroundColor: '#8B5E3C',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  overallBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#3C2A1A',
    marginBottom: 10,
  },
  drinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0E6D9',
  },
  drinkInfo: {
    flex: 1,
    marginRight: 12,
  },
  drinkName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3C2A1A',
  },
  drinkType: {
    fontSize: 13,
    color: '#8B7B6B',
    marginTop: 1,
  },
  drinkRatingBadge: {
    backgroundColor: '#F5EDE3',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  drinkRatingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5E3C',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0E6D9',
  },
  ratingLabel: {
    fontSize: 15,
    color: '#5C4A3A',
    flex: 1,
  },
  ratingValueBadge: {
    backgroundColor: '#F5EDE3',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 44,
    alignItems: 'center',
  },
  ratingValueText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5E3C',
  },
  notesText: {
    fontSize: 15,
    color: '#5C4A3A',
    lineHeight: 22,
  },
});
