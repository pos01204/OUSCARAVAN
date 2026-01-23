'use client';

import { useRouter } from 'next/navigation';
import { clearToken } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

/**
 * 로그아웃 버튼 컴포넌트
 * 
 * @description
 * 클릭 시 localStorage의 토큰을 삭제하고 로그인 페이지로 이동합니다.
 */
export function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    console.log('[LogoutButton] Logging out...');
    
    // 토큰 삭제
    clearToken();
    
    // 로그인 페이지로 이동
    router.push('/login');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className="text-muted-foreground hover:text-foreground"
      aria-label="로그아웃"
    >
      <LogOut className="w-4 h-4 md:mr-2" />
      <span className="hidden md:inline">로그아웃</span>
    </Button>
  );
}
