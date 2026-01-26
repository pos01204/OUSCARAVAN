'use client';

import { CAT_GUIDE_DATA } from '@/lib/catGuide';
import { CatWithBowl, PawPrintSimple } from '../CatIllustrations';

/**
 * 고양이 가이드 히어로 섹션
 * - 밥그릇과 함께하는 고양이 일러스트 + 타이틀
 */
export function CatHeroSection() {
  const { hero } = CAT_GUIDE_DATA;

  return (
    <section className="relative text-center py-6" aria-label="고양이 가이드 소개">
      {/* 메인 콘텐츠 */}
      <div className="relative z-10">
        {/* 고양이 일러스트 - 밥그릇과 함께 */}
        <div className="inline-block mb-6">
          <CatWithBowl className="w-28 h-24 text-cat-brown/70" />
        </div>

        {/* 타이틀 - Paperlogy */}
        <h1 className="font-cat text-xl font-semibold text-brand-dark mb-3 tracking-tight">
          {hero.title}
        </h1>

        {/* 서브타이틀 - 온글잎 박다현체 (크기 키움) */}
        <p className="font-cat-body text-[15px] text-brand-dark-muted leading-relaxed">
          {hero.subtitle}
        </p>
      </div>

      {/* 구분선 */}
      <div className="mt-8 flex items-center justify-center gap-4">
        <div className="h-px w-20 bg-gradient-to-r from-transparent to-cat-brown/20" />
        <PawPrintSimple className="w-3 h-3 text-cat-brown/25" />
        <div className="h-px w-20 bg-gradient-to-l from-transparent to-cat-brown/20" />
      </div>
    </section>
  );
}
