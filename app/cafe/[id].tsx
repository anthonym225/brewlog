// T22: Cafe Page Screen
import React, { useState, useCallback, useLayoutEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  useLocalSearchParams,
  router,
  useNavigation,
  useFocusEffect,
} from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { getCafeById } from '@/db/cafes';
import { getVisitsByCafeId } from '@/db/visits';
import { PhotoStrip } from '@/components/PhotoStrip';
import { EXPERIENCE_DIMENSIONS } from '@/constants/experienceDimensions';
import { formatDate, formatRating } from '@/utils/formatting';
import type { Cafe, VisitWithDetails, Drink, ExperienceDimensionKey } from '@/types';

export default function CafePageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [visits, setVisits] = useState<VisitWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      let cancelled = false;
      (async () => {
        try {
          const [cafeData, visitsData] = await Promise.all([
            getCafeById(id),
            getVisitsByCafeId(id),
          ]);
          if (!cancelled) {
            setCafe(cafeData);
            setVisits(visitsData);
          }
        } catch (error) {
          console.error('Failed to load cafe:', error);
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [id])
  );

  useLayoutEffect(() => {
    if (cafe) {
      navigation.setOptions({ title: cafe.name });
    }
  }, [navigation, cafe]);

  // Compute aggregate ratings
  const aggregateRatings = useMemo(() => {
    const result: { key: ExperienceDimensionKey; label: string; avg: number }[] = [];
    for (const dim of EXPERIENCE_DIMENSIONS) {
      const values: number[] = [];
      for (const v of visits) {
        const val = v[dim.key as ExperienceDimensionKey];
        if (val != null) {
          values.push(val);
        }
      }
      if (values.length > 0) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        result.push({
          key: dim.key,
          label: dim.label,
          avg: Math.round(avg * 10) / 10,
        });
      }
    }
    return result;
  }, [visits]);

  // Collect all drinks sorted by rating DESC
  const allDrinks = useMemo(() => {
    const drinks: (Drink & { cafeName: string })[] = [];
    for (const v of visits) {
      for (const d of v.drinks) {
        drinks.push({ ...d, cafeName: v.cafe.name });
      }
    }
    drinks.sort((a, b) => b.rating - a.rating);
    return drinks;
  }, [visits]);

  // Collect all photo URIs
  const allPhotos = useMemo(() => {
    const photos: string[] = [];
    for (const v of visits) {
      for (const p of v.photos) {
        photos.push(p.file_path);
      }
    }
    return photos;
  }, [visits]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#8B5E3C" />
      </View>
    );
  }

  if (!cafe) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color="#D4C4B0" />
        <Text style={styles.errorText}>Cafe not found</Text>
      </View>
    );
  }

  const showMap = cafe.latitude !== 0 || cafe.longitude !== 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.section}>
        <Text style={styles.cafeName}>{cafe.name}</Text>
        <View style={styles.addressRow}>
          <Ionicons name="location-outline" size={14} color="#8B7B6B" />
          <Text style={styles.addressText}>{cafe.address}</Text>
        </View>
        <Text style={styles.cityText}>
          {cafe.city}, {cafe.country}
        </Text>
      </View>

      {/* Map */}
      {showMap && (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: cafe.latitude,
              longitude: cafe.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <Marker
              coordinate={{
                latitude: cafe.latitude,
                longitude: cafe.longitude,
              }}
            />
          </MapView>
        </View>
      )}

      {/* Aggregate Ratings */}
      {aggregateRatings.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Average Ratings</Text>
          {aggregateRatings.map((r) => (
            <View key={r.key} style={styles.ratingRow}>
              <Text style={styles.ratingLabel}>{r.label}</Text>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingBadgeText}>
                  {formatRating(r.avg)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Drink Leaderboard */}
      {allDrinks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Drink Leaderboard</Text>
          {allDrinks.map((drink, index) => (
            <View key={`${drink.id}-${index}`} style={styles.drinkRow}>
              <Text style={styles.drinkRank}>#{index + 1}</Text>
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

      {/* Visit History */}
      {visits.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Visit History ({visits.length})
          </Text>
          {visits.map((v) => (
            <TouchableOpacity
              key={v.id}
              style={styles.visitRow}
              onPress={() => router.push(`/visit/${v.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.visitInfo}>
                <Text style={styles.visitDate}>
                  {formatDate(v.visited_at)}
                </Text>
                <Text style={styles.visitDrinks}>
                  {v.drinks.map((d) => d.name || d.type).join(', ')}
                </Text>
              </View>
              {v.overall_rating != null && (
                <View style={styles.visitRatingBadge}>
                  <Text style={styles.visitRatingText}>
                    {formatRating(v.overall_rating)}
                  </Text>
                </View>
              )}
              <Ionicons
                name="chevron-forward"
                size={16}
                color="#B0A090"
              />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* All Photos */}
      {allPhotos.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <PhotoStrip photos={allPhotos} />
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
  section: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8DDD0',
  },
  cafeName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#3C2A1A',
    marginBottom: 6,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  addressText: {
    fontSize: 14,
    color: '#8B7B6B',
    flex: 1,
  },
  cityText: {
    fontSize: 14,
    color: '#8B7B6B',
  },
  mapContainer: {
    height: 200,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#3C2A1A',
    marginBottom: 10,
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
  ratingBadge: {
    backgroundColor: '#F5EDE3',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 44,
    alignItems: 'center',
  },
  ratingBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5E3C',
  },
  drinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0E6D9',
  },
  drinkRank: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B0A090',
    width: 30,
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
  visitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0E6D9',
  },
  visitInfo: {
    flex: 1,
    marginRight: 12,
  },
  visitDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3C2A1A',
  },
  visitDrinks: {
    fontSize: 13,
    color: '#8B7B6B',
    marginTop: 2,
  },
  visitRatingBadge: {
    backgroundColor: '#8B5E3C',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 8,
  },
  visitRatingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
