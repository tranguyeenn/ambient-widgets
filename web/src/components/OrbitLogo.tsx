type OrbitLogoProps = {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  /** Full rings + glow; use false in the nav for a calmer mark */
  animated?: boolean;
};

const sizeMap = {
  sm: { box: "h-9 w-9", ringOut: "-inset-[18%]", ringMid: "-inset-[28%]" },
  md: { box: "h-16 w-16", ringOut: "-inset-[16%]", ringMid: "-inset-[26%]" },
  lg: { box: "h-28 w-28", ringOut: "-inset-[14%]", ringMid: "-inset-[24%]" },
  xl: { box: "h-36 w-36 sm:h-40 sm:w-40", ringOut: "-inset-[12%]", ringMid: "-inset-[22%]" },
} as const;

export default function OrbitLogo({
  size = "md",
  className = "",
  animated = true,
}: OrbitLogoProps) {
  const s = sizeMap[size];

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center ${s.box} ${animated ? "animate-orbit-float" : ""} ${className}`}
      aria-hidden
    >
      {animated ? (
        <>
          <div
            className={`pointer-events-none absolute ${s.ringMid} rounded-full border border-dashed border-cyan-300/25 animate-orbit-spin-reverse`}
          />
          <div
            className={`pointer-events-none absolute ${s.ringOut} rounded-full border border-cyan-400/30 animate-orbit-spin`}
          />
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-cyan-400/20 blur-2xl animate-orbit-pulse" />
        </>
      ) : null}
      <img
        src="/app-icon.png"
        alt=""
        width={512}
        height={512}
        className="relative h-full w-full rounded-2xl object-cover shadow-[0_0_40px_rgba(45,212,191,0.25)] ring-1 ring-cyan-400/20"
        draggable={false}
      />
    </div>
  );
}
