import { NextRequest, NextResponse } from 'next/server';

/**
 * 모바일 인앱(카카오톡 등)에서만 발생하는 흰 화면/런타임 에러를 추적하기 위한 로그 수집 엔드포인트
 * - 민감정보(토큰/쿠키)는 절대 저장하지 않도록 클라이언트에서 필터링 + 서버에서도 최소 필터링
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // 서버 측 최소 마스킹(방어적)
    const safe = JSON.parse(
      JSON.stringify(body, (key, value) => {
        if (typeof key === 'string') {
          const k = key.toLowerCase();
          if (k.includes('token') || k.includes('authorization') || k.includes('cookie')) {
            return '[REDACTED]';
          }
        }
        return value;
      })
    );

    // Vercel 로그로 남김 (추적용)
    console.error('[CLIENT_LOG]', safe);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[CLIENT_LOG] failed:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

