'use client';

import { usePathname } from 'next/navigation';
import { ConditionalHeader } from './ConditionalHeader';
import { ConditionalFooter } from './ConditionalFooter';
import { ConditionalBottomNav } from './ConditionalBottomNav';
import { ServiceWorkerInitializer } from './ServiceWorkerInitializer';

interface RootLayoutWrapperProps {
  children: React.ReactNode;
}

export function RootLayoutWrapper({ children }: RootLayoutWrapperProps) {
  const pathname = usePathname();
  // /admin 또는 /admin/으로 시작하는 모든 경로 체크
  const isAdminPage = pathname === '/admin' || pathname?.startsWith('/admin/');
  const isGuestPage = pathname?.startsWith('/guest/');

  // Service Worker는 모든 페이지에서 초기화
  return (
    <>
      <ServiceWorkerInitializer />
      {isAdminPage || isGuestPage ? (
        <>{children}</>
      ) : (
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
      )}
    </>
  );

