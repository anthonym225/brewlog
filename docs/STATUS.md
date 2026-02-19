# BrewLog — Implementation Status

> **Last updated:** 2026-02-18 (Phase 2 complete)
> **Purpose:** Track task progress so any agent can pick up work efficiently. Always update this file when completing or starting a task.

---

## Quick Start for Agents

1. Read this file to understand current state.
2. Find the next available task(s) in **Phase 2** below.
3. Read the full task spec in `docs/TASKS.md` before starting.
4. Update the status table here when done.

**Key files to know:**
- `docs/TASKS.md` — Full task specs with acceptance criteria
- `docs/DESIGN.md` — Product design and data model (source of truth)
- `package.json` — Installed dependencies and versions

---

## Task Status

| ID | Task | Status | Phase | Notes |
|----|------|--------|-------|-------|
| T01 | Project Initialization | ✅ Done | 1 | Expo SDK 54, all deps installed |
| T02 | TypeScript Types & Interfaces | ✅ Done | 2 | All entity, composite, ranking, and form types defined |
| T03 | App Constants | ✅ Done | 2 | 17 drink types + 8 experience dimensions with categories |
| T04 | Utility Functions | ✅ Done | 2 | UUID, rating computation, date/number formatting |
| T05 | DB Schema & Initialization | ✅ Done | 2 | 4 tables with FKs, WAL mode, async init |
| T06 | Navigation Shell | ✅ Done | 2 | Tab layout + all placeholder screens created |
| T07 | Cafe CRUD | 🔲 Ready | 3 | Unblocked — T02 + T05 done |
| T08 | Visit CRUD | 🔲 Ready | 3 | Unblocked — T02 + T05 done |
| T09 | Drink CRUD | 🔲 Ready | 3 | Unblocked — T02 + T05 done |
| T10 | Photo CRUD | 🔲 Ready | 3 | Unblocked — T02 + T05 done |
| T11 | Rankings Queries | 🔲 Ready | 3 | Unblocked — T02 + T05 done |
| T12 | RatingSlider Component | 🔲 Ready | 3 | Unblocked — T02 + T03 done |
| T13 | DrinkRow Component | 🔲 Ready | 3 | Unblocked — T02 + T03 done |
| T14 | VisitCard Component | 🔲 Ready | 3 | Unblocked — T02 done |
| T15 | PhotoStrip Component | 🔲 Ready | 3 | Unblocked — T02 done |
| T16 | EmptyState Component | 🔲 Ready | 3 | Unblocked — T02 done |
| T17 | StatCard Component | 🔲 Ready | 3 | Unblocked — T02 done |
| T18 | Zustand Store | ✅ Done | 2 | activeRankingTab + visitFormDraft state |
| T19 | Add Visit Screen | ⏳ Blocked | 4 | Needs T06, T07, T12, T13, T15, T18 |
| T20 | Home / Timeline Screen | ⏳ Blocked | 4 | Needs T06, T08, T14, T16 |
| T21 | Visit Detail Screen | ⏳ Blocked | 4 | Needs T06, T08, T15 |
| T22 | Cafe Page Screen | ⏳ Blocked | 4 | Needs T06, T07, T08, T11 |
| T23 | Map Screen | ⏳ Blocked | 4 | Needs T06, T07 |
| T24 | Rankings Screen | ⏳ Blocked | 4 | Needs T06, T11 |
| T25 | Profile / Stats Screen | ⏳ Blocked | 4 | Needs T06, T11, T17 |
| T26 | Google Places Integration | ⏳ Blocked | 5 | Needs T19 |
| T27 | Photo Capture & Storage | ⏳ Blocked | 5 | Needs T19 + T10 |
| T28 | Polish & Integration Testing | ⏳ Blocked | 6 | Needs all screens |

**Status legend:** ✅ Done · 🚧 In Progress · 🔲 Ready (unblocked) · ⏳ Blocked

---

## Currently Unblocked (ready to work on in parallel)

**Phase 3 — all 11 tasks are unblocked:**
- **T07** — Cafe CRUD → `src/db/cafes.ts`
- **T08** — Visit CRUD → `src/db/visits.ts`
- **T09** — Drink CRUD → `src/db/drinks.ts`
- **T10** — Photo CRUD → `src/db/photos.ts`
- **T11** — Rankings Queries → `src/db/rankings.ts`
- **T12** — RatingSlider Component → `src/components/RatingSlider.tsx`
- **T13** — DrinkRow Component → `src/components/DrinkRow.tsx`
- **T14** — VisitCard Component → `src/components/VisitCard.tsx`
- **T15** — PhotoStrip Component → `src/components/PhotoStrip.tsx`
- **T16** — EmptyState Component → `src/components/EmptyState.tsx`
- **T17** — StatCard Component → `src/components/StatCard.tsx`

---

## What's Done

### T01 — Project Initialization
- Expo SDK 54 + TypeScript scaffolded
- `main` entry: `expo-router/entry`
- `scheme`: `brewlog`
- All dependencies installed (see `package.json`)
- TypeScript compiles with zero errors

### T02 — TypeScript Types & Interfaces
- All entity interfaces: `Cafe`, `Visit`, `Drink`, `Photo`
- Composite types: `VisitWithDetails`, `CafeWithStats`
- Ranking types: `RankingEntry`, `DrinkRankingEntry`
- Form types: `VisitFormData`, `DrinkFormData`
- Union type: `ExperienceDimensionKey` (8 dimension keys)
- All field names match SQLite column names exactly

