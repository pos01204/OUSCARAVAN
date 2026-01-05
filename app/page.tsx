import { redirect } from 'next/navigation';

export default function RootPage() {
  // 루트 페이지 접근 시 관리자 로그인 페이지로 리다이렉트
  // 고객은 알림톡 링크를 통해 /guest/[token]으로 직접 접근
  redirect('/login');
}
