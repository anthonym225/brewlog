# Design: Mock Google Places for Local Dev & Testing

Date: 2026-02-22
Branch: feat/t26-google-places

## Summary

Add a mock Google Places implementation for local development and Playwright tests. When `GOOGLE_PLACES_API_KEY=mock`, `CafeSearchBar` uses a hardcoded set of cafes instead of calling the real API. Local dev activates mock via `.env.local`; Playwright always runs in mock mode via a shell env var injection in `playwright.config.ts`.

Also adds a `# TODO` section to `docs/STATUS.md` and a `// TODO` comment in `CafeSearchBar.tsx` tracking the real Google Places API signup steps.

## Files

| File | Action | Notes |
|---|---|---|
| `src/utils/mockPlaces.ts` | Create | Mock cafe data + `searchMockCafes(query)` + `getMockPlaceDetails(place_id)` |
| `src/components/CafeSearchBar.tsx` | Modify | Branch on `apiKey === 'mock'`; add TODO comment above `getApiKey()` |
| `app.config.js` | Modify | Add `dotenv.config({ path: '.env.local', override: true })` after existing call |
| `.env.local` | Create (gitignored) | `GOOGLE_PLACES_API_KEY=mock` |
| `playwright.config.ts` | Modify | Inject `GOOGLE_PLACES_API_KEY=mock` into webServer command |
| `e2e/smoke.test.ts` | Modify | Add cafe search smoke test using mock results |
| `docs/STATUS.md` | Modify | Append `## TODO` section |

## Mock Data (`src/utils/mockPlaces.ts`)

Three hardcoded cafes matching the Google Places API response shape:

| place_id | Name | Address |
|---|---|---|
| `mock-001` | Blue Bottle Coffee | Market St, San Francisco, CA |
| `mock-002` | Sightglass Coffee | 7th St, San Francisco, CA |
| `mock-003` | Ritual Coffee Roasters | Valencia St, San Francisco, CA |

**`searchMockCafes(query: string)`** — filters cafes by lowercased substring match on `description`. Returns `PlacePrediction[]`.

**`getMockPlaceDetails(place_id: string)`** — returns full place details object (name, formatted_address, address_components, geometry.location) for the given ID. Returns `PlaceDetailsResult | null`.

Both functions are pure and synchronous. `CafeSearchBar` wraps them in `Promise.resolve()` to preserve the existing async interface.

## Mock Activation

### Local dev (`.env.local`)

```
# .env.local — gitignored, overrides .env for local dev
GOOGLE_PLACES_API_KEY=mock
```

`app.config.js` loads this after `.env`:

```js
require('dotenv').config();
require('dotenv').config({ path: '.env.local', override: true });
```

`override: true` ensures `.env.local` wins over `.env`.

### Playwright tests (`playwright.config.ts`)

```ts
webServer: {
  command: 'GOOGLE_PLACES_API_KEY=mock CI=1 npx expo start --web --port 8081',
  ...
}
```

Shell env var injection means tests always run in mock mode. Since dotenv doesn't override existing `process.env` vars (only the `.env.local` load uses `override: true`), the shell value takes precedence over `.env`.

## `CafeSearchBar.tsx` Changes

### TODO comment (above `getApiKey()`)

```ts
// TODO: Sign up for Google Places API and add key to AWS Secrets Manager.
// Secret name: brewlog/google-places-api-key  Region: us-east-1
// Format: { "GOOGLE_PLACES_API_KEY": "AIzaSy..." }
// Copy to .env for local dev, or use GOOGLE_PLACES_API_KEY=mock (.env.local) for mock mode.
```

### Mock branching in `fetchPredictions`

```ts
if (apiKey === 'mock') {
  const results = searchMockCafes(input);
  setPredictions(results);
  setDropdownVisible(true);
  setLoading(false);
  return;
}
// ... existing real API call ...
```

### Mock branching in `handleSelectPrediction`

```ts
if (apiKey === 'mock') {
  const details = getMockPlaceDetails(prediction.place_id);
  if (!details) return;
  // assemble and call onSelect(...)
  return;
}
// ... existing real API call ...
```

## New Playwright Test

```ts
test('Add Visit cafe search returns mock results', async ({ page }) => {
  // Navigate to Add Visit
  // Type 'blue' in search input
  // Expect 'Blue Bottle Coffee' visible in dropdown
  // Expect 'Sightglass' not visible (filtered)
  // Click Blue Bottle Coffee result
  // Expect cafe card with name and address visible
});
```

## TODO Placements

### `docs/STATUS.md` (appended section)

```md
## TODO

- [ ] Sign up for Google Places API key (Google Cloud Console → Places API)
- [ ] Store key in AWS Secrets Manager: secret `brewlog/google-places-api-key`, region `us-east-1`, format `{"GOOGLE_PLACES_API_KEY":"AIzaSy..."}`
- [ ] Copy key to `.env` for local development
```

## Non-Goals

- No mock for map display (CafeMap)
- No mock server / service worker
- No mock persistence across tests
- No mock for photo storage
