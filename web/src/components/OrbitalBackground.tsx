export default function OrbitalBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(45,212,191,0.14),transparent_55%)]" />
      <div className="absolute inset-0 grid-fade opacity-40">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="absolute left-1/2 top-24 h-[520px] w-[520px] -translate-x-1/2 opacity-30 max-md:top-16 max-md:h-[360px] max-md:w-[360px]">
        <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-orbit-spin" />
        <div className="absolute inset-8 rounded-full border border-dashed border-cyan-300/15 animate-orbit-spin-reverse" />
        <div className="absolute inset-20 rounded-full border border-violet-400/10 animate-orbit-pulse" />
        <div className="absolute left-1/2 top-[18%] h-3 w-3 -translate-x-1/2 rounded-full bg-cyan-300 shadow-[0_0_24px_8px_rgba(94,234,212,0.45)]" />
      </div>

      <div className="absolute -right-32 top-1/3 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl" />
      <div className="absolute -left-24 bottom-1/4 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
    </div>
  );
}
