'use client';

import { formatDateTimeToKorean } from '@/lib/utils/date';
import { cn } from '@/lib/utils';

interface LastUpdatedAtProps {
  value: Date | string | null | undefined;
  className?: string;
  /** 간결한 형식 (모바일용) */
  compact?: boolean;
}

export function LastUpdatedAt({ value, className, compact }: LastUpdatedAtProps) {
  if (!value) return null;
  
  const formatted = formatDateTimeToKorean(value);
  
  return (
    <p className={cn('text-xs text-muted-foreground whitespace-nowrap', className)}>
      {compact ? formatted : `마지막 업데이트: ${formatted}`}
    </p>
  );
}

