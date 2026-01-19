'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated, getToken } from '@/lib/auth-client';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * 인증 상태 확인 래퍼 컴포넌트
 * 
 * @description
 * 관리자 페이지 접근 시 인증 상태를 확인하고,
 * 인증되지 않은 경우 로그인 페이지로 리다이렉트합니다.
 * 
 * 웹뷰 호환을 위해 localStorage 기반 토큰 확인을 사용합니다.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    // 클라이언트에서 인증 상태 확인
    const checkAuth = () => {
      console.log('[AuthGuard] Checking authentication status...');
      
      const authenticated = isAuthenticated();
      const token = getToken();
      
      console.log('[AuthGuard] Authentication result:', {
        authenticated,
        hasToken: !!token,
        pathname,
      });
      
      if (!authenticated) {
        console.log('[AuthGuard] Not authenticated, redirecting to login');
        // 현재 경로를 쿼리 파라미터로 전달 (로그인 후 돌아오기 위해)
        const returnUrl = encodeURIComponent(pathname);
        router.replace(`/login?returnUrl=${returnUrl}`);
        return;
      }
      
      console.log('[AuthGuard] Authentication successful');
      setIsAuthed(true);
      setIsChecking(false);
    };
    
    // 약간의 지연 후 체크 (hydration 완료 대기)
    const timer = setTimeout(checkAuth, 100);
    
    return () => clearTimeout(timer);
  }, [router, pathname]);

  // 인증 확인 중 로딩 표시
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  // 인증되지 않은 경우 (리다이렉트 중)
  if (!isAuthed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">로그인 페이지로 이동 중...</p>
        </div>
      </div>
    );
  }

  // 인증된 경우 children 렌더링
  return <>{children}</>;
}
