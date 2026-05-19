import { site } from "../config/site";

export default function Hero() {
  return (
    <section className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-center px-5 pb-16 pt-12 sm:px-8 sm:pt-20">
      <div className="animate-fade-up">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan-400/90">
          Personal desktop system · macOS
        </p>
        <h1 className="mt-6 text-5xl font-bold tracking-tight sm:text-7xl">
          <span className="text-gradient">Orbit</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400 sm:text-xl">
          A personal focus system that turns your desktop into a smarter
          workspace.
        </p>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-500">
          Built with Tauri, React, and TypeScript. Orbit started as ambient
          widgets and grew into calendar context, reminders, focus nudges, and
          rule-based distraction awareness, without becoming another noisy
          productivity app.
        </p>

        <div className="mt-10 grid max-w-md grid-cols-2 gap-3 sm:max-w-none sm:flex sm:flex-wrap">
          <a
            href={site.github}
            target="_blank"
            rel="noreferrer"
            className="hero-btn hero-btn--primary col-span-2 sm:col-span-1 sm:w-auto"
          >
            View GitHub
          </a>
          <a href={site.demoAnchor} className="hero-btn hero-btn--secondary">
            Watch Demo
          </a>
          <a href="#features" className="hero-btn hero-btn--secondary">
            Explore Features
          </a>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noreferrer"
            className="hero-btn hero-btn--secondary"
          >
            LinkedIn
          </a>
        </div>

        <dl className="mt-14 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-6 border-t border-white/5 pt-8 sm:grid-cols-4">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
              Stack
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-200">
              Tauri + React
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
              Platform
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-200">macOS</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
              Type
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-200">
              Personal system
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
              Workflow
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-200">
              AI-assisted development
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
