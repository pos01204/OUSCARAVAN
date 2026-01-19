'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGuestStore } from '@/lib/store';
import { WifiCard } from '@/components/features/WifiCard';
import { TimeCard } from '@/components/features/TimeCard';
import { CheckInOut } from '@/components/features/CheckInOut';
import { CheckoutReminder } from '@/components/features/CheckoutReminder';
import { GuestOrderSync } from '@/components/guest/GuestOrderSync';
import { FloorPlanCard } from '@/components/guest/FloorPlanCard';
import { WELCOME_MESSAGE } from '@/lib/constants';
import type { Reservation } from '@/lib/api';
import { BrandMediaLayer } from '@/components/guest/BrandMediaLayer';
import { GUEST_BRAND_MEDIA } from '@/lib/brand';
import { QuickActionGrid } from '@/components/guest/QuickActionGrid';
import { RecentOrdersSummary } from '@/components/guest/RecentOrdersSummary';
import { GuestAnnouncements } from '@/components/guest/GuestAnnouncements';
import { useGuestAnnouncements } from '@/lib/hooks/useGuestAnnouncements';

interface GuestHomeContentProps {
  reservation: Reservation;
  token: string;
}

export function GuestHomeContent({ reservation, token }: GuestHomeContentProps) {
  const { setGuestInfo, isCheckedIn, isCheckedOut } = useGuestStore();
  const { announcements, loading: announcementsLoading, error: announcementsError } =
    useGuestAnnouncements(token);

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
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-lg bg-gradient-to-br from-orange-100 to-amber-50 p-8 text-center border border-orange-100/50 shadow-sm"
        aria-label="환영 메시지"
      >
        {/* 향후 실사진/영상 브랜딩 레이어(에셋 없으면 렌더되지 않음) */}
        <BrandMediaLayer
          imageSrc={GUEST_BRAND_MEDIA.heroImageSrc}
          videoSrc={GUEST_BRAND_MEDIA.heroVideoSrc}
          alt="OUS 브랜드 히어로"
          fit="cover"
          overlayClassName="bg-gradient-to-b from-black/0 via-black/10 to-black/25"
          priority
        />
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          {WELCOME_MESSAGE.korean.replace('{name}', reservation.guestName)}
        </h1>
        {/* 호수 정보는 고객에게 노출하지 않음 (관리자 편의용) */}
      </motion.section>

      <GuestAnnouncements
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

      {/* 주문 동기화 컴포넌트 (백그라운드에서 주기적으로 주문 목록 동기화) */}
      <GuestOrderSync token={token} />

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
