# Rust & Tauri configuration

## Build script (`build.rs`)

Runs **before** every `cargo build`:

```rust
fn main() {
    tauri_build::build()
}
```

`tauri_build::build()`:

1. Reads `tauri.conf.json` (app id, windows, bundle, build hooks).
2. Generates context for `tauri::generate_context!()` in `main.rs`.
3. Wires permissions from `permissions/*.toml` and `capabilities/default.json`.
4. Validates icon paths for bundling.

## `tauri.conf.json` build hooks

| Key | Value | Effect |
|-----|-------|--------|
| `beforeDevCommand` | `npm run dev` | Start Vite before dev windows open |
| `devUrl` | `http://localhost:1420` | Webview base URL in dev |
| `beforeBuildCommand` | `npm run build` | Produce `dist/` before release compile |
| `frontendDist` | `../dist` | Static assets for release webviews |

## Window definitions

| Label | URL | Default size | Notes |
|-------|-----|--------------|-------|
| `lyric` | `pages/lyrics.html` | 400×200 | `create: true` — opens on launch |
| `calendar` | `pages/calendar.html` | 308×348 | Transparent, undecorated, all workspaces |

Shared window flags: `transparent`, `decorations: false`, `visibleOnAllWorkspaces`, `resizable`.

`macOSPrivateApi: true` enables transparent windows on macOS.

## Cargo dependencies

| Crate / plugin | Role |
|----------------|------|
| `tauri` | App lifecycle, commands, windows |
| `tauri-plugin-window-state` | Save size/position per window label |
| `tauri-plugin-opener` | Open URLs (Spotify login fallback) |
| `reqwest` | HTTP (Spotify, Genius) |
| `tiny_http` | Local OAuth callback server |
| `tokio` | Async command handlers |
| `scraper` / `regex` | Genius HTML + lyric filtering |
| `dotenvy` | Load `src-tauri/.env` |
| `chrono`, `serde`, `serde_json` | Types and serialization |

## Permissions & capabilities

**Capability:** `src-tauri/capabilities/default.json`

- Windows: `lyric`, `calendar`, `weather`
- Includes: `core:default`, window drag, opener, window-state, custom commands

**Custom permissions** (`src-tauri/permissions/*.toml`):

| Permission id | Rust command |
|---------------|----------------|
| `allow-get-current-lyric` | `get_current_lyric` |
| `allow-get-now-playing-track` | `get_now_playing_track` |
| `allow-spotify-login` | `spotify_login` |
| `allow-spotify-is-authenticated` | `spotify_is_authenticated` |

New commands must be registered in `main.rs` **and** allowed here, or `invoke` fails in release builds.

## Rust module map

```text
src-tauri/src/
├── main.rs           # entry, plugins, command registration
├── commands.rs       # #[tauri::command] handlers
├── spotify/          # OAuth, tokens, now playing API
├── genius.rs         # lyric search/scrape
├── lyric_filter.rs   # line filtering
└── cache.rs          # per-track line rotation
```

## Related docs

- [runtime-ipc.md](./runtime-ipc.md)
- [dev-tauri.md](./dev-tauri.md)
- [build-release.md](./build-release.md)
