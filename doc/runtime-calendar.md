# Calendar widget runtime

**No Rust IPC** — runs entirely in the frontend.

## Component chain

```text
pages/calendar.html
    └── src/calendar.tsx
            └── CalendarWidget.tsx
                    └── src/utils/calendar.ts
```

## Behavior

- Opens on the **current system month**
- **‹ ›** navigate month-by-month (year rolls Dec → Jan)
- **Today** always highlighted
- **Click** a day to select; selection persists across month changes
- Leap years and weekday alignment handled in `calendar.ts`

## Development

Works fully with browser-only dev:

```bash
npm run dev
# http://localhost:1420/pages/calendar.html
```

No `src-tauri/.env` required for calendar.

## Window

Same transparent shell as lyrics — see [runtime-windows.md](./runtime-windows.md). Drag via calendar header (`startDragging`).

## Related docs

- [dev-browser.md](./dev-browser.md)
- [architecture.md](./architecture.md)
