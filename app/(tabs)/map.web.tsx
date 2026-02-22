// Web fallback for T23 Map Screen — react-native-maps is not supported on web
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MapScreenWeb() {
  return (
    <View style={styles.container}>
      <Ionicons name="map-outline" size={64} color="#D4C4B0" />
      <Text style={styles.title}>Map view</Text>
      <Text style={styles.message}>
        The interactive map is available in the iOS and Android apps.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFAF5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3C2A1A',
    marginTop: 8,
  },
  message: {
    fontSize: 15,
    color: '#8B7B6B',
    textAlign: 'center',
    lineHeight: 22,
  },
});
