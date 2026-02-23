# Design: T28 Polish & Integration Testing

Date: 2026-02-22
Branch: feat/t28-polish

## Summary

Final integration pass for BrewLog. Primary deliverable is a fully-functional Edit Visit screen (`app/visit/edit/[id].tsx`). Secondary deliverables are three small polish fixes found during codebase audit.

## Scope

| Item | Files | Type |
|------|-------|------|
| Edit Visit screen | `app/visit/edit/[id].tsx` (new) | Feature |
| Wire edit button | `app/visit/[id].tsx` | Fix |
| SafeAreaView on detail screens | `app/visit/[id].tsx`, `app/cafe/[id].tsx` | Polish |
| Error logging in silent catches | `app/(tabs)/add.tsx`, `src/components/CafeSearchBar.tsx` | Polish |
| Mark T26/T27/T28 done in STATUS.md | `docs/STATUS.md` | Docs |

## Route and Navigation

- **Route:** `app/visit/edit/[id].tsx` — Expo Router serves it at `/visit/edit/:id`
- **Entry point:** `visit/[id].tsx` edit button → `router.push(\`/visit/edit/${id}\`)`
- **Exit:** `router.back()` on successful save — detail screen refreshes via `useFocusEffect`
- **Header:** Back chevron + "Edit Visit" title (Expo Router Stack, same pattern as other detail screens)

## Data Loading

On mount, call `getVisitWithDetails(id)`. Show `ActivityIndicator` while loading. Show "Visit not found" + back button on error.

Pre-fill form state:

| State | Source |
|-------|--------|
| `selectedCafe` | Existing cafe row (already in DB) |
| `visitedAt` | `visit.visited_at` |
| `drinks` | Existing drink rows → `DrinkFormData[]` (preserve UUIDs) |
| `experienceRatings` | 8 dimension columns (non-null values only) |
| `photos` | `file_path` strings from photos table |
| `notes` | `visit.notes ?? ''` |

Photos from existing visits are real file paths already on disk — displayed as-is in `PhotoStrip`, no re-saving needed.

## Save Logic (Reconciliation)

Run in order; bail on failure with an error alert:

1. **Cafe** — `selectedCafe` already in DB. If user changed cafe via `CafeSearchBar` or manual entry: insert/deduplicate new cafe first, capture its ID.

2. **`updateVisit(id, {...})`** — all visit columns: date, notes, all 8 rating dimensions, recomputed `overall_rating` and `coffee_quality`.

3. **Drinks reconciliation** (original UUIDs known from load):
   - UUID still in form → `updateDrink`
   - UUID removed → `deleteDrink`
   - New UUID (added during edit) → `insertDrink`

4. **Photos reconciliation** (original paths known from load):
   - Existing path still in form → no-op
   - Existing path removed → `deletePhotoFile(path)` + `deletePhoto(id)`
   - New picker URI (added during edit) → `savePhotoToStorage(uri)` + `insertPhoto`
   - Failure: clean up any newly written files to avoid orphans

## Polish Fixes

### SafeAreaView on detail screens
- `visit/[id].tsx` and `cafe/[id].tsx`: wrap `ScrollView` in `SafeAreaView` with `edges={['bottom']}`
- Stack navigator handles the top/header; only bottom edge needs protection

### Error logging
- `add.tsx`: 2 instances of `.catch(() => {})` → `.catch((err) => console.error(...))`
- `CafeSearchBar.tsx`: 2 instances of `.catch(() => {})` → `.catch((err) => console.error(...))`
- No user-facing change — improves observability

## Non-Goals

- No draft auto-save feedback (low priority, not blocking any flow)
- No Google Places API key (tracked in STATUS.md TODO)
- No shared VisitForm component refactor (YAGNI — can be done after T28)
