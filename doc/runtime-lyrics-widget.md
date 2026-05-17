# Lyrics widget runtime

**UI:** `src/components/LyricTile.tsx`  
**Entry:** `pages/lyrics.html` → `src/lyrics.tsx`

## Poll loop

Refreshes every **15 seconds** (`POLL_MS`, same as `QUOTE_REFRESH_MS` in `quoteApi.ts`).

```text
Every 15s (and once on mount):
    │
    ├─► spotify_is_authenticated
    │
    ├─► get_now_playing_track
    │       │
    │       ├─ track playing ──► get_current_lyric ──► lyric mode
    │       │
    │       └─ no track / error ──► getFallbackQuote() ──► quote mode
    │
    └─► Update UI (header label, connect button, content)
```

## Modes

| Mode | When | Display |
|------|------|---------|
| **Lyric** | Spotify reports a playing track | Genius line (+ song/artist metadata) |
| **Quote** | No track, Spotify off, or API error | ZenQuotes text or local fallback |

Quote mode shows a subtle header label. **Connect Spotify** appears when not authenticated.

## First launch

On first mount, if `spotify_is_authenticated` is false, the widget auto-calls `spotify_login` once (opens browser OAuth).

## Drag header

`onDragMouseDown` → `getCurrentWindow().startDragging()` to move the frameless window.

## Deep dives

- [runtime-spotify.md](./runtime-spotify.md) — OAuth & now playing
- [runtime-genius-cache.md](./runtime-genius-cache.md) — lyric fetch & rotation
- [runtime-zenquotes.md](./runtime-zenquotes.md) — quote mode
- [runtime-ipc.md](./runtime-ipc.md) — command table
