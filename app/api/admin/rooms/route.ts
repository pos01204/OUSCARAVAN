import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/constants';
import { buildAuthHeaders, getAdminTokenFromRequest } from '../_utils';

// 동적 렌더링 강제 (cookies 사용)
export const dynamic = 'force-dynamic';

const API_URL = API_CONFIG.baseUrl;

/**
 * 방 목록 조회 (배정 정보 포함)
 */
export async function GET() {
  try {
    const token = getAdminTokenFromRequest();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const response = await fetch(`${API_URL}/api/admin/rooms`, {
      method: 'GET',
      headers: buildAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'Failed to fetch rooms',
      }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    // Railway 백엔드가 배열을 직접 반환하므로 그대로 전달
    // 배열이 아닌 경우 (에러 등) 처리
    if (Array.isArray(data)) {
      return NextResponse.json(data);
    }
    // 배열이 아닌 경우 빈 배열 반환 (에러 방지)
    console.warn('[API] Rooms response is not an array:', data);
    return NextResponse.json([]);
  } catch (error) {
    console.error('[API] Failed to fetch rooms:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

/**
 * 방 추가
 */
export async function POST(request: NextRequest) {
  try {
    const token = getAdminTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${API_URL}/api/admin/rooms`, {
      method: 'POST',
      headers: buildAuthHeaders(token),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'Failed to create room',
      }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Failed to create room:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
