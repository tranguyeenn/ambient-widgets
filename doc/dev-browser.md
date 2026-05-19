# Browser-only development

**Command:** `npm run dev`

Use this when working on UI layout, styles, or the calendar widget without needing Spotify, Genius, or native windows.

## Flow

```text
npm run dev
    │
    ▼
vite (reads vite.config.ts)
    │
    ├─► Dev server :1420 (strictPort: true)
    ├─► React Fast Refresh (@vitejs/plugin-react)
    ├─► Multi-page inputs:
    │       pages/lyrics.html   → /src/lyrics.tsx
    │       pages/calendar.html → /src/calendar.tsx
    │       pages/weather.html  → /src/weather.tsx
    │       pages/welcome.html  → /src/welcome.tsx
    └─► Watches src/, pages/ — ignores src-tauri/**
```

## URLs

- http://localhost:1420/pages/calendar.html
- http://localhost:1420/pages/lyrics.html
- http://localhost:1420/pages/weather.html
- http://localhost:1420/pages/welcome.html

## What works / what does not

| Feature | Browser dev | Tauri dev |
|---------|-------------|-----------|
| Calendar grid, navigation | Yes | Yes |
| Transparent frameless window | No | Yes |
| `invoke(...)` / Spotify / Genius | No | Yes |
| Weather / Open-Meteo | Yes (fetch) | Yes |
| Weather location (GPS) | Browser geolocation API | Tauri geolocation plugin |
| Daily welcome overlay | UI only (no native window chrome) | Full-screen window |
| Window position memory | No | Yes |

Lyrics page may show loading or fallbacks because `invoke` is unavailable outside Tauri.

## Optional: `TAURI_DEV_HOST`

If set, Vite binds to that host and HMR uses WebSocket port **1421**. Used for physical-device dev; uncommon for this project.

## Related docs

- [dev-tauri.md](./dev-tauri.md) — full native dev
- [runtime-calendar.md](./runtime-calendar.md)
