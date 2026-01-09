import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 로그인 페이지 접근 시 관리자 페이지로 리다이렉트
  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }
  
  // 관리자 페이지는 인증 없이 접근 가능 (임시)
  // 고객 페이지는 토큰 검증을 서버 컴포넌트에서 처리
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/guest/:path*',
    '/login'
  ]
};
