import { invoke } from "@tauri-apps/api/core";
import type { NowPlayingTrack } from "../types/nowPlaying";

/** Returns the current Spotify track, or null if unavailable / nothing playing. */
export async function getNowPlayingTrack(): Promise<NowPlayingTrack | null> {
  try {
    return await invoke<NowPlayingTrack | null>("get_now_playing_track");
  } catch {
    return null;
  }
}
