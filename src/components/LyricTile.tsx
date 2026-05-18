import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { getNowPlayingTrack } from "../lib/nowPlaying";
import { getFallbackQuote, QUOTE_REFRESH_MS } from "../lib/quoteApi";
import type { LyricResult } from "../types/lyric";
import type { Quote } from "../types/quote";
import { FALLBACK_LYRIC } from "../utils/lyricFallback";
import "./LyricTile.css";

/** Refresh tile content every 15s (quote cache uses the same window). */
const POLL_MS = QUOTE_REFRESH_MS;

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
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const authChecked = useRef(false);

  const onDragMouseDown = () => {
    void getCurrentWindow().startDragging();
  };

  const refresh = async () => {
    const track = await getNowPlayingTrack();

    // After now-playing, so a revoked refresh token is cleared in Rust first.
    try {
      const authed = await invoke<boolean>("spotify_is_authenticated");
      setAuthenticated(authed);
    } catch {
      setAuthenticated(false);
    }

    if (track) {
      const result = await loadLyric();
      setMode("lyric");
      setLyric(result);
      setQuote(null);
    } else {
      const fallbackQuote = await getFallbackQuote();
      setMode("quote");
      setQuote(fallbackQuote);
      setLyric(null);
    }

    setLoading(false);
  };

  const connectSpotify = async () => {
    setConnecting(true);
    try {
      await invoke("spotify_login");
      await refresh();
    } catch (err) {
      console.error("[spotify] login failed:", err);
    } finally {
      setConnecting(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);

      if (!authChecked.current) {
        authChecked.current = true;
        if (!cancelled) {
          await refresh();
        }
        try {
          const authed = await invoke<boolean>("spotify_is_authenticated");
          if (!authed) {
            setConnecting(true);
            await invoke("spotify_login");
            if (!cancelled) {
              await refresh();
            }
          }
        } catch (err) {
          console.error("[spotify] login failed:", err);
        } finally {
          setConnecting(false);
        }
      } else if (!cancelled) {
        await refresh();
      }
    })();

    const interval = setInterval(() => {
      void refresh();
    }, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
      setConnecting(false);
    };
  }, []);

  const isQuoteMode = mode === "quote";
  const showConnect =
    !loading && !connecting && isQuoteMode && !authenticated;

  const displayLine = connecting
    ? "Opening Spotify login…"
    : loading
      ? "Loading…"
      : isQuoteMode && quote
        ? `“${quote.text}”`
        : lyric
          ? `“${lyric.line}”`
          : "No lyric found.";

  const displaySong = isQuoteMode
    ? (quote?.author ?? "…")
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
          <p className="lyric-tile__line">{displayLine}</p>

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
