import { useEffect, useState } from "react";
import "./LyricTile.css";
import { getCurrentWindow } from "@tauri-apps/api/window";

type LyricData = {
  success: boolean;
  error: string | null;
  line: string | null;
  song: string;
  artist: string;
};

function LyricTile() {
  const [lyric, setLyric] = useState<LyricData | null>(null);
  const [loading, setLoading] = useState(true);

  const onDragMouseDown = () => {
    void getCurrentWindow().startDragging();
  };

  async function fetchLyric() {
    try {
      const song = encodeURIComponent("Nights");
      const artist = encodeURIComponent("Frank Ocean");

      const response = await fetch(
        `http://127.0.0.1:8000/lyric?song=${song}&artist=${artist}`
      );

      const data: LyricData = await response.json();
      setLyric(data);
    } catch {
      setLyric({
        success: false,
        error: "Could not connect to lyric backend",
        line: null,
        song: "Unknown Song",
        artist: "Unknown Artist",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLyric();

    const interval = setInterval(() => {
      fetchLyric();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const displayLine = loading
    ? "Loading lyric..."
    : lyric?.success && lyric.line
    ? `“${lyric.line}”`
    : "No lyric found.";

  const displaySong = lyric?.song ?? "Song Title";
  const displayArtist = lyric?.artist ?? "Artist Name";

  return (
    <div
      className="lyric-tile"
      data-tauri-drag-region
      onMouseDown={onDragMouseDown}
    >
      <div className="lyric-tile__inner">
        <div className="lyric-tile__main">
          <div className="lyric-icon">♪</div>

          <div className="lyric-tile__copy">
            <p className="lyric-text">{displayLine}</p>

            <div className="lyric-meta">
              <span>{displaySong}</span>
              <span className="lyric-meta__sep">—</span>
              <span>{displayArtist}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LyricTile;