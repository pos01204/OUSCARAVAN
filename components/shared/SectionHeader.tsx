import * as React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  description?: string;
  rightSlot?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

const titleSizeClasses: Record<NonNullable<SectionHeaderProps['size']>, string> = {
  sm: 'text-base',
  md: 'text-lg',
};

export function SectionHeader({
  title,
  description,
  rightSlot,
  className,
  size = 'md',
}: SectionHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between',
        className
      )}
    >
      <div className="min-w-0">
        <h2
          className={cn(
            'font-heading font-bold text-brand-dark tracking-tight',
            titleSizeClasses[size]
          )}
        >
          {title}
        </h2>
        <div className="wave-line-sm" aria-hidden="true" />
        {description ? (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{description}</p>
        ) : null}
      </div>
      {rightSlot ? <div className="shrink-0 min-w-0 max-w-[50%] sm:max-w-none">{rightSlot}</div> : null}
    </header>
  );
}
