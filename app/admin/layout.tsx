import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { adminLogout } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { AdminMobileNav } from '@/components/admin/AdminMobileNav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;
  
  // 인증 체크 (미들웨어에서도 처리하지만 이중 체크)
  if (!token) {
    redirect('/login');
  }
  
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card" aria-label="주요 네비게이션">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-lg font-semibold" aria-label="OUSCARAVAN 관리자 홈">
              OUSCARAVAN 관리자
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
            {/* 모바일 네비게이션 */}
            <AdminMobileNav />
          </div>
          <form action={async () => {
            'use server';
            cookies().delete('admin-token');
            redirect('/login');
          }}>
            <Button type="submit" variant="outline" size="sm" aria-label="로그아웃">
              로그아웃
            </Button>
          </form>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8" role="main">
        {children}
      </main>
    </div>
  );
}
