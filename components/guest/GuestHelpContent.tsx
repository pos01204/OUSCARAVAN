'use client';

import { EMERGENCY_CONTACTS } from '@/lib/constants';
import {
  EmergencyActions,
  FAQSection,
  HelpSection,
  ManagerCallSheet,
  ManagerContact,
  NearbyFacilities,
} from '@/components/guest/help';
import { logHelpEvent } from '@/lib/help-telemetry';
import { Phone } from '@phosphor-icons/react';
import { useEffect } from 'react';

interface GuestHelpContentProps {
  token?: string;
}

export function GuestHelpContent({ token }: GuestHelpContentProps) {
  const ids = {
    emergency: 'help-emergency',
    faq: 'help-faq',
    nearby: 'help-nearby',
    contact: 'help-contact',
  } as const;

  useEffect(() => {
    logHelpEvent('help_view');
  }, []);

  return (
    <main className="pb-24" role="main" aria-label="도움말 페이지">
      {/* 관리자 전화 FAB (Mobile only) - Confirm Sheet */}
      <div className="md:hidden">
        <ManagerCallSheet
          source="fab"
          trigger={
            <button
              type="button"
              className="
                fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40
                flex h-11 w-11 items-center justify-center
                rounded-full bg-neutral-900 text-white
                shadow-lg shadow-neutral-900/20
                transition-all duration-200 hover:bg-neutral-800
              "
              aria-label="관리자에게 전화하기"
            >
              <Phone size={18} weight="regular" aria-hidden="true" />
            </button>
          }
        />
      </div>

      {/* 헤더 */}
      <header className="mb-8 mt-2">
        <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">도움말</h1>
        <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
          자주 묻는 질문과 긴급 연락처를 한 곳에 모아두었어요.
        </p>
      </header>

      {/* 컨텐츠 영역 */}
      <div className="space-y-10">
        <HelpSection
          id={ids.emergency}
          title="긴급 연락처"
          description="즉시 전화 연결됩니다."
        >
          <EmergencyActions />
        </HelpSection>

        <HelpSection
          id={ids.faq}
          title="자주 묻는 질문"
          description="자주 묻는 질문부터 우선 노출합니다."
        >
          <FAQSection />
        </HelpSection>

        <HelpSection
          id={ids.nearby}
          title="주변 시설"
          description="지도 앱으로 이동합니다."
        >
          <NearbyFacilities />
        </HelpSection>

        <HelpSection
          id={ids.contact}
          title="관리자 연락"
          description="문의 사항이 있을 때만 연결해 주세요."
        >
          <ManagerContact />
        </HelpSection>
      </div>
    </main>
  );
}
