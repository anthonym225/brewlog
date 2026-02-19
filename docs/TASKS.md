# BrewLog MVP — Task Breakdown & Dependency Graph

---

## How to Read This Document

- Each task has an **ID** (e.g., `T01`), a title, description, acceptance criteria, and dependencies.
- **Dependencies** list which tasks must be completed before a task can start.
- **Parallel groups** show which tasks can be executed simultaneously.
- Tasks are scoped so that a Sonnet-class model can pick one up and complete it in a single session.

---

## Dependency Graph (Visual)

```
T01 (Project Init)
 ├──► T02 (Types & Interfaces)
 ├──► T03 (Constants)
 ├──► T04 (Utility Functions)
 ├──► T05 (DB Schema & Init)
 ├──► T06 (Navigation Shell)
 │
 │   ┌── T02, T05 ──► T07 (Cafe CRUD)
 │   ├── T02, T05 ──► T08 (Visit CRUD)
 │   ├── T02, T05 ──► T09 (Drink CRUD)
 │   ├── T02, T05 ──► T10 (Photo CRUD)
 │   └── T02, T05 ──► T11 (Rankings Queries)
 │
 │   ┌── T02, T03 ──► T12 (RatingSlider)
 │   ├── T02, T03 ──► T13 (DrinkRow)
 │   ├── T02       ──► T14 (VisitCard)
 │   ├── T02       ──► T15 (PhotoStrip)
 │   ├── T02       ──► T16 (EmptyState)
 │   └── T02       ──► T17 (StatCard)
 │
 │   ┌── T01       ──► T18 (Zustand Store)
 │
 │   T06, T07, T12, T13, T15, T18 ──► T19 (Add Visit Screen)
 │   T06, T08, T14, T16           ──► T20 (Home/Timeline Screen)
 │   T06, T08, T15                ──► T21 (Visit Detail Screen)
 │   T06, T07, T08, T11           ──► T22 (Cafe Page Screen)
 │   T06, T07                     ──► T23 (Map Screen)
 │   T06, T11                     ──► T24 (Rankings Screen)
 │   T06, T11, T17                ──► T25 (Profile/Stats Screen)
 │
 │   T19                          ──► T26 (Google Places Integration)
 │   T19, T10                     ──► T27 (Photo Capture & Storage)
 │
 └── All screens done             ──► T28 (Polish & Integration Testing)
```

---

## Parallel Execution Groups

| Phase | Tasks | Description |
|-------|-------|-------------|
| **Phase 1** | `T01` | Project scaffolding — must be first |
| **Phase 2** | `T02`, `T03`, `T04`, `T05`, `T06`, `T18` | Foundation — all depend only on T01 |
| **Phase 3** | `T07`, `T08`, `T09`, `T10`, `T11`, `T12`, `T13`, `T14`, `T15`, `T16`, `T17` | DB operations + components — depend on Phase 2 |
| **Phase 4** | `T19`, `T20`, `T21`, `T22`, `T23`, `T24`, `T25` | Screens — depend on Phase 3 |
| **Phase 5** | `T26`, `T27` | Integrations — depend on Add Visit screen |
| **Phase 6** | `T28` | Polish — depends on all screens |

---

## Task Definitions

---

### T01: Project Initialization

**Dependencies:** None

**Description:**
Initialize the Expo project with TypeScript and install all dependencies. Create the directory structure defined in DESIGN.md Section 6.

**Steps:**
1. Run `npx create-expo-app@latest brewlog --template blank-typescript` (or initialize in current dir)
2. Install dependencies:
   ```
   npx expo install expo-router expo-sqlite expo-image-picker expo-file-system react-native-maps
   npm install zustand uuid
   npm install -D @types/uuid
   ```
3. Configure `app.json` for Expo Router (set `scheme`, `plugins` for expo-router)
4. Configure `tsconfig.json` with path aliases if desired
5. Create empty directory structure:
   ```
   app/(tabs)/
   app/visit/
   app/cafe/
   src/components/
   src/db/
   src/stores/
   src/constants/
   src/types/
   src/utils/
   ```
6. Create placeholder `app/_layout.tsx` that wraps with Expo Router's `<Stack />`
7. Verify the app runs with `npx expo start`

**Acceptance Criteria:**
- `npx expo start` launches without errors
- Directory structure matches DESIGN.md Section 6
- All dependencies are installed and listed in `package.json`
- TypeScript compiles without errors

**Output Files:**
- `package.json`
- `app.json`
- `tsconfig.json`
- `app/_layout.tsx`

---

### T02: TypeScript Types & Interfaces

**Dependencies:** `T01`

**Description:**
Define all TypeScript interfaces for the data model in `src/types/index.ts`. These types are used throughout the app by every other module.

**Steps:**
1. Create `src/types/index.ts`
2. Define interfaces matching DESIGN.md Section 4:

