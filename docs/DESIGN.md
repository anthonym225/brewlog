# BrewLog — Design Doc (Phase 0 MVP)

---

## 1. Executive Summary

A mobile-first personal cafe journal that lets users log cafe visits, rate drinks and experience, and automatically generate rankings, maps, and stats.

Positioned as: **A Letterboxd-style personal tracker for cafes and coffee.**

Unlike Yelp or Google Maps, the app is:
- **Personal-first** — private journal, not public reviews
- **Drink-centric** — rate individual drinks, not just the cafe
- **Ranking-driven** — auto-generated leaderboards from your data
- **Memory-focused** — timeline, photos, and maps as a travel diary

**Primary goal:** Replace a Notes app workflow with a dedicated, delightful app.

---

## 2. Phase 0 Scope

**Goal:** A local-only, single-user app that validates the product by replacing a Notes-based cafe tracking workflow.

**Characteristics:**
- Local-first (SQLite on device)
- Single user, no auth
- No backend, no cloud sync
- Fast iteration via Expo Go / TestFlight

**Success criteria:**
- Logging a visit takes < 30 seconds
- Rankings feel meaningful after ~10 cafes
- Map becomes useful after ~20 cafes
- Notes app is no longer used for cafe tracking

---

## 3. Technology Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | React Native + Expo (SDK 52) | Fast iteration, native APIs, expand to web later |
| Language | TypeScript | Type safety, better DX |
| Navigation | Expo Router (file-based) | Convention over config, deep linking for free |
| Local DB | Expo SQLite | Structured relational data, fast queries, no server |
| State | Zustand | Lightweight, no boilerplate, works well with persistence |
| UI Components | React Native built-ins + custom | Keep dependencies minimal for MVP |
| Maps | react-native-maps (MapView) | Standard, well-supported |
| Cafe Search | Google Places API (autocomplete) | Best cafe data available |
| Images | expo-image-picker + expo-file-system | Local photo storage on device |
| Icons | @expo/vector-icons (Ionicons) | Built into Expo |

---

## 4. Data Model

All data stored in a local SQLite database. Four core tables.

### 4.1 `cafes`

Represents a unique cafe location. Created automatically when a user logs their first visit to a cafe.

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT (UUID) | Primary key |
| `google_place_id` | TEXT | From Google Places API, nullable (manual entry fallback) |
| `name` | TEXT | Required |
| `address` | TEXT | Full address string |
| `city` | TEXT | Extracted or entered |
| `country` | TEXT | Extracted or entered |
| `latitude` | REAL | For map pins |
| `longitude` | REAL | For map pins |
| `created_at` | TEXT (ISO 8601) | |
| `updated_at` | TEXT (ISO 8601) | |

### 4.2 `visits`

The atomic unit of the app. One row per cafe visit.

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT (UUID) | Primary key |
| `cafe_id` | TEXT | FK → cafes.id |
| `visited_at` | TEXT (ISO 8601) | Date of visit (default: today) |
| `notes` | TEXT | Free-form text, nullable |
| `overall_rating` | REAL | Computed: avg of experience ratings, nullable |
| `coffee_quality` | REAL (1-10) | Computed: avg of drink ratings |
| `interior_design` | INTEGER (1-10) | Optional |
| `vibe` | INTEGER (1-10) | Optional |
| `work_friendliness` | INTEGER (1-10) | Optional |
| `location_surroundings` | INTEGER (1-10) | Optional |
| `value` | INTEGER (1-10) | Optional |
| `wait_time` | INTEGER (1-10) | Optional |
| `food_pastries` | INTEGER (1-10) | Optional |
| `created_at` | TEXT (ISO 8601) | |
| `updated_at` | TEXT (ISO 8601) | |

**Design decision:** Experience ratings are flat columns rather than a separate table. There's a fixed set of 8 dimensions — no need for the complexity of a join table. Simpler queries, simpler code.

### 4.3 `drinks`

Individual drinks ordered during a visit.

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT (UUID) | Primary key |
| `visit_id` | TEXT | FK → visits.id (CASCADE delete) |
| `name` | TEXT | e.g. "Cappuccino", "Oat Milk Latte" |
| `type` | TEXT | Normalized category (see 4.5) |
| `rating` | INTEGER (1-10) | Required — this is the core data point |
| `notes` | TEXT | Optional, e.g. "too bitter" |
| `created_at` | TEXT (ISO 8601) | |

