# Ambient Widgets

Small, transparent **macOS** desktop widgets built with **Tauri 2** and **React**. Each widget runs in its **own** native window so layouts stay independent and the stack stays predictable.

**Right now:** a **month calendar** ships first. A **lyric line** widget is wired up but **does not open at launch** until you turn it on in config. No Python is required for the calendar.

---

## Features

| | Calendar | Lyrics |
| --- | --- | --- |
| **Launch** | Opens with the app | Off by default (`"create": false` in `tauri.conf.json`) |
| **Stacking** | Sits **below** other windows (desktop-style layer), all Spaces | When enabled: floats above (good for a HUD-style tile) |
| **Backend** | None | Optional **FastAPI** + **Genius** on `http://127.0.0.1:8000` |
| **Chrome** | Frameless, transparent, drag header | Same + whole-tile drag |

---

## Quick start

```bash
npm install
npm run tauri dev    # Vite on :1420 + native windows
```

**Browser-only UI (no Tauri):**

```bash
npm run dev
# open http://localhost:1420/pages/calendar.html or …/lyrics.html
```

**Production macOS app:**

```bash
npm run tauri build
# .app lives under src-tauri/target/release/bundle/macos/
```

---

## Requirements

- **Node + npm** — frontend tooling  
- **Rust + Tauri v2 prerequisites** — [install guide](https://v2.tauri.app/start/prerequisites/)  
- **Python 3** — only if you use the lyric API (`backend/`)

---

## macOS behavior (calendar-first)

- **Release `.app`:** `ActivationPolicy::Accessory` in `src-tauri/src/lib.rs` — no **Dock** icon and no **⌘⇥** entry so the bundle feels closer to a desk accessory. **`tauri dev`** keeps the normal policy so the app is easy to switch to while coding.
- **Quit:** **⌘Q** after the app has focus. Rust installs **`Menu::default`**, which registers the standard **Quit Ambient Widgets** menu item (without that menu, ⌘Q often does nothing).
- **Calendar layer:** `alwaysOnBottom` + `visibleOnAllWorkspaces` in `tauri.conf.json`, and the same stacking is **re-applied in `setup`** so the window level sticks. Other apps draw **on top** of the widget; this is normal window Z-order, not embedding into the Finder wallpaper.
- **Login at boot:** **System Settings → General → Login Items & Extensions → Open at Login** — add **Ambient Widgets**.

---

## Lyrics backend (optional)

From the **repo root** (Python package path is `backend`):

1. `backend/.env`:

   ```bash
   GENIUS_ACCESS_TOKEN=your_token_here
   ```

2. Install and run:

   ```bash
   pip install -r backend/requirements.txt
   uvicorn backend.api:app --reload --host 127.0.0.1 --port 8000
   ```

3. Turn the lyric window on: in `src-tauri/tauri.conf.json`, set **`"create": true`** on the `lyric` window, rebuild, and keep Uvicorn running. The UI polls **`GET /lyric?song=…&artist=…`** every **15s** (demo query: *Nights* / *Frank Ocean*).

**API:** `backend/api.py` — `GET /`, `GET /lyric`. **`lyrics_service.py`** + **`filters.py`** pick a single “widget-sized” line via **lyricsgenius**.

If nothing listens on **:8000**, the tile shows a **connection** error (not a silent “no lyric”).

---

## Architecture

- **Vite multi-page:** each widget has **`pages/<name>.html`** and **`src/<name>.tsx`**. `vite.config.ts` lists them in `build.rollupOptions.input`.
- **Tauri:** one **`WebviewWindow`** per widget (`lyric`, `calendar`, …). URLs like `pages/calendar.html` resolve in dev and in `dist/` after `npm run build`.
- **Shared shell:** `src/styles/widget-shell.css` — transparent document + centered mount (no shared React “mega app”).
- **Rust entry:** `src-tauri/src/lib.rs` — menu, macOS activation policy (release), calendar stacking reinforcement.

**Add another widget:** new `pages/*.html` + `src/*.tsx` → Vite `input` → new block in `tauri.conf.json` `app.windows` → same `label` in `src-tauri/capabilities/default.json`.

---

## Project layout

```text
ambient-widgets/
├── pages/
│   ├── lyrics.html
│   └── calendar.html
├── src/
│   ├── lyrics.tsx
│   ├── calendar.tsx
│   ├── styles/widget-shell.css
│   └── widgets/
│       ├── lyrics/       # LyricTile + CSS
│       └── calendar/     # CalendarWidget + CSS
├── backend/
│   ├── api.py
│   ├── lyrics_service.py
│   ├── filters.py
│   └── requirements.txt
├── src-tauri/
│   ├── src/lib.rs
│   ├── capabilities/default.json
│   └── tauri.conf.json
├── vite.config.ts
├── package.json
└── README.md
```

---

## Roadmap (ideas)

Configurable track / “now playing”, persistence, more windows (weather, tasks, clock, visualizer), autostart plugin, tray controls—only if they stay small and ambient.

---

## Author & license

**Trang Nguyen** — **MIT License**
