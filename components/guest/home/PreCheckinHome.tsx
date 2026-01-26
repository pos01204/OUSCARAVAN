'use client';

import { useEffect } from 'react';
import { useGuestStore } from '@/lib/store';
import { HeroSection } from './HeroSection';
import { CriticalAnnouncement } from './CriticalAnnouncement';
import { CollapsedAnnouncements } from './CollapsedAnnouncements';
import { CheckInCTA } from './CheckInCTA';
import { QuickActionsCompact } from './QuickActionsCompact';
import { ServiceCardsGrid } from './ServiceCardsGrid';
import { SectionDivider } from '@/components/shared/SectionDivider';
import { FadeInSection } from '@/components/shared/FadeInSection';
import { useGuestAnnouncements } from '@/lib/hooks/useGuestAnnouncements';
import { getGuestHeroPreset } from '@/lib/guest-hero-preset';
import type { Reservation } from '@/lib/api';

interface PreCheckinHomeProps {
  reservation: Reservation;
  token: string;
}

export function PreCheckinHome({ reservation, token }: PreCheckinHomeProps) {
  const { setGuestInfo } = useGuestStore();
  const { announcements, loading: announcementsLoading } = useGuestAnnouncements(token);
  const heroPreset = getGuestHeroPreset(reservation.status);

  useEffect(() => {
    setGuestInfo({
      name: reservation.guestName,
      room: reservation.assignedRoom || '',
      checkinDate: reservation.checkin,
      checkoutDate: reservation.checkout,
    });
  }, [reservation, setGuestInfo]);

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
        subtitle="체크인 시간에 맞춰 방문해주세요"
        waveLineClass={heroPreset.waveLineClass}
      />

      {/* 긴급 공지 (있을 때만) */}
      {criticalAnnouncement && (
        <CriticalAnnouncement announcement={criticalAnnouncement} token={token} />
      )}

      {/* 체크인 CTA (메인 강조) */}
      <FadeInSection as="div" delay={0.1}>
        <CheckInCTA token={token} />
      </FadeInSection>

      <SectionDivider variant="brand" />

      {/* Quick Actions */}
      <FadeInSection as="div" delay={0.15}>
        <QuickActionsCompact token={token} variant="pre_checkin" />
      </FadeInSection>

      {/* WiFi + 이용시간 카드 (2x2) */}
      <FadeInSection as="div" delay={0.2}>
        <ServiceCardsGrid />
      </FadeInSection>

      <SectionDivider variant="minimal" />

      {/* 일반 공지 (접힌 상태) */}
      {!announcementsLoading && normalAnnouncements.length > 0 && (
        <FadeInSection as="div" delay={0.25}>
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
