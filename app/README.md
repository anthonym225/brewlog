# app/

Expo Router screen files. The directory structure maps 1:1 to URL routes.

## File-Based Routing

| File | Route | Description |
|------|-------|-------------|
| `_layout.tsx` | — | Root Stack layout. Wraps the entire app. Sets `headerShown: false` for tab screens and `true` for detail screens. Calls `initDatabase()` on startup. |
| `(tabs)/` | — | Bottom tab navigator group |
| `cafe/[id].tsx` | `/cafe/:id` | Cafe detail page — aggregate stats, visit history, map pin |
| `visit/[id].tsx` | `/visit/:id` | Visit detail — photos, drinks, experience ratings |

## Navigation Patterns

- **Tab navigation**: `router.push('/(tabs)/add')` to jump to a specific tab
- **Detail screens**: `router.push('/visit/123')` or `router.push('/cafe/456')`
- **Back**: `router.back()` or hardware back button
- **Params**: `useLocalSearchParams()` to read `[id]` from the URL

## Layout Hierarchy

```
_layout.tsx (Stack)
  (tabs)/_layout.tsx (Tabs)
    index.tsx        ← Home
    map.tsx          ← Map
    add.tsx          ← Add Visit
    rankings.tsx     ← Rankings
    profile.tsx      ← Profile
  cafe/[id].tsx      ← Stack screen
  visit/[id].tsx     ← Stack screen
```
