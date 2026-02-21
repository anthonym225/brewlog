// T20: Home / Timeline Screen
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { getAllVisitsWithDetails } from '@/db/visits';
import { VisitCard } from '@/components/VisitCard';
import { EmptyState } from '@/components/EmptyState';
import type { VisitWithDetails } from '@/types';

export default function HomeScreen() {
  const [visits, setVisits] = useState<VisitWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadVisits = useCallback(async () => {
    try {
      const data = await getAllVisitsWithDetails();
      setVisits(data);
    } catch (error) {
      console.error('Failed to load visits:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadVisits();
    }, [loadVisits])
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadVisits();
  }, [loadVisits]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>BrewLog</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#8B5E3C" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>BrewLog</Text>
      </View>
      {visits.length === 0 ? (
        <EmptyState
          title="No visits yet"
          message="Log your first cafe visit and start building your coffee journal."
          icon="cafe-outline"
          actionLabel="Add Visit"
          onAction={() => router.push('/(tabs)/add')}
        />
      ) : (
        <FlatList
          data={visits}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VisitCard
              visit={item}
              onPress={() => router.push(`/visit/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
        />
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
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8DDD0',
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
  listContent: {
    paddingTop: 16,
    paddingBottom: 32,
  },
});
