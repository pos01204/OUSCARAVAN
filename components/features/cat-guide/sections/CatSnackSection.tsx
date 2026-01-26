'use client';

import { CAT_GUIDE_DATA } from '@/lib/catGuide';
import { Storefront } from '@phosphor-icons/react';

/**
 * 츄르 안내 섹션
 * - 강조된 안내 카드
 */
export function CatSnackSection() {
  const { snack } = CAT_GUIDE_DATA;

  return (
    <section aria-label="간식 안내">
      {/* 섹션 타이틀 - Paperlogy */}
      <h2 className="font-cat text-base font-semibold text-brand-dark mb-4 tracking-tight">
        {snack.title}
      </h2>

      {/* 강조 카드 */}
      <div className="rounded-2xl bg-cat-brown/90 p-5 shadow-soft-md">
        <div className="flex items-center gap-4">
          {/* 아이콘 */}
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
            <Storefront size={24} weight="fill" className="text-white" />
          </div>
          
          {/* 텍스트 */}
          <div className="flex-1">
            <p className="font-cat text-[13px] text-white/70 mb-1">
              고양이 전용 츄르
            </p>
            <p className="font-cat-body text-[16px] text-white font-medium leading-snug">
              카페 1층 키오스크에서<br />
              구매 가능합니다
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
