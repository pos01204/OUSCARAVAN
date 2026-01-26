'use client';

import { useRef } from 'react';
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
import { CatSilhouette } from './CatIllustrations';

interface CatGuideDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 고양이 가이드 풀스크린 드로어
 * - vaul Drawer 기반 모바일 친화적 UI
 * - 미니멀 디자인
 */
export function CatGuideDrawer({ isOpen, onOpenChange }: CatGuideDrawerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[95dvh] bg-[#FDFCFA]">
        {/* 헤더 - 더 미니멀하게 */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-3.5 bg-[#FDFCFA]/95 backdrop-blur-sm border-b border-brand-cream-dark/15">
          <div className="flex items-center gap-2.5">
            <CatSilhouette className="w-5 h-5 text-cat-brown/40" />
            {/* 헤더 타이틀 - Paperlogy */}
            <span className="font-cat text-sm font-semibold text-brand-dark tracking-tight">
              고양이 이야기
            </span>
          </div>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-cat-cream/20"
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
          <div className="px-5 py-6 space-y-8">
            {/* 히어로 섹션 */}
            <CatHeroSection />

            {/* 소개 섹션 */}
            <FadeInSection delay={0.1} as="div">
              <CatIntroSection />
            </FadeInSection>

            {/* 팁 섹션 */}
            <FadeInSection delay={0.15} as="div">
              <CatTipsSection />
            </FadeInSection>

            {/* 주의사항 섹션 */}
            <FadeInSection delay={0.2} as="div">
              <CatWarningsSection />
            </FadeInSection>

            {/* 츄르 안내 섹션 */}
            <FadeInSection delay={0.25} as="div">
              <CatSnackSection />
            </FadeInSection>

            {/* 마무리 섹션 */}
            <FadeInSection delay={0.3} as="div">
              <CatFooterSection onClose={handleClose} />
            </FadeInSection>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
