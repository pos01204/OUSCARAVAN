'use client';

import { CAT_GUIDE_DATA } from '@/lib/catGuide';

/**
 * 고양이 가이드 히어로 섹션
 * - 텍스트 중심 미니멀 디자인
 */
export function CatHeroSection() {
  const { hero } = CAT_GUIDE_DATA;

  return (
    <section className="text-center pt-2 pb-6" aria-label="고양이 가이드 소개">
      {/* 타이틀 - Paperlogy */}
      <h1 className="font-cat text-xl font-semibold text-brand-dark mb-3 tracking-tight">
        {hero.title}
      </h1>

      {/* 서브타이틀 - 온글잎 박다현체 */}
      <p className="font-cat-body text-[15px] text-brand-dark-muted leading-relaxed">
        {hero.subtitle}
      </p>

      {/* 구분선 */}
      <div className="mt-6 mx-auto w-12 h-px bg-cat-brown/20" />
    </section>
  );
}
