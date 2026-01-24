'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGuestStore } from '@/lib/store';
import { WifiCard } from '@/components/features/WifiCard';
import { TimeCard } from '@/components/features/TimeCard';
import { CheckInOut } from '@/components/features/CheckInOut';
import { CheckoutReminder } from '@/components/features/CheckoutReminder';
import { FloorPlanCard } from '@/components/guest/FloorPlanCard';
import { WELCOME_MESSAGE } from '@/lib/constants';
import type { Reservation } from '@/lib/api';
import { BrandMediaLayer } from '@/components/guest/BrandMediaLayer';
import { GUEST_BRAND_MEDIA } from '@/lib/brand';
import { QuickActionGrid } from '@/components/guest/QuickActionGrid';
import { RecentOrdersSummary } from '@/components/guest/RecentOrdersSummary';
import { GuestAnnouncements } from '@/components/guest/GuestAnnouncements';
import { useGuestAnnouncements } from '@/lib/hooks/useGuestAnnouncements';
import { getGuestHeroPreset } from '@/lib/guest-hero-preset';
import { PAGE_ENTER } from '@/lib/motion';

interface GuestHomeContentProps {
  reservation: Reservation;
  token: string;
}

export function GuestHomeContent({ reservation, token }: GuestHomeContentProps) {
  const { setGuestInfo, isCheckedIn, isCheckedOut } = useGuestStore();
  const { announcements, loading: announcementsLoading, error: announcementsError } =
    useGuestAnnouncements(token);
  const heroPreset = getGuestHeroPreset(reservation.status);

  const formatYmd = (isoLike?: string) => {
    if (!isoLike) return '';
    const d = new Date(isoLike);
    if (Number.isNaN(d.getTime())) return '';
    const parts = new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(d);
    const y = parts.find((p) => p.type === 'year')?.value ?? '';
    const m = parts.find((p) => p.type === 'month')?.value ?? '';
    const day = parts.find((p) => p.type === 'day')?.value ?? '';
    return `${y}.${m}.${day}`;
  };

  const stayRange =
    reservation.checkin && reservation.checkout
      ? `${formatYmd(reservation.checkin)} — ${formatYmd(reservation.checkout)}`
      : null;

  useEffect(() => {
    // Railway API에서 가져온 예약 정보로 게스트 정보 설정
    setGuestInfo({
      name: reservation.guestName,
      room: reservation.assignedRoom || '',
      checkinDate: reservation.checkin,
      checkoutDate: reservation.checkout,
    });

    // 서버 상태와 동기화 (새로고침 시 초기화 방지)
    if (reservation.status === 'checked_in') {
      if (!isCheckedIn) {
        useGuestStore.getState().checkIn();
      }
    } else if (reservation.status === 'checked_out') {
      if (!isCheckedIn) useGuestStore.getState().checkIn();
      if (!isCheckedOut) useGuestStore.getState().checkOut();
    }
  }, [reservation, setGuestInfo, isCheckedIn, isCheckedOut]);

  return (
    <main className="space-y-6" role="main" aria-label="고객 홈 페이지">
      {/* Hero Section — 오션뷰 테마 */}
      <motion.section
        initial={PAGE_ENTER.initial}
        animate={PAGE_ENTER.animate}
        transition={PAGE_ENTER.transition}
        className={`ocean-wave-bg ${heroPreset.patternClass} relative overflow-hidden rounded-2xl bg-background-elevated p-8 md:p-10 text-center border border-border shadow-card`}
        aria-label="환영 메시지"
      >
        {/* 향후 실사진/영상 브랜딩 레이어(에셋 없으면 렌더되지 않음) */}
        <BrandMediaLayer
          imageSrc={GUEST_BRAND_MEDIA.heroImageSrc}
          videoSrc={GUEST_BRAND_MEDIA.heroVideoSrc}
          alt="OUS 브랜드 히어로"
          fit="cover"
          overlayClassName="bg-white/10"
          priority
        />
        {/* 환영 인사 */}
        <p className="text-[11px] font-medium tracking-[0.28em] text-muted-foreground uppercase relative z-10 mb-2">
          {heroPreset.eyebrow}
        </p>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-brand-dark relative z-10 tracking-tight">
          {WELCOME_MESSAGE.korean.replace('{name}', reservation.guestName)}
        </h1>
        {/* Premium rule */}
        <div className={`mx-auto ${heroPreset.waveLineClass} relative z-10`} aria-hidden="true" />
        <p className="mt-4 text-sm text-muted-foreground relative z-10 leading-relaxed">
          {heroPreset.subtitle}
        </p>
        {stayRange ? (
          <p className="mt-3 text-[11px] text-muted-foreground/80 relative z-10">
            {stayRange}
          </p>
        ) : null}
      </motion.section>

      <GuestAnnouncements
        token={token}
        announcements={announcements}
        loading={announcementsLoading}
        error={announcementsError}
      />

      {/* Quick Actions (1차 행동) */}
      <QuickActionGrid token={token} />

      {/* 약도 카드 (체크인 완료 후 배정된 공간 표시) */}
      {reservation.assignedRoom && (
        <FloorPlanCard assignedRoom={reservation.assignedRoom} />
      )}

      {/* Status Cards Grid */}
      <section className="grid gap-4 md:grid-cols-2" aria-label="서비스 정보 카드">
        <div id="wifi">
          <WifiCard />
        </div>
        <TimeCard />
        <div id="checkinout">
          <CheckInOut token={token} />
        </div>
      </section>

      {/* Checkout Reminder */}
      <CheckoutReminder />

      {/* 주문 내역(요약 + 더보기) */}
      <section aria-label="최근 주문">
        <RecentOrdersSummary token={token} />
      </section>
    </main>
  );
}
