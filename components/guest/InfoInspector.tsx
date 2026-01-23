'use client';

import * as React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

interface InfoInspectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  /**
   * 기본: 모바일(Drawer) / 데스크톱(Sheet right)
   * 필요 시 강제 모드로 통일 가능
   */
  mode?: 'auto' | 'drawer' | 'sheet';
  sheetSide?: 'left' | 'right' | 'top' | 'bottom';
  contentClassName?: string;
  /**
   * 오버레이 내부 “본문 스크롤 영역”에만 적용되는 클래스.
   * - 기본값: `overflow-y-auto` 기반
   * - Drawer/Sheet 공통으로 동일하게 적용됨
   */
  bodyClassName?: string;
}

export function InfoInspector({
  open,
  onOpenChange,
  title,
  description,
  children,
  mode = 'auto',
  sheetSide = 'right',
  contentClassName,
  bodyClassName,
}: InfoInspectorProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)', false);
  const resolvedMode = mode === 'auto' ? (isDesktop ? 'sheet' : 'drawer') : mode;

  if (resolvedMode === 'sheet') {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side={sheetSide}
          className={cn(
            // 오버레이 컨테이너는 overflow-hidden, 스크롤은 body에서만 처리
            'flex flex-col overflow-hidden',
            contentClassName
          )}
        >
          <SheetHeader className="shrink-0">
            <SheetTitle>{title}</SheetTitle>
            {description ? <SheetDescription>{description}</SheetDescription> : null}
          </SheetHeader>
          <div
            className={cn(
              // flex child 스크롤을 위해 min-h-0 필수
              'mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1',
              bodyClassName
            )}
          >
            {children}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className={cn(
          // Drawer 내부 스크롤/드래그 충돌 방지를 위해 컨테이너는 overflow-hidden
          'flex flex-col overflow-hidden',
          contentClassName
        )}
      >
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          {description ? <DrawerDescription>{description}</DrawerDescription> : null}
        </DrawerHeader>
        {/* 본문은 스크롤 영역 */}
        <div
          className={cn(
            // flex child 스크롤을 위해 min-h-0 필수
            'min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6',
            bodyClassName
          )}
        >
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

