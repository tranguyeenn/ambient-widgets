# Windows & webviews

Configured in `src-tauri/tauri.conf.json` → `app.windows`.

## Four windows

| Label | Title | Webview URL | On launch |
|-------|-------|-------------|-----------|
| `lyric` | Lyrics | `pages/lyrics.html` | Visible |
| `calendar` | Calendar | `pages/calendar.html` | Visible |
| `weather` | Weather | `pages/weather.html` | Visible |
| `welcome` | Welcome | `pages/welcome.html` | Hidden until daily check |

Each widget has its own webview context. Size and position are persisted via `tauri-plugin-window-state` (keyed by `label`). The **welcome** label is on the plugin denylist so it is not restored to an old size/position.

## Widget chrome

| Setting | Value | Effect |
|---------|-------|--------|
| `transparent` | `true` | See-through background |
| `decorations` | `false` | No native title bar |
| `shadow` | `false` | No window shadow |
| `visibleOnAllWorkspaces` | `true` | Shows on every Space |
| `resizable` | `true` | User can resize; content scales |
| `alwaysOnTop` | `false` | Normal desktop layering (click to focus) |

Welcome window: opaque background, not resizable, `alwaysOnTop` only while shown. See [runtime-welcome.md](./runtime-welcome.md).

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
5. Grant any new IPC or plugin permissions (if needed)

## Related docs

- [architecture.md](./architecture.md)
- [dev-tauri.md](./dev-tauri.md)
- [runtime-welcome.md](./runtime-welcome.md)
- [runtime-calendar.md](./runtime-calendar.md)
- [runtime-lyrics-widget.md](./runtime-lyrics-widget.md)
- [runtime-weather.md](./runtime-weather.md)
