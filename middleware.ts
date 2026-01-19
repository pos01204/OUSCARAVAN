import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 주의: /login을 /admin으로 강제 리다이렉트하면
  // AuthGuard(미인증) → /login → middleware → /admin → AuthGuard 루프가 발생할 수 있음.
  // 웹뷰 호환을 위해 로그인 페이지는 항상 접근 가능하게 둔다.

  // /admin은 서버 렌더링 단계에서 먼저 보호한다.
  // (미들웨어에서 차단하지 않으면, 서버 컴포넌트가 인증 없이 API를 호출하다가 401/예외로 error.tsx가 뜰 수 있음)
  if (pathname.startsWith('/admin')) {
    const tokenCookie = request.cookies.get('admin-token')?.value;
    if (!tokenCookie) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/guest/:path*',
    '/login'
  ]
};
