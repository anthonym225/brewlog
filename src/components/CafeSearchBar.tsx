// T26: Google Places Cafe Search Bar
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import type { Cafe } from '@/types';

// ---- Google Places API types ----

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface AutocompleteResponse {
  status: string;
  predictions: PlacePrediction[];
}

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface PlaceDetailsResult {
  name: string;
  formatted_address: string;
  address_components?: AddressComponent[];
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface PlaceDetailsResponse {
  status: string;
  result: PlaceDetailsResult;
}

// ---- Helper ----

function getApiKey(): string {
  const key = Constants.expoConfig?.extra?.googleMapsApiKey as string | undefined;
  return key ?? '';
}

function extractAddressComponent(
  components: AddressComponent[],
  ...types: string[]
): string {
  for (const type of types) {
    const comp = components.find((c) => c.types.includes(type));
    if (comp) return comp.long_name;
  }
  return '';
}

// ---- Component ----

interface CafeSearchBarProps {
  onSelect: (cafe: Omit<Cafe, 'id' | 'created_at' | 'updated_at'>) => void;
  onManualEntry: () => void;
}

export function CafeSearchBar({ onSelect, onManualEntry }: CafeSearchBarProps) {
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const apiKey = getApiKey();
  const hasApiKey = apiKey.length > 0;

  // Clean up debounce timer and any in-flight request on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      abortControllerRef.current?.abort();
    };
  }, []);

  const fetchPredictions = useCallback(
    async (input: string) => {
      if (!hasApiKey || input.trim().length < 2) {
        setPredictions([]);
        setDropdownVisible(input.length > 0);
        return;
      }

      // Abort any previous in-flight request
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;

      setLoading(true);
      setError(null);

      try {
        const url = new URL(
          'https://maps.googleapis.com/maps/api/place/autocomplete/json'
        );
        url.searchParams.set('input', input);
        url.searchParams.set('types', 'cafe');
        url.searchParams.set('key', apiKey);

        const response = await fetch(url.toString(), { signal });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = (await response.json()) as AutocompleteResponse;

        if (data.status === 'OK' || data.status === 'ZERO_RESULTS') {
          setPredictions(data.predictions ?? []);
          setDropdownVisible(true);
        } else {
          setError('Places search unavailable');
          setPredictions([]);
          setDropdownVisible(true);
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return; // Request was cancelled — don't update state
        }
        setError('Places search unavailable');
        setPredictions([]);
        setDropdownVisible(true);
      } finally {
        setLoading(false);
      }
    },
    [hasApiKey, apiKey]
  );

  const handleChangeText = (text: string) => {
    setQuery(text);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (text.trim().length === 0) {
      setPredictions([]);
      setDropdownVisible(false);
      setError(null);
      return;
    }

    if (!hasApiKey) {
      setDropdownVisible(true);
      return;
    }

    debounceTimer.current = setTimeout(() => {
      fetchPredictions(text).catch(() => {});
    }, 300);
  };

  const handleSelectPrediction = async (prediction: PlacePrediction) => {
    if (!hasApiKey) return;

    setLoading(true);
    setDropdownVisible(false);
    setQuery(prediction.structured_formatting.main_text);

    try {
      const url = new URL(
        'https://maps.googleapis.com/maps/api/place/details/json'
      );
      url.searchParams.set('place_id', prediction.place_id);
      url.searchParams.set('fields', 'name,formatted_address,address_components,geometry');
      url.searchParams.set('key', apiKey);

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = (await response.json()) as PlaceDetailsResponse;

      if (data.status !== 'OK') {
        throw new Error(`Places Details status: ${data.status}`);
      }

      const result = data.result;
      const components = result.address_components ?? [];

      const city = extractAddressComponent(
        components,
        'locality',
        'administrative_area_level_2'
      );
      const country = extractAddressComponent(components, 'country');
      const lat = result.geometry?.location.lat ?? 0;
      const lng = result.geometry?.location.lng ?? 0;

      onSelect({
        google_place_id: prediction.place_id,
        name: result.name,
        address: result.formatted_address,
        city,
        country,
        latitude: lat,
        longitude: lng,
      });
    } catch {
      setError('Could not load cafe details');
      setDropdownVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const showDropdown = dropdownVisible || (!hasApiKey && query.length > 0);

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <Ionicons name="search" size={18} color="#8B5E3C" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={handleChangeText}
          placeholder="Search for a cafe..."
          placeholderTextColor="#B0A090"
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="search"
          onFocus={() => {
            if (!hasApiKey || query.length > 0) {
              setDropdownVisible(true);
            }
          }}
        />
        {loading && (
          <ActivityIndicator size="small" color="#8B5E3C" style={styles.spinner} />
        )}
      </View>

      {showDropdown && (
        <View style={styles.dropdown}>
          {!hasApiKey && (
            <View style={styles.notConfiguredRow}>
              <Ionicons name="information-circle-outline" size={16} color="#B0A090" />
              <Text style={styles.notConfiguredText}>
                Google Places not configured
              </Text>
            </View>
          )}

          {hasApiKey && error && (
            <View style={styles.errorRow}>
              <Ionicons name="warning-outline" size={16} color="#B0A090" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {hasApiKey && !error && predictions.map((prediction) => (
            <TouchableOpacity
              key={prediction.place_id}
              style={styles.predictionRow}
              onPress={() => { handleSelectPrediction(prediction).catch(() => {}); }}
              activeOpacity={0.7}
            >
              <Ionicons name="cafe" size={16} color="#8B5E3C" />
              <View style={styles.predictionText}>
                <Text style={styles.predictionMain} numberOfLines={1}>
                  {prediction.structured_formatting.main_text}
                </Text>
                <Text style={styles.predictionSecondary} numberOfLines={1}>
                  {prediction.structured_formatting.secondary_text}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.manualEntryRow}
            onPress={onManualEntry}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={16} color="#8B5E3C" />
            <Text style={styles.manualEntryText}>Add manually</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EDE3',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#3C2A1A',
    paddingVertical: 10,
  },
  spinner: {
    marginLeft: 8,
  },
  dropdown: {
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8DDD0',
    overflow: 'hidden',
  },
  notConfiguredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8DDD0',
  },
  notConfiguredText: {
    fontSize: 13,
    color: '#B0A090',
    fontStyle: 'italic',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8DDD0',
  },
  errorText: {
    fontSize: 13,
    color: '#B0A090',
  },
  predictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8DDD0',
    gap: 8,
  },
  predictionText: {
    flex: 1,
  },
  predictionMain: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3C2A1A',
  },
  predictionSecondary: {
    fontSize: 12,
    color: '#8B7B6B',
    marginTop: 1,
  },
  manualEntryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  manualEntryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5E3C',
  },
});
