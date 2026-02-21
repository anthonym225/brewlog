// T24: RankingList Component
// Renders ranked entries for either cafe or drink rankings

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { router } from 'expo-router';
import type { RankingEntry, DrinkRankingEntry } from '@/types';

function getRankColor(rank: number): string {
  switch (rank) {
    case 1:
      return '#FFD700'; // gold
    case 2:
      return '#C0C0C0'; // silver
    case 3:
      return '#CD7F32'; // bronze
    default:
      return '#B0A090';
  }
}

interface CafeRankingListProps {
  type: 'cafe';
  entries: RankingEntry[];
}

interface DrinkRankingListProps {
  type: 'drink';
  entries: DrinkRankingEntry[];
}

type RankingListProps = CafeRankingListProps | DrinkRankingListProps;

export function RankingList(props: RankingListProps) {
  if (props.type === 'cafe') {
    return (
      <FlatList
        data={props.entries}
        keyExtractor={(item) => `${item.cafe_id}-${item.rank}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push(`/cafe/${item.cafe_id}`)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.rankBadge,
                { backgroundColor: getRankColor(item.rank) },
              ]}
            >
              <Text
                style={[
                  styles.rankText,
                  item.rank <= 3 && styles.rankTextTop,
                ]}
              >
                {item.rank}
              </Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>
                {item.cafe_name}
              </Text>
              <Text style={styles.city} numberOfLines={1}>
                {item.city}
              </Text>
            </View>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            </View>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    );
  }

  return (
    <FlatList
      data={props.entries}
      keyExtractor={(item) => `${item.visit_id}-${item.drink_name}-${item.rank}`}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.row}
          onPress={() => router.push(`/visit/${item.visit_id}`)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.rankBadge,
              { backgroundColor: getRankColor(item.rank) },
            ]}
          >
            <Text
              style={[
                styles.rankText,
                item.rank <= 3 && styles.rankTextTop,
              ]}
            >
              {item.rank}
            </Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {item.drink_name}
            </Text>
            <Text style={styles.city} numberOfLines={1}>
              {item.cafe_name} - {item.city}
            </Text>
          </View>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          </View>
        </TouchableOpacity>
      )}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8DDD0',
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rankTextTop: {
    fontSize: 15,
    fontWeight: '800',
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3C2A1A',
  },
  city: {
    fontSize: 13,
    color: '#8B7B6B',
    marginTop: 2,
  },
  ratingBadge: {
    backgroundColor: '#8B5E3C',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    minWidth: 44,
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
