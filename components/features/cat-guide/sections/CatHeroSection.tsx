'use client';

import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { CAT_GUIDE_DATA } from '@/lib/catGuide';

/**
 * 고양이 가이드 히어로 섹션
 * - 고품질 고양이 이모지 + 타이틀
 */
export function CatHeroSection() {
  const { hero } = CAT_GUIDE_DATA;

  return (
    <section className="relative text-center py-4" aria-label="고양이 가이드 소개">
      {/* 배경 발자국 (간소화) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30" aria-hidden="true">
        <Icon icon="noto:paw-prints" className="absolute top-0 left-6 w-5 h-5" />
        <Icon icon="noto:paw-prints" className="absolute top-8 right-8 w-4 h-4" />
        <Icon icon="noto:paw-prints" className="absolute bottom-4 left-1/4 w-4 h-4" />
      </div>

      {/* 메인 콘텐츠 */}
      <div className="relative z-10">
        {/* 고양이 이모지 */}
        <motion.div
          className="inline-block mb-4"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon icon="noto:smiling-cat-with-heart-eyes" className="w-20 h-20" />
        </motion.div>

        {/* 타이틀 */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <Icon icon="noto:sparkles" className="w-5 h-5" />
          <h1 className="font-cat text-xl font-bold text-brand-dark">
            {hero.title}
          </h1>
          <Icon icon="noto:sparkles" className="w-5 h-5" />
        </div>

        {/* 서브타이틀 */}
        <p className="text-sm text-brand-dark-muted leading-relaxed">
          {hero.subtitle}
        </p>
      </div>

      {/* 구분선 */}
      <div className="mt-6 flex items-center justify-center gap-2">
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-cat-brown/30" />
        <Icon icon="noto:paw-prints" className="w-4 h-4 text-cat-brown/50" />
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-cat-brown/30" />
      </div>
    </section>
  );
}
