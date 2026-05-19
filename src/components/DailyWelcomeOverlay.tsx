import {
  formatWelcomeDateLine,
  getDailyMessage,
} from "../lib/dailyWelcome";
import "./DailyWelcomeOverlay.css";

type DailyWelcomeOverlayProps = {
  onDismiss: () => void;
  onDebugShowAgain?: () => void;
};

export default function DailyWelcomeOverlay({
  onDismiss,
  onDebugShowAgain,
}: DailyWelcomeOverlayProps) {
  const message = getDailyMessage();
  const dateLine = formatWelcomeDateLine();

  return (
    <div className="daily-welcome" role="dialog" aria-labelledby="daily-welcome-greeting">
      <div className="daily-welcome__panel">
        <h1 id="daily-welcome-greeting" className="daily-welcome__greeting">
          Hello Trang!
        </h1>
        <p className="daily-welcome__message">{message}</p>
        <p className="daily-welcome__date">{dateLine}</p>
        <div className="daily-welcome__actions">
          <button
            type="button"
            className="daily-welcome__primary"
            onClick={onDismiss}
            autoFocus
          >
            Start the day
          </button>
          {onDebugShowAgain ? (
            <button
              type="button"
              className="daily-welcome__debug"
              onClick={onDebugShowAgain}
            >
              Show again today
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
