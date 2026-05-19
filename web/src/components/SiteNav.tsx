import { site } from "../config/site";
import OrbitLogo from "./OrbitLogo";

const links = [
  { href: "#problem", label: "Problem" },
  { href: "#features", label: "Features" },
  { href: "#demo", label: "Demo" },
  { href: "#technical", label: "Stack" },
  { href: "#lessons", label: "Lessons" },
];

export default function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-orbit-bg/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <a
          href="#"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight text-slate-100"
        >
          <OrbitLogo size="sm" animated={false} />
          Orbit
        </a>
        <ul className="hidden items-center gap-6 text-sm text-slate-400 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="transition-colors hover:text-cyan-300"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <a
            href={site.linkedin}
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-200 transition hover:border-violet-400/40 hover:bg-violet-400/10 hover:text-violet-100 sm:inline-block"
          >
            LinkedIn
          </a>
          <a
            href={site.github}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-100"
          >
            GitHub
          </a>
        </div>
      </nav>
    </header>
  );
}
