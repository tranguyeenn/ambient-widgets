# Daily welcome overlay

Full-screen once-per-day greeting shown in a dedicated Tauri window (`welcome`). Separate from the lyric, calendar, and weather widgets so dismissing it leaves those windows on the desktop.

## Window

| Label | URL | Default |
|-------|-----|---------|
| `welcome` | `pages/welcome.html` | `visible: false`, 900×640 (resized to monitor on show) |

| Setting | Value | Why |
|---------|-------|-----|
| `skipTaskbar` | `true` | Not listed in the Dock as its own app |
| `transparent` | `false` | Opaque ambient background |
| Window-state plugin | **denylisted** | Size/position not persisted between launches |

On show, the webview fills the **current monitor** (`currentMonitor()` → `setSize` + `setPosition`). This is full-screen visually without macOS native fullscreen (which moves to another Space).

## Files

| File | Role |
|------|------|
| `src/welcome.tsx` | Show/hide logic, listens for `daily-welcome-check` |
| `src/components/DailyWelcomeOverlay.tsx` | UI: greeting, daily message, **Start the day** |
| `src/lib/dailyWelcome.ts` | Date key, message rotation, `localStorage` |
| `src/styles/welcome-shell.css` | Document shell for welcome webview |

## Once per day

| Key | Storage | Format |
|-----|---------|--------|
| `orbit:lastWelcomeShownDate` | `localStorage` | `YYYY-MM-DD` (local calendar date) |

- **Show** when `lastShown !== today`
- **Dismiss** (`Start the day`) writes today’s date and hides the window
- Legacy key `ambient:lastWelcomeShownDate` is migrated on read

In **dev** (`import.meta.env.DEV`), `sessionStorage` (`orbit:welcome-shown-session`) also gates the overlay so you can test again after restarting the app the same day.

**Reset welcome (browser devtools in the welcome webview — not the terminal):**

```js
localStorage.removeItem('orbit:lastWelcomeShownDate')
sessionStorage.removeItem('orbit:welcome-shown-session')
```

In dev, use **Show again today** under the primary button.

## When it appears

1. **App startup** — welcome webview waits ~1.5s, then presents if not shown today
2. **`daily-welcome-check` event** — emitted from Rust when:
   - App resumes from sleep (`RunEvent::Resumed`)
   - ~2s after launch (webview ready)
   - Any widget window gains focus (unlock / return to desktop)

Rust does **not** hook the macOS lock screen or password UI — in-app only.

## Startup (Rust)

`main.rs` `setup`:

1. Hide `welcome` window
2. `show()` lyric, calendar, weather
3. Attach focus listeners on widgets → emit `daily-welcome-check`
4. Background thread: sleep 2s → emit `daily-welcome-check`

## Capabilities

Welcome uses the same capability set as widgets, including:

- `core:window:allow-show` / `allow-hide`
- `core:window:allow-set-size` / `allow-set-position`
- `core:window:allow-current-monitor`
- `core:window:allow-set-always-on-top`

## Related docs

- [runtime-startup.md](./runtime-startup.md)
- [runtime-windows.md](./runtime-windows.md)
