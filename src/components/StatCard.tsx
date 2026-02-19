// T17: StatCard Component
// Compact stat card for the Profile screen's grid layout

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
}

export function StatCard({ label, value, subtitle }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      {subtitle != null && subtitle.length > 0 && (
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    flex: 1,
    minWidth: 0,
    shadowColor: '#3C2A1A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  value: {
    fontSize: 28,
    fontWeight: '800',
    color: '#8B5E3C',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8B7B6B',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 11,
    color: '#B0A090',
    marginTop: 4,
    textAlign: 'center',
  },
});
