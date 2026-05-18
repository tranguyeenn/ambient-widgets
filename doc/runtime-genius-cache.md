# Genius lyrics & cache

**Modules:** `genius.rs`, `lyric_filter.rs`, `cache.rs`, orchestrated in `commands.rs` → `get_current_lyric`.

## `get_current_lyric` flow

```text
get_now_playing (Spotify)
    │
    ├─ fail ──► fallback_lyric()
    │              → `hold_my_hand_fallback()` (Genius: Hold My Hand / HAN + bundled cover)
    │
    └─ ok ──► cache::get_rotated(app, track)
              │
              ├─ hit ──► return cached line (source: "cache")
              │
              └─ miss ──► genius::fetch_lyric_candidates(song, artist)
                            ├─ lyric_filter on scraped lines
                            ├─ cache::save(app, track, candidates, "genius")
                            └─ return first candidate or fallback_lyric()
```

## Genius API

- Requires `GENIUS_ACCESS_TOKEN` in `src-tauri/.env`
- Search + scrape song page for lyric lines
- `lyric_filter.rs` removes headers, duplicates, low-quality lines

## Per-track cache rotation

When multiple candidate lines exist for a track, `cache::get_rotated` returns different lines on subsequent polls (same ~15s window as the UI), so the tile does not repeat the same line every refresh.

Cache is stored in app-scoped storage (not in git).

## Result shape (`LyricResult`)

| Field | Description |
|-------|-------------|
| `line` | Display lyric text |
| `song`, `artist` | From Spotify |
| `albumArt` | Optional URL |
| `source` | `"genius"`, `"cache"`, or `"fallback"` |

## Related docs

- [runtime-lyrics-widget.md](./runtime-lyrics-widget.md)
- [runtime-spotify.md](./runtime-spotify.md)
- [runtime-ipc.md](./runtime-ipc.md)
