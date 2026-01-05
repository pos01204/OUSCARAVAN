import { notFound } from 'next/navigation';
import { guestApi, type Reservation } from '@/lib/api';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { GuestBottomNav } from '@/components/guest/GuestBottomNav';

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
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pb-16 pt-16 md:pb-0 md:pt-0">
        <div className="container mx-auto max-w-md px-4 py-6 md:max-w-2xl">
          {/* 예약 정보 표시 (Header 아래) */}
          <div className="mb-4 rounded-lg bg-muted/50 p-4">
            <p className="text-sm font-medium">
              {reservation.guestName}님 · {reservation.assignedRoom || '방 미배정'}
            </p>
            <p className="text-xs text-muted-foreground">
              체크인: {reservation.checkin} · 체크아웃: {reservation.checkout}
            </p>
          </div>
          {children}
        </div>
      </main>
      <Footer />
      <GuestBottomNav token={params.token} />
    </div>
  );
}
