import { useState } from "react";
import DemoCalendarWidget from "./DemoCalendarWidget";
import DemoFocusNudge from "./DemoFocusNudge";
import DemoLyricTile from "./DemoLyricTile";
import DemoWeatherWidget from "./DemoWeatherWidget";
import DemoWelcomeOverlay from "./DemoWelcomeOverlay";
import "./demo-widgets.css";

type LyricMode = "lyric" | "quote";
type DistractionChoice = "study" | "bypass" | "offtopic" | null;

export default function OrbitDesktopDemo() {
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [lyricMode, setLyricMode] = useState<LyricMode>("lyric");
  const [nudgeVisible, setNudgeVisible] = useState(false);
  const [nudgeChoice, setNudgeChoice] = useState<DistractionChoice>(null);

  const resetNudge = () => {
    setNudgeChoice(null);
    setNudgeVisible(false);
  };

  return (
    <div className="orbit-desktop">
      <div className="orbit-desktop__wallpaper" aria-hidden />

      <div className="orbit-desktop__toolbar">
        <span className="orbit-desktop__toolbar-label">Desktop preview</span>
        <div className="orbit-desktop__toolbar-actions">
          <button
            type="button"
            className={`orbit-desktop__tool-btn ${welcomeOpen ? "orbit-desktop__tool-btn--active" : ""}`}
            onClick={() => setWelcomeOpen((v) => !v)}
          >
            {welcomeOpen ? "Hide welcome" : "Show welcome"}
          </button>
          <button
            type="button"
            className={`orbit-desktop__tool-btn ${lyricMode === "lyric" ? "orbit-desktop__tool-btn--active" : ""}`}
            onClick={() => setLyricMode("lyric")}
          >
            Lyric mode
          </button>
          <button
            type="button"
            className={`orbit-desktop__tool-btn ${lyricMode === "quote" ? "orbit-desktop__tool-btn--active" : ""}`}
            onClick={() => setLyricMode("quote")}
          >
            Quote mode
          </button>
          <button
            type="button"
            className="orbit-desktop__tool-btn"
            onClick={() => {
              setNudgeVisible(true);
              setNudgeChoice(null);
            }}
          >
            Simulate distraction
          </button>
          {(nudgeVisible || nudgeChoice) && (
            <button
              type="button"
              className="orbit-desktop__tool-btn"
              onClick={resetNudge}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="orbit-desktop__stage">
        {welcomeOpen ? (
          <DemoWelcomeOverlay onDismiss={() => setWelcomeOpen(false)} />
        ) : null}

        <div className="orbit-desktop__widget orbit-desktop__widget--lyric">
          <DemoLyricTile mode={lyricMode} />
        </div>

        <div className="orbit-desktop__widget-row">
          <div className="orbit-desktop__widget orbit-desktop__widget--weather">
            <DemoWeatherWidget />
          </div>
        </div>

        <div className="orbit-desktop__widget orbit-desktop__widget--calendar">
          <DemoCalendarWidget />
        </div>

        {nudgeVisible ? (
          <div className="orbit-desktop__widget orbit-desktop__widget--nudge">
            <DemoFocusNudge
              choice={nudgeChoice}
              onChoice={setNudgeChoice}
              onDismiss={resetNudge}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
