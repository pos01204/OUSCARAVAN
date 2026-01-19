import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

/**
 * Next.js Route Handler에서 관리자 토큰을 추출합니다.
 * 우선순위: Authorization 헤더(Bearer) → 쿼리(token, SSE용) → 쿠키(admin-token)
 */
export function getAdminTokenFromRequest(request?: NextRequest): string | null {
  try {
    const header = request?.headers.get('authorization');
    if (header && header.startsWith('Bearer ')) {
      return header.substring('Bearer '.length);
    }
  } catch {
    // ignore
  }

  try {
    const tokenFromQuery = request?.nextUrl?.searchParams?.get('token');
    if (tokenFromQuery) return tokenFromQuery;
  } catch {
    // ignore
  }

  const token = cookies().get('admin-token')?.value;
  return token || null;
}

export function buildAuthHeaders(token: string | null): Record<string, string> {
  if (!token) return { 'Content-Type': 'application/json' };
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

