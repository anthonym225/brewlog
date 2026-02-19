// T04: UUID generation utility

import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a new UUID v4 string.
 * Used as primary key for all entities (cafes, visits, drinks, photos).
 */
export function generateUUID(): string {
  return uuidv4();
}
