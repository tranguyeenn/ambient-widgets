import Section from "./Section";

export default function Problem() {
  return (
    <Section
      id="problem"
      label="Problem"
      title="Productivity tools rarely meet you where you actually work"
      description="Most apps are either passive dashboards you forget about, or aggressive blockers that fight your habits. Orbit sits in the middle: context on the desktop, reminders when they matter, and nudges tied to real behavior."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Too passive",
            body: "Calendar apps live in a tab. Weather lives in a phone. Nothing connects to the moment you sit down at your Mac.",
          },
          {
            title: "Too intrusive",
            body: "Hard blockers break flow when you legitimately need a reference tab, a message, or five minutes to reset.",
          },
          {
            title: "Wrong layer",
            body: "Orbit targets the desktop itself with transparent windows, a daily welcome, and ambient context, so focus support feels native, not bolted on.",
          },
        ].map((item) => (
          <article
            key={item.title}
            className="glass rounded-2xl p-6 transition hover:border-cyan-400/25"
          >
            <h3 className="text-lg font-semibold text-slate-100">{item.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              {item.body}
            </p>
          </article>
        ))}
      </div>
    </Section>
  );
}
