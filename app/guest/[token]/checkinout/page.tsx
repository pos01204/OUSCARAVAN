import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { guestApi, type Reservation } from '@/lib/api';
import { GuestCheckInOutContent } from '@/components/guest/GuestCheckInOutContent';

export default async function GuestCheckInOutPage({
  params,
}: {
  params: { token: string };
}) {
  // 토큰으로 예약 정보 조회
  let reservation: Reservation | null = null;
  
  try {
    reservation = await guestApi(params.token);
  } catch (error) {
    // 토큰이 유효하지 않으면 404 페이지
    notFound();
  }
  
  // TypeScript 타입 가드
  if (!reservation) {
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
      <GuestCheckInOutContent reservation={reservation} token={params.token} />
    </Suspense>
  );
}
