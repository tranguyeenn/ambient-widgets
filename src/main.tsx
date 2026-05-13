/**
 * JavaScript entry point for the webview UI.
 *
 * Tauri embeds a WebView that loads `index.html`, which loads this file as a module.
 * `createRoot` is React 18's API: it attaches your component tree to the DOM node `#root`
 * (see `index.html`). StrictMode runs extra checks in development only (e.g. warning about
 * deprecated APIs); it does nothing extra in production builds.
 */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Non-null assertion: we know Vite's index.html always provides `#root`.
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
