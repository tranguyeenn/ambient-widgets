import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/widget-shell.css";
import CalendarWidget from "./components/CalendarWidget";

const el = document.getElementById("root");
if (!el) {
  throw new Error("Calendar entry: missing #root");
}

createRoot(el).render(
  <StrictMode>
    <div className="widget-mount widget-mount--calendar">
      <CalendarWidget />
    </div>
  </StrictMode>,
);
