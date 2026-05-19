import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/widget-shell.css";
import WeatherWidget from "./components/WeatherWidget";

const el = document.getElementById("root");
if (!el) {
  throw new Error("Weather entry: missing #root");
}

createRoot(el).render(
  <StrictMode>
    <div className="widget-mount widget-mount--weather">
      <WeatherWidget />
    </div>
  </StrictMode>,
);
