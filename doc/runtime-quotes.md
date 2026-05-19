# DummyJSON quotes & quote mode

Used when Spotify has no current track or is unavailable.

## Frontend flow — `getRandomQuote()`

**File:** `src/lib/quoteApi.ts`

```text
getRandomQuote()
    │
    ├─ In-memory cache younger than 15s ──► return cached formatted quote
    │
    └─ fetch https://dummyjson.com/quotes/random (up to 8 tries if quote > 50 words)
              │
              ├─ success ──► format as:
              │                 "Quote text"
              │                 — Author
              │              store in memory cache, return
              │
              └─ fail ──► random calming fallback message
```

## API

- **Endpoint:** `https://dummyjson.com/quotes/random`
- **Response:** `{ id, quote, author }`
- Fetched from the webview (DummyJSON allows CORS); no Rust IPC or env vars.
- Quotes longer than **50 words** are skipped and re-fetched.
- Title Case from API is normalized to sentence case before display.

## UI

- Quote mode: header shows author (or `quote mode` for fallbacks) and a `quote mode` label
- Body shows the formatted quote or fallback text (multi-line via `white-space: pre-line`)
- New quote requested each refresh window when cache is stale (~15s)

## Related docs

- [runtime-lyrics-widget.md](./runtime-lyrics-widget.md)
- [runtime-ipc.md](./runtime-ipc.md)
