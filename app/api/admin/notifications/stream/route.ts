import { NextRequest } from 'next/server';
import { API_CONFIG } from '@/lib/constants';
import { buildAuthHeaders, getAdminTokenFromRequest } from '../../_utils';

export async function GET(request: NextRequest) {
  try {
    const token = getAdminTokenFromRequest(request);
    if (!token) {
      return new Response('Unauthorized', { status: 401 });
    }

    const apiUrl = API_CONFIG.baseUrl;
    const streamUrl = `${apiUrl}/api/admin/notifications/stream`;

    // Railway API로 SSE 연결 프록시 (Authorization 헤더 전달)
    const response = await fetch(streamUrl, {
      headers: buildAuthHeaders(token),
    });

    if (!response.ok) {
      return new Response('Failed to connect to notification stream', {
        status: response.status,
      });
    }

    // SSE 스트림을 클라이언트로 전달
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('[NotificationStream] Error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
