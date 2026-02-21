# app/(tabs)/

Bottom tab navigator screens. The `(tabs)` group renders a persistent 5-tab bar at the bottom of the screen.

## Files

| File | Tab | Icon | Description |
|------|-----|------|-------------|
| `_layout.tsx` | — | — | Tab navigator config — icons, labels, tab bar styling |
| `index.tsx` | Home | `home` | Timeline feed of all visits, newest first |
| `map.tsx` | Map | `map` | Full-screen map with pins for every visited cafe |
| `add.tsx` | Add | `add-circle` | Multi-section form for logging a new visit |
| `rankings.tsx` | Rankings | `trophy` | Scrollable category tabs with ranked cafe/drink lists |
| `profile.tsx` | Profile | `person` | Personal stats grid and summary cards |

## Tab Bar

- Uses Ionicons for tab icons
- The Add (+) tab is visually prominent (larger icon)
- Warm color palette: active tint `#C8864A` (caramel), inactive `#9E8B7D`

## Data Freshness

All data-displaying tabs use `useFocusEffect` to re-query SQLite when the user navigates to them. This ensures the Home, Map, Rankings, and Profile screens always reflect the latest visits without requiring a manual refresh.
