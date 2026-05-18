import type { LyricResult } from "../types/lyric";

/** Mirrors Rust `hold_my_hand_fallback` when `invoke` fails in the browser. */
export const FALLBACK_LYRIC: LyricResult = {
  line: "'Cause all I want is you, not your tears",
  song: "Hold My Hand",
  artist: "HAN",
  albumArt: "/hold-my-hand-cover.png",
  source: "fallback",
};
