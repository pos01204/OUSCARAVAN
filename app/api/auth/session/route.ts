import { NextRequest, NextResponse } from 'next/server';

/**
 * 클라이언트가 받은 JWT를 서버가 httpOnly 쿠키로 세팅해주는 엔드포인트.
 * 웹뷰에서 JS로 cookie/localStorage가 불안정할 수 있어, Set-Cookie 기반으로도 세팅해 안정성을 올린다.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const token = typeof body.token === 'string' ? body.token : null;
    const expiresIn = typeof body.expiresIn === 'number' ? body.expiresIn : 7 * 24 * 60 * 60;

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: expiresIn,
    });

    return res;
  } catch (error) {
    console.error('[AuthSession] Failed to set session cookie:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

