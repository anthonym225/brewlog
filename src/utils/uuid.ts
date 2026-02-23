// T04: UUID generation utility

import * as Crypto from 'expo-crypto';

/**
 * Generates a new UUID v4 string.
 * Used as primary key for all entities (cafes, visits, drinks, photos).
 */
export function generateUUID(): string {
  return Crypto.randomUUID();
}
