import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { guestApi, type Reservation } from '@/lib/api';
import { GuestHomeContent } from '@/components/guest/GuestHomeContent';

import { GuestHomeSkeleton } from '@/components/guest/GuestHomeSkeleton';

export const dynamic = 'force-dynamic';

export default async function GuestHomePage({
  params,
}: {
  params: { token: string };
}) {
  // 토큰으로 예약 정보 조회
  let reservation: Reservation | null = null;

  try {
    reservation = await guestApi(params.token, '', {
      cache: 'no-store',
    });
  } catch (error) {
    // 토큰이 유효하지 않으면 404 페이지
    notFound();
  }

  // TypeScript 타입 가드: reservation이 null이면 notFound()가 호출되므로 여기서는 null이 아님
  if (!reservation) {
    notFound();
  }

  return (
    <Suspense fallback={<GuestHomeSkeleton />}>
      <GuestHomeContent reservation={reservation} token={params.token} />
    </Suspense>
  );
}
