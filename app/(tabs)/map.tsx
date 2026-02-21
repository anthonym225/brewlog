// T23: Map Screen
import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import MapView, { Marker, Callout } from 'react-native-maps';
import { getCafesWithStats } from '@/db/cafes';
import { EmptyState } from '@/components/EmptyState';
import { formatRating } from '@/utils/formatting';
import type { CafeWithStats } from '@/types';

function getPinColor(rating: number | null): string {
  if (rating == null || rating < 5) return '#FF4444';
  if (rating <= 7) return '#FFB800';
  return '#44AA44';
}

export default function MapScreen() {
  const [cafes, setCafes] = useState<CafeWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<MapView>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          const data = await getCafesWithStats();
          if (!cancelled) {
            setCafes(data);
            if (data.length > 0) {
              setTimeout(() => {
                mapRef.current?.fitToCoordinates(
                  data.map((c) => ({
                    latitude: c.latitude,
                    longitude: c.longitude,
                  })),
                  {
                    edgePadding: {
                      top: 80,
                      right: 80,
                      bottom: 80,
                      left: 80,
                    },
                    animated: true,
                  }
                );
              }, 500);
            }
          }
        } catch (error) {
          console.error('Failed to load cafes for map:', error);
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
      <View style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#8B5E3C" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 40.7128,
          longitude: -74.006,
          latitudeDelta: 50,
          longitudeDelta: 50,
        }}
      >
        {cafes.map((cafe) => (
          <Marker
            key={cafe.id}
            coordinate={{
              latitude: cafe.latitude,
              longitude: cafe.longitude,
            }}
            pinColor={getPinColor(cafe.avg_overall_rating)}
          >
            <Callout onPress={() => router.push(`/cafe/${cafe.id}`)}>
              <View style={styles.callout}>
                <Text style={styles.calloutName} numberOfLines={1}>
                  {cafe.name}
                </Text>
                <Text style={styles.calloutRating}>
                  {cafe.avg_overall_rating != null
                    ? `${formatRating(cafe.avg_overall_rating)}/10`
                    : 'Not rated'}
                </Text>
                <Text style={styles.calloutHint}>Tap for details</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {cafes.length === 0 && (
        <View style={styles.emptyOverlay}>
          <EmptyState
            title="No cafes yet"
            message="Visit a cafe and log it to see it on the map."
            icon="map-outline"
            actionLabel="Add Visit"
            onAction={() => router.push('/(tabs)/add')}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFAF5',
  },
  map: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callout: {
    minWidth: 150,
    padding: 4,
  },
  calloutName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3C2A1A',
    marginBottom: 2,
  },
  calloutRating: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5E3C',
    marginBottom: 2,
  },
  calloutHint: {
    fontSize: 11,
    color: '#B0A090',
  },
  emptyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 248, 240, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
