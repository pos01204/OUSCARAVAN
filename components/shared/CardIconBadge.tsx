import * as React from 'react';
import { cn } from '@/lib/utils';

type BadgeTone = 
  | 'neutral' 
  | 'brand' 
  | 'info' 
  | 'success' 
  | 'warning' 
  | 'error'
  // 확장 색상 (카테고리별 차별화)
  | 'teal'
  | 'purple'
  | 'orange'
  | 'pink'
  | 'slate';

type BadgeSize = 'sm' | 'md' | 'lg';

interface CardIconBadgeProps {
  icon: React.ComponentType<{ className?: string; strokeWidth?: string | number }>;
  tone?: BadgeTone;
  size?: BadgeSize;
  className?: string;
  iconClassName?: string;
  strokeWidth?: string | number;
}

// 톤별 아이콘 색상
const toneClasses: Record<BadgeTone, string> = {
  neutral: 'text-muted-foreground',
  brand: 'text-brand-dark',
  info: 'text-status-info',
  success: 'text-status-success',
  warning: 'text-status-warning',
  error: 'text-status-error',
  // 확장 색상
  teal: 'text-teal-600',
  purple: 'text-purple-600',
  orange: 'text-orange-500',
  pink: 'text-pink-500',
  slate: 'text-slate-600',
};

// 톤별 배경 스타일 (글로우 효과 포함)
const toneBgClasses: Record<BadgeTone, string> = {
  neutral: 'bg-muted/60',
  brand: 'bg-brand-light/20',
  info: 'bg-status-info/10 shadow-[0_0_0_1px_rgba(37,99,235,0.08)]',
  success: 'bg-status-success/10 shadow-[0_0_0_1px_rgba(34,197,94,0.08)]',
  warning: 'bg-amber-100 shadow-[0_0_0_1px_rgba(245,158,11,0.15)]',
  error: 'bg-status-error/10 shadow-[0_0_0_1px_rgba(239,68,68,0.08)]',
  // 확장 색상 배경
  teal: 'bg-teal-100 shadow-[0_0_0_1px_rgba(20,184,166,0.1)]',
  purple: 'bg-purple-100 shadow-[0_0_0_1px_rgba(147,51,234,0.1)]',
  orange: 'bg-orange-100 shadow-[0_0_0_1px_rgba(249,115,22,0.1)]',
  pink: 'bg-pink-100 shadow-[0_0_0_1px_rgba(236,72,153,0.1)]',
  slate: 'bg-slate-100 shadow-[0_0_0_1px_rgba(100,116,139,0.1)]',
};

const sizeClasses: Record<BadgeSize, { container: string; icon: string }> = {
  sm: { container: 'h-8 w-8', icon: 'h-4 w-4' },
  md: { container: 'h-9 w-9', icon: 'h-5 w-5' },
  lg: { container: 'h-10 w-10', icon: 'h-5 w-5' },
};

export function CardIconBadge({
  icon: Icon,
  tone = 'brand',
  size = 'md',
  className,
  iconClassName,
  strokeWidth = 2.5,
}: CardIconBadgeProps) {
  const sizing = sizeClasses[size];
  
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-xl transition-all duration-200',
        toneBgClasses[tone],
        sizing.container,
        toneClasses[tone],
        className
      )}
      aria-hidden="true"
    >
      <Icon className={cn(sizing.icon, iconClassName)} strokeWidth={strokeWidth} />
    </div>
  );
}
