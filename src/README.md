# src/

All application source code. Imported via the `@/*` path alias (e.g. `import { Cafe } from '@/types'`).

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `components/` | Reusable UI components shared across screens |
| `constants/` | Static arrays — drink types and experience dimensions |
| `db/` | All SQLite operations, one file per entity |
| `stores/` | Zustand store for UI-only state |
| `types/` | TypeScript interfaces for all data models |
| `utils/` | Pure utility functions — UUID, ratings, formatting, photos |

## Path Alias

`@/*` resolves to `src/*` via `tsconfig.json`. Use this in all imports:

```ts
import { Visit } from '@/types';
import { getDatabase } from '@/db/database';
import { DRINK_TYPES } from '@/constants/drinkTypes';
```
