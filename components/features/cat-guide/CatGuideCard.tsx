'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CaretRight } from '@phosphor-icons/react';
import { CatGuideDrawer } from './CatGuideDrawer';
import { CatSilhouette, PawPrintSimple } from './CatIllustrations';
import { CAT_MOTION } from '@/lib/motion';

/**
 * 고양이 가이드 진입 카드
 * - 가이드 목록 하단에 배치되는 특별 디자인 카드
 * - 클릭 시 CatGuideDrawer 열림
 * - 미니멀 디자인
 */
export function CatGuideCard() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setIsDrawerOpen(true)}
        className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-cat-cream/50 to-cat-peach/30 border border-brand-cream-dark/25 px-4 py-4 text-left shadow-soft-sm"
        {...CAT_MOTION.catCardHover}
        aria-label="오우스의 작은 주민들 - 고양이 가이드 열기"
      >
        {/* 배경 발자국 (매우 연하게) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <PawPrintSimple className="absolute top-3 right-6 w-4 h-4 text-cat-brown/10" />
          <PawPrintSimple className="absolute bottom-3 left-12 w-3 h-3 text-cat-brown/8" />
        </div>

        {/* 메인 콘텐츠 - 가로 레이아웃 */}
        <div className="relative z-10 flex items-center gap-4">
          {/* 고양이 일러스트 */}
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/50 flex items-center justify-center">
            <CatSilhouette className="w-8 h-8 text-cat-brown/50" />
          </div>

          {/* 텍스트 */}
          <div className="flex-1 min-w-0">
            {/* 제목 - Paperlogy */}
            <h3 className="font-cat text-sm font-semibold text-brand-dark mb-0.5 tracking-tight">
              오우스의 작은 주민들
            </h3>
            {/* 설명 - 온글잎 박다현체 */}
            <p className="font-cat-body text-xs text-brand-dark-muted">
              카라반의 귀여운 고양이들
            </p>
          </div>

          {/* 화살표 */}
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-dark/80 flex items-center justify-center">
            <CaretRight size={14} weight="bold" className="text-white" />
          </div>
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
