import Section from "./Section";

const features = [
  {
    title: "Welcome Screen",
    tag: "Daily ritual",
    body: "A once-per-day overlay sets intent before widgets appear: calm copy, dismiss until tomorrow, no nagging.",
  },
  {
    title: "Calendar + Reminder Sync",
    tag: "Context",
    body: "Month view with today highlighted and selectable dates, designed to sit beside your work, not replace a full calendar app.",
  },
  {
    title: "Focus Mode",
    tag: "Intent",
    body: "Surfaces the current focus block and what matters now, so the desktop reinforces what you said you would do.",
  },
  {
    title: "Distraction Detection",
    tag: "Rules first",
    body: "Rule-based checks flag likely off-task windows. You stay in control with study-related, bypass, and off-topic responses.",
  },
  {
    title: "Music / Lyric Tile",
    tag: "Ambience",
    body: "Spotify + Genius for a single lyric line when music is playing: native Rust IPC, filtered lines, per-track cache rotation.",
  },
  {
    title: "Quote Fallback",
    tag: "Resilience",
    body: "When Spotify is quiet, DummyJSON quotes (with local fallbacks) keep the tile useful instead of empty.",
  },
];

export default function Features() {
  return (
    <Section
      id="features"
      label="Features"
      title="A workspace layer, not a wall of widgets"
      description="Each capability is modular, with its own window and lifecycle, but they share the same design language and desktop philosophy."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="group glass relative overflow-hidden rounded-2xl p-6 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-400/30"
          >
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full border border-cyan-400/10 opacity-0 transition group-hover:opacity-100" />
            <p className="font-mono text-[10px] uppercase tracking-wider text-cyan-400/80">
              {feature.tag}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-slate-50">
              {feature.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              {feature.body}
            </p>
          </article>
        ))}
      </div>
    </Section>
  );
}
