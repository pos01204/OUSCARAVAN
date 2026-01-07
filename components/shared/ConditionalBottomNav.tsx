'use client';

import { usePathname } from 'next/navigation';
import { BottomNav } from './BottomNav';

export function ConditionalBottomNav() {
  const pathname = usePathname();
  
  // 게스트 페이지는 자체 레이아웃에서 GuestBottomNav를 렌더링하므로 여기서는 제외
  if (pathname?.startsWith('/guest/')) {
    return null;
  }
  
  return <BottomNav />;
}