```typescript
// All entity interfaces
export interface Cafe {
  id: string;
  google_place_id: string | null;
  name: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
}

export interface Visit {
  id: string;
  cafe_id: string;
  visited_at: string;
  notes: string | null;
  overall_rating: number | null;
  coffee_quality: number | null;
  interior_design: number | null;
  vibe: number | null;
  work_friendliness: number | null;
  location_surroundings: number | null;
  value: number | null;
  wait_time: number | null;
  food_pastries: number | null;
  created_at: string;
  updated_at: string;
}

export interface Drink {
  id: string;
  visit_id: string;
  name: string;
  type: string;
  rating: number;
  notes: string | null;
  created_at: string;
}

export interface Photo {
  id: string;
  visit_id: string;
  file_path: string;
  sort_order: number;
  created_at: string;
}

// Composite types used by screens
export interface VisitWithDetails extends Visit {
  cafe: Cafe;
  drinks: Drink[];
  photos: Photo[];
}

export interface CafeWithStats extends Cafe {
  visit_count: number;
  avg_overall_rating: number | null;
  last_visited_at: string | null;
}

export interface RankingEntry {
  rank: number;
  cafe_name: string;
  cafe_id: string;
  city: string;
  rating: number;
}

export interface DrinkRankingEntry {
  rank: number;
  drink_name: string;
  drink_type: string;
  cafe_name: string;
  cafe_id: string;
  visit_id: string;
  city: string;
  rating: number;
}

// Form types for Add Visit
export interface VisitFormData {
  cafe: Cafe | null;
  visited_at: string;
  drinks: DrinkFormData[];
  experience_ratings: Partial<Record<ExperienceDimensionKey, number>>;
  photos: string[]; // local URIs before save
  notes: string;
}

export interface DrinkFormData {
  id: string; // temp ID for list key
  name: string;
  type: string;
  rating: number;
  notes: string;
}

export type ExperienceDimensionKey =
  | 'coffee_quality'
  | 'interior_design'
  | 'vibe'
  | 'work_friendliness'
  | 'location_surroundings'
  | 'value'
  | 'wait_time'
  | 'food_pastries';
```

**Acceptance Criteria:**
- `src/types/index.ts` exists and exports all interfaces above
- TypeScript compiles with no errors
- Types match the data model in DESIGN.md Section 4 exactly

**Output Files:**
- `src/types/index.ts`

---

### T03: App Constants

**Dependencies:** `T01`

**Description:**
Define the drink types and experience dimensions as TypeScript constants in `src/constants/`.

**Steps:**
1. Create `src/constants/drinkTypes.ts` with the `DRINK_TYPES` array from DESIGN.md Section 4.5
2. Create `src/constants/experienceDimensions.ts` with the `EXPERIENCE_DIMENSIONS` array from DESIGN.md Section 4.6
3. Export types for the dimension structure

**Exact Values:** Use the exact arrays from DESIGN.md Sections 4.5 and 4.6.

**Acceptance Criteria:**
- `src/constants/drinkTypes.ts` exports `DRINK_TYPES` as a readonly array of strings
- `src/constants/experienceDimensions.ts` exports `EXPERIENCE_DIMENSIONS` with `key`, `label`, `category` per entry
- TypeScript compiles with no errors

**Output Files:**
- `src/constants/drinkTypes.ts`
- `src/constants/experienceDimensions.ts`

---

### T04: Utility Functions

**Dependencies:** `T01`

**Description:**
Implement utility functions for UUID generation, rating computation, and formatting.

**Steps:**
1. Create `src/utils/uuid.ts`:
   - Export a `generateUUID()` function using the `uuid` package (v4)

2. Create `src/utils/ratings.ts`:
   - `computeOverallRating(visit: Visit): number | null` — averages all non-null experience dimension ratings for a visit
   - `computeCoffeeQuality(drinks: Drink[]): number | null` — averages all drink ratings for a visit

3. Create `src/utils/formatting.ts`:
   - `formatDate(isoString: string): string` — e.g., "Oct 26, 2023"
   - `formatRating(rating: number): string` — e.g., "8.5" (one decimal)
   - `formatRatingFraction(rating: number): string` — e.g., "8/10"

**Acceptance Criteria:**
- All three files exist and export their functions
- `computeOverallRating` correctly handles visits with no experience ratings (returns null)
- `computeCoffeeQuality` returns null for empty drink arrays
- `formatDate` produces human-readable dates
- TypeScript compiles with no errors

**Output Files:**
- `src/utils/uuid.ts`
- `src/utils/ratings.ts`
- `src/utils/formatting.ts`

---

### T05: Database Schema & Initialization

**Dependencies:** `T01`

**Description:**
Create the SQLite database schema and initialization logic using `expo-sqlite`.

**Steps:**
1. Create `src/db/schema.ts` with SQL `CREATE TABLE IF NOT EXISTS` statements for all 4 tables (cafes, visits, drinks, photos) matching DESIGN.md Section 4. Include:
   - Primary keys as TEXT (UUID)
   - Foreign keys with CASCADE delete for drinks and photos
   - All column types matching the design

2. Create `src/db/database.ts`:
   - Export an `initDatabase()` async function that:
     1. Opens the database via `expo-sqlite` using `SQLite.openDatabaseAsync('brewlog.db')`
     2. Enables WAL mode: `PRAGMA journal_mode = WAL`
     3. Enables foreign keys: `PRAGMA foreign_keys = ON`
     4. Runs all CREATE TABLE statements from schema.ts
   - Export a `getDatabase()` function that returns the initialized database instance
   - Use the synchronous `expo-sqlite` API (`openDatabaseSync`) if preferred for simplicity

