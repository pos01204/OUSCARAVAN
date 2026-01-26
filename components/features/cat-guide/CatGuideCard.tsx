'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CaretRight } from '@phosphor-icons/react';
import { CatGuideDrawer } from './CatGuideDrawer';
import { CAT_MOTION } from '@/lib/motion';

/**
 * 고양이 가이드 진입 카드
 * - 가이드 목록 하단에 배치되는 특별 디자인 카드
 * - 클릭 시 CatGuideDrawer 열림
 * - 텍스트 중심 미니멀 디자인
 */
export function CatGuideCard() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setIsDrawerOpen(true)}
        className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-cat-cream/50 to-cat-peach/30 border border-cat-brown/15 px-5 py-4 text-left shadow-soft-sm"
        {...CAT_MOTION.catCardHover}
        aria-label="오우스의 작은 주민들 - 고양이 가이드 열기"
      >
        {/* 메인 콘텐츠 */}
        <div className="flex items-center gap-4">
          {/* 텍스트 */}
          <div className="flex-1 min-w-0">
            {/* 제목 - Paperlogy */}
            <h3 className="font-cat text-[15px] font-semibold text-brand-dark mb-1 tracking-tight">
              오우스의 작은 주민들
            </h3>
            {/* 설명 - 온글잎 박다현체 */}
            <p className="font-cat-body text-[13px] text-brand-dark-muted">
              카라반의 귀여운 고양이들을 소개합니다
            </p>
          </div>

          {/* 화살표 */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cat-brown/60 flex items-center justify-center">
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
