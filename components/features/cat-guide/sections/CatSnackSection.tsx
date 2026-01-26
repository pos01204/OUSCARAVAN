'use client';

import { CAT_GUIDE_DATA } from '@/lib/catGuide';
import { HeartSimple } from '../CatIllustrations';

/**
 * 츄르 안내 섹션
 * - 간단한 정보 카드 (버튼 없음)
 */
export function CatSnackSection() {
  const { snack } = CAT_GUIDE_DATA;

  return (
    <section aria-label="간식 안내">
      {/* 섹션 타이틀 - Paperlogy */}
      <h2 className="font-cat text-[13px] font-semibold text-brand-dark mb-3 tracking-tight">
        {snack.title}
      </h2>

      {/* 정보 카드 */}
      <div className="rounded-2xl bg-gradient-to-br from-cat-peach/20 to-cat-cream/30 border border-brand-cream-dark/12 p-5">
        <div className="flex items-start gap-3.5">
          <HeartSimple className="w-4 h-4 text-cat-orange/70 flex-shrink-0 mt-0.5" />
          {/* 본문 - 온글잎 박다현체 */}
          <p className="font-cat-body text-[13px] text-brand-dark leading-relaxed">
            {snack.content}
          </p>
        </div>
      </div>
    </section>
  );
}
