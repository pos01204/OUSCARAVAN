import { redirect } from 'next/navigation';

export default function LoginPage() {
  // 로그인 페이지 접근 시 관리자 페이지로 리다이렉트
  redirect('/admin');
}
