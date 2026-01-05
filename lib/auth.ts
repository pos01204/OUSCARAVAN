'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// 임시 관리자 로그인 정보
const ADMIN_CREDENTIALS = {
  id: 'ouscaravan',
  password: '123456789a',
};

/**
 * 관리자 로그인 (서버 액션)
 */
export async function adminLogin(formData: FormData) {
  const id = formData.get('id');
  const password = formData.get('password');

  // 임시 인증 로직 (Railway 백엔드 API 연동 전)
  if (id === ADMIN_CREDENTIALS.id && password === ADMIN_CREDENTIALS.password) {
    // 임시 토큰 생성 (향후 JWT로 대체)
    const token = `admin-token-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    cookies().set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
      sameSite: 'lax',
    });
    
    redirect('/admin');
  } else {
    // 인증 실패 시 에러와 함께 리다이렉트
    redirect('/login?error=invalid_credentials');
  }
}

/**
 * 관리자 로그아웃
 */
export async function adminLogout() {
  cookies().delete('admin-token');
  redirect('/login');
}
