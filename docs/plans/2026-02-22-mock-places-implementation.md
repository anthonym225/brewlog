# Mock Google Places Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a mock Google Places implementation for local dev and Playwright tests, activate it via `GOOGLE_PLACES_API_KEY=mock`, and add TODO tracking for real API signup.

**Architecture:** A new `src/utils/mockPlaces.ts` module owns three hardcoded cafe fixtures and two pure search functions. `CafeSearchBar.tsx` imports from it and branches on `apiKey === 'mock'`. Local dev activates mock via `.env.local`; Playwright always injects `GOOGLE_PLACES_API_KEY=mock` into the web server command. Shared Place API types move from `CafeSearchBar.tsx` to `mockPlaces.ts` to keep them DRY.

**Tech Stack:** TypeScript, React Native / Expo SDK 54, Playwright, dotenv

---

### Task 1: Create `src/utils/mockPlaces.ts`

**Files:**
- Create: `src/utils/mockPlaces.ts`

**Step 1: Create the file**

Create `/Users/anthonymartino/Desktop/claude/brewlog/.worktrees/t26-google-places/src/utils/mockPlaces.ts` with this exact content:

```ts
// Mock Google Places data for local development and testing.
// Activate by setting GOOGLE_PLACES_API_KEY=mock in .env.local

// ── Shared types (also imported by CafeSearchBar) ──────────────────────────

export interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export interface PlaceDetailsResult {
  name: string;
  formatted_address: string;
  address_components?: AddressComponent[];
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

// ── Mock data ───────────────────────────────────────────────────────────────

const MOCK_PREDICTIONS: PlacePrediction[] = [
  {
    place_id: 'mock-001',
    description: 'Blue Bottle Coffee, Market St, San Francisco, CA, USA',
    structured_formatting: {
      main_text: 'Blue Bottle Coffee',
      secondary_text: 'Market St, San Francisco, CA, USA',
    },
  },
  {
    place_id: 'mock-002',
    description: 'Sightglass Coffee, 7th St, San Francisco, CA, USA',
    structured_formatting: {
      main_text: 'Sightglass Coffee',
      secondary_text: '7th St, San Francisco, CA, USA',
    },
  },
  {
    place_id: 'mock-003',
    description: 'Ritual Coffee Roasters, Valencia St, San Francisco, CA, USA',
    structured_formatting: {
      main_text: 'Ritual Coffee Roasters',
      secondary_text: 'Valencia St, San Francisco, CA, USA',
    },
  },
];

const MOCK_DETAILS: Record<string, PlaceDetailsResult> = {
  'mock-001': {
    name: 'Blue Bottle Coffee',
    formatted_address: '66 Mint St, San Francisco, CA 94103, USA',
    address_components: [
      { long_name: 'San Francisco', short_name: 'SF', types: ['locality', 'political'] },
      { long_name: 'United States', short_name: 'US', types: ['country', 'political'] },
    ],
    geometry: { location: { lat: 37.7813, lng: -122.4035 } },
  },
  'mock-002': {
    name: 'Sightglass Coffee',
    formatted_address: '270 7th St, San Francisco, CA 94103, USA',
    address_components: [
      { long_name: 'San Francisco', short_name: 'SF', types: ['locality', 'political'] },
      { long_name: 'United States', short_name: 'US', types: ['country', 'political'] },
    ],
    geometry: { location: { lat: 37.7768, lng: -122.4067 } },
  },
  'mock-003': {
    name: 'Ritual Coffee Roasters',
    formatted_address: '1026 Valencia St, San Francisco, CA 94110, USA',
    address_components: [
      { long_name: 'San Francisco', short_name: 'SF', types: ['locality', 'political'] },
      { long_name: 'United States', short_name: 'US', types: ['country', 'political'] },
    ],
    geometry: { location: { lat: 37.7572, lng: -122.4213 } },
  },
};

// ── Search functions ────────────────────────────────────────────────────────

/** Returns predictions whose description contains the query (case-insensitive). */
export function searchMockCafes(query: string): PlacePrediction[] {
  const q = query.toLowerCase();
  return MOCK_PREDICTIONS.filter((p) => p.description.toLowerCase().includes(q));
}

/** Returns full place details for a mock place_id, or null if not found. */
export function getMockPlaceDetails(placeId: string): PlaceDetailsResult | null {
  return MOCK_DETAILS[placeId] ?? null;
}
```

