import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { guestApi } from '@/lib/api';
import { GuestGuideContent } from '@/components/guest/GuestGuideContent';

export default async function GuestGuidePage({
  params,
}: {
  params: { token: string };
}) {
  // 토큰으로 예약 정보 조회 (토큰 검증)
  try {
    await guestApi(params.token);
  } catch (error) {
    // 토큰이 유효하지 않으면 404 페이지
    notFound();
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
      <GuestGuideContent />
    </Suspense>
  );
}
