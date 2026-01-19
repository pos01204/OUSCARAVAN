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
}: InfoInspectorProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)', false);
  const resolvedMode = mode === 'auto' ? (isDesktop ? 'sheet' : 'drawer') : mode;

  if (resolvedMode === 'sheet') {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side={sheetSide} className={contentClassName}>
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            {description ? <SheetDescription>{description}</SheetDescription> : null}
          </SheetHeader>
          <div className="mt-4">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className={contentClassName}>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          {description ? <DrawerDescription>{description}</DrawerDescription> : null}
        </DrawerHeader>
        <div className="px-4 pb-6">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}

