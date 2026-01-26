'use client';

import { CouponFlip } from '@/components/features/CouponFlip';
import { useGuestStore } from '@/lib/store';
import { GUEST_BRAND_MEDIA } from '@/lib/brand';
import { CafeHero, MenuGrid, CafeInfo, CafeQuickInfo } from '@/components/guest/cafe';
import { PageHeader } from '@/components/shared/PageHeader';
import { Check } from 'lucide-react';

interface GuestCafeContentProps {
  token: string;
}

export function GuestCafeContent({ token }: GuestCafeContentProps) {
  const { guestInfo } = useGuestStore();

  return (
    <main className="space-y-6" role="main" aria-label="카페 이용 페이지">
      {/* 공통 헤더 */}
      <PageHeader 
        subtitle="CAFÉ"
        title="카페" 
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

      {/* 퀵 정보 (운영시간, 조식, 케이크) */}
      <CafeQuickInfo />

      {/* 카페 이용 안내 */}
      <div className="rounded-xl bg-white border border-brand-cream-dark/25 overflow-hidden">
        <div className="px-4 py-3 bg-brand-cream/20 border-b border-brand-cream-dark/20">
          <p className="font-semibold text-brand-dark text-sm">이용 안내</p>
        </div>
        <ul className="divide-y divide-brand-cream-dark/15">
          <li className="px-4 py-3 flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-green-600" />
            </div>
            <span className="text-sm text-brand-dark"><strong className="text-amber-600">음료 10% 할인</strong> 혜택</span>
          </li>
          <li className="px-4 py-3 flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-green-600" />
            </div>
            <span className="text-sm text-brand-dark">포장 / 테이크아웃 가능</span>
          </li>
          <li className="px-4 py-3 flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-green-600" />
            </div>
            <span className="text-sm text-brand-dark">직접 방문 주문 (앱 주문 불가)</span>
          </li>
        </ul>
      </div>

      {/* 메뉴 섹션 */}
      <section className="-mx-4 px-4 py-6 bg-brand-cream/15 border-y border-brand-cream-dark/20">
        <h2 className="text-xl font-bold text-brand-dark mb-4">메뉴</h2>
        <MenuGrid />
      </section>

      {/* 카페 정보 (접이식) */}
      <section className="pt-2 pb-4">
        <CafeInfo />
      </section>
    </main>
  );
}
