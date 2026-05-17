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
              ├── Rollup multi-page (lyrics + calendar entries)
              ├── React JSX → bundled JS
              ├── CSS from components + widget-shell.css
              └── Output → dist/
```

## Output layout

```text
dist/
├── pages/
│   ├── lyrics.html
│   └── calendar.html
└── assets/
    ├── index-*.js   (per-entry chunks, hashed)
    └── *.css
```

Tauri reads this via `tauri.conf.json`:

```json
"frontendDist": "../dist"
```

Release webviews load files from `dist/`, not the Vite dev server.

## Keeping entries in sync

When adding a widget, update **all** of:

1. `pages/<name>.html`
2. `src/<name>.tsx`
3. `vite.config.ts` → `build.rollupOptions.input`
4. `src-tauri/tauri.conf.json` → `app.windows[]`

## Related docs

- [build-release.md](./build-release.md)
- [build-outputs.md](./build-outputs.md)
- [architecture.md](./architecture.md)
