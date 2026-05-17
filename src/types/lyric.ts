export type LyricResult = {
  line: string;
  song: string;
  artist: string;
  albumArt?: string;
  source?: "fallback" | "cache" | "genius";
};
