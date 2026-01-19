import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/constants';
import { buildAuthHeaders, getAdminTokenFromRequest } from '../../_utils';

export const dynamic = 'force-dynamic';

const API_URL = API_CONFIG.baseUrl;

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getAdminTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${API_URL}/api/admin/announcements/${params.id}`, {
      method: 'PATCH',
      headers: buildAuthHeaders(token),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || '공지를 수정하지 못했습니다.', code: errorData.code || 'API_ERROR' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Announcements API] Error:', error);
    return NextResponse.json(
      { error: '공지를 수정하지 못했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getAdminTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const response = await fetch(`${API_URL}/api/admin/announcements/${params.id}`, {
      method: 'DELETE',
      headers: buildAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || '공지를 삭제하지 못했습니다.', code: errorData.code || 'API_ERROR' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Announcements API] Error:', error);
    return NextResponse.json(
      { error: '공지를 삭제하지 못했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
