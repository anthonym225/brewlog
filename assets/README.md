# assets/

Static image assets bundled with the app.

| File | Usage |
|------|-------|
| `icon.png` | App icon (1024×1024) |
| `adaptive-icon.png` | Android adaptive icon foreground |
| `splash-icon.png` | Splash screen logo |
| `favicon.png` | Web favicon |
| `potential-home.png` | Design mockup reference (not used in production) |

## Notes

- User-captured photos are **not** stored here. They are saved to the app's document directory at runtime via `expo-file-system`. The DB stores file paths only.
- See `src/utils/photos.ts` for photo storage logic.
