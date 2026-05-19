import type { ReactNode } from "react";
import { useInView } from "../hooks/useInView";

type SectionProps = {
  id?: string;
  label: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export default function Section({
  id,
  label,
  title,
  description,
  children,
  className = "",
}: SectionProps) {
  const { ref, visible } = useInView();

  return (
    <section
      id={id}
      ref={ref}
      className={`mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28 ${className} ${
        visible ? "animate-fade-up" : "opacity-0"
      }`}
    >
      <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-cyan-400/80">
        {label}
      </p>
      <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-400">
          {description}
        </p>
      ) : null}
      <div className="mt-12">{children}</div>
    </section>
  );
}
