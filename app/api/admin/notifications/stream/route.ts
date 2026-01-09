import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { API_CONFIG } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    // 인증 체크 제거 - 모든 사용자가 접근 가능

    const apiUrl = API_CONFIG.baseUrl;
    const streamUrl = `${apiUrl}/api/admin/notifications/stream`;

    // Railway API로 SSE 연결 프록시 (인증 헤더 제거)
    const response = await fetch(streamUrl, {
      headers: {},
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
