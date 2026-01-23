/**
 * Railway 백엔드 API 호출 함수
 */

import { API_CONFIG, N8N_CONFIG } from './constants';
import { extractUserFriendlyMessage } from './error-messages';
import { getToken, clearToken, getAuthHeader } from './auth-client';
import type {
  ApiErrorCode,
  ApiErrorResponse,
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationsResponse,
  NotificationSettings,
  NotificationStats,
  Announcement,
  AnnouncementLevel,
  AnnouncementStatus,
  AnnouncementsResponse,
} from '@/types';
import { ApiError } from '@/types';

const API_URL = API_CONFIG.baseUrl;
const DEFAULT_TIMEOUT = API_CONFIG.timeout;
const RETRY_CONFIG = API_CONFIG.retry;

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
 * 재시도 가능한 에러인지 확인
 */
function isRetryableError(error: unknown, status?: number): boolean {
  // ApiError인 경우 status 확인
  if (error instanceof ApiError) {
    // 5xx 서버 오류는 재시도 가능
    if (error.status && error.status >= 500) {
      return true;
    }
    // 네트워크 오류는 재시도 가능
    if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT_ERROR') {
      return true;
    }
    // 4xx 클라이언트 오류는 재시도 불가능
    return false;
  }
  
  // 일반 Error인 경우 메시지로 판단
  if (error instanceof Error) {
    if (error.message === 'Request timeout') {
      return true;
    }
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return true;
    }
  }
  
  // status가 있는 경우 5xx는 재시도 가능
  if (status && status >= 500) {
    return true;
  }
  
  return false;
}

/**
 * 지수 백오프를 사용한 지연 시간 계산
 */
function calculateDelay(attempt: number): number {
  const delay = RETRY_CONFIG.initialDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
}

/**
 * 재시도 로직이 포함된 API 호출
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  timeout: number = DEFAULT_TIMEOUT
): Promise<Response> {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= RETRY_CONFIG.maxAttempts; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options, timeout);
      
      // 성공적인 응답이거나 재시도 불가능한 에러인 경우 즉시 반환
      if (response.ok || (response.status < 500 && response.status >= 400)) {
        return response;
      }
      
      // 5xx 서버 오류인 경우 재시도
      if (response.status >= 500) {
        lastError = new ApiError(
          `Server error: ${response.statusText}`,
          'INTERNAL_ERROR',
          response.status
        );
        
        // 마지막 시도가 아니면 대기 후 재시도
        if (attempt < RETRY_CONFIG.maxAttempts) {
          const delay = calculateDelay(attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      return response;
    } catch (error) {
      lastError = error;
      
      // 재시도 가능한 에러인지 확인
      if (isRetryableError(error)) {
        // 마지막 시도가 아니면 대기 후 재시도
        if (attempt < RETRY_CONFIG.maxAttempts) {
          const delay = calculateDelay(attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      // 재시도 불가능한 에러이거나 마지막 시도인 경우 즉시 throw
      throw error;
    }
  }
  
  // 모든 재시도 실패
  throw lastError;
}

/**
 * 인증이 필요한 API 호출 (웹뷰 호환)
 * Authorization 헤더로 토큰 전송 + credentials: include로 쿠키 폴백
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const authHeader = getAuthHeader();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...authHeader,
    ...options.headers,
  };
  
  const response = await fetchWithRetry(url, {
    ...options,
    headers,
    credentials: 'include', // 쿠키도 함께 전송 (폴백용)
  });
  
  // 401 에러 시 토큰 클리어 및 리다이렉트
  if (response.status === 401) {
    clearToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login?error=session_expired';
    }
    throw new ApiError('Session expired', 'UNAUTHORIZED', 401);
  }
  
  return response;
}

/**
 * 관리자 API 호출 (하이브리드 인증)
 * - Authorization 헤더로 토큰 전송 (웹뷰 호환)
 * - credentials: include로 쿠키 폴백 (일반 브라우저)
 */
