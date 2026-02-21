# src/components/

Reusable UI components shared across screens.

## Components

| File | Props | Used By |
|------|-------|---------|
| `RatingSlider.tsx` | `label`, `value`, `onChange`, `optional?` | Add Visit (experience dims), DrinkRow |
| `DrinkRow.tsx` | `drink: DrinkFormData`, `onChange`, `onDelete` | Add Visit drinks section |
| `VisitCard.tsx` | `visit: VisitWithDetails`, `onPress` | Home/Timeline feed |
| `PhotoStrip.tsx` | `photos: string[]`, `onAdd?`, `onDelete?`, `editable?` | Add Visit, Visit Detail, Cafe Page |
| `EmptyState.tsx` | `title`, `message`, `actionLabel?`, `onAction?` | Home, Map, Rankings |
| `StatCard.tsx` | `label`, `value`, `subtitle?` | Profile/Stats screen |
| `RankingList.tsx` | `entries: RankingEntry[] \| DrinkRankingEntry[]`, `onPress` | Rankings screen |

## Design Notes

- Color palette: primary `#6B4226` (dark brown), accent `#C8864A` (caramel), background `#FFF8F0` (cream)
- `RatingSlider` renders a row of 10 tappable circles — better touch targets than a native slider
- `PhotoStrip` has two modes: `editable` (shows add button + delete on long-press) and display-only
- `VisitCard` shows the first photo as a hero image, or a gradient placeholder if no photos
