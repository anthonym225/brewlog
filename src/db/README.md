# src/db/

All SQLite database operations. One file per entity. No ORM — all queries are raw parameterized SQL.

## Files

| File | Responsibility |
|------|---------------|
| `database.ts` | DB initialization and singleton access |
| `schema.ts` | `CREATE TABLE IF NOT EXISTS` statements for all 4 tables |
| `cafes.ts` | CRUD for the `cafes` table |
| `visits.ts` | CRUD for `visits` + composite queries joining drinks/photos |
| `drinks.ts` | CRUD for the `drinks` table |
| `photos.ts` | CRUD for the `photos` table |
| `rankings.ts` | Aggregation queries for Rankings and Profile stats |

## Initialization

`initDatabase()` must be called **once** at app startup (in `app/_layout.tsx`). It opens `brewlog.db`, enables WAL mode and foreign keys, then runs all `CREATE TABLE IF NOT EXISTS` statements.

`getDatabase()` returns the singleton — throws if called before `initDatabase()`.

## Key Query Patterns

**Composite queries** (`visits.ts`): `getVisitWithDetails()` and `getAllVisitsWithDetails()` join across cafes/drinks/photos and assemble `VisitWithDetails` objects in TypeScript (not a single SQL JOIN — they batch-query related records separately).

**Rankings** (`rankings.ts`): All computed at read time via SQL `AVG()` aggregation. No denormalized tables.

**Deduplication** (`cafes.ts`): `getCafeByGooglePlaceId()` enables reusing an existing cafe when a user logs a second visit to the same place.

## Safety Rules

- All queries use parameterized inputs (`?` placeholders) — never string interpolation
- Foreign keys are enforced (`PRAGMA foreign_keys = ON`)
- Drinks and photos cascade-delete when their parent visit is deleted