export async function adminApi(
  endpoint: string,
  options: RequestInit = {}
) {
  try {
    const response = await authenticatedFetch(`${API_URL}${endpoint}`, options);
    
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
      
      // ApiError로 변환하여 throw
      throw new ApiError(errorMessage, errorCode, response.status, errorDetails);
    }
    
    return response.json();
  } catch (error) {
    // 이미 ApiError인 경우 그대로 throw
    if (error instanceof ApiError) {
      throw error;
    }
    // 사용자 친화적인 에러 메시지로 변환
    const userFriendlyMessage = extractUserFriendlyMessage(error);
    throw new Error(userFriendlyMessage);
  }
}

/**
 * 고객 API 호출 (토큰 기반)
 */
export async function guestApi(
  token: string,
  endpoint: string = '',
  options: RequestInit = {}
) {
  try {
    const response = await fetchWithRetry(`${API_URL}/api/guest/${token}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
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
      
      // ApiError로 변환하여 throw
      throw new ApiError(errorMessage, errorCode, response.status, errorDetails);
    }
    
    return response.json();
  } catch (error) {
    // ApiError는 상태/코드 보존 (토큰 무효 vs 네트워크 장애 구분을 위해)
    if (error instanceof ApiError) {
      throw error;
    }
    // 사용자 친화적인 에러 메시지로 변환
    const userFriendlyMessage = extractUserFriendlyMessage(error);
    throw new Error(userFriendlyMessage);
  }
}

/**
 * Railway API 헬퍼 함수들
 */

/**
 * 체크인 처리
 */
export async function checkIn(token: string, timestamp?: string): Promise<CheckInOutResponse> {
  const body = timestamp ? { timestamp } : undefined;
  return guestApi(token, '/checkin', {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  }) as Promise<CheckInOutResponse>;
}

/**
 * 체크아웃 처리
 */
export async function checkOut(
  token: string,
  checklist?: {
    gasLocked: boolean;
    trashCleaned: boolean;
  },
  timestamp?: string
): Promise<CheckInOutResponse> {
  const body: {
    checklist?: { gasLocked: boolean; trashCleaned: boolean };
    timestamp?: string;
  } = {};
  
  if (checklist) {
    body.checklist = checklist;
  }
  if (timestamp) {
    body.timestamp = timestamp;
  }
  
  return guestApi(token, '/checkout', {
    method: 'POST',
    body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
  }) as Promise<CheckInOutResponse>;
}

/**
 * 주문 목록 조회
 */
export async function getOrders(token: string): Promise<OrdersResponse> {
  return guestApi(token, '/orders') as Promise<OrdersResponse>;
}

/**
 * 주문 생성
 */
export async function createOrder(
  token: string,
  data: {
    type: 'bbq' | 'fire' | 'kiosk';
    items: Array<{
      id: string;
      name: string;
      quantity: number;
      price: number;
    }>;
    totalAmount: number;
    deliveryTime?: string;
    notes?: string;
  }
): Promise<Order> {
  return guestApi(token, '/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  }) as Promise<Order>;
}

/**
 * 관리자 API 헬퍼 함수들
 */

/**
 * 예약 목록 조회
 */
export async function getReservations(params?: {
  status?: string;
  checkin?: string;
  checkout?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ReservationsResponse> {
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
  
  return adminApi(endpoint) as Promise<ReservationsResponse>;
}

/**
 * 예약 상세 조회 (클라이언트 사이드 - Next.js API 라우트 사용)
 */
export async function getReservation(id: string): Promise<Reservation> {
  const response = await authenticatedFetch(`/api/admin/reservations/${id}`, {
    method: 'GET',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new ApiError('Unauthorized', 'UNAUTHORIZED', 401);
    }
    const errorData = await response.json().catch(() => ({
      error: 'Failed to fetch reservation',
    }));
    throw new ApiError(
      errorData.error || 'Failed to fetch reservation',
      errorData.code,
      response.status
    );
  }

  return response.json() as Promise<Reservation>;
}

/**
 * 예약 업데이트 (클라이언트 사이드 - Next.js API 라우트 사용)
 */
export async function updateReservation(
  id: string,
  data: {
    assignedRoom?: string;
    phone?: string;
    uniqueToken?: string;
    status?: Reservation['status'];
  }
): Promise<Reservation> {
  const response = await authenticatedFetch(`/api/admin/reservations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new ApiError('Unauthorized', 'UNAUTHORIZED', 401);
    }
    const errorData = await response.json().catch(() => ({
      error: 'Failed to update reservation',
    }));
    throw new ApiError(
      errorData.error || 'Failed to update reservation',
      errorData.code,
      response.status
    );
  }

  return response.json() as Promise<Reservation>;
}

