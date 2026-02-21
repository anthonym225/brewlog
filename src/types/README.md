# src/types/

TypeScript interfaces for all data models. Single source of truth — everything imports from here.

## File

### `index.ts`

**Entity interfaces** (mirror the SQLite tables):

| Interface | Table |
|-----------|-------|
| `Cafe` | `cafes` |
| `Visit` | `visits` |
| `Drink` | `drinks` |
| `Photo` | `photos` |

**Composite types** (assembled in TypeScript from joined queries):

| Interface | Description |
|-----------|-------------|
| `VisitWithDetails` | Visit + Cafe + Drink[] + Photo[] |
| `CafeWithStats` | Cafe + visit_count + avg_rating + last_visited_at |
| `RankingEntry` | Rank, cafe name, city, rating |
| `DrinkRankingEntry` | Rank, drink name, type, cafe, rating |

**Form types** (UI state, not persisted directly):

| Interface | Description |
|-----------|-------------|
| `VisitFormData` | Draft state for the Add Visit form |
| `DrinkFormData` | Single drink row in the form (uses temp `id` as list key) |

**Utility types:**

| Type | Description |
|------|-------------|
| `ExperienceDimensionKey` | Union of all 8 experience rating column names |
| `AppStats` | Aggregated stats returned by `getStats()` for the Profile screen |
