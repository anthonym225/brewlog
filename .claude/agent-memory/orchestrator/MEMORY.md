# BrewLog Orchestrator Memory

## Project Overview
- "Letterboxd for coffee" personal cafe journal mobile app
- React Native + Expo SDK 54, TypeScript, expo-sqlite v16, Zustand v5
- Local-only SQLite database, no backend (Phase 0 MVP)

## Key File Paths
- Design doc: `docs/DESIGN.md`
- Task specs: `docs/TASKS.md`
- Status tracker: `docs/STATUS.md`
- Types: `src/types/index.ts`
- DB: `src/db/schema.ts`, `src/db/database.ts`, `src/db/cafes.ts`, `src/db/visits.ts`, `src/db/drinks.ts`, `src/db/photos.ts`, `src/db/rankings.ts`
- Constants: `src/constants/drinkTypes.ts`, `src/constants/experienceDimensions.ts`
- Utils: `src/utils/uuid.ts`, `src/utils/ratings.ts`, `src/utils/formatting.ts`
- Store: `src/stores/useAppStore.ts`
- Components: `src/components/RatingSlider.tsx`, `DrinkRow.tsx`, `VisitCard.tsx`, `PhotoStrip.tsx`, `EmptyState.tsx`, `StatCard.tsx`

## Completed Phases
- **Phase 1** (T01, T06): Project init + navigation shell
- **Phase 2** (T02, T03, T04, T05, T18): Types, constants, utils, DB schema, Zustand store
- **Phase 3** (T07-T17): DB CRUD operations + UI components

## Key Patterns
- Path alias: `@/*` maps to `src/*`
- All PKs are TEXT (UUID) using `uuid` v4
- expo-sqlite v16 async API: `openDatabaseAsync`, `execAsync`, `getAllAsync`
- npm installs need `--legacy-peer-deps` flag
- Colors: primary brown `#8B5E3C`, bg `#FFFAF5`, text `#3C2A1A`, inactive `#B0A090`
- TypeScript strict mode enabled

## TypeScript Gotchas
- expo-sqlite `runAsync` needs `(string | number | null)[]` not `unknown[]` for bind params
- JOIN query results should be typed as `Record<string, unknown>` not interface intersection types (TS index signature issue)
- `expo-image` must be explicitly installed (not bundled with Expo SDK 54)

## User Preferences
- Create PRs, do NOT merge (merge through GitHub UI)
- Single-branch strategy works well when all files are unique (no merge conflicts)

## Next Up
- Phase 4: 7 screen tasks (T19-T25) all unblocked
