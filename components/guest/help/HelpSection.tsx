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
        <div className="flex items-start gap-3">
          {/* 브랜드 악센트 바 */}
          <div className="w-1 h-5 mt-0.5 rounded-full bg-gradient-to-b from-brand-cream-dark to-brand-cream shrink-0" />
          <div>
            {eyebrow ? (
              <p className="text-[11px] font-medium text-brand-dark-muted uppercase tracking-[0.18em] mb-2">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="text-base font-semibold text-brand-dark tracking-tight">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-brand-dark-muted leading-relaxed">{description}</p>
            ) : null}
          </div>
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>

      <div className="mt-4 rounded-2xl border border-brand-cream-dark/30 bg-white/80 backdrop-blur-sm shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
        <div className="p-4">{children}</div>
      </div>
    </section>
  );
}

