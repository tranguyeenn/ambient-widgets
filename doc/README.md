# Documentation

Detailed guides for how Ambient Widgets is built and how it runs at runtime. Start here, then open the topic you need.

## Architecture

- [architecture.md](./architecture.md) — stack overview (React + Tauri + Rust)

## Build

- [build-outputs.md](./build-outputs.md) — generated folders and artifacts (`dist/`, `target/`, etc.)
- [npm-scripts.md](./npm-scripts.md) — all `package.json` scripts and quick “which command?” table
- [dev-browser.md](./dev-browser.md) — `npm run dev` (Vite only)
- [dev-tauri.md](./dev-tauri.md) — `npm run tauri dev` (native + hot reload)
- [build-frontend.md](./build-frontend.md) — `npm run build` (TypeScript + Vite → `dist/`)
- [build-release.md](./build-release.md) — `npm run tauri build`, DMG, install helpers
- [rust-tauri.md](./rust-tauri.md) — `build.rs`, Cargo deps, `tauri.conf.json`, permissions, `dist/` layout
- [icons.md](./icons.md) — regenerating app icons

## Runtime

- [runtime-startup.md](./runtime-startup.md) — app launch, macOS policy, plugins
- [runtime-windows.md](./runtime-windows.md) — lyric, calendar & weather windows, drag, window state
- [runtime-ipc.md](./runtime-ipc.md) — `invoke` commands (frontend ↔ Rust)
- [runtime-lyrics-widget.md](./runtime-lyrics-widget.md) — 15s poll loop, lyric vs quote mode
- [runtime-spotify.md](./runtime-spotify.md) — PKCE OAuth, tokens, now playing
- [runtime-genius-cache.md](./runtime-genius-cache.md) — Genius fetch, lyric filter, per-track cache
- [runtime-quotes.md](./runtime-quotes.md) — DummyJSON quote mode (lyrics widget)
- [runtime-weather.md](./runtime-weather.md) — Open-Meteo, geolocation, themes
- [runtime-calendar.md](./runtime-calendar.md) — calendar widget (frontend only)
