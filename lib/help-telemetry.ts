"use client";

type Json = Record<string, unknown>;

function baseContext(): Json {
  if (typeof window === "undefined") return {};
  return {
    href: window.location.href,
    pathname: window.location.pathname,
    referrer: document.referrer,
    userAgent: navigator.userAgent,
    ts: Date.now(),
    feature: "guest_help",
  };
}

async function postClientLog(payload: Json) {
  try {
    await fetch("/api/client-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // ignore
  }
}

export type HelpEventType =
  | "help_view"
  | "help_section_view"
  | "help_jump"
  | "help_faq_toggle"
  | "help_call_intent"
  | "help_call_confirm"
  | "help_call_cancel"
  | "help_call_outbound";

export function logHelpEvent(type: HelpEventType, data?: Json) {
  const payload: Json = { type, ...baseContext(), ...(data ?? {}) };
  void postClientLog(payload);
}