**Reference:** `expo-sqlite` docs — use `db.execAsync()` for DDL statements.

**Acceptance Criteria:**
- `schema.ts` contains valid SQL for all 4 tables
- `database.ts` exports `initDatabase()` and `getDatabase()`
- Foreign key constraints are enforced (CASCADE on delete)
- Tables match DESIGN.md Section 4 exactly
- The database can be initialized without errors in an Expo environment

**Output Files:**
- `src/db/schema.ts`
- `src/db/database.ts`

---

### T06: Navigation Shell (Tab Layout)

**Dependencies:** `T01`

**Description:**
Set up the Expo Router tab navigation with 5 tabs matching DESIGN.md Section 5.1, plus stack routes for detail screens.

**Steps:**
1. Create `app/(tabs)/_layout.tsx`:
   - Bottom tab bar with 5 tabs: Home, Map, Add (+), Rankings, Profile
   - Use Ionicons for tab icons: `home`, `map`, `add-circle`, `trophy`, `person`
   - Center "+" tab should be visually prominent (larger icon or custom styling)
   - Tab bar styling: clean, minimal, warm color palette

2. Create placeholder screens (just a View with the screen name as text):
   - `app/(tabs)/index.tsx` — Home / Timeline
   - `app/(tabs)/map.tsx` — Map
   - `app/(tabs)/add.tsx` — Add Visit
   - `app/(tabs)/rankings.tsx` — Rankings
   - `app/(tabs)/profile.tsx` — Profile

3. Create placeholder stack screens:
   - `app/visit/[id].tsx` — Visit Detail
   - `app/cafe/[id].tsx` — Cafe Page

4. Update `app/_layout.tsx` to properly wrap with Expo Router's root layout

**Acceptance Criteria:**
- App launches with a 5-tab bottom navigation bar
- Each tab shows its placeholder screen
- Tab icons and labels match DESIGN.md Section 5.1
- Navigating to `/visit/123` and `/cafe/456` routes works
- The "+" tab button is visually distinguished from other tabs

**Output Files:**
- `app/_layout.tsx`
- `app/(tabs)/_layout.tsx`
- `app/(tabs)/index.tsx`
- `app/(tabs)/map.tsx`
- `app/(tabs)/add.tsx`
- `app/(tabs)/rankings.tsx`
- `app/(tabs)/profile.tsx`
- `app/visit/[id].tsx`
- `app/cafe/[id].tsx`

---

### T07: Cafe CRUD Operations

**Dependencies:** `T02`, `T05`

**Description:**
Implement database operations for the `cafes` table.

**Steps:**
1. Create `src/db/cafes.ts` with the following exported functions:
   - `insertCafe(cafe: Omit<Cafe, 'created_at' | 'updated_at'>): Promise<void>` — insert a new cafe
   - `getCafeById(id: string): Promise<Cafe | null>` — get a single cafe
   - `getCafeByGooglePlaceId(placeId: string): Promise<Cafe | null>` — find existing cafe by Google Place ID (for deduplication)
   - `getAllCafes(): Promise<Cafe[]>` — get all cafes
   - `getCafesWithStats(): Promise<CafeWithStats[]>` — get all cafes with visit count, average rating, and last visit date (uses JOIN with visits table)
   - `updateCafe(id: string, updates: Partial<Cafe>): Promise<void>`
   - `deleteCafe(id: string): Promise<void>`

2. Use `getDatabase()` from `database.ts` for all queries
3. Use parameterized queries to prevent SQL injection
4. Generate `created_at` and `updated_at` timestamps in ISO 8601 format

**Acceptance Criteria:**
- All functions are exported and use proper TypeScript types
- `getCafeByGooglePlaceId` enables deduplication logic
- `getCafesWithStats` returns aggregate data via SQL JOIN
- Parameterized queries used throughout (no string interpolation in SQL)

**Output Files:**
- `src/db/cafes.ts`

---

### T08: Visit CRUD Operations

**Dependencies:** `T02`, `T05`

**Description:**
Implement database operations for the `visits` table, including composite queries that join with drinks and photos.

**Steps:**
1. Create `src/db/visits.ts` with:
   - `insertVisit(visit: Omit<Visit, 'created_at' | 'updated_at'>): Promise<void>`
   - `getVisitById(id: string): Promise<Visit | null>`
   - `getVisitWithDetails(id: string): Promise<VisitWithDetails | null>` — joins with cafe, drinks, photos
   - `getAllVisitsWithDetails(): Promise<VisitWithDetails[]>` — for timeline, ordered by visited_at DESC
   - `getVisitsByCafeId(cafeId: string): Promise<VisitWithDetails[]>` — for cafe page
   - `updateVisit(id: string, updates: Partial<Visit>): Promise<void>`
   - `deleteVisit(id: string): Promise<void>` — CASCADE handles drinks/photos in DB

