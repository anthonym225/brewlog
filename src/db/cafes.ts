// T07: Cafe CRUD Operations

import { getDatabase } from '@/db/database';
import type { Cafe, CafeWithStats } from '@/types';

/**
 * Insert a new cafe into the database.
 * Automatically sets created_at and updated_at timestamps.
 */
export async function insertCafe(
  cafe: Omit<Cafe, 'created_at' | 'updated_at'>
): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO cafes (id, google_place_id, name, address, city, country, latitude, longitude, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      cafe.id,
      cafe.google_place_id,
      cafe.name,
      cafe.address,
      cafe.city,
      cafe.country,
      cafe.latitude,
      cafe.longitude,
      now,
      now,
    ]
  );
}

/**
 * Get a single cafe by its ID.
 * Returns null if not found.
 */
export async function getCafeById(id: string): Promise<Cafe | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<Cafe>(
    'SELECT * FROM cafes WHERE id = ?',
    [id]
  );
  return row ?? null;
}

/**
 * Find an existing cafe by its Google Place ID.
 * Used for deduplication when adding visits to the same cafe.
 * Returns null if no cafe with this place ID exists, or if placeId is null.
 */
export async function getCafeByGooglePlaceId(
  placeId: string
): Promise<Cafe | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<Cafe>(
    'SELECT * FROM cafes WHERE google_place_id = ?',
    [placeId]
  );
  return row ?? null;
}

/**
 * Get all cafes, ordered by name.
 */
export async function getAllCafes(): Promise<Cafe[]> {
  const db = getDatabase();
  return db.getAllAsync<Cafe>('SELECT * FROM cafes ORDER BY name ASC');
}

/**
 * Get all cafes with aggregate stats from their visits:
 * - visit_count: total number of visits
 * - avg_overall_rating: average of overall_rating across visits (null if no ratings)
 * - last_visited_at: most recent visit date (null if no visits)
 *
 * Results are ordered by most recently visited first.
 */
export async function getCafesWithStats(): Promise<CafeWithStats[]> {
  const db = getDatabase();
  return db.getAllAsync<CafeWithStats>(
    `SELECT
       c.*,
       COUNT(v.id) AS visit_count,
       AVG(v.overall_rating) AS avg_overall_rating,
       MAX(v.visited_at) AS last_visited_at
     FROM cafes c
     LEFT JOIN visits v ON v.cafe_id = c.id
     GROUP BY c.id
     ORDER BY last_visited_at DESC NULLS LAST, c.name ASC`
  );
}

/**
 * Update a cafe's fields. Only the provided fields are updated.
 * Always updates the updated_at timestamp.
 */
export async function updateCafe(
  id: string,
  updates: Partial<Omit<Cafe, 'id' | 'created_at' | 'updated_at'>>
): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();

  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.google_place_id !== undefined) {
    fields.push('google_place_id = ?');
    values.push(updates.google_place_id);
  }
  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.address !== undefined) {
    fields.push('address = ?');
    values.push(updates.address);
  }
  if (updates.city !== undefined) {
    fields.push('city = ?');
    values.push(updates.city);
  }
  if (updates.country !== undefined) {
    fields.push('country = ?');
    values.push(updates.country);
  }
  if (updates.latitude !== undefined) {
    fields.push('latitude = ?');
    values.push(updates.latitude);
  }
  if (updates.longitude !== undefined) {
    fields.push('longitude = ?');
    values.push(updates.longitude);
  }

  // Always update the timestamp
  fields.push('updated_at = ?');
  values.push(now);

  if (fields.length === 1) {
    // Only updated_at — still run the update to bump timestamp
  }

  values.push(id);

  await db.runAsync(
    `UPDATE cafes SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

/**
 * Delete a cafe by ID.
 * CASCADE foreign keys will automatically delete associated visits, drinks, and photos.
 */
export async function deleteCafe(id: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM cafes WHERE id = ?', [id]);
}
