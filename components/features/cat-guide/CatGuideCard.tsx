'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { CatGuideDrawer } from './CatGuideDrawer';
import { CAT_MOTION } from '@/lib/motion';
import { CaretRight } from '@phosphor-icons/react';

/**
 * 고양이 가이드 진입 카드
 * - 가이드 목록 하단에 배치되는 특별 디자인 카드
 * - 클릭 시 CatGuideDrawer 열림
 * - 스크롤 없이 한 눈에 보이도록 컴팩트 디자인
 */
export function CatGuideCard() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setIsDrawerOpen(true)}
        className="w-full relative overflow-hidden rounded-2xl cat-gradient-bg border border-cat-peach/50 px-4 py-4 text-left shadow-soft-sm"
        {...CAT_MOTION.catCardHover}
        aria-label="오우스의 작은 주민들 - 고양이 가이드 열기"
      >
        {/* 배경 발자국 (간소화) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20" aria-hidden="true">
          <Icon icon="noto:paw-prints" className="absolute top-2 right-4 w-5 h-5" />
          <Icon icon="noto:paw-prints" className="absolute bottom-2 left-8 w-4 h-4" />
        </div>

        {/* 메인 콘텐츠 - 가로 레이아웃 */}
        <div className="relative z-10 flex items-center gap-4">
          {/* 고양이 이모지 아이콘 */}
          <motion.div
            className="flex-shrink-0 w-14 h-14 rounded-xl bg-white/60 flex items-center justify-center shadow-sm"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Icon icon="noto:cat-face" className="w-9 h-9" />
          </motion.div>

          {/* 텍스트 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Icon icon="noto:sparkles" className="w-4 h-4 flex-shrink-0" />
              <h3 className="font-cat text-base font-bold text-brand-dark truncate">
                오우스의 작은 주민들
              </h3>
            </div>
            <p className="text-xs text-brand-dark-muted line-clamp-1">
              카라반 곳곳의 귀여운 고양이들을 만나보세요
            </p>
          </div>

          {/* 화살표 */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cat-orange/90 flex items-center justify-center">
            <CaretRight size={16} weight="bold" className="text-white" />
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
