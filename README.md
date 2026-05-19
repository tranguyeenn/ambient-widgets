# Orbit

Small, transparent **macOS** desktop widgets built with **Tauri 2** and **React**. Each widget runs in its **own** native window so layouts stay independent. A **daily welcome overlay** greets you once per day, then disappears to reveal the widgets on your desktop.

Spotify and Genius run through the Rust shell; quotes use [DummyJSON](https://dummyjson.com) from the frontend—no separate backend server.

![App icon](src-tauri/app-icon.png)

---

## Widgets & welcome

| | Calendar | Lyrics | Weather | Daily welcome |
| --- | --- | --- | --- | --- |
| **What it does** | Full month grid with prev/next navigation, today highlight, clickable dates | **Lyric mode:** Genius line for the **currently playing** Spotify track. **Quote mode:** random quote from [DummyJSON](https://dummyjson.com/docs/quotes) when nothing is playing or Spotify is unavailable | Current conditions, today's high/low, condition-themed background; [Open-Meteo](https://open-meteo.com) + location (Lawrenceville area default) | Full-screen **Hello Trang!** + calm daily message; **Start the day** dismisses until tomorrow |
| **Launch** | Opens with the app | Opens with the app | Opens with the app | Once per day (hidden window until needed) |
| **Resize** | Yes — drag window edges | Yes | Yes (112×112 – 480×480) | Full monitor overlay (not resizable) |
| **Position memory** | Restored on next launch | Restored on next launch | Restored on next launch | Not persisted |

---

## Quick start

```bash
npm install
npm run tauri dev
```

Vite serves the UI on **http://localhost:1420**; Tauri opens the native windows (widgets first, then welcome if not shown today).

**Browser-only (no Tauri):**

```bash
npm run dev
# http://localhost:1420/pages/calendar.html
# http://localhost:1420/pages/lyrics.html
# http://localhost:1420/pages/weather.html
# http://localhost:1420/pages/welcome.html
```

**Production macOS app:**

```bash
npm run tauri build
```

Outputs (not copied to `/Applications` automatically):

- `src-tauri/target/release/bundle/macos/Orbit.app`
- `src-tauri/target/release/bundle/dmg/Orbit_0.1.0_aarch64.dmg`

Install either way:

```bash
npm run open:dmg    # opens DMG if built; otherwise prints a hint
npm run install:mac # copy Orbit.app → /Applications/Orbit.app
```

Then open **Orbit** from Applications (or Spotlight). The release build uses an accessory activation policy, so it may not appear in the Dock—use Spotlight or Login Items to launch it.

---

## Documentation

In-depth guides live in **[`doc/`](./doc/README.md)**.

| Topic | Guide |
| --- | --- |
| Index | [doc/README.md](./doc/README.md) |
| Architecture | [architecture.md](./doc/architecture.md) |
| Daily welcome | [runtime-welcome.md](./doc/runtime-welcome.md) |
| Weather & location | [runtime-weather.md](./doc/runtime-weather.md) |
| Build outputs | [build-outputs.md](./doc/build-outputs.md) |
| npm scripts | [npm-scripts.md](./doc/npm-scripts.md) |
| Native dev | [dev-tauri.md](./doc/dev-tauri.md) |
| Release build | [build-release.md](./doc/build-release.md) |
| Rust & Tauri | [rust-tauri.md](./doc/rust-tauri.md) |

---

## Requirements

- **Node + npm** — frontend tooling
- **Rust + Tauri v2** — [prerequisites](https://v2.tauri.app/start/prerequisites/)
- **Spotify + Genius** (lyric mode) — API credentials in `src-tauri/.env` (see below)
- **Location** (weather) — allow **Orbit** in **System Settings → Privacy & Security → Location Services**
- **DummyJSON** (quote mode) — no API key

---

## Daily welcome

- Shown **once per local calendar day** after launch or when returning to the desktop (not on the lock screen / password UI).
- Stored in `localStorage` as `orbit:lastWelcomeShownDate` (`YYYY-MM-DD`).
- **Dismiss:** tap **Start the day** — overlay hides; lyric, calendar, and weather stay on screen.
- **Dev:** **Show again today** link under the button; or reset in the **welcome webview** devtools console (not the terminal):

  ```js
  localStorage.removeItem('orbit:lastWelcomeShownDate')
  sessionStorage.removeItem('orbit:welcome-shown-session')
  ```

See [doc/runtime-welcome.md](./doc/runtime-welcome.md).

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
3. **Quote mode** — if Spotify is off, disconnected, errors, or nothing is playing, the UI switches to **quote mode**. Quotes come from DummyJSON. If the API fails, a random calming fallback is shown.

**Connect Spotify** appears in quote mode when you are not authenticated.

---

## Weather

- Loads **immediately** for saved GPS or a **Lawrenceville, GA** area default, then refines when location is granted.
- **Use my location** requests permission via `@tauri-apps/plugin-geolocation` (native app) or the browser API in Vite-only dev.
- City name from reverse geocode prefers **locality** (e.g. Lawrenceville) over metro name (e.g. Atlanta).

See [doc/runtime-weather.md](./doc/runtime-weather.md).

---

## Calendar

- Starts on the **current system month**
- **‹ ›** buttons move month-by-month across all years
- **Today** is always highlighted
- **Click** a day to select it; selection persists when you change months

---

## macOS behavior

- **Release `.app`:** accessory activation policy — no Dock icon and no **⌘⇥** entry. **`tauri dev`** keeps the normal policy while developing.
- **Quit:** **⌘Q** when the app has focus.
- **All Spaces:** widgets and welcome use `visibleOnAllWorkspaces`.
- **Login at boot:** **System Settings → General → Login Items** — add **Orbit**.

---

## Architecture

```text
Frontend (React)                         Tauri (Rust)
─────────────────                        ────────────
pages/calendar.html  ──►  calendar.tsx  ──►  CalendarWidget
pages/lyrics.html    ──►  lyrics.tsx    ──►  LyricTile  ──► Spotify / Genius IPC
pages/weather.html   ──►  weather.tsx   ──►  WeatherWidget (Open-Meteo, geolocation plugin)
pages/welcome.html   ──►  welcome.tsx   ──►  DailyWelcomeOverlay (daily-welcome-check event)
```

- **Vite multi-page:** `pages/*.html` + `src/*.tsx` in `vite.config.ts`
- **Four windows** in `tauri.conf.json` (`lyric`, `calendar`, `weather`, `welcome`)
- **Window state:** `tauri-plugin-window-state` (welcome label denylisted)
- **CSP:** allows Open-Meteo, BigDataCloud, DummyJSON in release builds

---

## Project layout

```text
orbit/
├── doc/                       # build & runtime guides (see doc/README.md)
├── pages/
│   ├── calendar.html
│   ├── lyrics.html
│   ├── weather.html
│   └── welcome.html
├── src/
│   ├── calendar.tsx / lyrics.tsx / weather.tsx / welcome.tsx
│   ├── components/
│   │   ├── CalendarWidget.tsx / .css
│   │   ├── LyricTile.tsx / .css
│   │   ├── WeatherWidget.tsx / .css
│   │   └── DailyWelcomeOverlay.tsx / .css
│   ├── lib/
│   │   ├── dailyWelcome.ts
│   │   ├── weatherApi.ts / weatherLocation.ts / locationStorage.ts / userLocation.ts
│   │   ├── quoteApi.ts / nowPlaying.ts / …
│   └── styles/
│       ├── widget-shell.css
│       └── welcome-shell.css
├── scripts/
│   └── render-app-icon.py     # regenerate app-icon.png
├── src-tauri/
│   ├── app-icon.png
│   ├── Info.plist             # NSLocationWhenInUseUsageDescription
│   ├── src/main.rs
│   └── tauri.conf.json
├── vite.config.ts
└── package.json
```

---

## App icon

Regenerate from the script (deep space + orbit ring), then bundle icons:

```bash
python3 scripts/render-app-icon.py
npx tauri icon src-tauri/app-icon.png -o src-tauri/icons
```

See [doc/icons.md](./doc/icons.md).

---

## Roadmap (ideas)

More widgets (tasks, clock), tray menu, autostart plugin—kept small and focused.

---

## Author & license

**Trang Nguyen** — **MIT License**
