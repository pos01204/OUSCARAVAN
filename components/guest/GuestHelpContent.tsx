'use client';

import { Phone } from 'lucide-react';
import { EMERGENCY_CONTACTS } from '@/lib/constants';
import { EmergencyContacts, FAQSection, ManagerContact } from '@/components/guest/help';

interface GuestHelpContentProps {
  token?: string;
}

export function GuestHelpContent({ token }: GuestHelpContentProps) {
  return (
    <main className="space-y-6" role="main" aria-label="도움말 페이지">
      {/* Emergency FAB (Mobile only) */}
      <a
        href={`tel:${EMERGENCY_CONTACTS.manager.number}`}
        className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg transition-transform hover:scale-110 md:hidden"
        aria-label="관리자에게 전화하기"
      >
        <Phone className="h-6 w-6" aria-hidden="true" />
      </a>

      {/* 헤더 */}
      <header className="py-2">
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">도움말</h1>
        <p className="text-neutral-500">
          자주 묻는 질문과<br />
          응급 연락처를 확인하세요
        </p>
      </header>

      {/* 응급 연락처 */}
      <EmergencyContacts />

      {/* 자주 묻는 질문 */}
      <FAQSection />

      {/* 관리자 연락 */}
      <ManagerContact />
    </main>
  );
}
