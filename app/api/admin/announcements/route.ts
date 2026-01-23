import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/constants';
import { buildAuthHeaders, getAdminTokenFromRequest } from '../_utils';

export const dynamic = 'force-dynamic';

const API_URL = API_CONFIG.baseUrl;

export async function GET(request: NextRequest) {
  try {
    const token = getAdminTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();

    const response = await fetch(`${API_URL}/api/admin/announcements${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: buildAuthHeaders(token),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || '공지를 불러오는데 실패했습니다.', code: errorData.code || 'API_ERROR' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Announcements API] Error:', error);
    return NextResponse.json(
      { error: '공지를 불러오는데 실패했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getAdminTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${API_URL}/api/admin/announcements`, {
      method: 'POST',
      headers: buildAuthHeaders(token),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || '공지를 생성하지 못했습니다.', code: errorData.code || 'API_ERROR' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Announcements API] Error:', error);
    return NextResponse.json(
      { error: '공지를 생성하지 못했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
