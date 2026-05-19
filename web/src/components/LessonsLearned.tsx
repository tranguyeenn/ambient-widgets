import Section from "./Section";

const lessons = [
  "Desktop app architecture: multiple webviews, Rust commands, and build pipelines that must stay in sync.",
  "State management: per-window React state, localStorage for welcome cadence, and Rust-side caches for lyrics.",
  "API integration: OAuth loops, token refresh, rate limits, and CSP rules that only show up in release builds.",
  "Window layering: transparent widgets vs. full-screen welcome; z-order and focus without a Dock icon in production.",
  "Designing around real behavior: quote fallback when Spotify is off, bypass paths when rules misfire, calm defaults.",
  "Responsible AI usage: assistants for debugging and learning, not as opaque core logic; rules and filters stay in code I can explain.",
];

export default function LessonsLearned() {
  return (
    <Section
      id="lessons"
      label="Lessons learned"
      title="What building Orbit taught me"
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        {lessons.map((lesson) => (
          <li
            key={lesson}
            className="glass flex gap-3 rounded-xl p-4 text-sm leading-relaxed text-slate-300"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
            {lesson}
          </li>
        ))}
      </ul>
    </Section>
  );
}
