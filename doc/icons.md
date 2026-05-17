# App icons

Icons are **not** regenerated on every build. Update them when `src-tauri/app-icon.png` changes.

## Regenerate

```bash
npx tauri icon src-tauri/app-icon.png -o src-tauri/icons
```

## Output

Writes files referenced by `tauri.conf.json` → `bundle.icon`:

- `icons/32x32.png`, `128x128.png`, `128x128@2x.png`
- `icon.icns` (macOS)
- `icon.ico` (Windows, if you bundle for Windows later)

## Source image

Use a **1024×1024** PNG at `src-tauri/app-icon.png` (see root README).

## Related docs

- [build-release.md](./build-release.md)
