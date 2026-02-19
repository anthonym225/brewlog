// T05: Database initialization using expo-sqlite v16

import * as SQLite from 'expo-sqlite';
import { ALL_CREATE_STATEMENTS } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Returns the singleton database instance.
 * Throws if the database has not been initialized via initDatabase().
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error(
      'Database not initialized. Call initDatabase() before accessing the database.'
    );
  }
  return db;
}

/**
 * Initializes the SQLite database:
 * 1. Opens (or creates) the 'brewlog.db' database
 * 2. Enables WAL mode for better concurrent read performance
 * 3. Enables foreign key constraints
 * 4. Creates all tables if they do not exist
 *
 * Must be called once at app startup before any database operations.
 */
export async function initDatabase(): Promise<void> {
  db = await SQLite.openDatabaseAsync('brewlog.db');

  // Enable WAL mode for better write performance
  await db.execAsync('PRAGMA journal_mode = WAL;');

  // Enable foreign key constraint enforcement
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // Create all tables
  for (const statement of ALL_CREATE_STATEMENTS) {
    await db.execAsync(statement);
  }
}
