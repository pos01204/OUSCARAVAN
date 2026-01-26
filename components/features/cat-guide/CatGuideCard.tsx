'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CatFace, PawPrint, Sparkle } from './CatIllustrations';
import { CatGuideDrawer } from './CatGuideDrawer';
import { CAT_MOTION } from '@/lib/motion';

/**
 * 고양이 가이드 진입 카드
 * - 가이드 목록 하단에 배치되는 특별 디자인 카드
 * - 클릭 시 CatGuideDrawer 열림
 */
export function CatGuideCard() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setIsDrawerOpen(true)}
        className="w-full relative overflow-hidden rounded-3xl cat-gradient-bg cat-card-glow border border-cat-peach/50 p-6 text-left"
        {...CAT_MOTION.catCardHover}
        aria-label="오우스의 작은 주민들 - 고양이 가이드 열기"
      >
        {/* 배경 발자국 패턴 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <motion.div
            className="absolute top-4 left-6 opacity-40"
            animate={{ y: [0, -6, 0], rotate: [-5, 5, -5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <PawPrint className="w-5 h-5 text-cat-brown/40" />
          </motion.div>
          <motion.div
            className="absolute top-8 right-12 opacity-30"
            animate={{ y: [0, -8, 0], rotate: [5, -5, 5] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          >
            <PawPrint className="w-4 h-4 text-cat-brown/30" />
          </motion.div>
          <motion.div
            className="absolute bottom-12 left-16 opacity-25"
            animate={{ y: [0, -6, 0], rotate: [-3, 3, -3] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          >
            <PawPrint className="w-4 h-4 text-cat-brown/25" />
          </motion.div>
          <motion.div
            className="absolute top-16 left-1/2 opacity-20"
            animate={{ y: [0, -5, 0], rotate: [3, -3, 3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }}
          >
            <PawPrint className="w-3 h-3 text-cat-brown/20" />
          </motion.div>
          <motion.div
            className="absolute bottom-8 right-8 opacity-30"
            animate={{ y: [0, -7, 0], rotate: [-4, 4, -4] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
          >
            <PawPrint className="w-5 h-5 text-cat-brown/30" />
          </motion.div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* 고양이 얼굴 */}
          <motion.div
            className="mb-4"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <CatFace expression="happy" size={72} />
          </motion.div>

          {/* 타이틀 */}
          <div className="flex items-center gap-2 mb-2">
            <Sparkle className="w-4 h-4 text-amber-400" />
            <h3 className="font-cat text-xl font-bold text-brand-dark">
              오우스의 작은 주민들
            </h3>
            <Sparkle className="w-4 h-4 text-amber-400" />
          </div>

          {/* 서브타이틀 */}
          <p className="text-sm text-brand-dark-muted mb-5 leading-relaxed">
            카라반 곳곳을 누비는<br />
            귀여운 고양이들을 만나보세요
          </p>

          {/* CTA 버튼 */}
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-cat-orange text-white text-sm font-semibold shadow-md"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span>🐱</span>
            <span>만나러 가기</span>
          </motion.div>
        </div>
      </motion.button>

      {/* 드로어 */}
      <CatGuideDrawer 
        isOpen={isDrawerOpen} 
        onOpenChange={setIsDrawerOpen} 
      />
    </>
  );
}
