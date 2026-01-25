"use client";

import type { ReactNode } from "react";

export function HelpSection({
  id,
  eyebrow,
  title,
  description,
  right,
  children,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-[calc(3.5rem+1rem)] md:scroll-mt-6"
      aria-label={title}
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          {eyebrow ? (
            <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-[0.18em] mb-2">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-base font-semibold text-neutral-900 tracking-tight">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-neutral-500 leading-relaxed">{description}</p>
          ) : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>

      <div className="mt-4 rounded-2xl border border-neutral-200/70 bg-white/70 backdrop-blur-sm shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
        <div className="p-4">{children}</div>
      </div>
    </section>
  );
}

