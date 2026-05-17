# Architecture

## Stack at a glance

```text
┌─────────────────────────────────────────────────────────────────┐
│  User-facing widgets (React + TypeScript)                       │
│  pages/*.html → src/*.tsx → components                          │
└────────────────────────────┬────────────────────────────────────┘
                             │ invoke() over Tauri IPC
┌────────────────────────────▼────────────────────────────────────┐
│  Native shell (Rust) — src-tauri/                                 │
│  Windows, macOS policy, Spotify / Genius / ZenQuotes, secrets     │
└─────────────────────────────────────────────────────────────────┘
```

| Layer | Tooling | Source |
|-------|---------|--------|
| UI | Vite 7, React 19, TypeScript 5.8 | `pages/`, `src/` |
| Desktop | Tauri 2, Rust 2021 | `src-tauri/` |
| Orchestration | npm scripts + `@tauri-apps/cli` | `package.json`, `tauri.conf.json` |

## Multi-page frontend

Each widget is its own HTML entry and React root:

| Window | HTML | TS entry | Component |
|--------|------|----------|-----------|
| Lyrics | `pages/lyrics.html` | `src/lyrics.tsx` | `LyricTile` |
| Calendar | `pages/calendar.html` | `src/calendar.tsx` | `CalendarWidget` |

Vite `rollupOptions.input` in `vite.config.ts` must match `tauri.conf.json` `app.windows[].url`.

## Data flow (lyrics widget)

```text
LyricTile (React)
    ├─► get_now_playing_track  → spotify/
    ├─► get_current_lyric      → genius.rs + cache.rs + lyric_filter.rs
    ├─► fetch_zen_quote        → zenquotes.rs
    └─► spotify_login / spotify_is_authenticated → spotify/auth.rs
```

Calendar has **no** Rust IPC — see [runtime-calendar.md](./runtime-calendar.md).

## Related docs

- [rust-tauri.md](./rust-tauri.md) — native shell details
- [runtime-ipc.md](./runtime-ipc.md) — command reference
