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
      contentType: response.headers.get('content-type'),
    });

    // 응답 상태 확인
    if (!response.ok) {
      // 에러 응답 본문 읽기
      let errorBody = '';
      try {
        errorBody = await response.text();
        console.error('[LOGIN] Authentication failed:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorBody.substring(0, 200),
        });
      } catch (e) {
        console.error('[LOGIN] Failed to read error response body:', e);
      }
      
      // 인증 실패 - redirect는 try-catch 밖에서 호출
      throw new Error('AUTH_FAILED');
    }

    // 성공 응답 본문 읽기
    let responseText = '';
    try {
      responseText = await response.text();
      console.log('[LOGIN] Response body (text):', {
        length: responseText.length,
        preview: responseText.substring(0, 200),
        isEmpty: responseText.length === 0,
      });
    } catch (e) {
      console.error('[LOGIN] Failed to read response body:', e);
      throw new Error('RESPONSE_READ_FAILED');
    }

    // JWT 토큰 받기
    let data;
    try {
      // 텍스트를 JSON으로 파싱
      if (!responseText || responseText.length === 0) {
        throw new Error('Response body is empty');
      }
      
      data = JSON.parse(responseText);
      console.log('[LOGIN] Response data received:', {
        hasToken: !!data.token,
        tokenLength: data.token?.length || 0,
        expiresIn: data.expiresIn,
        dataKeys: Object.keys(data),
      });
    } catch (e) {
      console.error('[LOGIN] Failed to parse response JSON:', {
        error: e instanceof Error ? e.message : String(e),
        responseText: responseText.substring(0, 500),
        contentType: response.headers.get('content-type'),
      });
      throw new Error('JSON_PARSE_FAILED');
    }
    
    const token = data.token;

    if (!token) {
      console.error('[LOGIN] No token in response:', data);
      throw new Error('NO_TOKEN_IN_RESPONSE');
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
    // redirect는 try-catch 밖에서 호출
    throw new Error('LOGIN_SUCCESS');
  } catch (error) {
    // 로그인 성공 - redirect
    if (error instanceof Error && error.message === 'LOGIN_SUCCESS') {
      redirect('/admin');
      return; // redirect는 예외를 던지므로 여기 도달하지 않음
    }

    // 인증 실패
    if (error instanceof Error && error.message === 'AUTH_FAILED') {
      redirect('/login?error=invalid_credentials');
      return;
    }

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
      return;
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
      return;
    }

    // 응답 파싱 실패
    if (error instanceof Error && (
      error.message === 'RESPONSE_READ_FAILED' ||
      error.message === 'JSON_PARSE_FAILED' ||
      error.message === 'NO_TOKEN_IN_RESPONSE'
    )) {
      console.error('[LOGIN] Response processing failed:', error.message);
      redirect('/login?error=network_error');
      return;
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