### T03 — App Constants
- `DRINK_TYPES`: 17 drink types as `readonly` const array with `DrinkType` type
- `EXPERIENCE_DIMENSIONS`: 8 dimensions with `key`, `label`, `category`, `description`
- Categories: Coffee, Space, Practical, Food
- Helper: `getDimensionsByCategory()` for grouped rendering

### T04 — Utility Functions
- `generateUUID()`: uses `uuid` v4 via the `uuid` package
- `computeOverallRating(visit)`: averages non-null experience dimensions, returns null if none rated
- `computeCoffeeQuality(drinks)`: averages drink ratings, returns null for empty array
- `formatDate(isoString)`: produces "Jan 15, 2025" format
- `formatRating(rating)`: produces "8.5" or em-dash for null
- `formatRatingFraction(rating)`: produces "8.5/10" or em-dash for null

### T05 — DB Schema & Initialization
- 4 tables: `cafes`, `visits`, `drinks`, `photos`
- All PKs are TEXT (UUID), FKs with ON DELETE CASCADE
- `initDatabase()`: opens DB, enables WAL + foreign keys, creates tables
- `getDatabase()`: returns singleton instance (throws if not initialized)
- Uses expo-sqlite v16 async API

### T18 — Zustand Store
- `activeRankingTab`: string state (default `'top_cafes'`)
- `visitFormDraft`: `Partial<VisitFormData> | null` (default `null`)
- Actions: `setActiveRankingTab`, `setVisitFormDraft`, `clearVisitFormDraft`
- zustand v5, no persistence middleware

### T06 — Navigation Shell
- `app/_layout.tsx` — Root Stack layout (no header)
- `app/(tabs)/_layout.tsx` — 5-tab bottom bar (Home, Map, Add+, Rankings, Profile)
  - Add tab has a circular `#8B5E3C` button, no label
  - Color palette: active `#8B5E3C`, inactive `#B0A090`, bg `#FFFAF5`
- Placeholder screens created for all 5 tabs + `/visit/[id]` + `/cafe/[id]`

---

## Project Structure (current)

```
brewlog/
├── app/
│   ├── _layout.tsx               ✅ Root Stack layout
│   ├── (tabs)/
│   │   ├── _layout.tsx           ✅ Tab bar (5 tabs, warm coffee palette)
│   │   ├── index.tsx             ✅ Placeholder — Home
│   │   ├── map.tsx               ✅ Placeholder — Map
│   │   ├── add.tsx               ✅ Placeholder — Add Visit
│   │   ├── rankings.tsx          ✅ Placeholder — Rankings
│   │   └── profile.tsx           ✅ Placeholder — Profile
│   ├── visit/[id].tsx            ✅ Placeholder — Visit Detail
│   └── cafe/[id].tsx             ✅ Placeholder — Cafe Page
├── src/
│   ├── components/               🔲 Empty — awaiting Phase 3
│   ├── constants/
│   │   ├── drinkTypes.ts         ✅ T03 — 17 drink types
│   │   └── experienceDimensions.ts ✅ T03 — 8 dimensions with categories
│   ├── db/
│   │   ├── schema.ts             ✅ T05 — CREATE TABLE statements
│   │   └── database.ts           ✅ T05 — initDatabase + getDatabase
│   ├── stores/
│   │   └── useAppStore.ts        ✅ T18 — Zustand UI state store
│   ├── types/
│   │   └── index.ts              ✅ T02 — All entity + form types
│   └── utils/
│       ├── uuid.ts               ✅ T04 — UUID generation
│       ├── ratings.ts            ✅ T04 — Rating computations
│       └── formatting.ts         ✅ T04 — Date/number formatting
├── docs/
│   ├── DESIGN.md                 ✅ Product design (source of truth)
│   ├── TASKS.md                  ✅ Full task specs
│   └── STATUS.md                 ✅ This file
├── app.json                      ✅ Configured (scheme, plugins, permissions)
├── package.json                  ✅ All deps installed
└── tsconfig.json                 ✅ Strict, @/* path alias
```

---

## Key Decisions (locked in)

| Topic | Decision |
|-------|----------|
| Framework | Expo SDK 54, React Native 0.81.5, TypeScript |
| Router | Expo Router v6 (file-based), entry = `expo-router/entry` |
| DB | expo-sqlite v16 (async API: `openDatabaseAsync`) |
| State | Zustand v5 (UI state only; all data lives in SQLite) |
| Maps | react-native-maps v1.20.1 |
| UUIDs | `uuid` package v13 (v4) |
| Colors | Primary brown: `#8B5E3C`, bg: `#FFFAF5`, text: `#3C2A1A` |
| Path alias | `@/*` → `src/*` (configured in tsconfig) |
| Peer deps | `--legacy-peer-deps` needed for npm installs (react-dom conflict) |

---

## Notes for Agents

- **Import paths:** Use `@/types`, `@/db/database`, etc. (path alias configured)
- **SQLite API:** Use `expo-sqlite` v16 async API — `SQLite.openDatabaseAsync()`, `db.execAsync()`, `db.getAllAsync()`, etc.
- **UUID:** `import { v4 as uuidv4 } from 'uuid'`
- **npm installs:** Always use `--legacy-peer-deps` flag if adding new packages
- **Stubs:** Stub files in `src/` contain `export {}` — replace entirely when implementing the task
- **TypeScript:** Run `npx tsc --noEmit` to verify no type errors before marking a task done
