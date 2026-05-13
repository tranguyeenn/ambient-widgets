/**
 * Root React component for the UI layer.
 *
 * In a Tauri app, this runs inside the WebView (Chromium/WebKit), not as a normal browser tab.
 * The native window (size, transparency, frameless chrome) is configured in `src-tauri/tauri.conf.json`.
 * Heavy logic (file I/O, OS integration) often lives in Rust under `src-tauri/` and is called via
 * `invoke()`; this file is a good place to compose widgets and shared layout only.
 */
import "./App.css";
import LyricTile from "./widgets/lyrics/LyricTile";

function App() {
  return (
    <main className="app">
      <LyricTile />
    </main>
  );
}

export default App;
