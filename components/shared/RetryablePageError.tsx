'use client';

import { useRouter } from 'next/navigation';
import { ErrorState } from '@/components/shared/ErrorState';

interface RetryablePageErrorProps {
  title?: string;
  description?: string;
  retryLabel?: string;
}

export function RetryablePageError({
  title = '데이터를 불러오지 못했어요',
  description = '네트워크 상태를 확인한 뒤 다시 시도해주세요.',
  retryLabel = '새로고침',
}: RetryablePageErrorProps) {
  const router = useRouter();

  return (
    <div className="py-6">
      <ErrorState
        title={title}
        description={description}
        retryLabel={retryLabel}
        onRetry={() => router.refresh()}
      />
    </div>
  );
}

