/**
 * 서버 사이드 관리자 API 호출 함수
 * Next.js 서버 컴포넌트에서 사용
 */

import { cookies } from 'next/headers';
import { API_CONFIG } from './constants';
import type { ApiErrorCode, ApiErrorResponse, Reservation, ReservationsResponse, AdminStats } from '@/types';
import { ApiError } from '@/types';

const API_URL = API_CONFIG.baseUrl;
const DEFAULT_TIMEOUT = API_CONFIG.timeout;

/**
 * 타임아웃이 있는 fetch 래퍼
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = DEFAULT_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

/**
 * 서버 사이드 관리자 API 호출
 */
export async function adminApiServer(
  endpoint: string,
  options: RequestInit = {}
) {
  // 서버 사이드 인증: admin-token 쿠키를 읽어 Railway로 Authorization 헤더 전달
  // (서버 컴포넌트는 localStorage에 접근할 수 없으므로 쿠키 기반이 필수)
  const token = cookies().get('admin-token')?.value;
  if (!token) {
    throw new ApiError('Unauthorized', 'UNAUTHORIZED', 401);
  }

  try {
    const response = await fetchWithTimeout(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      // 에러 응답 파싱 시도
      let errorMessage = `API Error: ${response.statusText}`;
      let errorCode: ApiErrorCode | undefined;
      let errorDetails: Record<string, unknown> | undefined;

      try {
        const errorData: ApiErrorResponse = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
        if (errorData.code) {
          errorCode = errorData.code;
        }
        if (errorData.details) {
          errorDetails = errorData.details;
        }
      } catch {
        // JSON 파싱 실패 시 기본 메시지 사용
      }

      throw new ApiError(errorMessage, errorCode, response.status, errorDetails);
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * 서버 사이드 관리자 API 헬퍼 함수들
 */

/**
 * 예약 목록 조회 (서버 사이드)
 */
export async function getReservationsServer(params?: {
  status?: string;
  checkin?: string;
  checkout?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params?.status && params.status !== 'all') {
    queryParams.append('status', params.status);
  }
  if (params?.checkin) {
    queryParams.append('checkin', params.checkin);
  }
  if (params?.checkout) {
    queryParams.append('checkout', params.checkout);
  }
  if (params?.search) {
    queryParams.append('search', params.search);
  }
  if (params?.page) {
    queryParams.append('page', params.page.toString());
  }
  if (params?.limit) {
    queryParams.append('limit', params.limit.toString());
  }

  const queryString = queryParams.toString();
  const endpoint = `/api/admin/reservations${queryString ? `?${queryString}` : ''}`;

  return adminApiServer(endpoint) as Promise<ReservationsResponse>;
}

/**
 * 통계 조회 (서버 사이드)
 */
export async function getAdminStatsServer() {
  return adminApiServer('/api/admin/stats') as Promise<AdminStats>;
}
