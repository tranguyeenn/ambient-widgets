/**
 * Vite configuration: how the dev server bundles and serves your React app.
 *
 * When you run `tauri dev`, Tauri starts this Vite server first (`beforeDevCommand` in tauri.conf),
 * then opens a native window whose WebView loads `devUrl` (e.g. http://localhost:1420).
 * `TAURI_DEV_HOST` is set when developing against a physical device so HMR can reach it.
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In Node (where this config runs), `process` exists; the DOM `process` types may be missing.
// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [react()],

  // 1. Keep Rust compiler errors visible in the same terminal as Vite (Vite won't clear the screen).
  clearScreen: false,

  server: {
    // 2. Fixed port so `tauri.conf.json` → `devUrl` always matches.
    port: 1420,
    strictPort: true,
    // Expose dev server on LAN when `TAURI_DEV_HOST` is set (mobile / remote debugging).
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. Avoid rebuild loops: Rust lives in `src-tauri` and is built by Cargo, not Vite.
      ignored: ["**/src-tauri/**"],
    },
  },
}));
