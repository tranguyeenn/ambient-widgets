type DemoWelcomeOverlayProps = {
  onDismiss: () => void;
};

function formatDateLine(): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

export default function DemoWelcomeOverlay({ onDismiss }: DemoWelcomeOverlayProps) {
  return (
    <div className="demo-welcome" role="dialog" aria-labelledby="demo-welcome-title">
      <div className="demo-welcome__panel">
        <h2 id="demo-welcome-title" className="demo-welcome__greeting">
          Hello Trang!
        </h2>
        <p className="demo-welcome__message">
          One calm screen before the widgets settle in. Take a breath, then start
          when you are ready.
        </p>
        <p className="demo-welcome__date">{formatDateLine()}</p>
        <button type="button" className="demo-welcome__primary" onClick={onDismiss}>
          Start the day
        </button>
      </div>
    </div>
  );
}
