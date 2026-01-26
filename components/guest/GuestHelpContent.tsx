'use client';

import { motion } from 'framer-motion';
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
import { PageHeader } from '@/components/shared/PageHeader';
import { FadeInSection } from '@/components/shared/FadeInSection';
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
            <motion.button
              type="button"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 15 }}
              className="
                fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40
                flex h-12 w-12 items-center justify-center
                rounded-full bg-brand-dark text-white
                shadow-lg shadow-brand-dark/20
                ring-2 ring-brand-cream/40 ring-offset-2 ring-offset-background
              "
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="관리자에게 전화하기"
            >
              <Phone size={20} weight="regular" aria-hidden="true" />
            </motion.button>
          }
        />
      </div>

      {/* 공통 헤더 */}
      <PageHeader 
        subtitle="HELP"
        title="도움말" 
      />

      {/* 컨텐츠 영역 */}
      <div className="space-y-6">
        <FadeInSection delay={0}>
          <HelpSection
            id={ids.emergency}
            title="긴급 연락처"
            description="즉시 전화 연결됩니다."
          >
            <EmergencyActions />
          </HelpSection>
        </FadeInSection>

        <FadeInSection delay={0.1}>
          <HelpSection
            id={ids.faq}
            title="자주 묻는 질문"
            description="자주 묻는 질문부터 우선 노출합니다."
          >
            <FAQSection />
          </HelpSection>
        </FadeInSection>

        <FadeInSection delay={0.2}>
          <HelpSection
            id={ids.nearby}
            title="주변 시설"
            description="지도 앱으로 이동합니다."
          >
            <NearbyFacilities />
          </HelpSection>
        </FadeInSection>

        <FadeInSection delay={0.3}>
          <HelpSection
            id={ids.contact}
            title="관리자 연락"
            description="문의 사항이 있을 때만 연결해 주세요."
          >
            <ManagerContact />
          </HelpSection>
        </FadeInSection>
      </div>
    </main>
  );
}
