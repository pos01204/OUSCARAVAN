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
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{title}</h1>
          {description ? (
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          ) : null}
        </div>
        {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
      </div>
    </header>
  );
}

