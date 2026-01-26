"use client";

import type { ReactNode } from "react";
import { Phone, WarningCircle } from "@phosphor-icons/react";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { EMERGENCY_CONTACTS } from "@/lib/constants";
import { logHelpEvent } from "@/lib/help-telemetry";

type Source = "fab" | "contact_card" | "faq" | "other";

export function ManagerCallSheet({
  trigger,
  source,
}: {
  trigger: ReactNode;
  source: Source;
}) {
  const { toast } = useToast();

  const number = EMERGENCY_CONTACTS.manager.number;

  const onConfirm = () => {
    logHelpEvent("help_call_confirm", { target: "manager", source });

    // 미세 진동(지원 시) — 실패해도 무해
    try {
      window.navigator?.vibrate?.(10);
    } catch {
      // ignore
    }

    toast({
      title: "전화 앱으로 연결 중…",
      description: `관리자 ${number}`,
    });

    // iOS/안드로이드: tel: 스킴 실행
    window.location.href = `tel:${number}`;
    logHelpEvent("help_call_outbound", { target: "manager", source });
  };

  return (
    <Sheet
      onOpenChange={(open) => {
        if (open) logHelpEvent("help_call_intent", { target: "manager", source });
      }}
    >
      <SheetTrigger asChild>{trigger}</SheetTrigger>

      <SheetContent
        side="bottom"
        className="rounded-t-2xl border-brand-cream-dark/40 px-5"
        aria-label="관리자 전화 확인"
      >
        <SheetHeader className="text-left">
          <SheetTitle className="text-lg font-semibold tracking-tight text-brand-dark">관리자에게 전화할까요?</SheetTitle>
          <SheetDescription className="text-sm text-brand-dark-muted">
            문의 시에만 연락해 주세요. 긴급은 119, 위협/범죄는 112를 이용해 주세요.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-5 rounded-xl border border-brand-cream-dark/30 bg-brand-cream/20 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-brand-dark text-white flex items-center justify-center">
              <Phone size={18} weight="regular" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-brand-dark">관리자</p>
              <p className="text-sm text-brand-dark-soft">{number}</p>
            </div>
          </div>

          <div className="mt-3 flex items-start gap-2 text-xs text-brand-dark-muted">
            <WarningCircle size={14} weight="regular" className="mt-[1px] shrink-0" aria-hidden="true" />
            <p className="leading-relaxed">
              긴급(생명/사고) 상황은 <span className="font-medium text-brand-dark">119</span>, 범죄/위협 상황은{" "}
              <span className="font-medium text-brand-dark">112</span>를 먼저 이용해 주세요.
            </p>
          </div>
        </div>

        <SheetFooter className="mt-6 gap-2">
          <SheetClose asChild>
            <button
              type="button"
              onClick={() => logHelpEvent("help_call_cancel", { target: "manager", source })}
              className="w-full rounded-xl border border-brand-cream-dark/40 bg-white px-4 py-3 text-sm font-medium text-brand-dark-soft hover:bg-brand-cream/20 transition-colors"
            >
              취소
            </button>
          </SheetClose>
          <SheetClose asChild>
            <button
              type="button"
              onClick={onConfirm}
              className="w-full rounded-xl bg-brand-dark px-4 py-3 text-sm font-medium text-white hover:bg-brand-dark-soft transition-colors"
            >
              전화 걸기
            </button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

