/**
 * Window position and size for each widget are persisted by
 * `tauri-plugin-window-state` (see src-tauri/src/main.rs).
 *
 * Each window label in tauri.conf.json gets its own saved state on close.
 * No extra localStorage is required for the weather widget.
 */
export const WEATHER_WINDOW_LABEL = "weather";
