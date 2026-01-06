/**
 * Railway 백엔드 API 호출 함수
 */

import { API_CONFIG, N8N_CONFIG } from './constants';
import type { ApiErrorCode, ApiErrorResponse } from '@/types';
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
 * 관리자 API 호출
 */
export async function adminApi(
  endpoint: string,
  options: RequestInit = {}
) {
  // 클라이언트 사이드에서 쿠키 읽기
  const token = typeof window !== 'undefined' 
    ? document.cookie
        .split('; ')
        .find(row => row.startsWith('admin-token='))
        ?.split('=')[1]
    : null;
  
  try {
    const response = await fetchWithRetry(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        // 인증 실패 시 로그인 페이지로 리다이렉트
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Unauthorized');
      }
      
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
    // 네트워크 오류 또는 타임아웃 처리
    if (error instanceof Error) {
      if (error.message === 'Request timeout') {
        throw new Error('요청 시간이 초과되었습니다. 다시 시도해주세요.');
      }
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('네트워크 오류가 발생했습니다. 연결을 확인해주세요.');
      }
    }
    throw error;
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
    // 네트워크 오류 또는 타임아웃 처리
    if (error instanceof Error) {
      if (error.message === 'Request timeout') {
        throw new Error('요청 시간이 초과되었습니다. 다시 시도해주세요.');
      }
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('네트워크 오류가 발생했습니다. 연결을 확인해주세요.');
      }
    }
    throw error;
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
    type: 'bbq' | 'fire';
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
 * 예약 상세 조회
 */
export async function getReservation(id: string): Promise<Reservation> {
  return adminApi(`/api/admin/reservations/${id}`) as Promise<Reservation>;
}

/**
 * 예약 업데이트
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
  return adminApi(`/api/admin/reservations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }) as Promise<Reservation>;
}

/**
 * 방 목록 조회
 */
export async function getRooms(): Promise<Room[]> {
  const data = await adminApi('/api/admin/rooms');
  return Array.isArray(data) ? data : (data.rooms || []);
}

/**
 * 방 추가
 */
export async function createRoom(data: {
  name: string;
  type: string;
  capacity: number;
  status: Room['status'];
  description?: string;
}): Promise<Room> {
  return adminApi('/api/admin/rooms', {
    method: 'POST',
    body: JSON.stringify(data),
  }) as Promise<Room>;
}

/**
 * 방 업데이트
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
  return adminApi(`/api/admin/rooms/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }) as Promise<Room>;
}

/**
 * 방 삭제
 */
export async function deleteRoom(id: string): Promise<void> {
  await adminApi(`/api/admin/rooms/${id}`, {
    method: 'DELETE',
  });
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
  
  return adminApi(endpoint) as Promise<OrdersResponse>;
}

/**
 * 주문 상태 업데이트
 */
export async function updateOrderStatus(
  id: string,
  status: Order['status']
): Promise<Order> {
  return adminApi(`/api/admin/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }) as Promise<Order>;
}

/**
 * 통계 조회
 */
export async function getAdminStats(): Promise<AdminStats> {
  return adminApi('/api/admin/stats') as Promise<AdminStats>;
}

/**
 * 타입 정의는 types/index.ts에서 import
 */
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
  orderType: 'bbq' | 'fire';
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
