# app/visit/

Dynamic route for the Visit Detail screen.

## Files

| File | Route | Description |
|------|-------|-------------|
| `[id].tsx` | `/visit/:id` | Full detail view for a single visit |

## Visit Detail — `[id].tsx`

Shows everything recorded for one cafe visit.

**Data query:** `getVisitWithDetails(id)` — joins visit with cafe, drinks, and photos.

**Sections displayed:**
1. Photo gallery via `PhotoStrip` (non-editable)
2. Cafe name (tappable → `/cafe/[cafe_id]`) and address
3. Visit date (formatted)
4. Drinks — name, type, rating displayed as `X/10`
5. Experience ratings — only dimensions that were actually rated
6. Notes (full text, untruncated)

**Actions:**
- **Edit** — navigates to Add Visit screen pre-filled with this visit's data
- **Delete** — confirmation `Alert` → `deleteVisit(id)` → `router.back()`

**Navigation in:** tapped from Home timeline `VisitCard`, Cafe Page visit history, Rankings entries
