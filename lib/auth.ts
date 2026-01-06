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
    console.error('[LOGIN] Missing credentials');
    redirect('/login?error=invalid_credentials');
  }

  // Railway 백엔드 API로 로그인 요청
  const apiUrl = API_CONFIG.baseUrl;
  const loginUrl = `${apiUrl}/api/auth/login`;
  
  // 환경 변수 및 설정 로깅 (Vercel Functions 로그에 표시)
  console.log('[LOGIN] Starting login process');
  console.log('[LOGIN] Environment check:', {
    hasApiUrl: !!process.env.NEXT_PUBLIC_API_URL,
    apiUrlFromEnv: process.env.NEXT_PUBLIC_API_URL || 'NOT SET',
    apiUrlFromConfig: apiUrl,
    nodeEnv: process.env.NODE_ENV,
    loginUrl: loginUrl,
  });
  
  try {
    // 타임아웃 설정 (10초)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.error('[LOGIN] Request timeout after 10 seconds');
      controller.abort();
    }, 10000);
    
    console.log('[LOGIN] Sending request to:', loginUrl);
    console.log('[LOGIN] Request body:', { id: id.toString(), password: '***' });
    
    const startTime = Date.now();
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: id.toString(),
        password: password.toString(),
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;
    
    console.log('[LOGIN] Response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      duration: `${duration}ms`,
      headers: Object.fromEntries(response.headers.entries()),
    });

    if (!response.ok) {
      // 응답 본문 읽기 시도
      let errorBody = '';
      try {
        errorBody = await response.text();
        console.error('[LOGIN] Error response body:', errorBody);
      } catch (e) {
        console.error('[LOGIN] Failed to read error response body');
      }
      
      console.error('[LOGIN] Authentication failed:', {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorBody.substring(0, 200), // 처음 200자만
      });
      
      // 인증 실패
      redirect('/login?error=invalid_credentials');
    }

    // JWT 토큰 받기
    let data;
    try {
      data = await response.json();
      console.log('[LOGIN] Response data received:', {
        hasToken: !!data.token,
        tokenLength: data.token?.length || 0,
        expiresIn: data.expiresIn,
      });
    } catch (e) {
      console.error('[LOGIN] Failed to parse response JSON:', e);
      redirect('/login?error=network_error');
    }
    
    const token = data.token;

    if (!token) {
      console.error('[LOGIN] No token in response:', data);
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
    
    console.log('[LOGIN] Login successful, redirecting to /admin');
    redirect('/admin');
  } catch (error) {
    // 네트워크 오류 등
    const errorDetails = {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      cause: error instanceof Error && 'cause' in error ? error.cause : undefined,
    };
    
    console.error('[LOGIN] Login error occurred:', errorDetails);
    console.error('[LOGIN] API URL used:', apiUrl);
    console.error('[LOGIN] Login URL used:', loginUrl);
    console.error('[LOGIN] Environment variables:', {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT SET',
    });
    
    // 타임아웃 에러인지 확인
    if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('timeout'))) {
      console.error('[LOGIN] Timeout error detected');
      redirect('/login?error=timeout');
    }
    
    // 네트워크 에러인지 확인
    if (error instanceof Error && (
      error.message.includes('fetch') || 
      error.message.includes('network') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ENOTFOUND') ||
      error.message.includes('ETIMEDOUT')
    )) {
      console.error('[LOGIN] Network error detected:', error.message);
      redirect('/login?error=network_error');
    }
    
    console.error('[LOGIN] Unknown error, redirecting to network_error');
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
