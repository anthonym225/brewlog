# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start dev server
npx expo start

# Run on specific platform
npx expo start --ios
npx expo start --android

# TypeScript check (required before marking any task done)
npx tsc --noEmit
```

No test runner is configured. No lint script is configured.

## Architecture

BrewLog is a local-only React Native + Expo app (SDK 54) for logging personal cafe visits. It uses file-based routing via Expo Router, SQLite for all persistent data, and Zustand for UI-only state.

### Directory layout

```
app/                  # Expo Router screens (file-based routing)
  _layout.tsx         # Root Stack layout (headerShown: false for tabs, true for detail screens)
  (tabs)/             # Bottom tab navigator (Home, Map, Add, Rankings, Profile)
  visit/[id].tsx      # Visit Detail screen
  cafe/[id].tsx       # Cafe Page screen
src/
  db/                 # All SQLite operations — one file per entity
  components/         # Reusable UI components
  stores/             # Zustand store (UI state only, not persisted)
  constants/          # DRINK_TYPES and EXPERIENCE_DIMENSIONS arrays
  types/              # TypeScript interfaces (index.ts)
  utils/              # uuid, ratings, formatting, photos helpers
```

Path alias: `@/*` → `src/*`

### Database layer (`src/db/`)

- **Initialization**: `initDatabase()` in `database.ts` must be called once at app startup. It opens `brewlog.db`, enables WAL mode and foreign keys, then runs all `CREATE TABLE IF NOT EXISTS` statements. `getDatabase()` returns the singleton — throws if called before `initDatabase()`.
- **No ORM**: All queries are raw SQL with parameterized inputs. Each entity has its own file: `cafes.ts`, `visits.ts`, `drinks.ts`, `photos.ts`, `rankings.ts`.
- **Composite queries**: `getVisitWithDetails()` and `getAllVisitsWithDetails()` in `visits.ts` join across cafes/drinks/photos and assemble `VisitWithDetails` objects in TypeScript.
- **Rankings**: All computed at read time via SQL aggregation in `rankings.ts`. No denormalized tables.

### State management

- **SQLite** holds all persistent data.
- **Zustand** (`src/stores/useAppStore.ts`) holds UI-only state: active ranking tab and `VisitFormData` draft (form survives app backgrounding). Resets on restart — no persistence middleware.

### Data model (4 tables)

| Table | Key points |
|-------|-----------|
| `cafes` | UUID PK, optional `google_place_id` for deduplication, lat/lng for map |
| `visits` | FK → cafes, flat experience rating columns (8 dimensions), computed `overall_rating` and `coffee_quality` |
| `drinks` | FK → visits (CASCADE delete), `type` from DRINK_TYPES constant |
| `photos` | FK → visits (CASCADE delete), stores local filesystem path only |

### Google Places integration

Cafe search uses the Google Places Autocomplete + Place Details HTTP APIs (not an SDK). The API key is stored via `expo-constants`. Cafes are deduplicated across visits via `google_place_id`. Manual entry fallback is required for cafes not on Google.

### Photo storage

Photos are copied to the app's document directory via `expo-file-system`, resized to max 1200px via `expo-image-manipulator`, and the DB stores paths only. Photo files must be deleted manually when a visit is deleted (cascade only handles DB rows).

## Key design decisions

- Experience ratings are flat columns on `visits`, not a join table — fixed 8 dimensions.
- The `DRINK_TYPES` and `EXPERIENCE_DIMENSIONS` arrays in `src/constants/` are the source of truth for all dropdowns and rankings.
- Rankings only show if a category has ≥ 2 entries.
- Screens should re-query on focus (`useFocusEffect`) to stay fresh after navigation.
