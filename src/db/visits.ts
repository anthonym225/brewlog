// T08: Visit CRUD Operations

import { getDatabase } from '@/db/database';
import type { Visit, VisitWithDetails, Drink, Photo, Cafe } from '@/types';

/**
 * Insert a new visit into the database.
 * Automatically sets created_at and updated_at timestamps.
 */
export async function insertVisit(
  visit: Omit<Visit, 'created_at' | 'updated_at'>
): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO visits (
       id, cafe_id, visited_at, notes, overall_rating, coffee_quality,
       interior_design, vibe, work_friendliness, location_surroundings,
       value, wait_time, food_pastries, created_at, updated_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      visit.id,
      visit.cafe_id,
      visit.visited_at,
      visit.notes,
      visit.overall_rating,
      visit.coffee_quality,
      visit.interior_design,
      visit.vibe,
      visit.work_friendliness,
      visit.location_surroundings,
      visit.value,
      visit.wait_time,
      visit.food_pastries,
      now,
      now,
    ]
  );
}

/**
 * Get a single visit by its ID.
 * Returns null if not found.
 */
export async function getVisitById(id: string): Promise<Visit | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<Visit>(
    'SELECT * FROM visits WHERE id = ?',
    [id]
  );
  return row ?? null;
}

/**
 * Get a single visit with its associated cafe, drinks, and photos.
 * Returns null if the visit does not exist.
 */
export async function getVisitWithDetails(
  id: string
): Promise<VisitWithDetails | null> {
  const db = getDatabase();

  // Get the visit joined with its cafe
  const visitRow = await db.getFirstAsync<Record<string, unknown>>(
    `SELECT
       v.*,
       c.id AS cafe_id_ref,
       c.google_place_id AS cafe_google_place_id,
       c.name AS cafe_name,
       c.address AS cafe_address,
       c.city AS cafe_city,
       c.country AS cafe_country,
       c.latitude AS cafe_latitude,
       c.longitude AS cafe_longitude,
       c.created_at AS cafe_created_at,
       c.updated_at AS cafe_updated_at
     FROM visits v
     INNER JOIN cafes c ON c.id = v.cafe_id
     WHERE v.id = ?`,
    [id]
  );

  if (!visitRow) {
    return null;
  }

  // Query drinks and photos for this visit
  const drinks = await db.getAllAsync<Drink>(
    'SELECT * FROM drinks WHERE visit_id = ? ORDER BY created_at ASC',
    [id]
  );

  const photos = await db.getAllAsync<Photo>(
    'SELECT * FROM photos WHERE visit_id = ? ORDER BY sort_order ASC',
    [id]
  );

  return assembleVisitWithDetails(visitRow, drinks, photos);
}

/**
 * Get all visits with details, ordered by visited_at DESC (newest first).
 * Used for the timeline feed.
 */
export async function getAllVisitsWithDetails(): Promise<VisitWithDetails[]> {
  const db = getDatabase();

  // Get all visits with cafe info
  const rows = await db.getAllAsync<Record<string, unknown>>(
    `SELECT
       v.*,
       c.id AS cafe_id_ref,
       c.google_place_id AS cafe_google_place_id,
       c.name AS cafe_name,
       c.address AS cafe_address,
       c.city AS cafe_city,
       c.country AS cafe_country,
       c.latitude AS cafe_latitude,
       c.longitude AS cafe_longitude,
       c.created_at AS cafe_created_at,
       c.updated_at AS cafe_updated_at
     FROM visits v
     INNER JOIN cafes c ON c.id = v.cafe_id
     ORDER BY v.visited_at DESC`
  );

  if (rows.length === 0) {
    return [];
  }

  const visitIds = rows.map((r) => r.id as string);

  // Batch query drinks and photos for all visits
  const placeholders = visitIds.map(() => '?').join(',');

  const allDrinks = await db.getAllAsync<Drink>(
    `SELECT * FROM drinks WHERE visit_id IN (${placeholders}) ORDER BY created_at ASC`,
    visitIds
  );

  const allPhotos = await db.getAllAsync<Photo>(
    `SELECT * FROM photos WHERE visit_id IN (${placeholders}) ORDER BY sort_order ASC`,
    visitIds
  );

  // Group drinks and photos by visit_id
  const drinksByVisit = new Map<string, Drink[]>();
  for (const drink of allDrinks) {
    const list = drinksByVisit.get(drink.visit_id) ?? [];
    list.push(drink);
    drinksByVisit.set(drink.visit_id, list);
  }

  const photosByVisit = new Map<string, Photo[]>();
  for (const photo of allPhotos) {
    const list = photosByVisit.get(photo.visit_id) ?? [];
    list.push(photo);
    photosByVisit.set(photo.visit_id, list);
  }

  // Assemble results
  return rows.map((row) => {
    const visitId = row.id as string;
    return assembleVisitWithDetails(
      row,
      drinksByVisit.get(visitId) ?? [],
      photosByVisit.get(visitId) ?? []
    );
  });
}

