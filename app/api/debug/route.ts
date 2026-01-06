import { NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/constants';

/**
 * 디버깅용 API 엔드포인트
 * Railway API 연결 상태 및 환경 변수 확인
 */
export async function GET() {
  const apiUrl = API_CONFIG.baseUrl;
  const loginUrl = `${apiUrl}/api/auth/login`;
  const healthUrl = `${apiUrl}/health`;
  
  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'NOT SET',
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'NOT SET',
      API_URL_FROM_CONFIG: apiUrl,
    },
    urls: {
      login: loginUrl,
      health: healthUrl,
    },
    tests: {} as Record<string, any>,
  };

  // Health check 테스트
  try {
    const healthStart = Date.now();
    const healthResponse = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000), // 5초 타임아웃
    });
    const healthDuration = Date.now() - healthStart;
    
    debugInfo.tests.health = {
      success: healthResponse.ok,
      status: healthResponse.status,
      statusText: healthResponse.statusText,
      duration: `${healthDuration}ms`,
      data: healthResponse.ok ? await healthResponse.json() : null,
    };
  } catch (error) {
    debugInfo.tests.health = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      errorName: error instanceof Error ? error.name : 'Unknown',
    };
  }

  // Login API 테스트 (인증 없이 - 401 예상)
  try {
    const loginStart = Date.now();
    const loginResponse = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: 'test',
        password: 'test',
      }),
      signal: AbortSignal.timeout(5000), // 5초 타임아웃
    });
    const loginDuration = Date.now() - loginStart;
    
    let responseBody = null;
    try {
      responseBody = await loginResponse.text();
      // JSON 파싱 시도
      try {
        responseBody = JSON.parse(responseBody);
      } catch {
        // JSON이 아니면 텍스트 그대로
      }
    } catch {
      // 응답 본문 읽기 실패
    }
    
    debugInfo.tests.login = {
      success: loginResponse.ok,
      status: loginResponse.status,
      statusText: loginResponse.statusText,
      duration: `${loginDuration}ms`,
      data: responseBody,
    };
  } catch (error) {
    debugInfo.tests.login = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      errorName: error instanceof Error ? error.name : 'Unknown',
    };
  }

  return NextResponse.json(debugInfo, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
