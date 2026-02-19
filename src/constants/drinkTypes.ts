// T03: Drink type constants from DESIGN.md Section 4.5

export const DRINK_TYPES = [
  'Espresso',
  'Americano',
  'Iced Americano',
  'Cappuccino',
  'Latte',
  'Iced Latte',
  'Flat White',
  'Cortado',
  'Macchiato',
  'Mocha',
  'Matcha Latte',
  'Iced Matcha Latte',
  'Chai',
  'Tea',
  'Cold Brew',
  'Iced Coffee',
  'Other',
] as const;

export type DrinkType = (typeof DRINK_TYPES)[number];
