'use client';

import { CAT_GUIDE_DATA } from '@/lib/catGuide';
import { CatWithChuru } from '../CatIllustrations';

/**
 * 츄르 안내 섹션
 * - 츄르 먹는 고양이 일러스트 + 안내
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
      <div className="rounded-2xl bg-gradient-to-br from-cat-peach/30 to-cat-cream/40 border border-cat-brown/10 p-5">
        <div className="flex items-center gap-4">
          {/* 츄르 먹는 고양이 일러스트 */}
          <CatWithChuru className="w-20 h-24 text-cat-brown/60 flex-shrink-0" />
          
          {/* 본문 - 온글잎 박다현체 (크기 키움) */}
          <p className="font-cat-body text-[15px] text-brand-dark leading-relaxed flex-1">
            {snack.content}
          </p>
        </div>
      </div>
    </section>
  );
}
