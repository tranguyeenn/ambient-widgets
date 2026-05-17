import { invoke } from "@tauri-apps/api/core";
import type { Quote } from "../types/quote";
import { LOCAL_FALLBACK_QUOTE } from "../types/quote";

/** Match LyricTile poll — new quote after each refresh window. */
export const QUOTE_REFRESH_MS = 15_000;

const LEGACY_CACHE_KEY = "ambient-widgets.zenquotes-cache";
try {
  localStorage.removeItem(LEGACY_CACHE_KEY);
} catch {
  /* ignore */
}

const CACHE_TTL_MS = QUOTE_REFRESH_MS;

type QuoteCacheEntry = {
  quote: Quote;
  fetchedAt: number;
};

let memoryCache: QuoteCacheEntry | null = null;

function getValidCache(): QuoteCacheEntry | null {
  if (!memoryCache) return null;
  if (Date.now() - memoryCache.fetchedAt > CACHE_TTL_MS) {
    memoryCache = null;
    return null;
  }
  return memoryCache;
}

function storeCache(quote: Quote): Quote {
  memoryCache = { quote, fetchedAt: Date.now() };
  return quote;
}

/** Fetches via Tauri/Rust so ZenQuotes is not blocked by browser CORS. */
async function fetchQuoteFromZenQuotes(): Promise<Quote | null> {
  try {
    return await invoke<Quote>("fetch_zen_quote");
  } catch (err) {
    console.warn("[zenquotes]", err);
    return null;
  }
}

/**
 * Returns a quote for quote mode. Re-fetches from ZenQuotes when the in-memory
 * cache is older than QUOTE_REFRESH_MS (avoids stale localStorage across launches).
 */
export async function getFallbackQuote(): Promise<Quote> {
  const cached = getValidCache();
  if (cached) return cached.quote;

  try {
    const fromApi = await fetchQuoteFromZenQuotes();
    if (fromApi) return storeCache(fromApi);
  } catch {
    /* invoke errors → local fallback */
  }

  return LOCAL_FALLBACK_QUOTE;
}
