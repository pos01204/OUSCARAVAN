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
      {/* Emergency FAB (Mobile only) - 위치 조정 */}
      <a
        href={`tel:${EMERGENCY_CONTACTS.manager.number}`}
        className="
          fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40
          flex h-12 w-12 items-center justify-center
          rounded-full bg-neutral-900 text-white
          shadow-lg shadow-neutral-900/25
          transition-all duration-200 hover:scale-105
          md:hidden
        "
        aria-label="관리자에게 전화하기"
      >
        <Phone size={22} weight="fill" aria-hidden="true" />
      </a>

      {/* 헤더 */}
      <header className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900 mb-1">도움말</h1>
        <p className="text-sm text-neutral-500 leading-relaxed">
          자주 묻는 질문과 응급 연락처를 확인하세요
        </p>
      </header>

      {/* 컨텐츠 영역 */}
      <div className="space-y-6">
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
