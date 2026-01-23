import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/constants';
import { buildAuthHeaders, getAdminTokenFromRequest } from '../_utils';

// 동적 렌더링 강제 (searchParams 사용)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = getAdminTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    // 쿼리 파라미터 가져오기
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();

    const apiUrl = API_CONFIG.baseUrl;
    const notificationsUrl = `${apiUrl}/api/admin/notifications${queryString ? `?${queryString}` : ''}`;

    // Railway API로 프록시 요청 (Authorization 헤더 전달)
    const response = await fetch(notificationsUrl, {
      headers: buildAuthHeaders(token),
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
