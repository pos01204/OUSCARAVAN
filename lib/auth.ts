'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { API_CONFIG } from './constants';

/**
 * 관리자 로그인 (서버 액션)
 * Railway 백엔드 API를 통해 JWT 토큰을 받아옵니다.
 */
export async function adminLogin(formData: FormData) {
  const id = formData.get('id');
  const password = formData.get('password');

  if (!id || !password) {
    redirect('/login?error=invalid_credentials');
  }

  try {
    // Railway 백엔드 API로 로그인 요청
    const apiUrl = API_CONFIG.baseUrl;
    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: id.toString(),
        password: password.toString(),
      }),
    });

    if (!response.ok) {
      // 인증 실패
      redirect('/login?error=invalid_credentials');
    }

    // JWT 토큰 받기
    const data = await response.json();
    const token = data.token;

    if (!token) {
      redirect('/login?error=invalid_credentials');
    }

    // 쿠키에 토큰 저장
    cookies().set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: data.expiresIn || 60 * 60 * 24 * 7, // API에서 받은 만료 시간 또는 기본 1주일
      path: '/',
      sameSite: 'lax',
    });
    
    redirect('/admin');
  } catch (error) {
    // 네트워크 오류 등
    console.error('Login error:', error);
    redirect('/login?error=network_error');
  }
}

/**
 * 관리자 로그아웃
 */
export async function adminLogout() {
  cookies().delete('admin-token');
  redirect('/login');
}
