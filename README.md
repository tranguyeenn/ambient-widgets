# Ambient Widgets

Small, transparent **macOS** desktop widgets built with **Tauri 2** and **React**. Each widget runs in its **own** native window so layouts stay independent. Spotify and Genius run through the Rust shell; quotes use [DummyJSON](https://dummyjson.com) from the frontend—no separate backend server.

![App icon](src-tauri/app-icon.png)

---

## Widgets

| | Calendar | Lyrics |
| --- | --- | --- |
| **What it does** | Full month grid with prev/next navigation, today highlight, clickable dates | **Lyric mode:** Genius line for the **currently playing** Spotify track. **Quote mode:** random quote from [DummyJSON](https://dummyjson.com/docs/quotes) when nothing is playing or Spotify is unavailable |
| **Launch** | Opens with the app | Opens with the app |
| **Resize** | Yes — drag window edges; content scales with size | Yes |
| **Position memory** | Restored on next launch | Restored on next launch |
| **Chrome** | Frameless glass card, drag via header | Same |

---

## Quick start

```bash
npm install
npm run tauri dev
```

Vite serves the UI on **http://localhost:1420**; Tauri opens the native windows.

**Browser-only (no Tauri):**

```bash
npm run dev
# http://localhost:1420/pages/calendar.html
# http://localhost:1420/pages/lyrics.html
```

**Production macOS app:**

```bash
npm run tauri build
```

Outputs (not copied to `/Applications` automatically):

- `src-tauri/target/release/bundle/macos/Ambient Widgets.app`
- `src-tauri/target/release/bundle/dmg/Ambient Widgets_0.1.0_aarch64.dmg`

Install either way:

```bash
# Drag Ambient Widgets.app from the .dmg to Applications
npm run open:dmg

# Or copy from the terminal (after build)
npm run install:mac
```

Then open **Ambient Widgets** from Applications (or Spotlight). The release build uses an accessory activation policy, so it may not appear in the Dock—use Spotlight or Login Items to launch it.

---

## Documentation

In-depth guides for build pipelines, Tauri/Rust config, and runtime behavior live in **[`doc/`](./doc/README.md)**.

| Topic | Guide |
| --- | --- |
| Index | [doc/README.md](./doc/README.md) |
| Architecture | [architecture.md](./doc/architecture.md) |
| Build outputs (`dist/`, `target/`, …) | [build-outputs.md](./doc/build-outputs.md) |
| npm scripts | [npm-scripts.md](./doc/npm-scripts.md) |
| Browser dev (`npm run dev`) | [dev-browser.md](./doc/dev-browser.md) |
| Native dev (`npm run tauri dev`) | [dev-tauri.md](./doc/dev-tauri.md) |
| Frontend build | [build-frontend.md](./doc/build-frontend.md) |
| Release build & install | [build-release.md](./doc/build-release.md) |
| Rust, Tauri, permissions | [rust-tauri.md](./doc/rust-tauri.md) |
| App icons | [icons.md](./doc/icons.md) |
| Startup & macOS policy | [runtime-startup.md](./doc/runtime-startup.md) |
| Windows & webviews | [runtime-windows.md](./doc/runtime-windows.md) |
| IPC commands | [runtime-ipc.md](./doc/runtime-ipc.md) |
| Lyrics widget (poll loop) | [runtime-lyrics-widget.md](./doc/runtime-lyrics-widget.md) |
| Spotify OAuth | [runtime-spotify.md](./doc/runtime-spotify.md) |
| Genius & lyric cache | [runtime-genius-cache.md](./doc/runtime-genius-cache.md) |
| DummyJSON & quote mode | [runtime-zenquotes.md](./doc/runtime-zenquotes.md) |
| Calendar widget | [runtime-calendar.md](./doc/runtime-calendar.md) |

---

## Requirements

- **Node + npm** — frontend tooling
- **Rust + Tauri v2** — [prerequisites](https://v2.tauri.app/start/prerequisites/)
- **Spotify + Genius** (lyric mode) — API credentials in `src-tauri/.env` (see below)
- **DummyJSON** (quote mode) — fetched from the webview; no API key required

---

## Lyrics setup (Spotify + Genius + quote mode)

1. Copy the example env file:

   ```bash
   cp src-tauri/.env.example src-tauri/.env
   ```

2. Fill in credentials:

   ```bash
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_REDIRECT_URI=http://127.0.0.1:8888/callback
   GENIUS_ACCESS_TOKEN=your_genius_access_token
   ```

   - **Spotify:** [Developer Dashboard](https://developer.spotify.com/dashboard) — add redirect URI `http://127.0.0.1:8888/callback`
   - **Genius:** [API clients](https://genius.com/api-clients) — create a client access token

3. Run the app. On first launch the lyric window may open Spotify login in your browser; approve access, then play something in Spotify on this Mac.

### Lyric vs quote mode

The tile polls every **15 seconds**:

1. **Spotify first** — `get_now_playing_track` checks for a current track.
2. **Lyric mode** — if a track is playing, `get_current_lyric` fetches a filtered Genius line (with per-track cache rotation).
3. **Quote mode** — if Spotify is off, disconnected, errors, or nothing is playing, the UI switches to **quote mode** (subtle label in the header). Quotes are fetched from DummyJSON (`getRandomQuote` in `quoteApi.ts`). A new quote is requested each refresh window (~15s in-memory cache). If the API fails, a random calming fallback message is shown.

**Connect Spotify** appears in quote mode when you are not authenticated.

---

## Calendar

- Starts on the **current system month**
- **‹ ›** buttons move month-by-month across all years (Dec → Jan rolls the year)
- **Today** is always highlighted
- **Click** a day to select it; selection persists when you change months
- Leap years and weekday alignment are handled in `src/utils/calendar.ts`

---

## macOS behavior

- **Release `.app`:** accessory activation policy — no Dock icon and no **⌘⇥** entry (desk-accessory feel). **`tauri dev`** keeps the normal policy so the app is easy to find while developing.
- **Quit:** **⌘Q** when the app has focus (standard app menu includes Quit).
- **All Spaces:** both widgets use `visibleOnAllWorkspaces`.
- **Login at boot:** **System Settings → General → Login Items → Open at Login** — add **Ambient Widgets**.

---

## Architecture

```text
Frontend (React)                         Tauri (Rust)
─────────────────                        ────────────
pages/calendar.html  ──►  calendar.tsx  ──►  CalendarWidget

pages/lyrics.html    ──►  lyrics.tsx    ──►  LyricTile
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    ▼                                                   ▼
         invoke("get_now_playing_track")              invoke("get_current_lyric")
                    │                                                   │
                    ▼                                                   ▼
              spotify/ (PKCE, now playing)                         commands.rs
                    │                                     ┌──────────┼──────────┐
                    │ no track                            ▼          ▼          ▼
                    ▼                              genius.rs    cache.rs   lyric_filter.rs
         getRandomQuote()  ──►  fetch dummyjson.com/quotes/random
         (src/lib/quoteApi.ts)
```

- **Vite multi-page:** `pages/*.html` + `src/*.tsx` entries in `vite.config.ts`
- **One window per widget** in `src-tauri/tauri.conf.json` (`calendar`, `lyric`)
- **Window state:** `tauri-plugin-window-state` saves size and position per window
- **Shared shell:** `src/styles/widget-shell.css` — transparent document, widgets fill their window

**Add another widget:** new `pages/*.html` + `src/*.tsx` → Vite `input` → `tauri.conf.json` window block → `capabilities/default.json`

See **[Documentation](#documentation)** for full build and runtime guides.

---

## Project layout

```text
ambient-widgets/
├── doc/                       # build & runtime guides (see doc/README.md)
├── pages/
│   ├── calendar.html
│   └── lyrics.html
├── src/
│   ├── calendar.tsx
│   ├── lyrics.tsx
│   ├── components/
│   │   ├── CalendarWidget.tsx / .css
│   │   └── LyricTile.tsx / .css
│   ├── lib/
│   │   ├── nowPlaying.ts      # get_now_playing_track wrapper
│   │   └── quoteApi.ts        # DummyJSON quotes + quote-mode cache
│   ├── utils/
│   │   ├── calendar.ts
│   │   └── lyricFallback.ts
│   ├── types/
│   │   ├── lyric.ts
│   │   └── nowPlaying.ts
│   └── styles/
│       └── widget-shell.css
├── src-tauri/
│   ├── app-icon.png
│   ├── .env.example
│   ├── src/
│   │   ├── main.rs
│   │   ├── commands.rs
│   │   ├── spotify/           # auth, tokens, now playing
│   │   ├── genius.rs
│   │   ├── lyric_filter.rs
│   │   └── cache.rs
│   ├── permissions/
│   ├── capabilities/
│   ├── icons/
│   └── tauri.conf.json
├── vite.config.ts
└── package.json
```

---

## App icon

Replace `src-tauri/app-icon.png` (1024×1024 PNG recommended), then:

```bash
npx tauri icon src-tauri/app-icon.png -o src-tauri/icons
```

---

## Roadmap (ideas)

More widgets (weather, tasks, clock), tray menu, autostart plugin—kept small and ambient.

---

## Author & license

**Trang Nguyen** — **MIT License**
