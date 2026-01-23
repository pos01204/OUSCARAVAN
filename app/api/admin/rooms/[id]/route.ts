import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/constants';
import { buildAuthHeaders, getAdminTokenFromRequest } from '../../_utils';

// 동적 렌더링 강제 (cookies 사용)
export const dynamic = 'force-dynamic';

const API_URL = API_CONFIG.baseUrl;

/**
 * 방 수정
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getAdminTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${API_URL}/api/admin/rooms/${params.id}`, {
      method: 'PATCH',
      headers: buildAuthHeaders(token),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'Failed to update room',
      }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Failed to update room:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

/**
 * 방 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getAdminTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const response = await fetch(`${API_URL}/api/admin/rooms/${params.id}`, {
      method: 'DELETE',
      headers: buildAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'Failed to delete room',
      }));
      return NextResponse.json(errorData, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Failed to delete room:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
