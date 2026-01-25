"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Lightning, Question, MapPin, Phone } from "@phosphor-icons/react";
import { logHelpEvent } from "@/lib/help-telemetry";

type SectionKey = "emergency" | "faq" | "nearby" | "contact";

const STORAGE_KEY = "help:last_section:v1";

export function HelpScrollSpy({
  ids,
}: {
  ids: Record<SectionKey, string>;
}) {
  const [active, setActive] = useState<SectionKey>("emergency");
  const lastSentRef = useRef<SectionKey | null>(null);

  const sections = useMemo(
    () =>
      [
        { key: "emergency" as const, id: ids.emergency, label: "긴급", icon: Lightning },
        { key: "faq" as const, id: ids.faq, label: "FAQ", icon: Question },
        { key: "nearby" as const, id: ids.nearby, label: "주변", icon: MapPin },
        { key: "contact" as const, id: ids.contact, label: "연락", icon: Phone },
      ] as const,
    [ids]
  );

  useEffect(() => {
    // 초기 진입: 마지막 섹션 복원(옵션)
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) as SectionKey | null;
      if (saved && ids[saved]) {
        setActive(saved);
      }
    } catch {
      // ignore
    }
  }, [ids]);

  useEffect(() => {
    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        // 가장 위에 가까운(화면 상단 근처) 섹션을 활성으로
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.boundingClientRect.top ?? 0) - (b.boundingClientRect.top ?? 0));
        const top = visible[0];
        if (!top?.target) return;

        const found = sections.find((s) => s.id === (top.target as HTMLElement).id);
        if (!found) return;

        setActive((prev) => (prev === found.key ? prev : found.key));
      },
      {
        // fixed header(56px) + 여백 고려
        rootMargin: "-56px 0px -70% 0px",
        threshold: [0.01, 0.1],
      }
    );

    elements.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  useEffect(() => {
    // 상태 저장
    try {
      window.localStorage.setItem(STORAGE_KEY, active);
    } catch {
      // ignore
    }

    // 섹션 뷰 로그(너무 자주 보내지 않도록 변경 시 1회만)
    if (lastSentRef.current !== active) {
      lastSentRef.current = active;
      logHelpEvent("help_section_view", { section: active });
    }
  }, [active]);

  const jumpTo = (key: SectionKey) => {
    const id = ids[key];
    const el = document.getElementById(id);
    if (!el) return;
    logHelpEvent("help_jump", { to: key });
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="sticky top-14 md:top-0 z-30 -mx-4 px-4 py-2 bg-white/70 backdrop-blur-md border-b border-neutral-200/60">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-neutral-500">
          <span className="text-neutral-400">현재 섹션</span>{" "}
          <span className="font-medium text-neutral-700">
            {sections.find((s) => s.key === active)?.label}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {sections.map((s) => {
            const Icon = s.icon;
            const isActive = s.key === active;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => jumpTo(s.key)}
                className={
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-colors " +
                  (isActive
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200")
                }
                aria-label={`${s.label}로 이동`}
              >
                <Icon size={12} weight="bold" aria-hidden="true" />
                <span>{s.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => {
              logHelpEvent("help_jump", { to: "top" });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors"
            aria-label="맨 위로"
          >
            <ArrowUp size={14} weight="bold" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

