import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { getNowPlayingTrack } from "../lib/nowPlaying";
import {
  getRandomQuote,
  parseQuoteAuthor,
  QUOTE_REFRESH_MS,
} from "../lib/quoteApi";
import type { LyricResult } from "../types/lyric";
import { FALLBACK_LYRIC } from "../utils/lyricFallback";
import "./LyricTile.css";

/** Spotify poll interval (quote cache uses the same window). */
const SPOTIFY_POLL_MS = QUOTE_REFRESH_MS;

type TileMode = "lyric" | "quote";

async function loadLyric(): Promise<LyricResult> {
  try {
    return await invoke<LyricResult>("get_current_lyric");
  } catch {
    return FALLBACK_LYRIC;
  }
}

function LyricTile() {
  const [mode, setMode] = useState<TileMode>("quote");
  const [lyric, setLyric] = useState<LyricResult | null>(null);
  const [quoteText, setQuoteText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const authChecked = useRef(false);
  const fetchGeneration = useRef(0);
  const lyricRef = useRef<LyricResult | null>(null);
  const authenticatedRef = useRef(false);
  lyricRef.current = lyric;
  authenticatedRef.current = authenticated;

  const onDragMouseDown = () => {
    void getCurrentWindow().startDragging();
  };

  const fetchSpotifyAsync = async () => {
    const generation = ++fetchGeneration.current;

    const track = await getNowPlayingTrack();
    if (generation !== fetchGeneration.current) return;

    // After now-playing, so a revoked refresh token is cleared in Rust first.
    try {
      const authed = await invoke<boolean>("spotify_is_authenticated");
      if (generation !== fetchGeneration.current) return;
      authenticatedRef.current = authed;
      setAuthenticated(authed);
    } catch {
      if (generation !== fetchGeneration.current) return;
      authenticatedRef.current = false;
      setAuthenticated(false);
    }

    if (track) {
      const result = await loadLyric();
      if (generation !== fetchGeneration.current) return;
      setMode("lyric");
      setLyric(result);
      setQuoteText(null);
    } else if (authenticatedRef.current && lyricRef.current) {
      // Spotify 503/429 blip — keep last lyric instead of flipping to quotes.
    } else {
      const quote = await getRandomQuote();
      if (generation !== fetchGeneration.current) return;
      setMode("quote");
      setQuoteText(quote);
      setLyric(null);
    }

    if (generation !== fetchGeneration.current) return;
    setLoading(false);
  };

  const connectSpotify = async () => {
    setConnecting(true);
    try {
      await invoke("spotify_login");
      await fetchSpotifyAsync();
    } catch (err) {
      console.error("[spotify] login failed:", err);
    } finally {
      setConnecting(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const fetchSpotify = () => void fetchSpotifyAsync();

    void (async () => {
      setLoading(true);

      if (!authChecked.current) {
        authChecked.current = true;
        if (!cancelled) {
          await fetchSpotifyAsync();
        }
        try {
          const authed = await invoke<boolean>("spotify_is_authenticated");
          if (!authed) {
            setConnecting(true);
            await invoke("spotify_login");
            if (!cancelled) {
              await fetchSpotifyAsync();
            }
          }
        } catch (err) {
          console.error("[spotify] login failed:", err);
        } finally {
          setConnecting(false);
        }
      } else if (!cancelled) {
        await fetchSpotifyAsync();
      }
    })();

    const interval = setInterval(fetchSpotify, SPOTIFY_POLL_MS);

    return () => {
      cancelled = true;
      fetchGeneration.current += 1;
      clearInterval(interval);
      setConnecting(false);
    };
  }, []);

  const isQuoteMode = mode === "quote";
  const showConnect =
    !loading && !connecting && isQuoteMode && !authenticated;

  const quoteAuthor =
    isQuoteMode && quoteText ? parseQuoteAuthor(quoteText) : null;

  const displayLine = connecting
    ? "Opening Spotify login…"
    : loading
      ? "Loading…"
      : isQuoteMode && quoteText
        ? quoteText
        : lyric
          ? `“${lyric.line}”`
          : "No lyric found.";

  const displaySong = isQuoteMode
    ? (quoteAuthor ?? "quote mode")
    : (lyric?.song ?? "Song Title");
  const displayArtist = isQuoteMode
    ? "quote mode"
    : (lyric?.artist ?? "Artist Name");

  return (
    <article
      className="lyric-tile"
      aria-label={isQuoteMode ? "Quote" : "Lyrics"}
      data-mode={mode}
    >
      <header
        className="lyric-tile__chrome"
        data-tauri-drag-region
        onMouseDown={onDragMouseDown}
      >
        <div className="lyric-tile__title">
          <h1 className="lyric-tile__song">{displaySong}</h1>
          <span
            className={
              isQuoteMode
                ? "lyric-tile__artist lyric-tile__mode-label"
                : "lyric-tile__artist"
            }
          >
            {displayArtist}
          </span>
        </div>
      </header>

      <div className="lyric-tile__body">
        <div className="lyric-tile__art-wrap">
          {!isQuoteMode && lyric?.albumArt ? (
            <img
              className="lyric-tile__art"
              src={lyric.albumArt}
              alt=""
              draggable={false}
            />
          ) : (
            <span className="lyric-tile__icon" aria-hidden>
              {isQuoteMode ? "\u201C" : "♪"}
            </span>
          )}
        </div>

        <div className="lyric-tile__copy">
          <p
            className={
              isQuoteMode
                ? "lyric-tile__line lyric-tile__line--quote"
                : "lyric-tile__line"
            }
          >
            {displayLine}
          </p>

          {showConnect ? (
            <button
              type="button"
              className="lyric-tile__connect"
              onClick={() => void connectSpotify()}
            >
              Connect Spotify
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default LyricTile;
