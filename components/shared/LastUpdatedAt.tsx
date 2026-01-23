'use client';

import { formatDateTimeToKorean } from '@/lib/utils/date';
import { cn } from '@/lib/utils';

interface LastUpdatedAtProps {
  value: Date | string | null | undefined;
  className?: string;
}

export function LastUpdatedAt({ value, className }: LastUpdatedAtProps) {
  if (!value) return null;
  return (
    <p className={cn('text-xs text-muted-foreground', className)}>
      마지막 업데이트: {formatDateTimeToKorean(value)}
    </p>
  );
}

