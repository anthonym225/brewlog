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
- DB: `src/db/schema.ts`, `src/db/database.ts`
- Constants: `src/constants/drinkTypes.ts`, `src/constants/experienceDimensions.ts`
- Utils: `src/utils/uuid.ts`, `src/utils/ratings.ts`, `src/utils/formatting.ts`
- Store: `src/stores/useAppStore.ts`

## Completed Phases
- **Phase 1** (T01, T06): Project init + navigation shell
- **Phase 2** (T02, T03, T04, T05, T18): Types, constants, utils, DB schema, Zustand store

## Key Patterns
- Path alias: `@/*` maps to `src/*`
- All PKs are TEXT (UUID) using `uuid` v4
- expo-sqlite v16 async API: `openDatabaseAsync`, `execAsync`, `getAllAsync`
- npm installs need `--legacy-peer-deps` flag
- Colors: primary brown `#8B5E3C`, bg `#FFFAF5`, text `#3C2A1A`
- TypeScript strict mode enabled

## Next Up
- Phase 3: 11 tasks (T07-T17) all unblocked — DB CRUD + UI components