2. For `getVisitWithDetails` and `getAllVisitsWithDetails`:
   - First query visits (with cafe JOIN)
   - Then batch-query drinks and photos for those visit IDs
   - Assemble into `VisitWithDetails` objects in TypeScript

**Acceptance Criteria:**
- All functions exported with proper types
- `getAllVisitsWithDetails` returns visits ordered by `visited_at` DESC
- `getVisitWithDetails` correctly assembles the composite object
- Delete cascades to drinks and photos via foreign key constraints

**Output Files:**
- `src/db/visits.ts`

---

### T09: Drink CRUD Operations

**Dependencies:** `T02`, `T05`

**Description:**
Implement database operations for the `drinks` table.

**Steps:**
1. Create `src/db/drinks.ts` with:
   - `insertDrink(drink: Omit<Drink, 'created_at'>): Promise<void>`
   - `insertDrinks(drinks: Omit<Drink, 'created_at'>[]): Promise<void>` — batch insert for saving a visit
   - `getDrinksByVisitId(visitId: string): Promise<Drink[]>`
   - `updateDrink(id: string, updates: Partial<Drink>): Promise<void>`
   - `deleteDrink(id: string): Promise<void>`
   - `deleteDrinksByVisitId(visitId: string): Promise<void>` — for re-saving a visit's drinks

**Acceptance Criteria:**
- All functions exported with proper types
- Batch insert works correctly for multiple drinks
- `deleteDrinksByVisitId` enables replacing all drinks when editing a visit

**Output Files:**
- `src/db/drinks.ts`

---

### T10: Photo CRUD Operations

**Dependencies:** `T02`, `T05`

**Description:**
Implement database operations for the `photos` table.

**Steps:**
1. Create `src/db/photos.ts` with:
   - `insertPhoto(photo: Omit<Photo, 'created_at'>): Promise<void>`
   - `insertPhotos(photos: Omit<Photo, 'created_at'>[]): Promise<void>` — batch insert
   - `getPhotosByVisitId(visitId: string): Promise<Photo[]>` — ordered by `sort_order`
   - `deletePhoto(id: string): Promise<void>`
   - `deletePhotosByVisitId(visitId: string): Promise<void>`

**Acceptance Criteria:**
- All functions exported with proper types
- Photos returned ordered by `sort_order` ASC
- Batch insert supports saving multiple photos at once

**Output Files:**
- `src/db/photos.ts`

---

### T11: Rankings & Aggregation Queries

**Dependencies:** `T02`, `T05`

**Description:**
Implement SQL queries for all ranking categories and stats aggregation defined in DESIGN.md Sections 5.7 and 5.8.

**Steps:**
1. Create `src/db/rankings.ts` with:
   - `getCafeRankings(dimension: ExperienceDimensionKey): Promise<RankingEntry[]>` — rank cafes by a specific experience dimension (average across visits). Used for: Overall, Coffee Quality, Vibe, Interior, Work Friendliness, Value, Food rankings.
   - `getDrinkRankings(drinkType: string): Promise<DrinkRankingEntry[]>` — rank individual drinks of a specific type by rating. Used for: Top Espressos, Top Cappuccinos, etc.
   - `getOverallCafeRankings(): Promise<RankingEntry[]>` — rank cafes by average of ALL experience dimensions
   - `getStats(): Promise<AppStats>` — return all stats for the Profile screen:
     ```typescript
     interface AppStats {
       total_cafes: number;
       total_visits: number;
       total_drinks: number;
       cities: string[];
       countries: string[];
       avg_rating: number | null;
       favorite_drink_type: string | null;
       most_visited_cafe: { name: string; count: number } | null;
       highest_rated_cafe: { name: string; rating: number } | null;
       current_month_visits: number;
       previous_month_visits: number;
     }
     ```

2. Each ranking query should:
   - Only include entries where the relevant dimension is not null
   - Sort by rating DESC
   - Include cafe name and city for display
   - Minimum 2 entries per category (filter in query or in calling code)

**Acceptance Criteria:**
- `getCafeRankings` works for any experience dimension key
- `getDrinkRankings` filters by drink type and sorts by rating
- `getOverallCafeRankings` averages all non-null dimensions
- `getStats` returns all stats needed for Profile screen
- All queries use parameterized SQL

**Output Files:**
- `src/db/rankings.ts`

---

### T12: RatingSlider Component

**Dependencies:** `T02`, `T03`

**Description:**
Build a reusable 1-10 rating slider component used in Add Visit (for experience dimensions) and DrinkRow.

**Steps:**
1. Create `src/components/RatingSlider.tsx`:
   - Props: `label: string`, `value: number | null`, `onChange: (value: number | null) => void`, `optional?: boolean`
   - Display the label and current value
   - A horizontal slider or tappable number row (1-10)
   - If `optional` is true, show a way to clear/unset the rating
   - Warm color scheme — filled portion should use the app's accent color

**Design Notes:**
- Consider a row of tappable circles (1-10) rather than a native slider for better touch targets
- Show the selected number prominently
- Unrated state should be visually distinct (greyed out)

**Acceptance Criteria:**
- Component renders a 1-10 rating input
- `onChange` fires with the selected value
- Optional ratings can be cleared/unset
- Visual feedback on the selected value
- Works for both experience dimensions and drink ratings

