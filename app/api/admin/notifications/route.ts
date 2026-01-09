import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_CONFIG } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    // 인증 체크 제거 - 모든 사용자가 접근 가능

    // 쿼리 파라미터 가져오기
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();

    const apiUrl = API_CONFIG.baseUrl;
    const notificationsUrl = `${apiUrl}/api/admin/notifications${queryString ? `?${queryString}` : ''}`;

    // Railway API로 프록시 요청 (인증 헤더 제거)
    const response = await fetch(notificationsUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || '알림을 불러오는데 실패했습니다.', code: errorData.code || 'API_ERROR' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Notifications API] Error:', error);
    return NextResponse.json(
      { error: '알림을 불러오는데 실패했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
