# App startup

Entry point: `src-tauri/src/main.rs`

## Flow

```text
main()
    │
    ├─► Load src-tauri/.env (dotenvy::from_path)
    ├─► Optional: dotenvy::dotenv() from cwd
    │
    ├─► tauri::Builder::default()
    │       .plugin(tauri_plugin_window_state)
    │       .plugin(tauri_plugin_opener)
    │       .invoke_handler([
    │           get_current_lyric,
    │           fetch_zen_quote,
    │           get_now_playing_track,
    │           spotify_is_authenticated,
    │           spotify_login,
    │       ])
    │
    ├─► setup(|app| { ... })
    │       ├─ macOS: default app menu (Quit via ⌘Q)
    │       └─ release macOS: ActivationPolicy::Accessory
    │
    └─► Run event loop → create windows → load webviews
```

## Environment variables

Loaded from `src-tauri/.env` (see `.env.example`):

| Variable | Used for |
|----------|----------|
| `SPOTIFY_CLIENT_ID` | OAuth |
| `SPOTIFY_REDIRECT_URI` | OAuth callback (default `http://127.0.0.1:8888/callback`) |
| `GENIUS_ACCESS_TOKEN` | Lyric search |
| `ZENQUOTES_API_KEY` | Optional; higher rate limits |

Missing Spotify/Genius config surfaces as graceful errors (quote mode, fallbacks) — not a crash at startup.

## macOS activation policy

| Build | Policy | User-visible effect |
|-------|--------|---------------------|
| Debug (`tauri dev`) | Default | Dock icon, ⌘⇥ |
| Release (`tauri build`) | Accessory | No Dock, no ⌘⇥ — desk-accessory feel |

## Related docs

- [runtime-windows.md](./runtime-windows.md)
- [runtime-ipc.md](./runtime-ipc.md)
- [rust-tauri.md](./rust-tauri.md)
