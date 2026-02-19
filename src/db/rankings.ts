// T11: Rankings & Aggregation Queries

import { getDatabase } from '@/db/database';
import type {
  ExperienceDimensionKey,
  RankingEntry,
  DrinkRankingEntry,
} from '@/types';

/**
 * Allowed column names for experience dimensions.
 * Used to validate the dimension key before interpolating into SQL.
 */
const VALID_DIMENSIONS: ReadonlySet<string> = new Set<string>([
  'coffee_quality',
  'interior_design',
  'vibe',
  'work_friendliness',
  'location_surroundings',
  'value',
  'wait_time',
  'food_pastries',
]);

/**
 * Rank cafes by the average of a specific experience dimension across all visits.
 * Only includes cafes that have at least one visit with a non-null value for the dimension.
 * Results are sorted by rating DESC.
 */
export async function getCafeRankings(
  dimension: ExperienceDimensionKey
): Promise<RankingEntry[]> {
  if (!VALID_DIMENSIONS.has(dimension)) {
    throw new Error(`Invalid dimension key: ${dimension}`);
  }

  const db = getDatabase();

  // Safe to interpolate dimension because we validated it against the whitelist above
  const rows = await db.getAllAsync<{ cafe_id: string; cafe_name: string; city: string; avg_rating: number }>(
    `SELECT
       c.id AS cafe_id,
       c.name AS cafe_name,
       c.city,
       AVG(v.${dimension}) AS avg_rating
     FROM visits v
     INNER JOIN cafes c ON c.id = v.cafe_id
     WHERE v.${dimension} IS NOT NULL
     GROUP BY c.id
     ORDER BY avg_rating DESC`
  );

  return rows.map((row, index) => ({
    rank: index + 1,
    cafe_name: row.cafe_name,
    cafe_id: row.cafe_id,
    city: row.city,
    rating: Math.round(row.avg_rating * 10) / 10,
  }));
}

/**
 * Rank individual drinks of a specific type by their rating.
 * Includes the cafe name and city for display.
 * Results are sorted by rating DESC, then by drink name ASC for ties.
 */
export async function getDrinkRankings(
  drinkType: string
): Promise<DrinkRankingEntry[]> {
  const db = getDatabase();

  const rows = await db.getAllAsync<{
    drink_name: string;
    drink_type: string;
    cafe_name: string;
    cafe_id: string;
    visit_id: string;
    city: string;
    rating: number;
  }>(
    `SELECT
       d.name AS drink_name,
       d.type AS drink_type,
       c.name AS cafe_name,
       c.id AS cafe_id,
       d.visit_id,
       c.city,
       d.rating
     FROM drinks d
     INNER JOIN visits v ON v.id = d.visit_id
     INNER JOIN cafes c ON c.id = v.cafe_id
     WHERE d.type = ?
     ORDER BY d.rating DESC, d.name ASC`,
    [drinkType]
  );

  return rows.map((row, index) => ({
    rank: index + 1,
    drink_name: row.drink_name,
    drink_type: row.drink_type,
    cafe_name: row.cafe_name,
    cafe_id: row.cafe_id,
    visit_id: row.visit_id,
    city: row.city,
    rating: row.rating,
  }));
}

/**
 * Rank cafes by the average of ALL non-null experience dimensions across all visits.
 * This computes the average of averages per dimension per cafe.
 * Only includes cafes with at least one rated dimension.
 * Results are sorted by rating DESC.
 */
export async function getOverallCafeRankings(): Promise<RankingEntry[]> {
  const db = getDatabase();

  // For each visit, compute the average of all non-null dimensions,
  // then average those per cafe.
  const rows = await db.getAllAsync<{ cafe_id: string; cafe_name: string; city: string; avg_rating: number }>(
    `SELECT
       c.id AS cafe_id,
       c.name AS cafe_name,
       c.city,
       AVG(visit_avg) AS avg_rating
     FROM (
       SELECT
         v.cafe_id,
         (
           COALESCE(v.coffee_quality, 0) * (v.coffee_quality IS NOT NULL) +
           COALESCE(v.interior_design, 0) * (v.interior_design IS NOT NULL) +
           COALESCE(v.vibe, 0) * (v.vibe IS NOT NULL) +
           COALESCE(v.work_friendliness, 0) * (v.work_friendliness IS NOT NULL) +
           COALESCE(v.location_surroundings, 0) * (v.location_surroundings IS NOT NULL) +
           COALESCE(v.value, 0) * (v.value IS NOT NULL) +
           COALESCE(v.wait_time, 0) * (v.wait_time IS NOT NULL) +
           COALESCE(v.food_pastries, 0) * (v.food_pastries IS NOT NULL)
         ) * 1.0 / NULLIF(
           (v.coffee_quality IS NOT NULL) +
           (v.interior_design IS NOT NULL) +
           (v.vibe IS NOT NULL) +
           (v.work_friendliness IS NOT NULL) +
           (v.location_surroundings IS NOT NULL) +
           (v.value IS NOT NULL) +
           (v.wait_time IS NOT NULL) +
           (v.food_pastries IS NOT NULL),
           0
         ) AS visit_avg
       FROM visits v
     ) sub
     INNER JOIN cafes c ON c.id = sub.cafe_id
     WHERE sub.visit_avg IS NOT NULL
     GROUP BY c.id
     ORDER BY avg_rating DESC`
  );

  return rows.map((row, index) => ({
    rank: index + 1,
    cafe_name: row.cafe_name,
    cafe_id: row.cafe_id,
    city: row.city,
    rating: Math.round(row.avg_rating * 10) / 10,
  }));
}

