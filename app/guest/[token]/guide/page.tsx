import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { guestApi, type Reservation } from '@/lib/api';
import { GuestGuideContent } from '@/components/guest/GuestGuideContent';
import { RetryablePageError } from '@/components/shared/RetryablePageError';
import { ApiError } from '@/types';

export default async function GuestGuidePage({
  params,
}: {
  params: { token: string };
}) {
  let reservation: Reservation | null = null;
  
  // 토큰으로 예약 정보 조회 (토큰 검증)
  try {
    reservation = await guestApi(params.token);
  } catch (error) {
    // 토큰이 유효하지 않으면 404 페이지
    if (error instanceof ApiError && (error.status === 401 || error.status === 404)) {
      notFound();
    }
    const message = error instanceof Error ? error.message : '예약 정보를 불러오지 못했어요. 다시 시도해주세요.';
    return <RetryablePageError title="이용 안내서를 불러오지 못했어요" description={message} />;
  }
  
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        </div>
      }
    >
      <GuestGuideContent token={params.token} assignedRoom={reservation?.assignedRoom} />
    </Suspense>
  );
}
