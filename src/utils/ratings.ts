// T04: Rating computation helpers

import type { Visit, Drink, ExperienceDimensionKey } from '../types';

/**
 * The 8 experience dimension keys that map to columns on the Visit entity.
 */
const EXPERIENCE_KEYS: ExperienceDimensionKey[] = [
  'coffee_quality',
  'interior_design',
  'vibe',
  'work_friendliness',
  'location_surroundings',
  'value',
  'wait_time',
  'food_pastries',
];

/**
 * Computes the overall experience rating for a visit as the average of all
 * non-null experience dimension ratings. Returns null if no dimensions are rated.
 *
 * Result is rounded to one decimal place.
 */
export function computeOverallRating(visit: Visit): number | null {
  const values: number[] = [];

  for (const key of EXPERIENCE_KEYS) {
    const val = visit[key];
    if (val != null) {
      values.push(val);
    }
  }

  if (values.length === 0) {
    return null;
  }

  const sum = values.reduce((acc, v) => acc + v, 0);
  return Math.round((sum / values.length) * 10) / 10;
}

/**
 * Computes the coffee quality score as the average of all drink ratings.
 * Returns null if the drinks array is empty.
 *
 * Result is rounded to one decimal place.
 */
export function computeCoffeeQuality(drinks: Drink[]): number | null {
  if (drinks.length === 0) {
    return null;
  }

  const sum = drinks.reduce((acc, drink) => acc + drink.rating, 0);
  return Math.round((sum / drinks.length) * 10) / 10;
}
