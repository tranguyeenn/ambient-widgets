/**
 * LyricTile — a sample “ambient widget” card shown inside the transparent Tauri window.
 *
 * Dragging: with `decorations: false`, there is no OS title bar. We move the *window* by calling
 * `startDragging()` when the user presses the mouse on the tile. The attribute
 * `data-tauri-drag-region` tells the WebView to treat this region as a drag surface as well
 * (see Tauri docs on custom titlebars). The capability `core:window:allow-start-dragging` must
 * be listed in `src-tauri/capabilities/default.json` or the IPC call is denied at runtime.
 *
 * Double rectangular frame (outer + inner) shares one stroke width in CSS via `--tile-frame`.
 * `void` before `startDragging()`: fire-and-forget; we don’t await in the mouse handler.
 */
import "./LyricTile.css";
import { getCurrentWindow } from "@tauri-apps/api/window";

function LyricTile() {
  const onDragMouseDown = () => {
    void getCurrentWindow().startDragging();
  };

  return (
    <div
      className="lyric-tile"
      data-tauri-drag-region
      onMouseDown={onDragMouseDown}
    >
      <div className="lyric-tile__inner">
        {/* Decorative strip; aria-hidden so screen readers skip it */}
        <div className="lyric-tile__accent" aria-hidden />
        <div className="lyric-tile__main">
          <div className="lyric-icon">♪</div>
          <div className="lyric-tile__copy">
            <p className="lyric-text">“one lyric line here”</p>
            <div className="lyric-meta">
              <span>Song Title</span>
              <span className="lyric-meta__sep">—</span>
              <span>Artist Name</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LyricTile;
