'use client';

import { CouponFlip } from '@/components/features/CouponFlip';
import { useGuestStore } from '@/lib/store';
import { GUEST_BRAND_MEDIA } from '@/lib/brand';
import { CafeHero, MenuGrid, CafeInfo } from '@/components/guest/cafe';
import { PageHeader } from '@/components/shared/PageHeader';
import { Info } from 'lucide-react';

interface GuestCafeContentProps {
  token: string;
}

export function GuestCafeContent({ token }: GuestCafeContentProps) {
  const { guestInfo } = useGuestStore();

  return (
    <main className="space-y-6" role="main" aria-label="카페 이용 페이지">
      {/* 공통 헤더 */}
      <PageHeader 
        title="카페" 
        description="여유로운 한 잔의 시간을 즐겨보세요."
      />

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
      <div className="rounded-xl bg-neutral-50 border border-neutral-200/80 p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
            <Info className="h-4 w-4 text-neutral-500" />
          </div>
          <div>
            <p className="font-semibold text-neutral-800 text-sm mb-1">카페 이용 안내</p>
            <p className="text-sm text-neutral-600 leading-relaxed">
              카페는 직접 방문하여 주문해주세요.<br />
              앱을 통한 주문은 불가합니다.
            </p>
          </div>
        </div>
      </div>

      {/* 메뉴 섹션 */}
      <section className="-mx-4 px-4 py-6 bg-neutral-50 border-y border-neutral-200/60">
        <h2 className="text-xl font-bold text-neutral-900 mb-4">메뉴</h2>
        <MenuGrid />
      </section>

      {/* 카페 정보 (접이식) */}
      <section className="pt-2 pb-4">
        <CafeInfo />
      </section>
    </main>
  );
}
