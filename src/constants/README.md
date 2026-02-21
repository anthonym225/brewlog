# src/constants/

Static app-wide constants. These are the single source of truth for drink types and experience rating dimensions.

## Files

### `drinkTypes.ts`

Exports `DRINK_TYPES: readonly string[]` — the list of selectable drink categories used in the DrinkRow type picker and Rankings screen tabs (Top Espressos, Top Cappuccinos, etc.).

### `experienceDimensions.ts`

Exports `EXPERIENCE_DIMENSIONS` — an array of objects describing each rating dimension:

```ts
interface ExperienceDimension {
  key: ExperienceDimensionKey;   // matches Visit column name
  label: string;                  // display label
  category: string;               // grouping in Add Visit form
}
```

These keys map directly to columns on the `visits` table. Adding a new dimension requires a DB migration — the constants and schema must stay in sync.
