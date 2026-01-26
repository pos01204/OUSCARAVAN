'use client';

import { CAT_GUIDE_DATA } from '@/lib/catGuide';
import { CatSilhouette, PawPrintSimple } from '../CatIllustrations';

/**
 * 고양이 가이드 히어로 섹션
 * - 미니멀 SVG 일러스트 + 타이틀
 */
export function CatHeroSection() {
  const { hero } = CAT_GUIDE_DATA;

  return (
    <section className="relative text-center py-6" aria-label="고양이 가이드 소개">
      {/* 배경 발자국 패턴 (매우 연하게) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <PawPrintSimple className="absolute top-2 left-8 w-4 h-4 text-cat-brown/15" />
        <PawPrintSimple className="absolute top-6 right-10 w-3 h-3 text-cat-brown/10" />
        <PawPrintSimple className="absolute bottom-8 left-1/4 w-3 h-3 text-cat-brown/10" />
      </div>

      {/* 메인 콘텐츠 */}
      <div className="relative z-10">
        {/* 고양이 일러스트 */}
        <div className="inline-block mb-4">
          <CatSilhouette className="w-16 h-16 text-cat-brown/60" />
        </div>

        {/* 타이틀 */}
        <h1 className="font-cat text-xl font-bold text-brand-dark mb-2">
          {hero.title}
        </h1>

        {/* 서브타이틀 */}
        <p className="text-sm text-brand-dark-muted leading-relaxed">
          {hero.subtitle}
        </p>
      </div>

      {/* 구분선 */}
      <div className="mt-6 flex items-center justify-center gap-3">
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-brand-cream-dark/40" />
        <PawPrintSimple className="w-3 h-3 text-cat-brown/30" />
        <div className="h-px w-16 bg-gradient-to-l from-transparent to-brand-cream-dark/40" />
      </div>
    </section>
  );
}
