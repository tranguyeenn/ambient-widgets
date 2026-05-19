# IPC commands

Frontend calls Rust via Tauri `invoke()` (`@tauri-apps/api/core`). Commands are registered in `main.rs` and implemented in `commands.rs` and submodules.

Weather and quote mode use **browser `fetch()`** only — no IPC.

## Command reference

| Command | Frontend | Returns | Rust behavior |
|---------|----------|---------|---------------|
| `get_now_playing_track` | `src/lib/nowPlaying.ts`, `LyricTile` | Track or `null` | Spotify Web API — current playback |
| `get_current_lyric` | `LyricTile` | `LyricResult` | Now playing → cache → Genius → fallback |
| `spotify_is_authenticated` | `LyricTile` | `boolean` | Valid token on disk |
| `spotify_login` | `LyricTile` | `()` or error | PKCE OAuth flow |

## Serialization

- Payloads are JSON over IPC.
- Rust structs use `#[serde(rename_all = "camelCase")]` to match TypeScript types in `src/types/`.

## Error handling (frontend)

| Wrapper | On error |
|---------|----------|
| `getNowPlayingTrack()` | Returns `null` |
| `loadLyric()` / `get_current_lyric` | `FALLBACK_LYRIC` |
| `getRandomQuote()` | Random calming fallback string |
| `spotify_login` | Logged; UI shows connect state |

## Adding a new command

1. Implement `#[tauri::command]` in `commands.rs` (or module).
2. Add to `invoke_handler!` in `main.rs`.
3. Create `src-tauri/permissions/allow-<name>.toml`.
4. Add permission id to `capabilities/default.json`.
5. Call from frontend with `invoke("command_name")`.

## Related docs

- [runtime-lyrics-widget.md](./runtime-lyrics-widget.md)
- [runtime-spotify.md](./runtime-spotify.md)
- [runtime-genius-cache.md](./runtime-genius-cache.md)
- [runtime-quotes.md](./runtime-quotes.md)
- [runtime-weather.md](./runtime-weather.md)
- [rust-tauri.md](./rust-tauri.md)
