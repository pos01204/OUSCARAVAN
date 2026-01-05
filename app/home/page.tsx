import { redirect } from 'next/navigation';

// 기존 /home 라우트는 고객 전용 페이지로 이동
// 토큰이 없으면 관리자 로그인 페이지로 리다이렉트
// 향후: URL 파라미터를 토큰으로 변환하는 로직 추가 예정
export default function HomePage() {
  redirect('/login');
}