**Output Files:**
- `src/components/RatingSlider.tsx`

---

### T13: DrinkRow Component

**Dependencies:** `T02`, `T03`

**Description:**
Build the drink entry row component used in the Add Visit form.

**Steps:**
1. Create `src/components/DrinkRow.tsx`:
   - Props: `drink: DrinkFormData`, `onChange: (updated: DrinkFormData) => void`, `onDelete: () => void`
   - Layout: type picker (dropdown or modal showing DRINK_TYPES), custom name text input, rating (1-10), optional notes field
   - Type picker: tappable field that opens a modal/bottom sheet with the DRINK_TYPES list
   - Name field: text input for custom name (e.g., "Oat Milk Lavender Latte")
   - Rating: compact rating input (reuse RatingSlider or a simpler inline version)
   - Delete: swipe-to-delete gesture or a delete icon button

**Acceptance Criteria:**
- User can select a drink type from DRINK_TYPES
- User can enter a custom drink name
- User can rate the drink 1-10
- User can delete the drink row
- All changes propagate via `onChange`

**Output Files:**
- `src/components/DrinkRow.tsx`

---

### T14: VisitCard Component

**Dependencies:** `T02`

**Description:**
Build the visit card component displayed in the Home/Timeline feed.

**Steps:**
1. Create `src/components/VisitCard.tsx`:
   - Props: `visit: VisitWithDetails`, `onPress: () => void`
   - Layout (matching DESIGN.md Section 5.2):
     - Hero photo (first photo, or a placeholder gradient if no photos)
     - Cafe name + city
     - Visit date (formatted)
     - Drink names with ratings (compact format: "Cappuccino 8/10, Latte 7/10")
     - Notes preview (2 lines, truncated with ellipsis)
     - Average experience rating badge (if any experience ratings exist)
   - Card styling: rounded corners, subtle shadow, warm palette
   - Tappable (entire card is pressable)

**Acceptance Criteria:**
- Card displays all required information from a `VisitWithDetails`
- Hero photo shows first photo or a placeholder
- Notes are truncated to 2 lines
- Card is pressable and calls `onPress`
- Looks good with and without photos/notes/ratings

**Output Files:**
- `src/components/VisitCard.tsx`

---

### T15: PhotoStrip Component

**Dependencies:** `T02`

**Description:**
Build the horizontal photo thumbnail strip used in Add Visit (for selecting/previewing photos) and Visit Detail.

**Steps:**
1. Create `src/components/PhotoStrip.tsx`:
   - Props: `photos: string[]` (array of local file URIs), `onAdd?: () => void`, `onDelete?: (index: number) => void`, `editable?: boolean`
   - Layout: horizontal ScrollView of thumbnail images
   - If `editable`, show an "Add" button at the end and support long-press to delete
   - If not editable (display mode), just show the photos horizontally
   - Tap a photo to show a larger preview (simple modal or fullscreen)
   - Thumbnails should be square, ~80x80

**Acceptance Criteria:**
- Displays photos in a horizontal scrollable strip
- Editable mode shows add button and supports delete
- Display mode is read-only
- Handles empty state gracefully (shows only add button or nothing)

**Output Files:**
- `src/components/PhotoStrip.tsx`

---

### T16: EmptyState Component

**Dependencies:** `T02`

**Description:**
Build a reusable empty state component for screens with no data.

**Steps:**
1. Create `src/components/EmptyState.tsx`:
   - Props: `title: string`, `message: string`, `actionLabel?: string`, `onAction?: () => void`
   - Layout: centered illustration area (placeholder icon), title, descriptive message, optional CTA button
   - Used on: Timeline (no visits), Map (no cafes), Rankings (not enough data)

**Acceptance Criteria:**
- Renders centered empty state with title and message
- Optional action button works when provided
- Looks clean and inviting (not like an error)

**Output Files:**
- `src/components/EmptyState.tsx`

---

### T17: StatCard Component

**Dependencies:** `T02`

**Description:**
Build the stat card component used on the Profile screen.

**Steps:**
1. Create `src/components/StatCard.tsx`:
   - Props: `label: string`, `value: string | number`, `subtitle?: string`
   - Layout: compact card with the value prominently displayed and the label below
   - Used in a grid on the Profile screen

**Acceptance Criteria:**
- Renders a stat with label and value
- Optional subtitle for secondary info
- Works well in a 2-column grid layout

**Output Files:**
- `src/components/StatCard.tsx`

---

### T18: Zustand Store

**Dependencies:** `T01`

**Description:**
Set up the Zustand store for UI state management as defined in DESIGN.md Section 7.5.

**Steps:**
1. Create `src/stores/useAppStore.ts`:
   - `activeRankingTab: string` — currently selected ranking category
   - `setActiveRankingTab(tab: string): void`
   - `visitFormDraft: VisitFormData | null` — draft state for Add Visit form (survives backgrounding)
   - `setVisitFormDraft(draft: VisitFormData | null): void`
   - `clearVisitFormDraft(): void`

2. Use `zustand` with no persistence middleware (in-memory only for P0)

