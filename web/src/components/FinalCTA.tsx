import { site } from "../config/site";

export default function FinalCTA() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-24 pt-8 sm:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-orbit-elevated via-orbit-surface to-orbit-bg p-10 text-center sm:p-14">
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-20"
          aria-hidden
        >
          <div className="h-64 w-64 rounded-full border border-dashed border-cyan-300/40 animate-orbit-spin" />
        </div>
        <h2 className="relative text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
          See the repo, the demo, or reach out
        </h2>
        <p className="relative mx-auto mt-4 max-w-lg text-sm leading-relaxed text-slate-400">
          Orbit is a personal project by Trang Nguyen, built to learn desktop
          engineering, not to pitch a startup. MIT licensed.
        </p>
        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <a
            href={site.github}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-orbit-bg transition hover:bg-cyan-300"
          >
            GitHub
          </a>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-violet-400/40 hover:bg-violet-400/10"
          >
            LinkedIn
          </a>
          <a
            href={site.demoAnchor}
            className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:text-cyan-300"
          >
            Interactive demo
          </a>
        </div>
      </div>
      <footer className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 text-xs text-slate-500 sm:flex-row">
        <p>© {new Date().getFullYear()} Trang Nguyen · Orbit</p>
        <p className="font-mono">Tauri 2 · React 19 · TypeScript</p>
      </footer>
    </section>
  );
}
