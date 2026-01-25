'use client';

import { Phone } from '@phosphor-icons/react';
import { EMERGENCY_CONTACTS } from '@/lib/constants';
import { EmergencyContacts, FAQSection, ManagerContact } from '@/components/guest/help';

interface GuestHelpContentProps {
  token?: string;
}

export function GuestHelpContent({ token }: GuestHelpContentProps) {
  return (
    <main className="pb-24" role="main" aria-label="도움말 페이지">
      {/* Emergency FAB (Mobile only) */}
      <a
        href={`tel:${EMERGENCY_CONTACTS.manager.number}`}
        className="
          fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40
          flex h-11 w-11 items-center justify-center
          rounded-full bg-neutral-900 text-white
          shadow-lg shadow-neutral-900/20
          transition-all duration-200 hover:bg-neutral-800
          md:hidden
        "
        aria-label="관리자에게 전화하기"
      >
        <Phone size={18} weight="regular" aria-hidden="true" />
      </a>

      {/* 헤더 */}
      <header className="mb-8">
        <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Help</p>
        <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">도움말</h1>
      </header>

      {/* 컨텐츠 영역 */}
      <div className="space-y-8">
        {/* 응급 연락처 & 주변 시설 */}
        <EmergencyContacts />

        {/* 자주 묻는 질문 */}
        <FAQSection />

        {/* 관리자 연락 */}
        <ManagerContact />
      </div>
    </main>
  );
}
