'use client';

import { CAT_GUIDE_DATA } from '@/lib/catGuide';

/**
 * 츄르 안내 섹션
 * - 텍스트 중심 디자인
 */
export function CatSnackSection() {
  const { snack } = CAT_GUIDE_DATA;

  return (
    <section aria-label="간식 안내">
      {/* 섹션 타이틀 - Paperlogy */}
      <h2 className="font-cat text-base font-semibold text-brand-dark mb-4 tracking-tight">
        {snack.title}
      </h2>

      {/* 정보 카드 */}
      <div className="rounded-2xl bg-gradient-to-br from-cat-peach/25 to-cat-cream/35 border border-cat-brown/10 p-5">
        <p className="font-cat-body text-[15px] text-brand-dark leading-relaxed">
          {snack.content}
        </p>
      </div>
    </section>
  );
}
