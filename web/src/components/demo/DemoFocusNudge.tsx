type DistractionChoice = "study" | "bypass" | "offtopic" | null;

type DemoFocusNudgeProps = {
  choice: DistractionChoice;
  onChoice: (value: DistractionChoice) => void;
  onDismiss: () => void;
};

const feedback: Record<NonNullable<DistractionChoice>, string> = {
  study: "Logged as study-related. Nudge hidden for this block.",
  bypass: "Bypass noted. Snoozed for 25 minutes.",
  offtopic: "Marked off-topic. Lyric tile quiet until your break.",
};

export default function DemoFocusNudge({
  choice,
  onChoice,
  onDismiss,
}: DemoFocusNudgeProps) {
  return (
    <aside className="demo-nudge" aria-live="polite">
      <p className="demo-nudge__label">Distraction check</p>
      <p className="demo-nudge__text">
        {choice
          ? feedback[choice]
          : "Short-form scroll detected during your focus block. Still on task?"}
      </p>
      {!choice ? (
        <div className="demo-nudge__actions">
          {(
            [
              ["study", "Study-related"],
              ["bypass", "Bypass"],
              ["offtopic", "Off-topic"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className="demo-nudge__btn"
              onClick={() => onChoice(value)}
            >
              {label}
            </button>
          ))}
        </div>
      ) : (
        <button type="button" className="demo-nudge__btn" onClick={onDismiss}>
          Dismiss
        </button>
      )}
    </aside>
  );
}