### 4.4 `photos`

Photos attached to a visit.

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT (UUID) | Primary key |
| `visit_id` | TEXT | FK → visits.id (CASCADE delete) |
| `file_path` | TEXT | Local filesystem path |
| `sort_order` | INTEGER | Display order within visit |
| `created_at` | TEXT (ISO 8601) | |

Photos are stored as files on device via `expo-file-system`. The DB stores paths only.

### 4.5 Drink Types (App Constants)

Not a DB table — defined as a TypeScript constant. Used for categorization and filtering in rankings.

```
DRINK_TYPES = [
  "Espresso",
  "Americano",
  "Iced Americano",
  "Cappuccino",
  "Latte",
  "Iced Latte",
  "Flat White",
  "Cortado",
  "Macchiato",
  "Mocha",
  "Matcha Latte",
  "Iced Matcha Latte",
  "Chai",
  "Tea",
  "Cold Brew",
  "Iced Coffee",
  "Other",
]
```

Users pick a type from this list but can also enter a custom drink name. The `type` field enables "Best Cappuccinos" rankings; the `name` field allows specificity like "Oat Milk Lavender Latte".

### 4.6 Experience Rating Dimensions (App Constants)

Also a TypeScript constant, not a table.

```typescript
EXPERIENCE_DIMENSIONS = [
  { key: "coffee_quality", label: "Coffee Quality", category: "Coffee" },
  { key: "interior_design", label: "Interior & Design", category: "Space" },
  { key: "vibe", label: "Vibe", category: "Space" },
  { key: "work_friendliness", label: "Work Friendliness", category: "Space" },
  { key: "location_surroundings", label: "Location & Surroundings", category: "Practical" },
  { key: "value", label: "Value", category: "Practical" },
  { key: "wait_time", label: "Wait Time / Efficiency", category: "Practical" },
  { key: "food_pastries", label: "Food & Pastries", category: "Food" },
]
```

---

## 5. Screen Specifications

### 5.1 Navigation Structure

Bottom tab bar with 5 tabs:

| Tab | Icon | Screen | Purpose |
|-----|------|--------|---------|
| Home | `home` | Timeline | Chronological visit feed |
| Map | `map` | MapView | Visual travel diary |
| + | `add-circle` | Add Visit | Primary action (prominent center button) |
| Rankings | `trophy` | Rankings | Sorteable and filterable location/drink/entity leaderboards |
| Profile | `person` | Profile | Stats dashboard |

Uses Expo Router file-based routing with a tab layout.

### 5.2 Home / Timeline Screen

**Purpose:** Memory scrapbook + quick access to past visits.

**Layout:** Vertical scrolling list of visit cards, newest first.

**Visit Card contents:**
- Hero photo (first photo, or placeholder gradient if none)
- Cafe name + city
- Visit date
- Drink names with ratings (compact: "Cappuccino 8/10, Latte 7/10")
- Notes preview (2 lines, truncated)
- Average experience rating badge (if rated)

**Interactions:**
- Tap card → Visit Detail screen
- Pull to refresh (re-query DB)
- Empty state: illustration + "Log your first cafe visit" CTA

### 5.3 Add Visit Screen (Core Flow)

**Purpose:** The most important screen. Must be fast and frictionless.

**Flow as a single scrollable form:**

1. **Cafe Selection** (top)
   - Search bar using Google Places Autocomplete
   - Filtered to `type=cafe` results
   - On select: auto-fill name, address, city, country, lat/lng
   - If cafe already exists in local DB (matched by `google_place_id`), reuse it
   - Fallback: "Add manually" option for cafes not on Google

2. **Date Picker**
   - Default: today
   - Tappable to change

3. **Drinks Section**
   - "Add Drink" button
   - Each drink row: type picker (dropdown/modal from DRINK_TYPES) + custom name field + rating slider (1-10)
   - At least one drink required
   - Swipe to delete

4. **Experience Ratings** (collapsible section, collapsed by default)
   - Sliders for each dimension (1-10)
   - Grouped by category (Coffee / Space / Practical / Food)
   - All optional — leave blank to skip

5. **Photos**
   - "Add Photos" button → image picker (camera or library)
   - Horizontal thumbnail strip
   - Tap to preview, long-press to delete

