'use client';

import { usePathname } from 'next/navigation';
import { ConditionalHeader } from './ConditionalHeader';
import { ConditionalFooter } from './ConditionalFooter';
import { ConditionalBottomNav } from './ConditionalBottomNav';

interface RootLayoutWrapperProps {
  children: React.ReactNode;
}

export function RootLayoutWrapper({ children }: RootLayoutWrapperProps) {
  const pathname = usePathname();
  // /admin 또는 /admin/으로 시작하는 모든 경로 체크
  const isAdminPage = pathname === '/admin' || pathname?.startsWith('/admin/');
  const isGuestPage = pathname?.startsWith('/guest/');

  // 관리자 페이지나 게스트 페이지는 자체 레이아웃을 사용하므로 루트 레이아웃 구조를 적용하지 않음
  if (isAdminPage || isGuestPage) {
    return <>{children}</>;
  }

  // 일반 페이지는 루트 레이아웃 구조 적용
  return (
    <>
      <ConditionalHeader />
      <main className="flex flex-1 flex-col pb-16 pt-16 md:pb-0 md:pt-0">
        <div className="container mx-auto max-w-md flex-1 px-4 py-6 md:max-w-2xl">
          {children}
        </div>
        <ConditionalFooter />
      </main>
      <ConditionalBottomNav />
    </>
  );
}