**Acceptance Criteria:**
- Store exports a `useAppStore` hook
- Active ranking tab state works
- Visit form draft can be saved and cleared
- No persistence to disk (UI state only, resets on app restart)

**Output Files:**
- `src/stores/useAppStore.ts`

---

### T19: Add Visit Screen

**Dependencies:** `T06`, `T07`, `T12`, `T13`, `T15`, `T18`

**Description:**
Build the Add Visit screen — the most important screen in the app. Must be fast and frictionless per DESIGN.md Section 5.3.

**Steps:**
1. Implement `app/(tabs)/add.tsx` as a scrollable form with these sections:
   - **Cafe Selection:** For MVP, use a simple text input for cafe name + address fields (Google Places integration is T26). If a cafe with the same name exists in DB, offer to reuse it.
   - **Date Picker:** Default to today, tappable to change. Use a date picker modal.
   - **Drinks Section:** "Add Drink" button that adds a DrinkRow. At least one drink required. Use the DrinkRow component (T13).
   - **Experience Ratings:** Collapsible section (collapsed by default). Show RatingSlider (T12) for each experience dimension grouped by category.
   - **Photos:** "Add Photos" button + PhotoStrip (T15). Actual photo picking logic will be wired in T27 — for now, just show the UI with a placeholder onAdd handler.
   - **Notes:** Multi-line text input with placeholder "How was it?"
   - **Save Button:** Sticky at bottom of screen.