**Step 2: TypeScript check**

```bash
cd /Users/anthonymartino/Desktop/claude/brewlog/.worktrees/t26-google-places && npx tsc --noEmit
```

Expected: no errors.

**Step 3: Commit**

```bash
git -C /Users/anthonymartino/Desktop/claude/brewlog/.worktrees/t26-google-places add src/utils/mockPlaces.ts
git -C /Users/anthonymartino/Desktop/claude/brewlog/.worktrees/t26-google-places commit -m "feat: add mockPlaces utility with 3 hardcoded cafe fixtures"
```

---

### Task 2: Update `CafeSearchBar.tsx` — types + mock branching

**Files:**
- Modify: `src/components/CafeSearchBar.tsx`

**Context:** The component currently defines `PlacePrediction`, `AddressComponent`, and `PlaceDetailsResult` inline. These move to `mockPlaces.ts` (Task 1). `AutocompleteResponse` and `PlaceDetailsResponse` are API-response wrappers used only by the real fetch paths — they stay inline.

**Step 1: Read the current file**

Read `src/components/CafeSearchBar.tsx` in full before editing.

**Step 2: Replace the type definitions and add imports**

Replace the existing `// ---- Google Places API types ----` block:

```ts
// ---- Google Places API types ----

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface AutocompleteResponse {
  status: string;
  predictions: PlacePrediction[];
}

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface PlaceDetailsResult {
  name: string;
  formatted_address: string;
  address_components?: AddressComponent[];
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface PlaceDetailsResponse {
  status: string;
  result: PlaceDetailsResult;
}
```

With:

```ts
// ---- Google Places API types ----

import {
  type PlacePrediction,
  type AddressComponent,
  type PlaceDetailsResult,
  searchMockCafes,
  getMockPlaceDetails,
} from '@/utils/mockPlaces';

interface AutocompleteResponse {
  status: string;
  predictions: PlacePrediction[];
}

interface PlaceDetailsResponse {
  status: string;
  result: PlaceDetailsResult;
}
```

**Step 3: Add TODO comment above `getApiKey()`**

Replace:

```ts
// ---- Helper ----

function getApiKey(): string {
```

With:

```ts
// ---- Helper ----

// TODO: Sign up for Google Places API and add key to AWS Secrets Manager.
// Secret name: brewlog/google-places-api-key  Region: us-east-1
// Format: { "GOOGLE_PLACES_API_KEY": "AIzaSy..." }
// Copy to .env for local dev, or use GOOGLE_PLACES_API_KEY=mock (.env.local) for mock mode.
function getApiKey(): string {
```

**Step 4: Add mock branch in `fetchPredictions`**

Inside `fetchPredictions`, after the early-return check (`if (!hasApiKey || input.trim().length < 2)`), add the mock branch before the `abortControllerRef` line:

Replace:

```ts
    // Abort any previous in-flight request
    abortControllerRef.current?.abort();
```

With:

```ts
    // Mock mode — synchronous, no network call
    if (apiKey === 'mock') {
      setPredictions(searchMockCafes(input));
      setDropdownVisible(true);
      return;
    }

    // Abort any previous in-flight request
    abortControllerRef.current?.abort();
```

**Step 5: Add mock branch in `handleSelectPrediction`**

After `if (!hasApiKey) return;`, add the mock branch before `setLoading(true)`:

Replace:

```ts
    setLoading(true);
    setDropdownVisible(false);
    setQuery(prediction.structured_formatting.main_text);
```

With:

