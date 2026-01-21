'use client';

import { CouponFlip } from '@/components/features/CouponFlip';
import { CafeInfoTab } from '@/components/features/CafeInfoTab';
import { useGuestStore } from '@/lib/store';
import { GUEST_BRAND_MEDIA } from '@/lib/brand';
import { GuestPageHeader } from '@/components/guest/GuestPageHeader';

interface GuestCafeContentProps {
  token: string;
}

export function GuestCafeContent({ token }: GuestCafeContentProps) {
  const { guestInfo } = useGuestStore();

  return (
    <main className="space-y-6" role="main" aria-label="카페 이용 페이지">
      <GuestPageHeader
        title="카페 이용"
        description="투숙객 전용 할인 쿠폰과 카페 정보를 확인하세요"
      />

      {/* 투숙객 전용 쿠폰 */}
      <section aria-label="투숙객 전용 쿠폰">
        <CouponFlip
          roomNumber={guestInfo.room}
          backImageSrc={GUEST_BRAND_MEDIA.couponBackImageSrc}
        />
      </section>

      {/* 카페 정보 (기존 CafeInfoTab 재사용) */}
      <CafeInfoTab />
    </main>
  );
}
