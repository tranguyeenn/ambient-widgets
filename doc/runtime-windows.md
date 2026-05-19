# Windows & webviews

Configured in `src-tauri/tauri.conf.json` → `app.windows`.

## Three independent windows

| Label | Title | Webview URL |
|-------|-------|-------------|
| `lyric` | Lyrics | `pages/lyrics.html` |
| `calendar` | Calendar | `pages/calendar.html` |
| `weather` | Weather | `pages/weather.html` |

Each has its own webview process context. Size and position are persisted separately via `tauri-plugin-window-state` (keyed by `label`).

## Window chrome

| Setting | Value | Effect |
|---------|-------|--------|
| `transparent` | `true` | See-through background |
| `decorations` | `false` | No native title bar |
| `shadow` | `false` | No window shadow |
| `visibleOnAllWorkspaces` | `true` | Shows on every Space |
| `resizable` | `true` | User can resize; content scales |
| `alwaysOnTop` | `false` | Normal desktop layering (click to focus) |

Requires `macOSPrivateApi: true` in Tauri config for transparency on macOS.

## Drag to move

Widget headers call:

```ts
getCurrentWindow().startDragging()
```

Requires capability permission `core:window:allow-start-dragging`.

## Dev vs release URL

| Mode | Webview loads |
|------|----------------|
| `tauri dev` | `http://localhost:1420/pages/...` |
| `tauri build` | `dist/pages/...` (from `frontendDist`) |

## Adding a new widget

1. `pages/<widget>.html` + `src/<widget>.tsx`
2. Vite `input` entry
3. New block in `tauri.conf.json` `windows`
4. Add window label to `capabilities/default.json` → `windows`
5. Grant any new IPC permissions in `permissions/*.toml` (if needed)

## Related docs

- [architecture.md](./architecture.md)
- [dev-tauri.md](./dev-tauri.md)
- [runtime-calendar.md](./runtime-calendar.md)
- [runtime-lyrics-widget.md](./runtime-lyrics-widget.md)
- [runtime-weather.md](./runtime-weather.md)