6. **Notes**
   - Multi-line text input
   - Placeholder: "How was it?"

7. **Save Button** (sticky at bottom)

**Validation:** At least one drink with a rating is required. Everything else is optional.

### 5.4 Visit Detail Screen

**Purpose:** Full view of a logged visit. Accessed by tapping a timeline card or a visit entry on a cafe page.

**Contents:**
- Photo gallery (horizontal scroll or grid)
- Cafe name (tappable → Cafe Page) + address
- Date
- Drinks with ratings
- Experience ratings (only show dimensions that were rated)
- Notes (full text)
- Edit button → re-open Add Visit form pre-filled
- Delete button (with confirmation)

### 5.5 Cafe Page

**Purpose:** Auto-generated profile for each cafe, aggregated from all visits.

**Contents:**
- Name, address, city/country
- Map snippet showing location
- **Aggregate ratings:** Average of each experience dimension across all visits (only show dimensions rated at least once)
- **Drink leaderboard:** All drinks ordered here, sorted by rating
- **Visit history:** List of all visits, newest first (tappable → Visit Detail)
- **Photo gallery:** All photos from all visits

### 5.6 Map Screen

**Purpose:** Visual travel diary and planning tool.

**Layout:** Full-screen map + collapsible bottom sheet with list.

**Map features:**
- Pins for all visited cafes
- Pin color based on average rating (red < 5, yellow 5-7, green > 7)
- Tap pin → cafe name popover → tap to open Cafe Page
- Auto-fit to show all pins on load

**Bottom sheet list:**
- All cafes sorted by average rating (default)
- Sort toggle: by rating, by most recent visit, by number of visits
- Each row: cafe name, city, avg rating, visit count

### 5.7 Rankings Screen

**Purpose:** Auto-generated leaderboards. Major engagement driver.

**Layout:** Horizontal category tabs + vertical ranked list.

**Ranking categories:**
- **Overall** — cafes sorted by average of all experience ratings
- **Coffee Quality** — cafes by coffee_quality avg
- **Best Vibe** — cafes by vibe avg
- **Best Interior** — cafes by interior_design avg
- **Best for Working** — cafes by work_friendliness avg
- **Best Value** — cafes by value avg
- **Best Food** — cafes by food_pastries avg
- **Top Espressos** — individual drinks where type="Espresso", sorted by rating
- **Top Cappuccinos** — individual drinks where type="Cappuccino", sorted by rating
- **Top Lattes** — individual drinks where type="Latte", sorted by rating
- **Top Flat Whites** — individual drinks where type="Flat White", sorted by rating
- **Top Matcha** — individual drinks where type="Matcha", sorted by rating

