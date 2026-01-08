import { notFound } from 'next/navigation';
import { guestApi, type Reservation } from '@/lib/api';
import { GuestHeader } from '@/components/guest/GuestHeader';
import { Footer } from '@/components/shared/Footer';
import { GuestBottomNav } from '@/components/guest/GuestBottomNav';
import { GuestReservationInfo } from '@/components/guest/GuestReservationInfo';

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
    notFound();
  }

  // TypeScript 타입 가드: reservation이 null이면 notFound()가 호출되므로 여기서는 null이 아님
  if (!reservation) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <GuestHeader token={params.token} />
      <main className="flex-1 pb-16 pt-14 md:pb-0 md:pt-0">
        <div className="container mx-auto max-w-md px-4 py-6 md:max-w-2xl">
          {children}
        </div>
      </main>
      <Footer />
      <GuestBottomNav token={params.token} />
    </div>
  );
}