/**
 * 방 목록 조회 (클라이언트 사이드 - Next.js API 라우트 사용)
 * 배정 정보 포함
 */
export async function getRooms(): Promise<(Room & { reservation?: { id: string; guestName: string; checkin: string; checkout: string; status: string; } | null })[]> {
  const response = await authenticatedFetch('/api/admin/rooms', {
    method: 'GET',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new ApiError('Unauthorized', 'UNAUTHORIZED', 401);
    }
    const errorData = await response.json().catch(() => ({
      error: 'Failed to fetch rooms',
    }));
    throw new ApiError(
      errorData.error || 'Failed to fetch rooms',
      errorData.code,
      response.status
    );
  }

  const data = await response.json();
  // 배열로 직접 반환 (배정 정보 포함)
  return Array.isArray(data) ? data : (data.rooms || []);
}

/**
 * 방 추가 (클라이언트 사이드 - Next.js API 라우트 사용)
 */
export async function createRoom(data: {
  name: string;
  type: string;
  capacity: number;
  status: Room['status'];
  description?: string;
}): Promise<Room> {
  const response = await authenticatedFetch('/api/admin/rooms', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new ApiError('Unauthorized', 'UNAUTHORIZED', 401);
    }
    const errorData = await response.json().catch(() => ({
      error: 'Failed to create room',
    }));
    throw new ApiError(
      errorData.error || 'Failed to create room',
      errorData.code,
      response.status
    );
  }

  return response.json() as Promise<Room>;
}

/**
 * 방 업데이트 (클라이언트 사이드 - Next.js API 라우트 사용)
 */
export async function updateRoom(
  id: string,
  data: {
    name?: string;
    type?: string;
    capacity?: number;
    status?: Room['status'];
    description?: string;
  }
): Promise<Room> {
  const response = await authenticatedFetch(`/api/admin/rooms/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new ApiError('Unauthorized', 'UNAUTHORIZED', 401);
    }
    const errorData = await response.json().catch(() => ({
      error: 'Failed to update room',
    }));
    throw new ApiError(
      errorData.error || 'Failed to update room',
      errorData.code,
      response.status
    );
  }

  return response.json() as Promise<Room>;
}

/**
 * 방 삭제 (클라이언트 사이드 - Next.js API 라우트 사용)
 */
export async function deleteRoom(id: string): Promise<void> {
  const response = await authenticatedFetch(`/api/admin/rooms/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new ApiError('Unauthorized', 'UNAUTHORIZED', 401);
    }
    const errorData = await response.json().catch(() => ({
      error: 'Failed to delete room',
    }));
    throw new ApiError(
      errorData.error || 'Failed to delete room',
      errorData.code,
      response.status
    );
  }
}

/**
 * 주문 목록 조회 (관리자)
 */
