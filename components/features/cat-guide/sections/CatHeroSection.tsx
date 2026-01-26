'use client';

import { motion } from 'framer-motion';
import { CatFace, PawPrint, Sparkle, WaveDivider } from '../CatIllustrations';
import { CAT_GUIDE_DATA } from '@/lib/catGuide';

/**
 * 고양이 가이드 히어로 섹션
 * - 대형 고양이 얼굴 + 타이틀
 * - floating 발자국 + shimmer 텍스트
 */
export function CatHeroSection() {
  const { hero } = CAT_GUIDE_DATA;

  return (
    <section className="relative text-center py-6" aria-label="고양이 가이드 소개">
      {/* 배경 발자국 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <motion.div
          className="absolute top-2 left-8"
          animate={{ y: [0, -8, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <PawPrint className="w-5 h-5 text-cat-brown/30" />
        </motion.div>
        <motion.div
          className="absolute top-6 right-10"
          animate={{ y: [0, -6, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >
          <PawPrint className="w-4 h-4 text-cat-brown/25" />
        </motion.div>
        <motion.div
          className="absolute bottom-8 left-1/4"
          animate={{ y: [0, -7, 0], opacity: [0.25, 0.5, 0.25] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          <PawPrint className="w-4 h-4 text-cat-brown/25" />
        </motion.div>
        <motion.div
          className="absolute bottom-4 right-1/4"
          animate={{ y: [0, -5, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 2.3, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        >
          <PawPrint className="w-3 h-3 text-cat-brown/20" />
        </motion.div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="relative z-10">
        {/* 고양이 얼굴 */}
        <motion.div
          className="inline-block mb-5"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <CatFace expression="love" size={100} />
        </motion.div>

        {/* 타이틀 */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <motion.div
            animate={{ rotate: [0, 15, 0, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkle className="w-5 h-5 text-amber-400" />
          </motion.div>
          <h1 className="font-cat text-2xl font-bold text-shimmer-cat">
            {hero.title}
          </h1>
          <motion.div
            animate={{ rotate: [0, -15, 0, 15, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkle className="w-5 h-5 text-amber-400" />
          </motion.div>
        </div>

        {/* 서브타이틀 */}
        <p className="text-sm text-brand-dark-muted leading-relaxed">
          {hero.subtitle}
        </p>
      </div>

      {/* 웨이브 구분선 */}
      <div className="mt-8">
        <WaveDivider className="text-cat-brown/40" />
      </div>
    </section>
  );
}
