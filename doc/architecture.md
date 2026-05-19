# Architecture

## Stack at a glance

```text
┌─────────────────────────────────────────────────────────────────┐
│  User-facing UI (React + TypeScript)                            │
│  pages/*.html → src/*.tsx → components                          │
│  widgets: lyric, calendar, weather  +  welcome overlay          │
└────────────────────────────┬────────────────────────────────────┘
                             │ invoke() over Tauri IPC (lyrics only)
┌────────────────────────────▼────────────────────────────────────┐
│  Native shell (Rust) — src-tauri/                                 │
│  Windows, events, macOS policy, Spotify / Genius, geolocation   │
└────────────────────────────┬────────────────────────────────────┘
                             │ fetch() from webview (no IPC)
┌────────────────────────────▼────────────────────────────────────┐
│  Weather, quotes, welcome state — Open-Meteo, DummyJSON, storage  │
└─────────────────────────────────────────────────────────────────┘
```

| Layer | Tooling | Source |
|-------|---------|--------|
| UI | Vite 7, React 19, TypeScript 5.8 | `pages/`, `src/` |
| Desktop | Tauri 2, Rust 2021 | `src-tauri/` |
| Orchestration | npm scripts + `@tauri-apps/cli` | `package.json`, `tauri.conf.json` |

## Multi-page frontend

Each surface is its own HTML entry and React root:

| Window | HTML | TS entry | Component |
|--------|------|----------|-----------|
| Lyrics | `pages/lyrics.html` | `src/lyrics.tsx` | `LyricTile` |
| Calendar | `pages/calendar.html` | `src/calendar.tsx` | `CalendarWidget` |
| Weather | `pages/weather.html` | `src/weather.tsx` | `WeatherWidget` |
| Welcome | `pages/welcome.html` | `src/welcome.tsx` | `DailyWelcomeOverlay` |

Vite `rollupOptions.input` in `vite.config.ts` must match `tauri.conf.json` `app.windows[].url`.

## Data flow (lyrics widget)

```text
LyricTile (React)
    ├─► get_now_playing_track  → spotify/
    ├─► get_current_lyric      → genius.rs + cache.rs + lyric_filter.rs
    └─► spotify_login / spotify_is_authenticated → spotify/auth.rs

Quote mode uses `getRandomQuote()` in the webview (DummyJSON) — see [runtime-quotes.md](./runtime-quotes.md).
```

Calendar and weather have **no** Rust IPC — see [runtime-calendar.md](./runtime-calendar.md), [runtime-weather.md](./runtime-weather.md).

Welcome is frontend-only with Rust **events** (`daily-welcome-check`) — see [runtime-welcome.md](./runtime-welcome.md).

## Related docs

- [rust-tauri.md](./rust-tauri.md) — native shell details
- [runtime-ipc.md](./runtime-ipc.md) — command reference
- [runtime-welcome.md](./runtime-welcome.md)
