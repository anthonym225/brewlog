// T14: VisitCard Component
// Timeline feed card showing hero photo, cafe info, drinks, notes preview, and rating badge

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import type { VisitWithDetails } from '@/types';
import { formatDate, formatRating } from '@/utils/formatting';

interface VisitCardProps {
  visit: VisitWithDetails;
  onPress: () => void;
}

export function VisitCard({ visit, onPress }: VisitCardProps) {
  const heroPhoto = visit.photos.length > 0 ? visit.photos[0] : null;

  // Format drinks summary: "Cappuccino 8/10, Latte 7/10"
  const drinksSummary = visit.drinks
    .map((d) => `${d.name || d.type} ${d.rating}/10`)
    .join(', ');

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.card}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Visit to ${visit.cafe.name}`}
    >
      {/* Hero photo or placeholder */}
      {heroPhoto ? (
        <Image
          source={{ uri: heroPhoto.file_path }}
          style={styles.heroImage}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={styles.heroPlaceholder}>
          <Text style={styles.heroPlaceholderText}>
            {visit.cafe.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.content}>
        {/* Cafe name, city, and rating badge */}
        <View style={styles.topRow}>
          <View style={styles.cafeInfo}>
            <Text style={styles.cafeName} numberOfLines={1}>
              {visit.cafe.name}
            </Text>
            <Text style={styles.cafeCity} numberOfLines={1}>
              {visit.cafe.city}
            </Text>
          </View>
          {visit.overall_rating != null && (
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>
                {formatRating(visit.overall_rating)}
              </Text>
            </View>
          )}
        </View>

        {/* Date */}
        <Text style={styles.date}>{formatDate(visit.visited_at)}</Text>

        {/* Drinks summary */}
        {drinksSummary.length > 0 && (
          <Text style={styles.drinks} numberOfLines={1}>
            {drinksSummary}
          </Text>
        )}

        {/* Notes preview */}
        {visit.notes != null && visit.notes.length > 0 && (
          <Text style={styles.notes} numberOfLines={2}>
            {visit.notes}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#3C2A1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: 180,
  },
  heroPlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#D4C4B0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPlaceholderText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFAF5',
  },
  content: {
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  cafeInfo: {
    flex: 1,
    marginRight: 8,
  },
  cafeName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#3C2A1A',
  },
  cafeCity: {
    fontSize: 13,
    color: '#8B7B6B',
    marginTop: 1,
  },
  ratingBadge: {
    backgroundColor: '#8B5E3C',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 40,
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  date: {
    fontSize: 13,
    color: '#B0A090',
    marginBottom: 6,
  },
  drinks: {
    fontSize: 14,
    color: '#5C4A3A',
    marginBottom: 4,
  },
  notes: {
    fontSize: 13,
    color: '#8B7B6B',
    lineHeight: 18,
    marginTop: 2,
  },
});
