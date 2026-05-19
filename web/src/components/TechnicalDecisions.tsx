import Section from "./Section";

const decisions = [
  {
    title: "Tauri instead of Electron",
    body: "Smaller binaries, Rust for Spotify/Genius IPC and token handling, and native macOS window APIs for transparency and workspace visibility.",
  },
  {
    title: "React + TypeScript frontend",
    body: "Familiar component model for multiple entry pages (calendar, lyrics, weather, welcome) with strict types for API payloads and widget state.",
  },
  {
    title: "Rule-based logic before ML",
    body: "Heuristics for distraction patterns and lyric filtering are explainable, testable, and fast, with no model hosting for a personal desktop tool.",
  },
  {
    title: "Modular widget structure",
    body: "Each surface is its own Tauri window with independent size, position memory, and lifecycle, so you compose a workspace instead of one crowded view.",
  },
  {
    title: "API fallbacks everywhere",
    body: "Genius misses → cached lines; Spotify idle → quotes; geolocation denied → default city; CSP-tuned img-src for album art in release builds.",
  },
  {
    title: "macOS window behavior",
    body: "Accessory activation policy in release, visible-on-all-workspaces, transparent undecorated widgets, and welcome overlay layering over the desktop.",
  },
];

export default function TechnicalDecisions() {
  return (
    <Section
      id="technical"
      label="Technical decisions"
      title="Choices that shaped the architecture"
      description="Orbit is a student-built systems project with pragmatic tradeoffs over hype."
    >
      <ol className="relative space-y-0 border-l border-cyan-400/20 pl-8">
        {decisions.map((item, index) => (
          <li key={item.title} className="relative pb-10 last:pb-0">
            <span className="absolute -left-[33px] flex h-4 w-4 items-center justify-center rounded-full border border-cyan-400/50 bg-orbit-bg">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            </span>
            <span className="font-mono text-xs text-slate-500">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-1 text-lg font-semibold text-slate-100">
              {item.title}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
              {item.body}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
