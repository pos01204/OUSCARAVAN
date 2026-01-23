import { notFound } from 'next/navigation';
import { guestApi, type Reservation } from '@/lib/api';
import { GuestHeader } from '@/components/guest/GuestHeader';
import { Footer } from '@/components/shared/Footer';
import { GuestBottomNav } from '@/components/guest/GuestBottomNav';
import { GuestReservationInfo } from '@/components/guest/GuestReservationInfo';
import { RetryablePageError } from '@/components/shared/RetryablePageError';
import { ApiError } from '@/types';
import { NetworkStatusBanner } from '@/components/shared/NetworkStatusBanner';

export default async function GuestLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { token: string };
}) {
  // 토큰으로 예약 정보 조회
  let reservation: Reservation | null = null;

  try {
    reservation = await guestApi(params.token);
  } catch (error) {
    // 토큰이 유효하지 않으면 404 페이지
    if (error instanceof ApiError && (error.status === 401 || error.status === 404)) {
      notFound();
    }
    const message = error instanceof Error ? error.message : '예약 정보를 불러오지 못했어요. 다시 시도해주세요.';
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <GuestHeader token={params.token} />
        <main className="flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-14 md:pb-0 md:pt-0">
          <div className="container mx-auto max-w-md px-4 py-6 md:max-w-2xl">
            <RetryablePageError title="예약 정보를 불러오지 못했어요" description={message} />
          </div>
        </main>
        <Footer />
        <GuestBottomNav token={params.token} />
      </div>
    );
  }

  // TypeScript 타입 가드: reservation이 null이면 notFound()가 호출되므로 여기서는 null이 아님
  if (!reservation) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <GuestHeader token={params.token} />
      <main className="flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-14 md:pb-0 md:pt-0">
        <div className="container mx-auto max-w-md px-4 py-6 md:max-w-2xl">
          <NetworkStatusBanner />
          {children}
        </div>
      </main>
      <Footer />
      <GuestBottomNav token={params.token} />
    </div>
  );
}
