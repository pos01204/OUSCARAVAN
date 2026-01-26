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
      {/* 섹션 타이틀 */}
      <h2 className="text-sm font-semibold text-brand-dark mb-2">
        {snack.title}
      </h2>

      {/* 정보 카드 */}
      <div className="rounded-xl bg-cat-cream/30 border border-brand-cream-dark/20 p-4">
        <div className="flex items-start gap-3">
          <HeartSimple className="w-4 h-4 text-cat-orange flex-shrink-0 mt-0.5" />
          <p className="text-sm text-brand-dark leading-relaxed">
            {snack.content}
          </p>
        </div>
      </div>
    </section>
  );
}
