import Link from 'next/link';
import { AdminBottomNav } from '@/components/admin/AdminBottomNav';
import { NotificationBell } from '@/components/admin/notifications/NotificationBell';
import { AdminNotificationSetup } from '@/components/admin/AdminNotificationSetup';
import { AuthGuard } from '@/components/admin/AuthGuard';
import { LogoutButton } from '@/components/admin/LogoutButton';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background pb-16 md:pb-0">
        {/* 모바일: 간소화된 헤더 (로고와 로그아웃만) */}
        <nav className="border-b bg-card md:border-b" aria-label="주요 네비게이션">
          <div className="container mx-auto flex h-14 md:h-16 items-center justify-between px-4">
            <div className="flex items-center gap-3 md:gap-6">
              <Link href="/admin" className="text-base md:text-lg font-semibold" aria-label="OUSCARAVAN 관리자 홈">
                <span className="hidden md:inline">OUSCARAVAN 관리자</span>
                <span className="md:hidden">관리자</span>
              </Link>
              {/* 데스크톱 네비게이션 */}
              <div className="hidden gap-4 md:flex">
                <Link
                  href="/admin"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="대시보드로 이동"
                >
                  대시보드
                </Link>
                <Link
                  href="/admin/reservations"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="예약 관리로 이동"
                >
                  예약 관리
                </Link>
                <Link
                  href="/admin/rooms"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="방 관리로 이동"
                >
                  방 관리
                </Link>
                <Link
                  href="/admin/orders"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="주문 관리로 이동"
                >
                  주문 관리
                </Link>
              </div>
              {/* 모바일 네비게이션 (햄버거 메뉴 제거, 바텀 네비게이션으로 대체) */}
              <div className="md:hidden"></div>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <LogoutButton />
            </div>
          </div>
        </nav>
        <main className="container mx-auto px-4 py-4 md:py-8" role="main">
          <AdminNotificationSetup />
          {children}
        </main>
        {/* 모바일 바텀 네비게이션 */}
        <AdminBottomNav />
      </div>
    </AuthGuard>
  );
}
