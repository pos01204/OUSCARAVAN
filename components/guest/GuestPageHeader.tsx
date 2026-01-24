'use client';

import * as React from 'react';
import clsx from 'clsx';

interface GuestPageHeaderProps {
  title: string;
  description?: string;
  rightSlot?: React.ReactNode;
  className?: string;
}

export function GuestPageHeader({ title, description, rightSlot, className }: GuestPageHeaderProps) {
  return (
    <header className={clsx('space-y-2', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-brand-dark tracking-tight">
            {title}
          </h1>
          {/* Animated Ocean Wave Line */}
          <div className="mt-2 h-1 w-12 rounded-full bg-gradient-to-r from-status-info/20 via-status-info/50 to-status-info/20" aria-hidden="true" />
          {description ? (
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{description}</p>
          ) : null}
        </div>
        {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
      </div>
    </header>
  );
}

