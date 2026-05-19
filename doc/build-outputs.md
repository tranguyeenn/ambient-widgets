# Build outputs

Paths produced by installs and builds. Most are listed in the root `.gitignore` and are **not** committed.

## Gitignored (generated)

| Path | Created by | Contents |
|------|------------|----------|
| `node_modules/` | `npm install` | JS dependencies |
| `dist/` | `npm run build` | Production frontend (HTML, JS, CSS, assets) |
| `dist-ssr/` | (reserved) | Not used in this project today |
| `src-tauri/target/` | `cargo build` / `tauri build` | Rust binaries, deps, bundles |
| `*.local` | Vite/env | Local overrides |

## Release artifacts

Under `src-tauri/target/` (also gitignored):

- `src-tauri/target/release/bundle/macos/Orbit.app`
- `src-tauri/target/release/bundle/dmg/Orbit_0.1.0_aarch64.dmg`

See [build-release.md](./build-release.md) for how to build and install these.

## Runtime data (not in repo)

Written while the app runs:

| Item | Location | Purpose |
|------|----------|---------|
| `spotify_tokens.json` | App data dir (Tauri `app.path()`) | OAuth access/refresh tokens |
| Lyric cache | App-scoped storage (`cache.rs`) | Per-track Genius line rotation |

## Secrets

| File | Gitignored? | Notes |
|------|-------------|-------|
| `src-tauri/.env` | No (by default) | Copy from `.env.example`; **do not commit** real credentials |
| `src-tauri/.env.example` | No | Template only |

Rust loads `.env` at startup — see [runtime-startup.md](./runtime-startup.md).

## Frontend bundle shape

After `npm run build`, `dist/` looks like:

```text
dist/
├── pages/
│   ├── lyrics.html
│   └── calendar.html
└── assets/
    ├── *.js
    └── *.css
```

Details: [build-frontend.md](./build-frontend.md).
