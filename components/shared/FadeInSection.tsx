'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SECTION_FADE_IN } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface FadeInSectionProps {
  children: React.ReactNode;
  className?: string;
  /** 지연 시간 (초 단위) */
  delay?: number;
  /** section 대신 div로 렌더링 */
  as?: 'section' | 'div';
  /** aria-label */
  'aria-label'?: string;
}

/**
 * 스크롤 시 자연스럽게 페이드인되는 섹션 래퍼
 * - prefers-reduced-motion 존중
 * - once: true로 한 번만 애니메이션
 */
export function FadeInSection({
  children,
  className,
  delay = 0,
  as = 'section',
  'aria-label': ariaLabel,
}: FadeInSectionProps) {
  const reduceMotion = useReducedMotion();
  const Component = as === 'div' ? motion.div : motion.section;

  if (reduceMotion) {
    const StaticComponent = as === 'div' ? 'div' : 'section';
    return (
      <StaticComponent className={className} aria-label={ariaLabel}>
        {children}
      </StaticComponent>
    );
  }

  return (
    <Component
      className={cn(className)}
      initial={SECTION_FADE_IN.initial}
      whileInView={SECTION_FADE_IN.whileInView}
      viewport={SECTION_FADE_IN.viewport}
      transition={{ ...SECTION_FADE_IN.transition, delay }}
      aria-label={ariaLabel}
    >
      {children}
    </Component>
  );
}
