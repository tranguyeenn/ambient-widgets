# ZenQuotes & quote mode

Used when Spotify has no current track or is unavailable.

## Why Rust, not the browser?

ZenQuotes does not allow browser CORS from the webview. The frontend calls `invoke("fetch_zen_quote")` so HTTP runs in Rust (`zenquotes.rs`) and bypasses CORS.

## Frontend flow — `getFallbackQuote()`

**File:** `src/lib/quoteApi.ts`

```text
getFallbackQuote()
    │
    ├─ In-memory cache younger than 15s ──► return cached quote
    │
    └─ invoke fetch_zen_quote
              │
              ├─ success ──► store in memory cache, return
              └─ fail ──► LOCAL_FALLBACK_QUOTE
                    (“nothing playing, so here’s a thought instead.”)
```

Cache is **in-memory only** (legacy `localStorage` key is cleared on load).

## Rust — `fetch_zen_quote`

- HTTP to ZenQuotes API
- Optional `ZENQUOTES_API_KEY` in `.env` for higher rate limits
- Returns `{ text, author }` (camelCase to TS)

## UI

- Quote mode: header shows quote-mode label
- Text wrapped in typographic quotes in `LyricTile`
- New quote requested each refresh window when cache is stale (~15s)

## Related docs

- [runtime-lyrics-widget.md](./runtime-lyrics-widget.md)
- [runtime-ipc.md](./runtime-ipc.md)
