// T25: Profile / Stats Screen
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getStats, type AppStats } from '@/db/rankings';
import { StatCard } from '@/components/StatCard';
import { formatRating } from '@/utils/formatting';

export default function ProfileScreen() {
  const [stats, setStats] = useState<AppStats | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          const data = await getStats();
          if (!cancelled) {
            setStats(data);
          }
        } catch (error) {
          console.error('Failed to load stats:', error);
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Stats</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#8B5E3C" />
        </View>
      </SafeAreaView>
    );
  }

  const s = stats ?? {
    total_cafes: 0,
    total_visits: 0,
    total_drinks: 0,
    avg_rating: null,
    current_month_visits: 0,
    previous_month_visits: 0,
    cities: [],
    countries: [],
    favorite_drink_type: null,
    most_visited_cafe: null,
    highest_rated_cafe: null,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Stats</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.grid}>
          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <StatCard label="Total Cafes" value={s.total_cafes} />
            </View>
            <View style={styles.gridItem}>
              <StatCard label="Total Visits" value={s.total_visits} />
            </View>
          </View>
          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <StatCard label="Total Drinks" value={s.total_drinks} />
            </View>
            <View style={styles.gridItem}>
              <StatCard
                label="Avg Rating"
                value={s.avg_rating != null ? formatRating(s.avg_rating) : '\u2014'}
              />
            </View>
          </View>
          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <StatCard
                label="This Month"
                value={s.current_month_visits}
                subtitle="visits"
              />
            </View>
            <View style={styles.gridItem}>
              <StatCard
                label="Last Month"
                value={s.previous_month_visits}
                subtitle="visits"
              />
            </View>
          </View>
        </View>

        {/* Detail Sections */}
        <View style={styles.detailSection}>
          <DetailRow
            icon="location-outline"
            label="Cities Visited"
            value={
              s.cities.length > 0
                ? `${s.cities.length} ${s.cities.length === 1 ? 'city' : 'cities'}: ${s.cities.join(', ')}`
                : 'No data yet'
            }
          />
          <DetailRow
            icon="globe-outline"
            label="Countries"
            value={
              s.countries.length > 0
                ? `${s.countries.length} ${s.countries.length === 1 ? 'country' : 'countries'}: ${s.countries.join(', ')}`
                : 'No data yet'
            }
          />
          <DetailRow
            icon="cafe-outline"
            label="Favorite Drink Type"
            value={s.favorite_drink_type ?? 'No data yet'}
          />
          <DetailRow
            icon="heart-outline"
            label="Most Visited Cafe"
            value={
              s.most_visited_cafe
                ? `${s.most_visited_cafe.name} (${s.most_visited_cafe.count} ${s.most_visited_cafe.count === 1 ? 'visit' : 'visits'})`
                : 'No data yet'
            }
          />
          <DetailRow
            icon="star-outline"
            label="Highest Rated Cafe"
            value={
              s.highest_rated_cafe
                ? `${s.highest_rated_cafe.name} (${formatRating(s.highest_rated_cafe.rating)}/10)`
                : 'No data yet'
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={detailStyles.row}>
      <Ionicons name={icon} size={20} color="#8B5E3C" style={detailStyles.icon} />
      <View style={detailStyles.textContainer}>
        <Text style={detailStyles.label}>{label}</Text>
        <Text style={detailStyles.value}>{value}</Text>
      </View>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8DDD0',
  },
  icon: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B7B6B',
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    color: '#3C2A1A',
    lineHeight: 21,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFAF5',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#3C2A1A',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridItem: {
    flex: 1,
  },
  detailSection: {
    marginTop: 24,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 32,
    shadowColor: '#3C2A1A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
});
