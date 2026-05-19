# Frontend production build

**Command:** `npm run build`  
Runs alone or automatically as `beforeBuildCommand` during `npm run tauri build`.

## Flow

```text
npm run build
    │
    ├─1─► tsc
    │         tsconfig.json → src/
    │         tsconfig.node.json → vite.config.ts (project reference)
    │         noEmit: true — typecheck only
    │
    └─2─► vite build
              ├── Rollup multi-page (four entries)
              ├── React JSX → bundled JS
              ├── CSS from components + widget-shell.css / welcome-shell.css
              └── Output → dist/
```

## Output layout

```text
dist/
├── pages/
│   ├── lyrics.html
│   ├── calendar.html
│   ├── weather.html
│   └── welcome.html
└── assets/
    ├── *-*.js   (per-entry chunks, hashed)
    └── *.css
```

Tauri reads this via `tauri.conf.json`:

```json
"frontendDist": "../dist"
```

## Related docs

- [dev-browser.md](./dev-browser.md)
- [build-release.md](./build-release.md)
- [rust-tauri.md](./rust-tauri.md)