2. On Save:
   - Validate: at least one drink with a rating
   - Create or reuse cafe (via `insertCafe` / `getCafeByGooglePlaceId` from T07)
   - Insert visit with experience ratings and computed `overall_rating` and `coffee_quality`
   - Insert all drinks (T09's `insertDrinks`)
   - Clear form draft from Zustand store
   - Navigate to Home tab

3. Save form draft to Zustand store on changes (so form survives backgrounding)

**Acceptance Criteria:**
- Form renders all sections from DESIGN.md Section 5.3
- Experience ratings section is collapsible and collapsed by default
- Saving a visit with 1 drink and no optional fields takes < 5 taps
- Validation prevents saving without at least one rated drink
- Visit is persisted to SQLite on save
- Form resets after successful save

**Output Files:**
- `app/(tabs)/add.tsx`

---

### T20: Home / Timeline Screen

**Dependencies:** `T06`, `T08`, `T14`, `T16`

**Description:**
Build the Home/Timeline screen showing a chronological feed of visit cards per DESIGN.md Section 5.2.

**Steps:**
1. Implement `app/(tabs)/index.tsx`:
   - Query `getAllVisitsWithDetails()` from T08 on mount and on focus
   - Render a FlatList of VisitCard components (T14)
   - Newest visits first
   - Pull-to-refresh to re-query
   - Empty state (T16): "Log your first cafe visit" with CTA navigating to Add tab
   - Tap card → navigate to `/visit/[id]`

**Acceptance Criteria:**
- Displays visits as cards in reverse chronological order
- Pull-to-refresh works
- Empty state shown when no visits exist
- Tapping a card navigates to Visit Detail
- Screen refreshes when returning from Add Visit

**Output Files:**
- `app/(tabs)/index.tsx`

---

### T21: Visit Detail Screen

**Dependencies:** `T06`, `T08`, `T15`

**Description:**
Build the Visit Detail screen per DESIGN.md Section 5.4.

**Steps:**
1. Implement `app/visit/[id].tsx`:
   - Read `id` from route params
   - Query `getVisitWithDetails(id)` from T08
   - Display:
     - Photo gallery using PhotoStrip (T15) in non-editable mode
     - Cafe name (tappable → `/cafe/[cafe_id]`) + address
     - Date (formatted)
     - Drinks with ratings (each drink: name, type, rating as X/10)
     - Experience ratings — only show dimensions that were rated
     - Notes (full text)
   - Edit button → navigate to Add Visit screen pre-filled with this visit's data
   - Delete button with confirmation dialog → delete visit and navigate back

**Acceptance Criteria:**
- All visit details are displayed correctly
- Only rated experience dimensions are shown
- Cafe name links to Cafe Page
- Delete works with confirmation
- Edit navigates to Add Visit with pre-filled data (or a separate edit route)

**Output Files:**
- `app/visit/[id].tsx`

---

### T22: Cafe Page Screen

**Dependencies:** `T06`, `T07`, `T08`, `T11`

**Description:**
Build the auto-generated Cafe Page per DESIGN.md Section 5.5.

**Steps:**
1. Implement `app/cafe/[id].tsx`:
   - Read `id` from route params
   - Query cafe details, all visits for this cafe, aggregate ratings
   - Display:
     - Name, address, city/country
     - Map snippet (a small MapView showing the cafe's pin)
     - Aggregate ratings: average of each experience dimension across all visits (only show rated ones)
     - Drink leaderboard: all drinks ordered at this cafe, sorted by rating DESC
     - Visit history: list of visits, newest first, tappable → Visit Detail
     - Photo gallery: all photos from all visits

**Acceptance Criteria:**
- Cafe header info displays correctly
- Map snippet shows the cafe location
- Aggregate ratings are computed correctly across visits
- Drink leaderboard shows all drinks sorted by rating
- Visit history is tappable
- Handles cafes with only 1 visit

**Output Files:**
- `app/cafe/[id].tsx`

---

### T23: Map Screen

**Dependencies:** `T06`, `T07`

**Description:**
Build the Map screen per DESIGN.md Section 5.6.

**Steps:**
1. Implement `app/(tabs)/map.tsx`:
   - Full-screen MapView using `react-native-maps`
   - Query all cafes with stats (T07's `getCafesWithStats`)
   - Place a pin for each visited cafe
   - Pin color based on average rating: red (< 5), yellow (5-7), green (> 7)
   - Tap pin → callout/popover with cafe name and rating
   - Tap callout → navigate to `/cafe/[id]`
   - Auto-fit map to show all pins on initial load
   - Empty state when no cafes logged

2. Bottom sheet (optional for MVP — can be simplified to just the map):
   - If implementing: list of cafes sorted by rating, with toggle for sort order
   - Can use a simple scrollable list below the map as a simpler alternative

**Acceptance Criteria:**
- Map displays with pins for all visited cafes
- Pin colors reflect ratings
- Tapping a pin shows cafe info
- Can navigate to Cafe Page from pin
- Map fits all pins on load
- Empty state when no data

**Output Files:**
- `app/(tabs)/map.tsx`

---

### T24: Rankings Screen

**Dependencies:** `T06`, `T11`

**Description:**
Build the Rankings screen per DESIGN.md Section 5.7.

**Steps:**
1. Implement `app/(tabs)/rankings.tsx`:
   - Horizontal scrollable tabs for ranking categories:
     - Overall, Coffee Quality, Best Vibe, Best Interior, Best for Working, Best Value, Best Food
     - Top Espressos, Top Cappuccinos, Top Lattes, Top Flat Whites, Top Matcha
   - Use Zustand's `activeRankingTab` to persist selected tab
   - For cafe rankings: call `getCafeRankings(dimension)` or `getOverallCafeRankings()`
   - For drink rankings: call `getDrinkRankings(drinkType)`
   - Display each entry: rank (#1, #2...), name, rating, city
   - Tap entry → Cafe Page (for cafe rankings) or Visit Detail (for drink rankings)
   - Only show categories with >= 2 entries
   - Empty state when not enough data

2. Create `src/components/RankingList.tsx` (or inline):
   - Renders a list of ranking entries with rank numbers, names, ratings

**Acceptance Criteria:**
- Horizontal category tabs are scrollable and selectable
- Rankings display correctly for each category
- Categories with < 2 entries are hidden
- Entries are tappable and navigate correctly
- Active tab persists via Zustand

**Output Files:**
- `app/(tabs)/rankings.tsx`
- `src/components/RankingList.tsx`

---

### T25: Profile / Stats Screen

**Dependencies:** `T06`, `T11`, `T17`

**Description:**
Build the Profile/Stats screen per DESIGN.md Section 5.8.

**Steps:**
1. Implement `app/(tabs)/profile.tsx`:
   - Query `getStats()` from T11
   - Display a grid of StatCard components (T17):
     - Total cafes visited
     - Total visits logged
     - Total drinks rated
     - Average rating given
     - Current month vs previous month visits
   - Below the grid, detail sections:
     - Cities visited (count + list)
     - Countries visited (count + list)
     - Favorite drink type (most frequently ordered)
     - Most visited cafe
     - Highest rated cafe

**Acceptance Criteria:**
- All stats from DESIGN.md Section 5.8 are displayed
- StatCards form a clean grid
- Detail sections show lists for cities/countries
- Handles zero data gracefully (shows "0" or "No data yet")
- Stats refresh on screen focus

**Output Files:**
- `app/(tabs)/profile.tsx`

---

### T26: Google Places Integration

**Dependencies:** `T19`

**Description:**
Wire up Google Places Autocomplete to the Add Visit screen's cafe selection.

**Steps:**
1. Create `src/components/CafeSearchBar.tsx`:
   - Text input that calls Google Places Autocomplete API as user types
   - Filter results to `type=cafe|coffee_shop`
   - Display results in a dropdown below the input
   - On selection, call Place Details API to get full address, lat/lng, place_id
   - Debounce API calls (300ms)
   - Show "Add manually" option at bottom of results

2. API setup:
   - Use Google Places Autocomplete API via HTTP (not SDK)
   - API key stored in app config (environment variable via `expo-constants`)
   - Endpoint: `https://maps.googleapis.com/maps/api/place/autocomplete/json`
   - Place Details: `https://maps.googleapis.com/maps/api/place/details/json`

3. Wire into Add Visit screen:
   - Replace the simple text input for cafe selection with CafeSearchBar
   - On selection: check if cafe with this `google_place_id` exists in DB → reuse or create
   - On "Add manually": show manual name + address fields

**Acceptance Criteria:**
- Search bar shows autocomplete results from Google Places
- Results are filtered to cafes/coffee shops
- Selecting a result fills in all cafe fields (name, address, city, country, lat, lng, place_id)
- Existing cafes are deduplicated by google_place_id
- Manual entry fallback works
- API calls are debounced
- Works without API key (shows manual entry fallback with a warning)

**Output Files:**
- `src/components/CafeSearchBar.tsx`
- Updated `app/(tabs)/add.tsx`

---

### T27: Photo Capture & Storage

**Dependencies:** `T19`, `T10`

**Description:**
Wire up photo picking, storage, and cleanup to the Add Visit flow.

**Steps:**
1. Create a photo utility in `src/utils/photos.ts`:
   - `pickPhotos(): Promise<string[]>` — launch image picker (camera or library), return URIs
   - `savePhotoToStorage(uri: string): Promise<string>` — copy photo to app's document directory, resize to max 1200px wide, return the new local path
   - `deletePhotoFile(filePath: string): Promise<void>` — remove photo file from disk

2. Wire into Add Visit screen:
   - "Add Photos" button calls `pickPhotos()`
   - Selected photos are saved via `savePhotoToStorage()` and URIs stored in form state
   - On visit save: insert photo records via T10's `insertPhotos()`
   - On visit delete (T21): delete photo files from disk via `deletePhotoFile()`

3. Use `expo-image-picker` for selection and `expo-file-system` for storage
4. Use `expo-image-manipulator` for resizing (install if not already)

**Acceptance Criteria:**
- User can pick photos from library or camera
- Photos are copied to app storage (not just referenced from library)
- Photos are resized to max 1200px wide
- Photo paths are stored in DB on visit save
- Photos are cleaned up when a visit is deleted

**Output Files:**
- `src/utils/photos.ts`
- Updated `app/(tabs)/add.tsx`
- Updated `app/visit/[id].tsx` (delete cleanup)

---

### T28: Polish & Integration Testing

**Dependencies:** All screens (`T19`–`T27`)

**Description:**
Final integration pass to ensure all screens work together, navigation flows are smooth, and edge cases are handled.

**Steps:**
1. Test the full flow:
   - Add a visit → see it on Timeline → tap to see Detail → tap cafe name → Cafe Page
   - Add 3+ cafes → verify Map shows all pins with correct colors
   - Add 10+ visits → verify Rankings populate correctly
   - Check Profile stats accuracy
   - Edit a visit → verify changes persist
   - Delete a visit → verify cascade (drinks, photos removed)

2. Fix navigation issues:
   - Ensure screens refresh data when focused (useFocusEffect)
   - Back navigation works correctly from all detail screens
   - Tab bar remains visible on tab screens, hidden on detail screens (if desired)

3. Visual polish:
   - Consistent color palette across all screens (warm, coffee-inspired tones)
   - Loading states while DB queries run
   - Error handling for failed DB operations (show toast/alert)
   - Safe area handling (notch, home indicator)
   - Keyboard avoidance on form screens

4. Performance:
   - FlatList optimizations on Timeline (keyExtractor, getItemLayout if possible)
   - Avoid unnecessary re-renders

**Acceptance Criteria:**
- Complete add → view → edit → delete flow works end-to-end
- All navigation paths work correctly
- No crashes or unhandled errors
- App looks polished and consistent
- Logging a visit takes < 30 seconds (DESIGN.md success criteria)

**Output Files:**
- Various fixes across all screen and component files

---

## Summary

| ID | Task | Dependencies | Est. Complexity |
|----|------|-------------|-----------------|
| T01 | Project Initialization | — | Low |
| T02 | TypeScript Types & Interfaces | T01 | Low |
| T03 | App Constants | T01 | Low |
| T04 | Utility Functions | T01 | Low |
| T05 | DB Schema & Initialization | T01 | Medium |
| T06 | Navigation Shell | T01 | Medium |
| T07 | Cafe CRUD | T02, T05 | Medium |
| T08 | Visit CRUD | T02, T05 | Medium |
| T09 | Drink CRUD | T02, T05 | Low |
| T10 | Photo CRUD | T02, T05 | Low |
| T11 | Rankings Queries | T02, T05 | Medium |
| T12 | RatingSlider Component | T02, T03 | Medium |
| T13 | DrinkRow Component | T02, T03 | Medium |
| T14 | VisitCard Component | T02 | Medium |
| T15 | PhotoStrip Component | T02 | Medium |
| T16 | EmptyState Component | T02 | Low |
| T17 | StatCard Component | T02 | Low |
| T18 | Zustand Store | T01 | Low |
| T19 | Add Visit Screen | T06, T07, T12, T13, T15, T18 | High |
| T20 | Home / Timeline Screen | T06, T08, T14, T16 | Medium |
| T21 | Visit Detail Screen | T06, T08, T15 | Medium |
| T22 | Cafe Page Screen | T06, T07, T08, T11 | High |
| T23 | Map Screen | T06, T07 | Medium |
| T24 | Rankings Screen | T06, T11 | Medium |
| T25 | Profile / Stats Screen | T06, T11, T17 | Medium |
| T26 | Google Places Integration | T19 | Medium |
| T27 | Photo Capture & Storage | T19, T10 | Medium |
| T28 | Polish & Integration Testing | All | High |

**Total: 28 tasks across 6 phases**
