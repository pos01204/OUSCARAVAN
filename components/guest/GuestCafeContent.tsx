'use client';

import { CouponFlip } from '@/components/features/CouponFlip';
import { useGuestStore } from '@/lib/store';
import { GUEST_BRAND_MEDIA } from '@/lib/brand';
import { CafeHero, MenuGrid, CafeInfo } from '@/components/guest/cafe';
import { Info } from 'lucide-react';

interface GuestCafeContentProps {
  token: string;
}

export function GuestCafeContent({ token }: GuestCafeContentProps) {
  const { guestInfo } = useGuestStore();

  return (
    <main className="space-y-6" role="main" aria-label="카페 이용 페이지">
      {/* 히어로 섹션 */}
      <CafeHero />

      {/* 투숙객 전용 쿠폰 */}
      <section aria-label="투숙객 전용 쿠폰">
        <CouponFlip
          roomNumber={guestInfo.room}
          backImageSrc={GUEST_BRAND_MEDIA.couponBackImageSrc}
        />
      </section>

      {/* 카페 이용 안내 */}
      <div className="rounded-xl bg-amber-50 border border-amber-200/60 p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <Info className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="font-bold text-amber-900 text-sm mb-1">카페 이용 안내</p>
            <p className="text-sm text-amber-700/80 leading-relaxed">
              카페는 직접 방문하여 주문해주세요.<br />
              앱을 통한 주문은 불가합니다.
            </p>
          </div>
        </div>
      </div>

      {/* 메뉴 섹션 */}
      <div className="pt-2">
        <h2 className="text-xl font-bold text-neutral-900 mb-4">메뉴</h2>
        <MenuGrid />
      </div>

      {/* 카페 정보 (접이식) */}
      <div className="pt-4">
        <CafeInfo />
      </div>
    </main>
  );
}