/**
 * AppStats interface matching the Profile screen requirements.
 */
export interface AppStats {
  total_cafes: number;
  total_visits: number;
  total_drinks: number;
  cities: string[];
  countries: string[];
  avg_rating: number | null;
  favorite_drink_type: string | null;
  most_visited_cafe: { name: string; count: number } | null;
  highest_rated_cafe: { name: string; rating: number } | null;
  current_month_visits: number;
  previous_month_visits: number;
}

/**
 * Get all stats for the Profile screen.
 * Handles empty database gracefully (returns zeros and nulls).
 */
export async function getStats(): Promise<AppStats> {
  const db = getDatabase();

  // Basic counts
  const counts = await db.getFirstAsync<{
    total_cafes: number;
    total_visits: number;
    total_drinks: number;
    avg_rating: number | null;
  }>(
    `SELECT
       (SELECT COUNT(*) FROM cafes) AS total_cafes,
       (SELECT COUNT(*) FROM visits) AS total_visits,
       (SELECT COUNT(*) FROM drinks) AS total_drinks,
       (SELECT AVG(overall_rating) FROM visits WHERE overall_rating IS NOT NULL) AS avg_rating`
  );

  // Distinct cities
  const cityRows = await db.getAllAsync<{ city: string }>(
    'SELECT DISTINCT city FROM cafes ORDER BY city ASC'
  );
  const cities = cityRows.map((r) => r.city);

  // Distinct countries
  const countryRows = await db.getAllAsync<{ country: string }>(
    'SELECT DISTINCT country FROM cafes ORDER BY country ASC'
  );
  const countries = countryRows.map((r) => r.country);

  // Favorite drink type (most frequently ordered)
  const favDrinkRow = await db.getFirstAsync<{ type: string; cnt: number }>(
    `SELECT type, COUNT(*) AS cnt
     FROM drinks
     GROUP BY type
     ORDER BY cnt DESC
     LIMIT 1`
  );

  // Most visited cafe
  const mostVisitedRow = await db.getFirstAsync<{ name: string; cnt: number }>(
    `SELECT c.name, COUNT(v.id) AS cnt
     FROM visits v
     INNER JOIN cafes c ON c.id = v.cafe_id
     GROUP BY c.id
     ORDER BY cnt DESC
     LIMIT 1`
  );

  // Highest rated cafe (by average overall_rating)
  const highestRatedRow = await db.getFirstAsync<{
    name: string;
    avg_rating: number;
  }>(
    `SELECT c.name, AVG(v.overall_rating) AS avg_rating
     FROM visits v
     INNER JOIN cafes c ON c.id = v.cafe_id
     WHERE v.overall_rating IS NOT NULL
     GROUP BY c.id
     ORDER BY avg_rating DESC
     LIMIT 1`
  );

  // Current month and previous month visit counts
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-indexed

  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const currentMonthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  const prevMonthPrefix = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;

  const monthCounts = await db.getFirstAsync<{
    current_month: number;
    previous_month: number;
  }>(
    `SELECT
       (SELECT COUNT(*) FROM visits WHERE visited_at LIKE ? || '%') AS current_month,
       (SELECT COUNT(*) FROM visits WHERE visited_at LIKE ? || '%') AS previous_month`,
    [currentMonthPrefix, prevMonthPrefix]
  );

  return {
    total_cafes: counts?.total_cafes ?? 0,
    total_visits: counts?.total_visits ?? 0,
    total_drinks: counts?.total_drinks ?? 0,
    cities,
    countries,
    avg_rating: counts?.avg_rating != null
      ? Math.round(counts.avg_rating * 10) / 10
      : null,
    favorite_drink_type: favDrinkRow?.type ?? null,
    most_visited_cafe: mostVisitedRow
      ? { name: mostVisitedRow.name, count: mostVisitedRow.cnt }
      : null,
    highest_rated_cafe: highestRatedRow
      ? {
          name: highestRatedRow.name,
          rating: Math.round(highestRatedRow.avg_rating * 10) / 10,
        }
      : null,
    current_month_visits: monthCounts?.current_month ?? 0,
    previous_month_visits: monthCounts?.previous_month ?? 0,
  };
}
