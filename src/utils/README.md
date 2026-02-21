# src/utils/

Pure utility functions. No side effects, no DB access, no UI.

## Files

### `uuid.ts`

| Function | Description |
|----------|-------------|
| `generateUUID()` | Returns a v4 UUID string using the `uuid` package |

### `ratings.ts`

| Function | Description |
|----------|-------------|
| `computeOverallRating(visit)` | Averages all non-null experience dimension values on a `Visit`. Returns `null` if no dimensions are rated. |
| `computeCoffeeQuality(drinks)` | Averages all drink ratings. Returns `null` for an empty array. |

These are used when saving a visit — `overall_rating` and `coffee_quality` are computed and stored as columns on the `visits` table.

### `formatting.ts`

| Function | Example output |
|----------|---------------|
| `formatDate(isoString)` | `"Oct 26, 2023"` |
| `formatRating(rating)` | `"8.5"` |
| `formatRatingFraction(rating)` | `"8/10"` |

### `photos.ts`

| Function | Description |
|----------|-------------|
| `pickPhotos()` | Launch image picker (camera or library), return local URIs |
| `savePhotoToStorage(uri)` | Copy photo to app document directory, resize to max 1200px wide, return new path |
| `deletePhotoFile(filePath)` | Remove photo file from disk |

Photo files must be deleted manually when a visit is deleted — cascade only handles DB rows.
