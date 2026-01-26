'use client';

import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { FadeInSection } from '@/components/shared/FadeInSection';
import { CatHeroSection } from './sections/CatHeroSection';
import { CatIntroSection } from './sections/CatIntroSection';
import { CatTipsSection } from './sections/CatTipsSection';
import { CatWarningsSection } from './sections/CatWarningsSection';
import { CatSnackSection } from './sections/CatSnackSection';
import { CatFooterSection } from './sections/CatFooterSection';

interface CatGuideDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 고양이 가이드 풀스크린 드로어
 * - vaul Drawer 기반 모바일 친화적 UI
 * - 각 섹션별 FadeInSection 적용
 */
export function CatGuideDrawer({ isOpen, onOpenChange }: CatGuideDrawerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[95dvh] bg-gradient-to-b from-cat-pink/30 via-cat-peach/20 to-cat-cream/30">
        {/* 헤더 */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-sm border-b border-cat-peach/30">
          <div className="flex items-center gap-2">
            <span className="text-lg">🐱</span>
            <span className="font-cat text-base font-semibold text-brand-dark">
              고양이 이야기
            </span>
          </div>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-cat-peach/30"
              aria-label="닫기"
            >
              <X className="h-4 w-4 text-brand-dark-muted" />
            </Button>
          </DrawerClose>
        </div>

        {/* 스크롤 콘텐츠 */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overscroll-contain"
        >
          <div className="px-4 py-6 space-y-8">
            {/* 히어로 섹션 */}
            <CatHeroSection />

            {/* 소개 섹션 */}
            <FadeInSection delay={0.1} as="div">
              <CatIntroSection />
            </FadeInSection>

            {/* 팁 섹션 */}
            <FadeInSection delay={0.2} as="div">
              <CatTipsSection />
            </FadeInSection>

            {/* 주의사항 섹션 */}
            <FadeInSection delay={0.3} as="div">
              <CatWarningsSection />
            </FadeInSection>

            {/* 츄르 안내 섹션 */}
            <FadeInSection delay={0.4} as="div">
              <CatSnackSection onClose={handleClose} />
            </FadeInSection>

            {/* 마무리 섹션 */}
            <FadeInSection delay={0.5} as="div">
              <CatFooterSection onClose={handleClose} />
            </FadeInSection>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
