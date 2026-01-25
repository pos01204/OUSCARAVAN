'use client';

import { cn } from '@/lib/utils';

type DividerVariant = 'default' | 'minimal' | 'brand';

interface SectionDividerProps {
  variant?: DividerVariant;
  className?: string;
}

export function SectionDivider({ variant = 'default', className }: SectionDividerProps) {
  if (variant === 'minimal') {
    return (
      <div 
        className={cn('section-divider-minimal', className)} 
        role="separator" 
        aria-hidden="true" 
      />
    );
  }

  if (variant === 'brand') {
    return (
      <div 
        className={cn('section-divider-brand', className)} 
        role="separator" 
        aria-hidden="true"
      >
        <div className="section-divider-brand-symbol">
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  }

  // default: 점 3개 웨이브
  return (
    <div 
      className={cn('section-divider', className)} 
      role="separator" 
      aria-hidden="true"
    >
      <div className="section-divider-wave">
        <div className="section-divider-wave-center" />
      </div>
    </div>
  );
}
