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

function isBrowser() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function safeGetStorage(type: 'localStorage' | 'sessionStorage'): Storage | null {
  if (!isBrowser()) return null;
  try {
    const storage = window[type];
    // iOS Safari/일부 웹뷰에서 quota/권한 문제를 조기에 감지하기 위한 probe
    const probeKey = '__storage_probe__';
    storage.setItem(probeKey, '1');
    storage.removeItem(probeKey);
    return storage;
  } catch {
    return null;
  }
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (!isBrowser()) return;
  try {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    // 웹뷰 호환성 우선: SameSite=Lax
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;
  } catch (error) {
    console.error('[AuthClient] Failed to set cookie:', error);
  }
}

function getCookie(name: string): string | null {
  if (!isBrowser()) return null;
  try {
    const encodedName = encodeURIComponent(name) + '=';
    const parts = document.cookie.split(';').map(p => p.trim());
    for (const part of parts) {
      if (part.startsWith(encodedName)) {
        return decodeURIComponent(part.substring(encodedName.length));
      }
    }
    return null;
  } catch (error) {
    console.error('[AuthClient] Failed to get cookie:', error);
    return null;
  }
}

function deleteCookie(name: string) {
  if (!isBrowser()) return;
  try {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${encodeURIComponent(name)}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
  } catch (error) {
    console.error('[AuthClient] Failed to delete cookie:', error);
  }
}

/**
 * 토큰 저장
 * @param token - JWT 토큰
 * @param expiresIn - 만료 시간 (초 단위, 기본 7일)
 */
export function saveToken(token: string, expiresIn: number = 7 * 24 * 60 * 60): void {
  if (!isBrowser()) return;
  
  try {
    // 만료 시간 저장 (현재 시간 + expiresIn 초)
    const expiryTime = Date.now() + (expiresIn * 1000);
    const expiryValue = expiryTime.toString();

    // 1) localStorage
    const ls = safeGetStorage('localStorage');
    if (ls) {
      ls.setItem(TOKEN_KEY, token);
      ls.setItem(TOKEN_EXPIRY_KEY, expiryValue);
      console.log('[AuthClient] Token saved to localStorage');
    } else {
      console.log('[AuthClient] localStorage not available');
    }

    // 2) sessionStorage (localStorage가 막힌 웹뷰 대비)
    const ss = safeGetStorage('sessionStorage');
    if (ss) {
      ss.setItem(TOKEN_KEY, token);
      ss.setItem(TOKEN_EXPIRY_KEY, expiryValue);
      console.log('[AuthClient] Token saved to sessionStorage');
    } else {
      console.log('[AuthClient] sessionStorage not available');
    }

    // 3) cookie (스토리지 둘 다 막힌 웹뷰 대비 + 서버 폴백)
    setCookie(TOKEN_KEY, token, expiresIn);
    setCookie(TOKEN_EXPIRY_KEY, expiryValue, expiresIn);
    console.log('[AuthClient] Token saved to cookie');

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
  try {
    if (!isBrowser()) return null;

    // 조회 우선순위: localStorage -> sessionStorage -> cookie
    const ls = safeGetStorage('localStorage');
    const ss = safeGetStorage('sessionStorage');

    const token =
      ls?.getItem(TOKEN_KEY) ??
      ss?.getItem(TOKEN_KEY) ??
      getCookie(TOKEN_KEY);

    const expiry =
      ls?.getItem(TOKEN_EXPIRY_KEY) ??
      ss?.getItem(TOKEN_EXPIRY_KEY) ??
      getCookie(TOKEN_EXPIRY_KEY);
    
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
  if (!isBrowser()) return;
  
  try {
    const ls = safeGetStorage('localStorage');
    const ss = safeGetStorage('sessionStorage');
    ls?.removeItem(TOKEN_KEY);
    ls?.removeItem(TOKEN_EXPIRY_KEY);
    ss?.removeItem(TOKEN_KEY);
    ss?.removeItem(TOKEN_EXPIRY_KEY);
    deleteCookie(TOKEN_KEY);
    deleteCookie(TOKEN_EXPIRY_KEY);
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
  try {
    if (!isBrowser()) return null;

    const ls = safeGetStorage('localStorage');
    const ss = safeGetStorage('sessionStorage');
    const expiry =
      ls?.getItem(TOKEN_EXPIRY_KEY) ??
      ss?.getItem(TOKEN_EXPIRY_KEY) ??
      getCookie(TOKEN_EXPIRY_KEY);
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
