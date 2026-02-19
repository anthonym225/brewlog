// T09: Drink CRUD Operations

import { getDatabase } from '@/db/database';
import type { Drink } from '@/types';

/**
 * Insert a single drink into the database.
 * Automatically sets created_at timestamp.
 */
export async function insertDrink(
  drink: Omit<Drink, 'created_at'>
): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO drinks (id, visit_id, name, type, rating, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [drink.id, drink.visit_id, drink.name, drink.type, drink.rating, drink.notes, now]
  );
}

/**
 * Batch insert multiple drinks for a visit.
 * Automatically sets created_at timestamp for all drinks.
 * If the array is empty, this is a no-op.
 */
export async function insertDrinks(
  drinks: Omit<Drink, 'created_at'>[]
): Promise<void> {
  if (drinks.length === 0) {
    return;
  }

  const db = getDatabase();
  const now = new Date().toISOString();

  for (const drink of drinks) {
    await db.runAsync(
      `INSERT INTO drinks (id, visit_id, name, type, rating, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [drink.id, drink.visit_id, drink.name, drink.type, drink.rating, drink.notes, now]
    );
  }
}

/**
 * Get all drinks for a specific visit, ordered by creation time.
 */
export async function getDrinksByVisitId(visitId: string): Promise<Drink[]> {
  const db = getDatabase();
  return db.getAllAsync<Drink>(
    'SELECT * FROM drinks WHERE visit_id = ? ORDER BY created_at ASC',
    [visitId]
  );
}

/**
 * Update a drink's fields. Only the provided fields are updated.
 */
export async function updateDrink(
  id: string,
  updates: Partial<Omit<Drink, 'id' | 'visit_id' | 'created_at'>>
): Promise<void> {
  const db = getDatabase();

  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.type !== undefined) {
    fields.push('type = ?');
    values.push(updates.type);
  }
  if (updates.rating !== undefined) {
    fields.push('rating = ?');
    values.push(updates.rating);
  }
  if (updates.notes !== undefined) {
    fields.push('notes = ?');
    values.push(updates.notes);
  }

  if (fields.length === 0) {
    return;
  }

  values.push(id);

  await db.runAsync(
    `UPDATE drinks SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

/**
 * Delete a single drink by ID.
 */
export async function deleteDrink(id: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM drinks WHERE id = ?', [id]);
}

/**
 * Delete all drinks for a specific visit.
 * Used when re-saving a visit's drinks (delete all, then re-insert).
 */
export async function deleteDrinksByVisitId(visitId: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM drinks WHERE visit_id = ?', [visitId]);
}
