import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 주의: /login을 /admin으로 강제 리다이렉트하면
  // AuthGuard(미인증) → /login → middleware → /admin → AuthGuard 루프가 발생할 수 있음.
  // 웹뷰 호환을 위해 로그인 페이지는 항상 접근 가능하게 둔다.

  // 모바일 인앱 브라우저(카카오톡 등)에서 쿠키 정책이 불안정할 수 있어,
  // middleware에서 /admin을 쿠키로 강제 차단하지 않습니다.
  // 인증은 클라이언트(AuthGuard) + Authorization 헤더 기반 내부 API로 처리합니다.
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/guest/:path*',
    '/login'
  ]
};
