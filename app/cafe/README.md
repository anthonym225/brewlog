# app/cafe/

Dynamic route for the Cafe Page screen.

## Files

| File | Route | Description |
|------|-------|-------------|
| `[id].tsx` | `/cafe/:id` | Auto-generated cafe page |

## Cafe Page — `[id].tsx`

Displays everything logged about a single cafe across all visits.

**Data queries:**
- `getCafeById(id)` — cafe name, address, coordinates
- `getVisitsByCafeId(id)` — all visits for this cafe

**Sections displayed:**
1. Cafe header (name, address, city/country)
2. Embedded `MapView` with a marker at the cafe's coordinates
3. Aggregate experience ratings — averaged across all visits, only shows rated dimensions
4. Drink leaderboard — all drinks ordered at this cafe, sorted by rating DESC
5. Visit history — list of visits, newest first, each tappable → `/visit/[id]`
6. Photo gallery — all photos from all visits in a `PhotoStrip`

**Navigation in:** tapped from `VisitCard`, Visit Detail cafe name link, Map callout
