# npm scripts

Defined in root `package.json`.

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `vite` | Web-only dev server on port **1420** |
| `build` | `tsc && vite build` | Typecheck + production frontend → `dist/` |
| `preview` | `vite preview` | Serve `dist/` locally (no Tauri) |
| `tauri` | `tauri` | Pass-through to Tauri CLI |
| `open:dmg` | shell helper | Open `Orbit_*.dmg` after release (errors if not built yet) |
| `install:mac` | `ditto …` | Copy `Orbit.app` → `/Applications/Orbit.app` |

## Tauri CLI (via `npm run tauri …`)

| Command | What it does |
|---------|----------------|
| `npm run tauri dev` | Vite + Rust debug binary + widget windows |
| `npm run tauri build` | `npm run build` + release Rust + macOS bundle |

## Quick reference

| Goal | Command |
|------|---------|
| Tweak calendar UI only | `npm run dev` → http://localhost:1420/pages/calendar.html |
| Test Spotify / lyrics / native windows | `npm run tauri dev` |
| Production `.app` / `.dmg` | `npm run tauri build` |
| Typecheck without bundling | `npx tsc` |
| Open built installer | `npm run open:dmg` |
| Copy app to Applications | `npm run install:mac` |

## Related docs

- [dev-browser.md](./dev-browser.md)
- [dev-tauri.md](./dev-tauri.md)
- [build-frontend.md](./build-frontend.md)
- [build-release.md](./build-release.md)
