# Spotify integration

**Rust modules:** `src-tauri/src/spotify/` (`auth.rs`, `tokens.rs`, `api.rs`, `config.rs`, `error.rs`)

## OAuth (PKCE) — `spotify_login`

```text
spotify_login
    │
    ├─► Read SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI from .env
    ├─► Generate PKCE verifier + S256 challenge + random state
    ├─► Start tiny_http server on redirect port (default 8888)
    ├─► Open browser → accounts.spotify.com/authorize
    ├─► User approves → http://127.0.0.1:8888/callback?code=...
    ├─► Exchange code for tokens (reqwest POST)
    └─► Save spotify_tokens.json in app data directory
```

Scopes: `user-read-currently-playing`, `user-read-playback-state`.

Redirect URI must match [Spotify Developer Dashboard](https://developer.spotify.com/dashboard): `http://127.0.0.1:8888/callback`.

## Token storage

- File: `spotify_tokens.json` (via Tauri app data path)
- Refresh: automatic when access token is near expiry (`tokens.rs`)
- `spotify_is_authenticated`: token file exists and is usable

## Now playing — `get_now_playing_track`

```text
fetch_now_playing(app)
    │
    ├─► Load tokens; refresh if expired
    └─► GET Spotify Web API (currently playing endpoint)
```

Returns `NowPlayingTrack` `{ song, artist, albumArt? }` or `null` on failure.

## Errors (quiet vs logged)

These map to `null` / quote mode without noisy logs:

- `NotAuthenticated`
- `NotConfigured` (missing `.env`)
- `NothingPlaying`
- `NoActiveDevice`

Other errors are logged to stderr as `[spotify] …`.

## Frontend usage

- `src/lib/nowPlaying.ts` — thin `invoke` wrapper
- `LyricTile` — poll + connect button + auto-login on first run

## Related docs

- [runtime-lyrics-widget.md](./runtime-lyrics-widget.md)
- [runtime-ipc.md](./runtime-ipc.md)
