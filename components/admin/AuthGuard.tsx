'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated, getToken } from '@/lib/auth-client';
import { Loader2 } from 'lucide-react';

function isKakaoInAppBrowser() {
  if (typeof navigator === 'undefined') return false;
  return /KAKAOTALK/i.test(navigator.userAgent);
}

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
        const loginUrl = `/login?returnUrl=${returnUrl}`;
        // 라우터 리다이렉트 시도
        router.replace(loginUrl);
        // 웹뷰에서 router.replace가 간헐적으로 실패/지연될 수 있어 window.location 폴백 적용
        if (typeof window !== 'undefined') {
          window.location.replace(loginUrl);
        }
        // 상태를 종료 상태로 변경하여 '인증 확인 중...'에서 고정되지 않도록 함
        setIsAuthed(false);
        setIsChecking(false);
        return;
      }

      // 인증은 되었지만, 카카오 인앱 브라우저에서 반복적인 화이트스크린/쿠키 정책 문제가 발생하는 경우가 있어
      // 관리자 영역은 외부 브라우저 사용을 권장(원천 회피 옵션)
      // 필요 시 아래 리다이렉트를 활성화할 수 있음.
      // 현재는 오류 재현 시 추적을 위해 강제 차단 대신 안내 페이지로 선택 이동.
      if (isKakaoInAppBrowser()) {
        // 인앱에서 문제가 계속된다면, 아래 한 줄을 주석 해제해 강제 안내 페이지로 보낼 수 있음.
        // window.location.replace(`/inapp?returnUrl=${encodeURIComponent(pathname)}`);
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
