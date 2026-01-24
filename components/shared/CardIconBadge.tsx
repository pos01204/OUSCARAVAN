import * as React from 'react';
import { cn } from '@/lib/utils';

type BadgeTone = 'neutral' | 'brand' | 'info' | 'success' | 'warning' | 'error';
type BadgeSize = 'sm' | 'md' | 'lg';

interface CardIconBadgeProps {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tone?: BadgeTone;
  size?: BadgeSize;
  className?: string;
  iconClassName?: string;
  strokeWidth?: number;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'text-muted-foreground',
  brand: 'text-brand-dark',
  info: 'text-status-info',
  success: 'text-status-success',
  warning: 'text-status-warning',
  error: 'text-status-error',
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
        'inline-flex items-center justify-center rounded-xl bg-muted/60',
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
