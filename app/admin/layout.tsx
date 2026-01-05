import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { adminLogout } from '@/lib/auth';
import { Button } from '@/components/ui/button';

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
      <nav className="border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-lg font-semibold">
              OUSCARAVAN 관리자
            </Link>
            <div className="flex gap-4">
              <Link
                href="/admin"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                대시보드
              </Link>
              <Link
                href="/admin/reservations"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                예약 관리
              </Link>
              <Link
                href="/admin/rooms"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                방 관리
              </Link>
              <Link
                href="/admin/orders"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                주문 관리
              </Link>
            </div>
          </div>
          <form action={async () => {
            'use server';
            cookies().delete('admin-token');
            redirect('/login');
          }}>
            <Button type="submit" variant="outline" size="sm">
              로그아웃
            </Button>
          </form>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
