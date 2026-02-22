import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CafeMapProps {
  latitude: number;
  longitude: number;
}

export default function CafeMap(_props: CafeMapProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="map-outline" size={28} color="#B0A090" />
      <Text style={styles.text}>Map view available in mobile app</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5EDE3',
    gap: 8,
  },
  text: {
    fontSize: 13,
    color: '#8B7B6B',
    textAlign: 'center',
  },
});
