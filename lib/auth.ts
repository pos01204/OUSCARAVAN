/**
 * 인증 유틸리티 함수
 */

/**
 * 관리자 로그인
 */
export async function adminLogin(username: string, password: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ouscaravan-api.railway.app';
  
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  
  if (!response.ok) {
    throw new Error('로그인 실패');
  }
  
  const { token } = await response.json();
  
  // 쿠키에 토큰 저장
  if (typeof document !== 'undefined') {
    document.cookie = `admin-token=${token}; path=/; max-age=86400`; // 24시간
  }
  
  return token;
}

/**
 * 관리자 로그아웃
 */
export function adminLogout() {
  if (typeof document !== 'undefined') {
    document.cookie = 'admin-token=; path=/; max-age=0';
    window.location.href = '/login';
  }
}

/**
 * 관리자 토큰 확인
 */
export function getAdminToken(): string | null {
  if (typeof document === 'undefined') return null;
  
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('admin-token='))
    ?.split('=')[1] || null;
}
