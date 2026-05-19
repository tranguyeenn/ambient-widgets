/**
 * Vite configuration: multi-page build so each Tauri window loads its own HTML + TS entry.
 *
 * - `pages/lyrics.html` → lyric widget WebView
 * - `pages/calendar.html` → calendar widget WebView
 * - `pages/weather.html` → weather widget WebView
 * - `pages/welcome.html` → daily welcome overlay WebView
 *
 * `TAURI_DEV_HOST` is set when developing against a physical device so HMR can reach it.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// In Node (where this config runs), `process` exists; the DOM `process` types may be missing.
// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [react()],

  clearScreen: false,

  build: {
    rollupOptions: {
      input: {
        lyrics: path.resolve(__dirname, "pages/lyrics.html"),
        calendar: path.resolve(__dirname, "pages/calendar.html"),
        weather: path.resolve(__dirname, "pages/weather.html"),
        welcome: path.resolve(__dirname, "pages/welcome.html"),
      },
    },
  },

  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
}));
