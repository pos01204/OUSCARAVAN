'use client';

import { useEffect } from 'react';
import { useGuestStore } from '@/lib/store';
import { HeroSection } from './HeroSection';
import { CriticalAnnouncement } from './CriticalAnnouncement';
import { CollapsedAnnouncements } from './CollapsedAnnouncements';
import { QuickActionsCompact } from './QuickActionsCompact';
import { ServiceCardsGrid } from './ServiceCardsGrid';
import { CheckoutStatusCard } from './CheckoutStatusCard';
import { FloorPlanCard } from '@/components/guest/FloorPlanCard';
import { RecentOrdersSummary } from '@/components/guest/RecentOrdersSummary';
import { CheckoutReminder } from '@/components/features/CheckoutReminder';
import { SectionDivider } from '@/components/shared/SectionDivider';
import { FadeInSection } from '@/components/shared/FadeInSection';
import { useGuestAnnouncements } from '@/lib/hooks/useGuestAnnouncements';
import { getGuestHeroPreset } from '@/lib/guest-hero-preset';
import type { Reservation } from '@/lib/api';

interface CheckedInHomeProps {
  reservation: Reservation;
  token: string;
}

export function CheckedInHome({ reservation, token }: CheckedInHomeProps) {
  const { setGuestInfo, isCheckedIn, checkIn } = useGuestStore();
  const { announcements, loading: announcementsLoading } = useGuestAnnouncements(token);
  const heroPreset = getGuestHeroPreset(reservation.status);

  useEffect(() => {
    setGuestInfo({
      name: reservation.guestName,
      room: reservation.assignedRoom || '',
      checkinDate: reservation.checkin,
      checkoutDate: reservation.checkout,
    });

    // 서버 상태와 동기화
    if (!isCheckedIn) {
      checkIn();
    }
  }, [reservation, setGuestInfo, isCheckedIn, checkIn]);

  const criticalAnnouncement = announcements.find((a) => a.level === 'critical');
  const normalAnnouncements = announcements.filter((a) => a.level !== 'critical');

  return (
    <main className="space-y-6" role="main" aria-label="고객 홈 페이지">
      {/* Hero Section */}
      <HeroSection
        guestName={reservation.guestName}
        checkin={reservation.checkin}
        checkout={reservation.checkout}
        eyebrow={heroPreset.eyebrow}
        subtitle={heroPreset.subtitle}
        waveLineClass={heroPreset.waveLineClass}
      />

      {/* 체크아웃 리마인더 (상단으로 이동!) */}
      <CheckoutReminder />

      {/* 긴급 공지 (있을 때만) */}
      {criticalAnnouncement && (
        <CriticalAnnouncement announcement={criticalAnnouncement} token={token} />
      )}

      {/* Quick Actions (주문이 첫 번째) */}
      <FadeInSection as="div" delay={0.1}>
        <QuickActionsCompact token={token} variant="checked_in" />
      </FadeInSection>

      <SectionDivider variant="brand" />

      {/* 약도 카드 (배정된 경우) */}
      {reservation.assignedRoom && (
        <FadeInSection as="div" delay={0.15}>
          <FloorPlanCard assignedRoom={reservation.assignedRoom} />
        </FadeInSection>
      )}

      {/* WiFi + 이용시간 카드 (2x2) */}
      <FadeInSection as="div" delay={0.2}>
        <ServiceCardsGrid />
      </FadeInSection>

      {/* 최근 주문 */}
      <FadeInSection as="div" delay={0.25}>
        <RecentOrdersSummary token={token} />
      </FadeInSection>

      <SectionDivider variant="minimal" />

      {/* 체크아웃 상태 카드 (하단) */}
      <FadeInSection as="div" delay={0.3}>
        <CheckoutStatusCard token={token} />
      </FadeInSection>

      {/* 일반 공지 (접힌 상태) */}
      {!announcementsLoading && normalAnnouncements.length > 0 && (
        <FadeInSection as="div" delay={0.35}>
          <CollapsedAnnouncements
            announcements={normalAnnouncements}
            token={token}
            defaultExpanded={false}
          />
        </FadeInSection>
      )}
    </main>
  );
}
