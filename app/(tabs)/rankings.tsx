// T24: Rankings Screen
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useAppStore } from '@/stores/useAppStore';
import {
  getOverallCafeRankings,
  getCafeRankings,
  getDrinkRankings,
} from '@/db/rankings';
import { RankingList } from '@/components/RankingList';
import { EmptyState } from '@/components/EmptyState';
import type {
  RankingEntry,
  DrinkRankingEntry,
  ExperienceDimensionKey,
} from '@/types';

interface TabDefinition {
  key: string;
  label: string;
  type: 'cafe' | 'drink';
  fetchCafe?: () => Promise<RankingEntry[]>;
  fetchDrink?: () => Promise<DrinkRankingEntry[]>;
}

const TABS: TabDefinition[] = [
  {
    key: 'overall',
    label: 'Overall',
    type: 'cafe',
    fetchCafe: getOverallCafeRankings,
  },
  {
    key: 'coffee_quality',
    label: 'Coffee Quality',
    type: 'cafe',
    fetchCafe: () => getCafeRankings('coffee_quality'),
  },
  {
    key: 'vibe',
    label: 'Best Vibe',
    type: 'cafe',
    fetchCafe: () => getCafeRankings('vibe'),
  },
  {
    key: 'interior_design',
    label: 'Best Interior',
    type: 'cafe',
    fetchCafe: () => getCafeRankings('interior_design'),
  },
  {
    key: 'work_friendliness',
    label: 'Best for Working',
    type: 'cafe',
    fetchCafe: () => getCafeRankings('work_friendliness'),
  },
  {
    key: 'value',
    label: 'Best Value',
    type: 'cafe',
    fetchCafe: () => getCafeRankings('value'),
  },
  {
    key: 'food_pastries',
    label: 'Best Food',
    type: 'cafe',
    fetchCafe: () => getCafeRankings('food_pastries'),
  },
  {
    key: 'espresso',
    label: 'Top Espressos',
    type: 'drink',
    fetchDrink: () => getDrinkRankings('Espresso'),
  },
  {
    key: 'cappuccino',
    label: 'Top Cappuccinos',
    type: 'drink',
    fetchDrink: () => getDrinkRankings('Cappuccino'),
  },
  {
    key: 'latte',
    label: 'Top Lattes',
    type: 'drink',
    fetchDrink: () => getDrinkRankings('Latte'),
  },
  {
    key: 'flat_white',
    label: 'Top Flat Whites',
    type: 'drink',
    fetchDrink: () => getDrinkRankings('Flat White'),
  },
  {
    key: 'matcha',
    label: 'Top Matcha',
    type: 'drink',
    fetchDrink: () => getDrinkRankings('Matcha Latte'),
  },
];

export default function RankingsScreen() {
  const { activeRankingTab, setActiveRankingTab } = useAppStore();
  const [cafeEntries, setCafeEntries] = useState<RankingEntry[]>([]);
  const [drinkEntries, setDrinkEntries] = useState<DrinkRankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const tabScrollRef = useRef<ScrollView>(null);

  const activeTab =
    TABS.find((t) => t.key === activeRankingTab) ?? TABS[0];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab.type === 'cafe' && activeTab.fetchCafe) {
        const data = await activeTab.fetchCafe();
        setCafeEntries(data);
        setDrinkEntries([]);
      } else if (activeTab.type === 'drink' && activeTab.fetchDrink) {
        const data = await activeTab.fetchDrink();
        setDrinkEntries(data);
        setCafeEntries([]);
      }
    } catch (error) {
      console.error('Failed to load rankings:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleTabPress = (tab: TabDefinition) => {
    setActiveRankingTab(tab.key);
  };

  const entries =
    activeTab.type === 'cafe' ? cafeEntries : drinkEntries;
  const hasEnoughData = entries.length >= 2;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rankings</Text>
      </View>

      {/* Tab Bar */}
      <ScrollView
        ref={tabScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => handleTabPress(tab)}
              style={[styles.tab, isActive && styles.tabActive]}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.tabText, isActive && styles.tabTextActive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#8B5E3C" />
        </View>
      ) : !hasEnoughData ? (
        <EmptyState
          title="Not enough data"
          message={`Need at least 2 entries in "${activeTab.label}" to show rankings. Keep logging visits!`}
          icon="trophy-outline"
        />
      ) : activeTab.type === 'cafe' ? (
        <RankingList type="cafe" entries={cafeEntries} />
      ) : (
        <RankingList type="drink" entries={drinkEntries} />
      )}
    </SafeAreaView>
  );
}

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
  tabBar: {
    maxHeight: 48,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8DDD0',
  },
  tabBarContent: {
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 4,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 2,
  },
  tabActive: {
    backgroundColor: '#8B5E3C',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B7B6B',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
