import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/widget-shell.css";
import LyricTile from "./components/LyricTile";

const el = document.getElementById("root");
if (!el) {
  throw new Error("Lyrics entry: missing #root");
}

createRoot(el).render(
  <StrictMode>
    <div className="widget-mount widget-mount--lyrics">
      <LyricTile />
    </div>
  </StrictMode>,
);
