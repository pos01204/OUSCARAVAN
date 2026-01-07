'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './Footer';

export function ConditionalFooter() {
  const pathname = usePathname();
  
  // 게스트 페이지는 자체 레이아웃에서 Footer를 렌더링하므로 여기서는 제외
  if (pathname?.startsWith('/guest/')) {
    return null;
  }
  
  return <Footer />;
}
