/** Match LyricTile poll — new quote after each refresh window. */
export const QUOTE_REFRESH_MS = 15_000;

const DUMMYJSON_QUOTE_URL = "https://dummyjson.com/quotes/random";

const FALLBACK_MESSAGES = [
  "No music playing. Sit with the silence.",
  "Spotify disappeared. Your thoughts remain.",
  "Nothing is playing right now.",
  "Offline. Breathing still works.",
  "No lyric found. The room is quiet.",
] as const;

type DummyJsonQuote = {
  id: number;
  quote: string;
  author: string;
};

type QuoteCacheEntry = {
  text: string;
  fetchedAt: number;
};

let memoryCache: QuoteCacheEntry | null = null;

function getValidCache(): QuoteCacheEntry | null {
  if (!memoryCache) return null;
  if (Date.now() - memoryCache.fetchedAt > QUOTE_REFRESH_MS) {
    memoryCache = null;
    return null;
  }
  return memoryCache;
}

function storeCache(text: string): string {
  memoryCache = { text, fetchedAt: Date.now() };
  return text;
}

function isDummyJsonQuote(value: unknown): value is DummyJsonQuote {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "number" &&
    typeof record.quote === "string" &&
    typeof record.author === "string"
  );
}

function pickRandomFallback(): string {
  const index = Math.floor(Math.random() * FALLBACK_MESSAGES.length);
  return FALLBACK_MESSAGES[index] ?? FALLBACK_MESSAGES[0];
}

/** DummyJSON often returns Title Case; show normal sentence casing instead. */
function toSentenceCase(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;

  let result = trimmed
    .toLowerCase()
    .replace(
      /(^|[.!?…]\s+)([a-z])/g,
      (_match, prefix: string, letter: string) => prefix + letter.toUpperCase(),
    );

  result = result.replace(/\bi\b/g, "I");
  return result;
}

function formatQuote(quote: string, author: string): string {
  return `"${toSentenceCase(quote)}"\n— ${author}`;
}

/** Author line from a formatted quote, or null for fallback-only text. */
export function parseQuoteAuthor(formatted: string): string | null {
  const dash = formatted.indexOf("\n— ");
  if (dash === -1) return null;
  const author = formatted.slice(dash + 3).trim();
  return author || null;
}

/**
 * Fetches a random quote from DummyJSON. Returns formatted text on success, or a
 * random calming fallback when the API fails. Reuses an in-memory cache for
 * QUOTE_REFRESH_MS to align with the lyric widget poll interval.
 */
export async function getRandomQuote(): Promise<string> {
  const cached = getValidCache();
  if (cached) return cached.text;

  try {
    const response = await fetch(DUMMYJSON_QUOTE_URL, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      return pickRandomFallback();
    }

    const data: unknown = await response.json();
    if (!isDummyJsonQuote(data)) {
      return pickRandomFallback();
    }

    const quote = data.quote.trim();
    const author = data.author.trim();
    if (!quote || !author) {
      return pickRandomFallback();
    }

    return storeCache(formatQuote(quote, author));
  } catch (err) {
    console.warn("[quotes]", err);
    return pickRandomFallback();
  }
}
