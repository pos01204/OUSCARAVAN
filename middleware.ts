import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 관리자 페이지 접근 제어
  if (pathname.startsWith('/admin')) {
    // 로그인 페이지는 제외
    if (pathname === '/admin/login' || pathname === '/login') {
      return NextResponse.next();
    }
    
    // 쿠키에서 토큰 확인
    const token = request.cookies.get('admin-token')?.value;
    
    // 토큰이 없으면 로그인 페이지로 리다이렉트
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // 고객 페이지는 토큰 검증을 서버 컴포넌트에서 처리
  // 미들웨어에서는 별도 처리 불필요
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/guest/:path*',
    '/login'
  ]
};
