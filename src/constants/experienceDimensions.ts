// T03: Experience dimension constants from DESIGN.md Section 4.6

import type { ExperienceDimensionKey } from '../types';

export interface ExperienceDimension {
  key: ExperienceDimensionKey;
  label: string;
  category: 'Coffee' | 'Space' | 'Practical' | 'Food';
  description: string;
}

export const EXPERIENCE_DIMENSIONS: readonly ExperienceDimension[] = [
  {
    key: 'coffee_quality',
    label: 'Coffee Quality',
    category: 'Coffee',
    description: 'How good were the drinks overall?',
  },
  {
    key: 'interior_design',
    label: 'Interior & Design',
    category: 'Space',
    description: 'How does the space look and feel?',
  },
  {
    key: 'vibe',
    label: 'Vibe',
    category: 'Space',
    description: 'What is the overall atmosphere like?',
  },
  {
    key: 'work_friendliness',
    label: 'Work Friendliness',
    category: 'Space',
    description: 'How suitable is this cafe for working or studying?',
  },
  {
    key: 'location_surroundings',
    label: 'Location & Surroundings',
    category: 'Practical',
    description: 'How is the neighborhood and accessibility?',
  },
  {
    key: 'value',
    label: 'Value',
    category: 'Practical',
    description: 'How reasonable are the prices for what you get?',
  },
  {
    key: 'wait_time',
    label: 'Wait Time / Efficiency',
    category: 'Practical',
    description: 'How quick was the service?',
  },
  {
    key: 'food_pastries',
    label: 'Food & Pastries',
    category: 'Food',
    description: 'How good is the food and pastry selection?',
  },
] as const;

export const EXPERIENCE_CATEGORIES = ['Coffee', 'Space', 'Practical', 'Food'] as const;

export type ExperienceCategory = (typeof EXPERIENCE_CATEGORIES)[number];

/**
 * Returns experience dimensions grouped by category for rendering in sections.
 */
export function getDimensionsByCategory(): Record<ExperienceCategory, ExperienceDimension[]> {
  const grouped: Record<ExperienceCategory, ExperienceDimension[]> = {
    Coffee: [],
    Space: [],
    Practical: [],
    Food: [],
  };

  for (const dim of EXPERIENCE_DIMENSIONS) {
    grouped[dim.category].push(dim);
  }

  return grouped;
}
