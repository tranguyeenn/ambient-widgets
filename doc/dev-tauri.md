# Native development

**Command:** `npm run tauri dev`

Use this for transparent windows, IPC, Spotify OAuth, lyrics, quote mode, weather location, and the daily welcome overlay.

## Flow

```text
npm run tauri dev
    │
    ▼
@tauri-apps/cli
    │
    ├─1─► beforeDevCommand: npm run dev
    │         └── Vite on http://localhost:1420
    │
    ├─2─► cargo build (debug)
    │         ├── build.rs → tauri_build::build()
    │         └── compiles src-tauri/src/*.rs
    │
    └─3─► Launch native process (orbit)
              ├── Load src-tauri/.env (dotenvy)
              ├── Plugins: geolocation, window-state, opener
              ├── Register IPC commands
              ├── macOS: normal activation policy (Dock visible)
              ├── Show lyric, calendar, weather; hide welcome
              └── Windows from tauri.conf.json:
                      lyric    → http://localhost:1420/pages/lyrics.html
                      calendar → http://localhost:1420/pages/calendar.html
                      weather  → http://localhost:1420/pages/weather.html
                      welcome  → http://localhost:1420/pages/welcome.html
```

## Hot reload

Webviews load the **dev URL**, not `dist/`. Editing React/TS/CSS under `src/` or `pages/` hot-reloads through Vite.

Rust changes require the Tauri dev process to rebuild (CLI usually handles this on save).

## Prerequisites

- `npm install`
- Rust + [Tauri v2 prerequisites](https://v2.tauri.app/start/prerequisites/)
- `src-tauri/.env` for lyrics (see root README)

## Dev vs release (macOS)

| Behavior | `tauri dev` | `tauri build` (release) |
|----------|-------------|-------------------------|
| Dock icon | Yes | No (accessory policy) |
| ⌘⇥ app switcher | Yes | No |
| Welcome overlay | Can re-show same day after restart (session gate) | Once per calendar day |

See [runtime-startup.md](./runtime-startup.md), [runtime-welcome.md](./runtime-welcome.md).

## Related docs

- [dev-browser.md](./dev-browser.md)
- [rust-tauri.md](./rust-tauri.md)
- [runtime-windows.md](./runtime-windows.md)
