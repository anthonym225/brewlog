# BrewLog

A local-only mobile app for logging personal cafe visits. Built with React Native + Expo (SDK 54).

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React Native + Expo SDK 54 |
| Routing | Expo Router (file-based) |
| Database | SQLite via `expo-sqlite` |
| UI State | Zustand (in-memory, no persistence) |
| Language | TypeScript |
| Navigation | Expo Router tab + stack |

## Getting Started

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start dev server
npx expo start

# Web
npx expo start --web

# iOS
npx expo start --ios

# Android
npx expo start --android
```

## Directory Structure

```
app/                  # Expo Router screens (file-based routing)
  (tabs)/             # Bottom tab navigator — Home, Map, Add, Rankings, Profile
  cafe/               # Cafe detail screen: /cafe/[id]
  visit/              # Visit detail screen: /visit/[id]
assets/               # Static image assets
docs/                 # Design documents and task breakdown
src/
  components/         # Reusable UI components
  constants/          # DRINK_TYPES and EXPERIENCE_DIMENSIONS
  db/                 # SQLite operations — one file per entity
  stores/             # Zustand store (UI state only)
  types/              # TypeScript interfaces
  utils/              # uuid, ratings, formatting, photos helpers
```

## Data Model

Four SQLite tables: `cafes`, `visits`, `drinks`, `photos`. All relationships use UUID foreign keys. Drinks and photos cascade-delete when their parent visit is deleted.

## Key Design Decisions

- Experience ratings are flat columns on `visits` (8 fixed dimensions — no join table).
- Rankings are computed at read time via SQL aggregation — no denormalized tables.
- Photos are copied to the app's document directory; the DB stores paths only.
- Screens re-query on focus via `useFocusEffect` to stay fresh after navigation.