**Ranking entry display:**
- Rank number (#1, #2, #3...)
- Cafe name (or drink name + cafe for drink rankings)
- Rating value
- City
- Tap → Cafe Page (or Visit Detail for drink rankings)

**Minimum data:** A ranking category only shows if there are >= 2 entries with data for that dimension.

### 5.8 Profile / Stats Screen

**Purpose:** Personal stats dashboard.

**Stats displayed:**
- Total cafes visited
- Total visits logged
- Total drinks rated
- Cities visited (count + list)
- Countries visited (count + list)
- Average rating given
- Favorite drink type (most frequently ordered)
- Most visited cafe
- Highest rated cafe
- Current month visits vs previous month

**Layout:** Grid of stat cards at top, then detail sections below.

---

## 6. Project Structure

```
brewlog/
├── app/                          # Expo Router (file-based routing)
│   ├── _layout.tsx               # Root layout
│   ├── (tabs)/                   # Tab navigator
│   │   ├── _layout.tsx           # Tab bar config
│   │   ├── index.tsx             # Home / Timeline
│   │   ├── map.tsx               # Map screen
│   │   ├── add.tsx               # Add Visit
│   │   ├── rankings.tsx          # Rankings
│   │   └── profile.tsx           # Profile / Stats
│   ├── visit/
│   │   └── [id].tsx              # Visit Detail
│   └── cafe/
│       └── [id].tsx              # Cafe Page
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── VisitCard.tsx
│   │   ├── DrinkRow.tsx
│   │   ├── RatingSlider.tsx
│   │   ├── CafeSearchBar.tsx
│   │   ├── PhotoStrip.tsx
│   │   ├── RankingList.tsx
│   │   ├── StatCard.tsx
│   │   └── EmptyState.tsx
│   ├── db/
│   │   ├── schema.ts             # CREATE TABLE statements
│   │   ├── database.ts           # DB init + connection
│   │   ├── cafes.ts              # Cafe CRUD queries
│   │   ├── visits.ts             # Visit CRUD queries
│   │   ├── drinks.ts             # Drink CRUD queries
│   │   ├── photos.ts             # Photo CRUD queries
│   │   └── rankings.ts           # Ranking/aggregation queries
│   ├── stores/
│   │   └── useAppStore.ts        # Zustand store (UI state, not data persistence)
│   ├── constants/
│   │   ├── drinkTypes.ts
│   │   └── experienceDimensions.ts
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces for all entities
│   └── utils/
│       ├── uuid.ts               # UUID generation
│       ├── ratings.ts            # Rating computation helpers
│       └── formatting.ts         # Date, number formatting
├── assets/                       # Static assets (fonts, images)
├── app.json                      # Expo config
├── tsconfig.json
└── package.json
```

---

## 7. Key Implementation Details

### 7.1 Database Initialization

On app launch:
1. Open/create SQLite database via `expo-sqlite`
2. Run migrations (create tables if not exist)
3. App is ready

No migration framework needed for P0. A simple version check + `CREATE TABLE IF NOT EXISTS` is sufficient.

### 7.2 Google Places Integration

- Use Google Places Autocomplete API (HTTP, not SDK) to search for cafes
- Filter by `type=cafe|coffee_shop`
- On selection, call Place Details API to get full address, lat/lng
- Store `google_place_id` to deduplicate across visits
- Requires a Google Cloud API key (restricted to Places API)
- **Fallback:** Manual entry form for cafes not in Google (name + address fields)

### 7.3 Photo Storage

- Photos captured/selected via `expo-image-picker`
- Copied to app's document directory via `expo-file-system`
- Resized to max 1200px wide before saving (reduce storage)
- DB stores the local file path
- On visit delete, associated photo files are also deleted

### 7.4 Rating Computations

All rankings are computed via SQL queries at read time — no denormalized aggregation tables.

**Cafe overall rating:**
```sql
SELECT cafe_id, AVG(avg_experience) as overall
FROM (
  SELECT cafe_id,
    AVG(COALESCE(coffee_quality, interior_design, vibe, ...)) as avg_experience
  FROM visits
  WHERE cafe_id = ?
  GROUP BY id
) GROUP BY cafe_id
```

This keeps the data model simple. If query performance becomes an issue with hundreds of visits, we can add materialized views later.

### 7.5 State Management

Zustand store handles **UI state only**:
- Active ranking tab
- Map filter selection
- Form draft state (so the Add Visit form survives backgrounding)

**All persistent data** lives in SQLite and is read via direct queries. No ORM, no data duplication in memory stores.

---

## 8. MVP Non-Goals

Explicitly excluded from Phase 0:

- User accounts / authentication
- Cloud sync / backup
- Social features
- Public reviews
- Cafe discovery feed
- Push notifications
- Monetization
- Web app
- Offline-first sync (it's already offline-only)
- Onboarding flow (single user, knows what the app does)
- Internationalization

---

## 9. Phase 1 Preview (Post-MVP)

When P0 is validated, Phase 1 adds:

| Feature | Technology |
|---------|-----------|
| Auth | Firebase Auth (Sign in with Apple) |
| Cloud DB | Firestore |
| Photo storage | Firebase Storage |
| Cross-device sync | Firestore real-time sync |
| Analytics | Firebase Analytics |
| Crash reporting | Firebase Crashlytics |
| Onboarding | Custom flow |
| App Store | Full listing, screenshots, privacy policy |

The SQLite schema is designed to map cleanly to Firestore documents for migration.

---

## 10. Open Questions

1. **Rating scale:** 1-10 is specified, but 1-5 (with half stars) might be more familiar to users. Worth testing in P0.
2. **Drink type "Other":** Should custom types entered under "Other" be promotable to first-class types over time?
3. **Multiple visits same day:** The data model supports it, but should the UI handle it explicitly (e.g. "Morning visit" vs "Afternoon visit")?
4. **Wishlist/saved cafes:** The design mentions greyed-out pins for unvisited cafes. Should P0 include a simple "save cafe" feature, or defer to P1?
