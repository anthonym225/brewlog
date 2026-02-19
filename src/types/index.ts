// T02: TypeScript Types & Interfaces
// Core entity types matching the SQLite schema in DESIGN.md Section 4

export interface Cafe {
  id: string;
  google_place_id: string | null;
  name: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
}

export interface Visit {
  id: string;
  cafe_id: string;
  visited_at: string;
  notes: string | null;
  overall_rating: number | null;
  coffee_quality: number | null;
  interior_design: number | null;
  vibe: number | null;
  work_friendliness: number | null;
  location_surroundings: number | null;
  value: number | null;
  wait_time: number | null;
  food_pastries: number | null;
  created_at: string;
  updated_at: string;
}

export interface Drink {
  id: string;
  visit_id: string;
  name: string;
  type: string;
  rating: number;
  notes: string | null;
  created_at: string;
}

export interface Photo {
  id: string;
  visit_id: string;
  file_path: string;
  sort_order: number;
  created_at: string;
}

// Composite types used by screens

export interface VisitWithDetails extends Visit {
  cafe: Cafe;
  drinks: Drink[];
  photos: Photo[];
}

export interface CafeWithStats extends Cafe {
  visit_count: number;
  avg_overall_rating: number | null;
  last_visited_at: string | null;
}

export interface RankingEntry {
  rank: number;
  cafe_name: string;
  cafe_id: string;
  city: string;
  rating: number;
}

export interface DrinkRankingEntry {
  rank: number;
  drink_name: string;
  drink_type: string;
  cafe_name: string;
  cafe_id: string;
  visit_id: string;
  city: string;
  rating: number;
}

// Form types for Add Visit

export interface VisitFormData {
  cafe: Cafe | null;
  visited_at: string;
  drinks: DrinkFormData[];
  experience_ratings: Partial<Record<ExperienceDimensionKey, number>>;
  photos: string[]; // local URIs before save
  notes: string;
}

export interface DrinkFormData {
  id: string; // temp ID for list key
  name: string;
  type: string;
  rating: number;
  notes: string;
}

export type ExperienceDimensionKey =
  | 'coffee_quality'
  | 'interior_design'
  | 'vibe'
  | 'work_friendliness'
  | 'location_surroundings'
  | 'value'
  | 'wait_time'
  | 'food_pastries';