/**
 * Get all visits for a specific cafe, with details.
 * Ordered by visited_at DESC (newest first).
 */
export async function getVisitsByCafeId(
  cafeId: string
): Promise<VisitWithDetails[]> {
  const db = getDatabase();

  const rows = await db.getAllAsync<Record<string, unknown>>(
    `SELECT
       v.*,
       c.id AS cafe_id_ref,
       c.google_place_id AS cafe_google_place_id,
       c.name AS cafe_name,
       c.address AS cafe_address,
       c.city AS cafe_city,
       c.country AS cafe_country,
       c.latitude AS cafe_latitude,
       c.longitude AS cafe_longitude,
       c.created_at AS cafe_created_at,
       c.updated_at AS cafe_updated_at
     FROM visits v
     INNER JOIN cafes c ON c.id = v.cafe_id
     WHERE v.cafe_id = ?
     ORDER BY v.visited_at DESC`,
    [cafeId]
  );

  if (rows.length === 0) {
    return [];
  }

  const visitIds = rows.map((r) => r.id as string);
  const placeholders = visitIds.map(() => '?').join(',');

  const allDrinks = await db.getAllAsync<Drink>(
    `SELECT * FROM drinks WHERE visit_id IN (${placeholders}) ORDER BY created_at ASC`,
    visitIds
  );

  const allPhotos = await db.getAllAsync<Photo>(
    `SELECT * FROM photos WHERE visit_id IN (${placeholders}) ORDER BY sort_order ASC`,
    visitIds
  );

  const drinksByVisit = new Map<string, Drink[]>();
  for (const drink of allDrinks) {
    const list = drinksByVisit.get(drink.visit_id) ?? [];
    list.push(drink);
    drinksByVisit.set(drink.visit_id, list);
  }

  const photosByVisit = new Map<string, Photo[]>();
  for (const photo of allPhotos) {
    const list = photosByVisit.get(photo.visit_id) ?? [];
    list.push(photo);
    photosByVisit.set(photo.visit_id, list);
  }

  return rows.map((row) => {
    const visitId = row.id as string;
    return assembleVisitWithDetails(
      row,
      drinksByVisit.get(visitId) ?? [],
      photosByVisit.get(visitId) ?? []
    );
  });
}

/**
 * Update a visit's fields. Only the provided fields are updated.
 * Always updates the updated_at timestamp.
 */
export async function updateVisit(
  id: string,
  updates: Partial<
    Omit<Visit, 'id' | 'cafe_id' | 'created_at' | 'updated_at'>
  >
): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();

  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  const allowedKeys: Array<keyof typeof updates> = [
    'visited_at',
    'notes',
    'overall_rating',
    'coffee_quality',
    'interior_design',
    'vibe',
    'work_friendliness',
    'location_surroundings',
    'value',
    'wait_time',
    'food_pastries',
  ];

  for (const key of allowedKeys) {
    if (updates[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(updates[key] as string | number | null);
    }
  }

  fields.push('updated_at = ?');
  values.push(now);
  values.push(id);

  await db.runAsync(
    `UPDATE visits SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

/**
 * Delete a visit by ID.
 * CASCADE foreign keys will automatically delete associated drinks and photos.
 */
export async function deleteVisit(id: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM visits WHERE id = ?', [id]);
}

// --- Internal helpers ---

/**
 * Assembles a VisitWithDetails object from a flat joined row plus drinks and photos arrays.
 */
function assembleVisitWithDetails(
  row: Record<string, unknown>,
  drinks: Drink[],
  photos: Photo[]
): VisitWithDetails {
  const cafe: Cafe = {
    id: row.cafe_id as string,
    google_place_id: (row.cafe_google_place_id as string | null) ?? null,
    name: row.cafe_name as string,
    address: row.cafe_address as string,
    city: row.cafe_city as string,
    country: row.cafe_country as string,
    latitude: row.cafe_latitude as number,
    longitude: row.cafe_longitude as number,
    created_at: row.cafe_created_at as string,
    updated_at: row.cafe_updated_at as string,
  };

  const visit: VisitWithDetails = {
    id: row.id as string,
    cafe_id: row.cafe_id as string,
    visited_at: row.visited_at as string,
    notes: (row.notes as string | null) ?? null,
    overall_rating: (row.overall_rating as number | null) ?? null,
    coffee_quality: (row.coffee_quality as number | null) ?? null,
    interior_design: (row.interior_design as number | null) ?? null,
    vibe: (row.vibe as number | null) ?? null,
    work_friendliness: (row.work_friendliness as number | null) ?? null,
    location_surroundings:
      (row.location_surroundings as number | null) ?? null,
    value: (row.value as number | null) ?? null,
    wait_time: (row.wait_time as number | null) ?? null,
    food_pastries: (row.food_pastries as number | null) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    cafe,
    drinks,
    photos,
  };

  return visit;
}
