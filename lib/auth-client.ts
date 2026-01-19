/**
 * 클라이언트 사이드 인증 유틸리티
 * 웹뷰 호환을 위해 localStorage 기반 토큰 관리
 * 
 * @description
 * httpOnly 쿠키 대신 localStorage를 사용하여 웹뷰(카카오톡, 네이버 등)에서도
 * 안정적으로 인증 상태를 유지할 수 있도록 합니다.
 */

const TOKEN_KEY = 'admin-token';
const TOKEN_EXPIRY_KEY = 'admin-token-expiry';

/**
 * 토큰 저장
 * @param token - JWT 토큰
 * @param expiresIn - 만료 시간 (초 단위, 기본 7일)
 */
export function saveToken(token: string, expiresIn: number = 7 * 24 * 60 * 60): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(TOKEN_KEY, token);
    
    // 만료 시간 저장 (현재 시간 + expiresIn 초)
    const expiryTime = Date.now() + (expiresIn * 1000);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    
    console.log('[AuthClient] Token saved successfully');
    console.log('[AuthClient] Token expires at:', new Date(expiryTime).toLocaleString());
  } catch (error) {
    console.error('[AuthClient] Failed to save token:', error);
  }
}

/**
 * 토큰 조회
 * @returns 유효한 토큰 또는 null
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    
    // 토큰이 없으면 null
    if (!token) {
      return null;
    }
    
    // 만료 시간 확인
    if (expiry) {
      const expiryTime = parseInt(expiry, 10);
      if (Date.now() > expiryTime) {
        console.log('[AuthClient] Token expired, clearing');
        clearToken();
        return null;
      }
    }
    
    return token;
  } catch (error) {
    console.error('[AuthClient] Failed to get token:', error);
    return null;
  }
}

/**
 * 토큰 삭제
 */
export function clearToken(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    console.log('[AuthClient] Token cleared');
  } catch (error) {
    console.error('[AuthClient] Failed to clear token:', error);
  }
}

/**
 * 로그인 상태 확인
 * @returns 로그인 여부
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * Authorization 헤더 객체 생성
 * @returns Authorization 헤더 객체 또는 빈 객체
 */
export function getAuthHeader(): { Authorization: string } | Record<string, never> {
  const token = getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

/**
 * 토큰 만료까지 남은 시간 (밀리초)
 * @returns 남은 시간 (밀리초) 또는 null (토큰 없음)
 */
export function getTokenRemainingTime(): number | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiry) return null;
    
    const expiryTime = parseInt(expiry, 10);
    const remaining = expiryTime - Date.now();
    
    return remaining > 0 ? remaining : 0;
  } catch (error) {
    console.error('[AuthClient] Failed to get remaining time:', error);
    return null;
  }
}

/**
 * 토큰 갱신 필요 여부 확인
 * 만료 1시간 전부터 갱신 권장
 * @returns 갱신 필요 여부
 */
export function shouldRefreshToken(): boolean {
  const remaining = getTokenRemainingTime();
  if (remaining === null) return false;
  
  // 1시간 = 3600000 밀리초
  const ONE_HOUR = 60 * 60 * 1000;
  return remaining < ONE_HOUR;
}