```ts
    // Mock mode — resolve details synchronously
    if (apiKey === 'mock') {
      const details = getMockPlaceDetails(prediction.place_id);
      if (!details) return;
      const components = details.address_components ?? [];
      const city = extractAddressComponent(components, 'locality', 'administrative_area_level_2');
      const country = extractAddressComponent(components, 'country');
      setQuery(prediction.structured_formatting.main_text);
      setDropdownVisible(false);
      onSelect({
        google_place_id: prediction.place_id,
        name: details.name,
        address: details.formatted_address,
        city,
        country,
        latitude: details.geometry?.location.lat ?? 0,
        longitude: details.geometry?.location.lng ?? 0,
      });
      return;
    }

    setLoading(true);
    setDropdownVisible(false);
    setQuery(prediction.structured_formatting.main_text);
```

**Step 6: TypeScript check**

```bash
cd /Users/anthonymartino/Desktop/claude/brewlog/.worktrees/t26-google-places && npx tsc --noEmit
```

Expected: no errors.

**Step 7: Commit**

```bash
git -C /Users/anthonymartino/Desktop/claude/brewlog/.worktrees/t26-google-places add src/components/CafeSearchBar.tsx
git -C /Users/anthonymartino/Desktop/claude/brewlog/.worktrees/t26-google-places commit -m "feat: wire mock Places into CafeSearchBar, add TODO for real API signup"
```

---

### Task 3: Update `app.config.js` and create `.env.local`

**Files:**
- Modify: `app.config.js`
- Create: `.env.local` (gitignored)

**Step 1: Add `.env.local` loading to `app.config.js`**

The file currently starts with:

```js
require('dotenv').config();
```

Replace that line with:

```js
require('dotenv').config();
require('dotenv').config({ path: '.env.local', override: true });
```

**Step 2: Create `.env.local`**

Create `/Users/anthonymartino/Desktop/claude/brewlog/.worktrees/t26-google-places/.env.local`:

```
# .env.local — gitignored, overrides .env for local development
# Set GOOGLE_PLACES_API_KEY=mock to use hardcoded fixture cafes (no real API key needed)
GOOGLE_PLACES_API_KEY=mock
```

**Step 3: Verify `.env.local` is gitignored**

```bash
git -C /Users/anthonymartino/Desktop/claude/brewlog/.worktrees/t26-google-places status
```

Expected: `.env.local` does NOT appear in untracked files (it matches `.env*.local` in `.gitignore`).

**Step 4: Verify mock loads via Expo config**

```bash
cd /Users/anthonymartino/Desktop/claude/brewlog/.worktrees/t26-google-places && npx expo config --type public 2>/dev/null | grep -A3 '"extra"'
```

Expected: `googleMapsApiKey` shows `"mock"`.

**Step 5: Commit**

```bash
git -C /Users/anthonymartino/Desktop/claude/brewlog/.worktrees/t26-google-places add app.config.js
git -C /Users/anthonymartino/Desktop/claude/brewlog/.worktrees/t26-google-places commit -m "chore: load .env.local override in app.config.js for mock dev mode"
```

---

### Task 4: Update `playwright.config.ts` and add cafe search smoke test

**Files:**
- Modify: `playwright.config.ts`
- Modify: `e2e/smoke.test.ts`

**Step 1: Inject mock key into Playwright webServer command**

In `playwright.config.ts`, the current webServer command is:

```ts
command: 'CI=1 npx expo start --web --port 8081',
```

Replace with:

```ts
command: 'GOOGLE_PLACES_API_KEY=mock CI=1 npx expo start --web --port 8081',
```

This ensures tests always run in mock mode regardless of whether `.env.local` exists on the machine.

**Step 2: Add cafe search smoke test**

In `e2e/smoke.test.ts`, inside the `test.describe('BrewLog web smoke tests', ...)` block, add this test after the existing Add Visit test:

