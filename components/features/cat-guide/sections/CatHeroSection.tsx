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
    <section className="relative text-center py-4" aria-label="고양이 가이드 소개">
      {/* 배경 발자국 패턴 (매우 연하게) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <PawPrintSimple className="absolute top-0 left-6 w-3 h-3 text-cat-brown/8" />
        <PawPrintSimple className="absolute top-8 right-8 w-2.5 h-2.5 text-cat-brown/6" />
      </div>

      {/* 메인 콘텐츠 */}
      <div className="relative z-10">
        {/* 고양이 일러스트 */}
        <div className="inline-block mb-5">
          <CatSilhouette className="w-14 h-14 text-cat-brown/50" />
        </div>

        {/* 타이틀 - Paperlogy */}
        <h1 className="font-cat text-lg font-semibold text-brand-dark mb-2 tracking-tight">
          {hero.title}
        </h1>

        {/* 서브타이틀 - 온글잎 박다현체 */}
        <p className="font-cat-body text-[13px] text-brand-dark-muted leading-relaxed">
          {hero.subtitle}
        </p>
      </div>

      {/* 구분선 - 더 미니멀하게 */}
      <div className="mt-8 flex items-center justify-center gap-4">
        <div className="h-px w-20 bg-gradient-to-r from-transparent to-brand-cream-dark/25" />
        <PawPrintSimple className="w-2.5 h-2.5 text-cat-brown/20" />
        <div className="h-px w-20 bg-gradient-to-l from-transparent to-brand-cream-dark/25" />
      </div>
    </section>
  );
}
