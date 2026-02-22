// Mock Google Places data for local development and testing.
// Activate by setting GOOGLE_PLACES_API_KEY=mock in .env.local

// ── Shared types (also imported by CafeSearchBar) ──────────────────────────

export interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export interface PlaceDetailsResult {
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

export interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

// ── Mock data ───────────────────────────────────────────────────────────────

const MOCK_PREDICTIONS: PlacePrediction[] = [
  {
    place_id: 'mock-001',
    description: 'Blue Bottle Coffee, Market St, San Francisco, CA, USA',
    structured_formatting: {
      main_text: 'Blue Bottle Coffee',
      secondary_text: 'Market St, San Francisco, CA, USA',
    },
  },
  {
    place_id: 'mock-002',
    description: 'Sightglass Coffee, 7th St, San Francisco, CA, USA',
    structured_formatting: {
      main_text: 'Sightglass Coffee',
      secondary_text: '7th St, San Francisco, CA, USA',
    },
  },
  {
    place_id: 'mock-003',
    description: 'Ritual Coffee Roasters, Valencia St, San Francisco, CA, USA',
    structured_formatting: {
      main_text: 'Ritual Coffee Roasters',
      secondary_text: 'Valencia St, San Francisco, CA, USA',
    },
  },
];

const MOCK_DETAILS: Record<string, PlaceDetailsResult> = {
  'mock-001': {
    name: 'Blue Bottle Coffee',
    formatted_address: '66 Mint St, San Francisco, CA 94103, USA',
    address_components: [
      { long_name: 'San Francisco', short_name: 'SF', types: ['locality', 'political'] },
      { long_name: 'United States', short_name: 'US', types: ['country', 'political'] },
    ],
    geometry: { location: { lat: 37.7813, lng: -122.4035 } },
  },
  'mock-002': {
    name: 'Sightglass Coffee',
    formatted_address: '270 7th St, San Francisco, CA 94103, USA',
    address_components: [
      { long_name: 'San Francisco', short_name: 'SF', types: ['locality', 'political'] },
      { long_name: 'United States', short_name: 'US', types: ['country', 'political'] },
    ],
    geometry: { location: { lat: 37.7768, lng: -122.4067 } },
  },
  'mock-003': {
    name: 'Ritual Coffee Roasters',
    formatted_address: '1026 Valencia St, San Francisco, CA 94110, USA',
    address_components: [
      { long_name: 'San Francisco', short_name: 'SF', types: ['locality', 'political'] },
      { long_name: 'United States', short_name: 'US', types: ['country', 'political'] },
    ],
    geometry: { location: { lat: 37.7572, lng: -122.4213 } },
  },
};

// ── Search functions ────────────────────────────────────────────────────────

/** Returns predictions whose description contains the query (case-insensitive). */
export function searchMockCafes(query: string): PlacePrediction[] {
  const q = query.toLowerCase();
  return MOCK_PREDICTIONS.filter((p) => p.description.toLowerCase().includes(q));
}

/** Returns full place details for a mock place_id, or null if not found. */
export function getMockPlaceDetails(placeId: string): PlaceDetailsResult | null {
  return MOCK_DETAILS[placeId] ?? null;
}