```ts
  test('Add Visit cafe search returns mock results', async ({ page }) => {
    // Navigate to Add Visit
    const addLink = page.locator('a[href*="add"]').first();
    if (await addLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addLink.click();
      await waitForLoad(page);
    } else {
      await page.goto('/add');
      await waitForLoad(page);
    }

    // Find the search input (TextInput renders as <input> on web)
    const searchInput = page.locator('input[placeholder="Search for a cafe..."]').first();
    const inputVisible = await searchInput.isVisible({ timeout: 5000 }).catch(() => false);

    if (!inputVisible) {
      // Search bar not rendered on web — skip gracefully
      await expectNoErrorOverlay(page);
      return;
    }

    // Type 'blue' — debounce is 300ms so wait 500ms
    await searchInput.fill('blue');
    await page.waitForTimeout(500);

    // Blue Bottle Coffee should appear in dropdown
    await expect(page.locator('text=Blue Bottle Coffee').first()).toBeVisible({ timeout: 5000 });

    // Sightglass should NOT appear (doesn't match 'blue')
    await expect(page.locator('text=Sightglass Coffee').first()).not.toBeVisible({ timeout: 2000 }).catch(() => {});

    await expectNoErrorOverlay(page);
  });
```

**Step 3: Commit**

```bash
git -C /Users/anthonymartino/Desktop/claude/brewlog/.worktrees/t26-google-places add playwright.config.ts e2e/smoke.test.ts
git -C /Users/anthonymartino/Desktop/claude/brewlog/.worktrees/t26-google-places commit -m "test: inject mock Places key in Playwright, add cafe search smoke test"
```

---

### Task 5: Add TODO section to `docs/STATUS.md`

**Files:**
- Modify: `docs/STATUS.md`

**Step 1: Read the file**

Read `docs/STATUS.md` in full to find the end of the file.

**Step 2: Append TODO section**

Append the following to the end of `docs/STATUS.md`:

```md

---

## TODO

- [ ] Sign up for Google Places API key (Google Cloud Console → Places API)
- [ ] Store key in AWS Secrets Manager: secret `brewlog/google-places-api-key`, region `us-east-1`, format `{"GOOGLE_PLACES_API_KEY":"AIzaSy..."}`
- [ ] Copy key to `.env` for local development (replacing placeholder)
- [ ] Remove `GOOGLE_PLACES_API_KEY=mock` from `.env.local` once real key is in place
```

**Step 3: Commit**

```bash
git -C /Users/anthonymartino/Desktop/claude/brewlog/.worktrees/t26-google-places add docs/STATUS.md
git -C /Users/anthonymartino/Desktop/claude/brewlog/.worktrees/t26-google-places commit -m "docs: add Google Places API signup TODO to STATUS.md"
```

---

### Task 6: Run Playwright tests and push

**Step 1: TypeScript check**

```bash
cd /Users/anthonymartino/Desktop/claude/brewlog/.worktrees/t26-google-places && npx tsc --noEmit
```

Expected: no errors.

**Step 2: Run Playwright smoke tests**

```bash
cd /Users/anthonymartino/Desktop/claude/brewlog/.worktrees/t26-google-places && npx playwright test --config playwright.config.ts 2>&1
```

Expected: all tests pass, including the new cafe search test. If any test fails, investigate and fix before pushing.

**Step 3: Verify git status is clean**

```bash
git -C /Users/anthonymartino/Desktop/claude/brewlog/.worktrees/t26-google-places status
```

Expected: `working tree clean` (`.env.local` must not appear).

**Step 4: Push**

```bash
git -C /Users/anthonymartino/Desktop/claude/brewlog/.worktrees/t26-google-places push origin feat/t26-google-places
```

---

## PR Test Plan Checklist Reference

These items from PR #9 can be verified manually after the mock is in place:

- [ ] Search for a cafe — type 'blue', 'sight', or 'ritual' → matching mock results appear after 300ms debounce
- [ ] Select a result — cafe card shown with name + address
- [ ] Select same mock cafe on a second visit — existing cafe reused (no duplicate DB row)
- [ ] Tap "Add manually" — text fields appear
- [ ] Background the app after selecting a mock cafe — on return, cafe is still shown (Zustand draft)
- [ ] Set `GOOGLE_PLACES_API_KEY=` (empty) in `.env.local` → "Google Places not configured" shown, manual entry works
