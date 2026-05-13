# Ambient Widgets

Ambient Widgets is a lightweight desktop widget system built for macOS.

The project focuses on transparent, minimal widgets that sit on the desktop instead of feeling like separate apps.

**Today:** a single **LyricTile** in a **Tauri 2** window (frameless, transparent, always on top, draggable) plus an optional **Python** backend that pulls lyrics from the **Genius** API. Other widgets described below are **planned**, not in the repo yet.

---

# Vision

Many desktop widgets feel disconnected from the desktop: too large, visually noisy, or opaque blocks on top of the wallpaper.

Ambient Widgets aims for small components that stay calm and personal—translucent surfaces, soft blur, and light interaction rather than mini dashboards.

---

# What’s implemented

## LyricTile

A compact card that shows one lyric line and **Song — Artist** metadata.

**Shipped behavior**

- Frosted, semi-transparent panel (backdrop blur) over the real desktop; native window transparency is enabled in Tauri.
- Drag the window by clicking the tile (`startDragging` + drag region).
- Polls the backend every **15 seconds** at `GET http://127.0.0.1:8000/lyric?song=…&artist=…` (JSON: `success`, `error`, `line`, `song`, `artist`).
- The UI currently requests a **fixed** track for demos (**“Nights”** / **Frank Ocean**); wiring it to “now playing” or user input is future work.

**Backend (`backend/`)**

- **FastAPI** app in `api.py`: `GET /` (health), `GET /lyric` (lyric payload).
- **lyricsgenius** + `GENIUS_ACCESS_TOKEN` (loaded from `backend/.env` via **python-dotenv**). Lyrics are cleaned and filtered (`filters.py`) before a single line is chosen for the widget.

**Not in this version**

- Album art, local lyric files, Spotify “recently played” integration (all roadmap).

Example layout:

```txt
♪ “one lyric line here”

Song Title — Artist
```

---

# Planned widgets

## ReminderTile

Lightweight reminders and daily load—design only for now.

## WeatherTile

Transparent weather readout—design only for now.

---

# Why I’m Building This

Music, desktop aesthetics, and ambient environments matter for how I focus and organize the day. This project combines desktop customization, soft UI, and small music-adjacent utilities without building another full dashboard.

---

# Design philosophy

- **Minimal UI** — calm desktop, not crowded chrome.
- **Transparency** — glass-style panels, blur, low noise; content sets its own surface where needed.
- **Personal computing** — routines and taste over gamified productivity.

---

# Tech stack

| Layer | Stack |
| --- | --- |
| Desktop shell | **Tauri 2** (Rust), transparent undecorated window |
| UI | **React 19**, **TypeScript**, **Vite 7**, CSS |
| Backend | **Python**, **FastAPI**, **Uvicorn**, **lyricsgenius**, **python-dotenv** |
| Package managers | **npm** (frontend), **pip** (backend) |

---

# Local development

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) and [Tauri v2 prerequisites](https://v2.tauri.app/start/prerequisites/) for your OS.
- **Python 3** for the lyric API.

### Frontend (Tauri + Vite)

```bash
npm install
npm run dev           # web only (browser)
npm run tauri dev     # native window + Vite dev server (port 1420)
npm run build         # typecheck + production bundle → dist/
npm run tauri build   # packaged app
```

### Backend (lyrics API)

From the **repository root** (so `backend` imports resolve):

1. Create `backend/.env` with a Genius client access token:

   ```bash
   GENIUS_ACCESS_TOKEN=your_token_here
   ```

2. Install dependencies and run the server:

   ```bash
   pip install -r backend/requirements.txt
   uvicorn backend.api:app --reload --host 127.0.0.1 --port 8000
   ```

3. Start `npm run tauri dev` in another terminal. Without the backend, the tile shows a connection error state.

Recommended VS Code extensions: [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) and [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer).

---

# Roadmap (high level)

- **Done (initial slice):** transparent macOS window, LyricTile UI, Genius-backed `/lyric` API, basic filtering for “widget-sized” lines.
- **Next:** configurable song/source, persistence, more widgets, external APIs (e.g. Spotify, weather) as needed.

---

# Folder structure

```text
ambient-widgets/
├── src/
│   ├── widgets/
│   │   └── lyrics/          # LyricTile.tsx, LyricTile.css
│   ├── App.tsx
│   ├── App.css
│   └── main.tsx
├── backend/
│   ├── api.py               # FastAPI routes
│   ├── lyrics_service.py    # Genius fetch + line selection
│   ├── filters.py
│   └── requirements.txt
├── src-tauri/
├── public/
├── package.json
└── README.md
```

---

# Long-term ideas

Music-reactive visuals, focus/calendar-adjacent widgets, adaptive theming, multiple layouts—only if they stay small and ambient.

---

# What this project is not

Not an OS, not a Spotify clone, not a bloated widget store—intentionally small surface area.

---

# Author

Trang Nguyen

# License

MIT License
