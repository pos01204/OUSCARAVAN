import { redirect } from 'next/navigation';

// 기존 /help 라우트는 고객 전용 페이지로 이동
// 토큰이 없으면 관리자 로그인 페이지로 리다이렉트
export default function HelpPage() {
  redirect('/login');
}
