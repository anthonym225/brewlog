# Design: .env + API Key Loading (T26)

Date: 2026-02-22
Branch: feat/t26-google-places

## Summary

Add `.env`-based API key loading to the BrewLog Expo app. The developer manually populates `.env` with secrets (sourced from AWS Secrets Manager). At build/dev time, `app.config.js` loads the `.env` via `dotenv` and injects keys into `expo.extra`, where they are consumed by `CafeSearchBar` via `expo-constants`.

## Approach

Build-time injection only. No AWS SDK in the app. No runtime secret fetching. Developer manages `.env` manually.

## Files

| File | Action | Notes |
|---|---|---|
| `.env` | Create (gitignored) | Placeholder values, developer populates |
| `.env.example` | Create (committed) | Documents required variables |
| `app.config.js` | Create | Replaces `app.json`; loads dotenv, injects `GOOGLE_PLACES_API_KEY` |
| `app.json` | Remove | Superseded by `app.config.js` |
| `Makefile` | Create | `dev`, `ios`, `android` targets |
| `.gitignore` | Edit | Add `.env` |
| `package.json` | Edit | Add `dotenv` as devDependency |

## Secret Structure (AWS Secrets Manager)

Secret name placeholder: `brewlog/google-places-api-key`
Region placeholder: `us-east-1`
Format: JSON object

```json
{
  "GOOGLE_PLACES_API_KEY": "AIzaSy..."
}
```

Developer copies the value manually into `.env`.

## `.env` Variables

```
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
```

## `app.config.js` Structure

```js
require('dotenv').config();

export default {
  expo: {
    // ...all fields from app.json unchanged...
    extra: {
      googleMapsApiKey: process.env.GOOGLE_PLACES_API_KEY ?? '',
    },
  },
};
```

No changes required to `CafeSearchBar.tsx` — it already reads `Constants.expoConfig?.extra?.googleMapsApiKey`.

## Makefile Targets

```makefile
.PHONY: dev ios android

dev:
	npx expo start

ios:
	npx expo start --ios

android:
	npx expo start --android
```

## Non-Goals

- No automatic secret fetching script
- No CI/CD integration
- No AWS SDK dependency
- No runtime secret loading