export async function getAdminOrders(params?: {
  status?: string;
  date?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<OrdersResponse> {
  const queryParams = new URLSearchParams();
  if (params?.status && params.status !== 'all') {
    queryParams.append('status', params.status);
  }
  if (params?.date) {
    queryParams.append('date', params.date);
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
  const endpoint = `/api/admin/orders${queryString ? `?${queryString}` : ''}`;
  
  const response = await authenticatedFetch(endpoint, {
    method: 'GET',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new ApiError('Unauthorized', 'UNAUTHORIZED', 401);
    }
    const errorData = await response.json().catch(() => ({
      error: 'Failed to fetch orders',
    }));
    throw new ApiError(
      errorData.error || 'Failed to fetch orders',
      errorData.code,
      response.status
    );
  }

  return response.json() as Promise<OrdersResponse>;
}

/**
 * 주문 상태 업데이트
 */
export async function updateOrderStatus(
  id: string,
  status: Order['status']
): Promise<Order> {
  const response = await authenticatedFetch(`/api/admin/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new ApiError('Unauthorized', 'UNAUTHORIZED', 401);
    }
    const errorData = await response.json().catch(() => ({
      error: 'Failed to update order',
    }));
    throw new ApiError(
      errorData.error || 'Failed to update order',
      errorData.code,
      response.status
    );
  }

  return response.json();
}

/**
 * 통계 조회
 */
export async function getAdminStats(): Promise<AdminStats> {
  return adminApi('/api/admin/stats') as Promise<AdminStats>;
}

/**
 * 알림 API 함수들
 */

/**
 * 알림 목록 조회
 * Next.js API 라우트를 통해 서버 사이드에서 Railway API를 호출
 */
export async function getNotifications(params?: {
  type?: NotificationType;
  isRead?: boolean;
  priority?: NotificationPriority;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<NotificationsResponse> {
  const queryParams = new URLSearchParams();
  if (params?.type) {
    queryParams.append('type', params.type);
  }
  if (params?.isRead !== undefined) {
    queryParams.append('isRead', params.isRead.toString());
  }
  if (params?.priority) {
    queryParams.append('priority', params.priority);
  }
  if (params?.startDate) {
    queryParams.append('startDate', params.startDate);
  }
  if (params?.endDate) {
    queryParams.append('endDate', params.endDate);
  }
  if (params?.page) {
    queryParams.append('page', params.page.toString());
  }
  if (params?.limit) {
    queryParams.append('limit', params.limit.toString());
  }

  const queryString = queryParams.toString();
  // Next.js API 라우트 사용 (서버 사이드에서 쿠키를 읽어 Railway API로 프록시)
  const url = `/api/admin/notifications${queryString ? `?${queryString}` : ''}`;

  try {
    const response = await fetchWithRetry(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 쿠키 포함
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new ApiError('로그인이 필요합니다. 다시 로그인해주세요.', 'UNAUTHORIZED', 401);
      }
      
      const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || '알림을 불러오는데 실패했습니다.',
        errorData.code,
        response.status
      );
    }

    return response.json() as Promise<NotificationsResponse>;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const userFriendlyMessage = extractUserFriendlyMessage(error);
    throw new ApiError(userFriendlyMessage, 'NETWORK_ERROR', 0);
  }
}

/**
 * 알림 읽음 처리
 */
export async function markNotificationAsRead(id: string): Promise<Notification> {
  return adminApi(`/api/admin/notifications/${id}/read`, {
    method: 'PATCH',
  }) as Promise<Notification>;
}

/**
 * 모든 알림 읽음 처리
 */
export async function markAllNotificationsAsRead(): Promise<{ updatedCount: number }> {
  return adminApi('/api/admin/notifications/read-all', {
    method: 'PATCH',
  }) as Promise<{ updatedCount: number }>;
}

/**
 * 알림 삭제
 */
export async function deleteNotification(id: string): Promise<{ success: boolean }> {
  return adminApi(`/api/admin/notifications/${id}`, {
    method: 'DELETE',
  }) as Promise<{ success: boolean }>;
}

/**
 * 알림 설정 조회
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  return adminApi('/api/admin/notifications/settings') as Promise<NotificationSettings>;
}

/**
 * 알림 설정 업데이트
 */
export async function updateNotificationSettings(
  data: Partial<NotificationSettings>
): Promise<NotificationSettings> {
  return adminApi('/api/admin/notifications/settings', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }) as Promise<NotificationSettings>;
}

/**
 * 알림 통계 조회
 */
export async function getNotificationStats(): Promise<NotificationStats> {
  return adminApi('/api/admin/notifications/stats') as Promise<NotificationStats>;
}

/**
 * 공지 API 함수들
 */
export async function getAdminAnnouncements(params?: {
  status?: AnnouncementStatus;
  level?: AnnouncementLevel;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<AnnouncementsResponse> {
  const queryParams = new URLSearchParams();
  if (params?.status && params.status !== 'all') {
    queryParams.append('status', params.status);
  }
  if (params?.level) {
    queryParams.append('level', params.level);
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
  const url = `/api/admin/announcements${queryString ? `?${queryString}` : ''}`;

  try {
    const response = await fetchWithRetry(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new ApiError('로그인이 필요합니다. 다시 로그인해주세요.', 'UNAUTHORIZED', 401);
      }
      const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || '공지를 불러오는데 실패했습니다.',
        errorData.code,
        response.status
      );
    }

    return response.json() as Promise<AnnouncementsResponse>;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const userFriendlyMessage = extractUserFriendlyMessage(error);
    throw new ApiError(userFriendlyMessage, 'NETWORK_ERROR', 0);
  }
}

export async function createAnnouncement(data: {
  title: string;
  content: string;
  level?: AnnouncementLevel;
  startsAt?: string;
  endsAt?: string | null;
  isActive?: boolean;
}): Promise<Announcement> {
  const response = await fetchWithRetry('/api/admin/announcements', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new ApiError('로그인이 필요합니다. 다시 로그인해주세요.', 'UNAUTHORIZED', 401);
    }
    const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.error || '공지를 생성하지 못했습니다.',
      errorData.code,
      response.status
    );
  }

  return response.json() as Promise<Announcement>;
}

export async function updateAnnouncement(
  id: string,
  data: {
    title?: string;
    content?: string;
    level?: AnnouncementLevel;
    startsAt?: string;
    endsAt?: string | null;
    isActive?: boolean;
  }
): Promise<Announcement> {
  const response = await fetchWithRetry(`/api/admin/announcements/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new ApiError('로그인이 필요합니다. 다시 로그인해주세요.', 'UNAUTHORIZED', 401);
    }
    const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.error || '공지를 수정하지 못했습니다.',
      errorData.code,
      response.status
    );
  }

  return response.json() as Promise<Announcement>;
}

export async function deleteAnnouncement(id: string): Promise<{ success: boolean }> {
  const response = await fetchWithRetry(`/api/admin/announcements/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new ApiError('로그인이 필요합니다. 다시 로그인해주세요.', 'UNAUTHORIZED', 401);
    }
    const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.error || '공지를 삭제하지 못했습니다.',
      errorData.code,
      response.status
    );
  }

  return response.json() as Promise<{ success: boolean }>;
}

export async function getGuestAnnouncements(token: string): Promise<Announcement[]> {
  const response = await guestApi(token, '/announcements');
  return response.announcements as Announcement[];
}

/**
 * 타입 정의는 types/index.ts에서 import
 */
import type {
  Reservation,
  Order,
  OrderItem,
  Room,
  AdminStats,
  AuthResponse,
  ReservationsResponse,
  OrdersResponse,
  RoomsResponse,
  CheckInOutResponse,
} from '@/types';

export type {
  Reservation,
  Order,
  OrderItem,
  Room,
  AdminStats,
  AuthResponse,
  ReservationsResponse,
  OrdersResponse,
  RoomsResponse,
  CheckInOutResponse,
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationLinkType,
  NotificationsResponse,
  NotificationSettings,
  NotificationStats,
  Announcement,
  AnnouncementLevel,
  AnnouncementStatus,
  AnnouncementsResponse,
  ApiErrorResponse,
  ApiError,
  ApiErrorCode,
} from '@/types';

/**
 * n8n 웹훅 URL (환경 변수에서 가져오기)
 */
const getN8NWebhookUrl = () => {
  // 서버 사이드에서는 환경 변수 직접 사용
  if (typeof window === 'undefined') {
    return process.env.N8N_WEBHOOK_URL || process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '';
  }
  // 클라이언트 사이드에서는 내부 API 라우트 사용
  return '';
};

/**
 * 체크인 정보를 n8n으로 전송
 * 클라이언트에서는 내부 API 라우트 사용, 서버에서는 직접 n8n 웹훅 호출
 */
export async function sendCheckInToN8N(data: {
  guest: string;
  room: string;
  checkinTime: string;
  source?: string;
}): Promise<boolean> {
  try {
    // 클라이언트 사이드: 내부 API 라우트 사용
    if (typeof window !== 'undefined') {
      const response = await fetch('/api/n8n/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return response.ok;
    }
    
    // 서버 사이드: 직접 n8n 웹훅 호출
    const webhookUrl = getN8NWebhookUrl();
    if (!webhookUrl) {
      console.warn('N8N_WEBHOOK_URL is not set');
      return false;
    }
    
    const response = await fetch(`${webhookUrl}/checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Failed to send check-in to n8n:', error);
    return false;
  }
}

/**
 * 체크아웃 정보를 n8n으로 전송
 * 클라이언트에서는 내부 API 라우트 사용, 서버에서는 직접 n8n 웹훅 호출
 */
export async function sendCheckOutToN8N(data: {
  guest: string;
  room: string;
  checkoutTime: string;
  checklist?: {
    gasLocked: boolean;
    trashCleaned: boolean;
  };
}): Promise<boolean> {
  try {
    // 클라이언트 사이드: 내부 API 라우트 사용
    if (typeof window !== 'undefined') {
      const response = await fetch('/api/n8n/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return response.ok;
    }
    
    // 서버 사이드: 직접 n8n 웹훅 호출
    const webhookUrl = getN8NWebhookUrl();
    if (!webhookUrl) {
      console.warn('N8N_WEBHOOK_URL is not set');
      return false;
    }
    
    const response = await fetch(`${webhookUrl}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Failed to send check-out to n8n:', error);
    return false;
  }
}

/**
 * 주문 정보를 n8n으로 전송
 * 클라이언트에서는 내부 API 라우트 사용, 서버에서는 직접 n8n 웹훅 호출
 */
export async function sendOrderToN8N(data: {
  guest: string;
  room: string;
  orderType: 'bbq' | 'fire' | 'kiosk';
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  deliveryTime?: string;
  notes?: string;
}): Promise<boolean> {
  try {
    // 클라이언트 사이드: 내부 API 라우트 사용
    if (typeof window !== 'undefined') {
      const response = await fetch('/api/n8n/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return response.ok;
    }
    
    // 서버 사이드: 직접 n8n 웹훅 호출
    const webhookUrl = getN8NWebhookUrl();
    if (!webhookUrl) {
      console.warn('N8N_WEBHOOK_URL is not set');
      return false;
    }
    
    const response = await fetch(`${webhookUrl}/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Failed to send order to n8n:', error);
    return false;
  }
}

/**
 * 예약 배정 정보를 n8n으로 전송 (알림톡 발송 트리거)
 * 클라이언트에서는 내부 API 라우트 사용, 서버에서는 직접 n8n 웹훅 호출
 */
export async function sendReservationAssignedToN8N(data: {
  reservationId: string;
  guestName: string;
  phone: string;
  uniqueToken: string;
  assignedRoom: string;
  checkin: string;
  checkout: string;
}): Promise<boolean> {
  try {
    // 클라이언트 사이드: 내부 API 라우트 사용
    if (typeof window !== 'undefined') {
      const response = await fetch('/api/n8n/reservation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return response.ok;
    }
    
    // 서버 사이드: 직접 n8n 웹훅 호출
    const webhookUrl = getN8NWebhookUrl();
    if (!webhookUrl) {
      console.warn('N8N_WEBHOOK_URL is not set');
      return false;
    }
    
    const response = await fetch(`${webhookUrl}/reservation-assigned`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Failed to send reservation assigned to n8n:', error);
    return false;
  }
}
