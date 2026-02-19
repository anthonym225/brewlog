// T10: Photo CRUD Operations

import { getDatabase } from '@/db/database';
import type { Photo } from '@/types';

/**
 * Insert a single photo into the database.
 * Automatically sets created_at timestamp.
 */
export async function insertPhoto(
  photo: Omit<Photo, 'created_at'>
): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO photos (id, visit_id, file_path, sort_order, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [photo.id, photo.visit_id, photo.file_path, photo.sort_order, now]
  );
}

/**
 * Batch insert multiple photos for a visit.
 * Automatically sets created_at timestamp for all photos.
 * If the array is empty, this is a no-op.
 */
export async function insertPhotos(
  photos: Omit<Photo, 'created_at'>[]
): Promise<void> {
  if (photos.length === 0) {
    return;
  }

  const db = getDatabase();
  const now = new Date().toISOString();

  for (const photo of photos) {
    await db.runAsync(
      `INSERT INTO photos (id, visit_id, file_path, sort_order, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [photo.id, photo.visit_id, photo.file_path, photo.sort_order, now]
    );
  }
}

/**
 * Get all photos for a specific visit, ordered by sort_order ascending.
 */
export async function getPhotosByVisitId(visitId: string): Promise<Photo[]> {
  const db = getDatabase();
  return db.getAllAsync<Photo>(
    'SELECT * FROM photos WHERE visit_id = ? ORDER BY sort_order ASC',
    [visitId]
  );
}

/**
 * Delete a single photo by ID.
 */
export async function deletePhoto(id: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM photos WHERE id = ?', [id]);
}

/**
 * Delete all photos for a specific visit.
 * Used when re-saving a visit's photos (delete all, then re-insert).
 */
export async function deletePhotosByVisitId(visitId: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM photos WHERE visit_id = ?', [visitId]);
}
