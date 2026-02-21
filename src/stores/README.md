# src/stores/

Zustand store for UI-only state. Nothing here is persisted to disk — all state resets on app restart.

## Files

### `useAppStore.ts`

| State | Type | Purpose |
|-------|------|---------|
| `activeRankingTab` | `string` | Currently selected Rankings screen tab — survives tab switches |
| `visitFormDraft` | `VisitFormData \| null` | Add Visit form draft — survives app backgrounding within a session |

| Action | Description |
|--------|-------------|
| `setActiveRankingTab(tab)` | Update the active rankings category |
| `setVisitFormDraft(draft)` | Save form state as user fills it in |
| `clearVisitFormDraft()` | Reset form after a successful save |

## Why Not Persist?

This is an intentional P0 decision. The form draft surviving backgrounding (within a session) is handled by React/Zustand in-memory. Surviving a full restart is a Phase 2 enhancement if needed.

All permanent data lives in SQLite (`src/db/`).
