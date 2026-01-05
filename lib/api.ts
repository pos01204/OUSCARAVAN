/**
 * Railway 백엔드 API 호출 함수
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ouscaravan-api.railway.app';

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
  
  const response = await fetch(`${API_URL}${endpoint}`, {
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
    }
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * 고객 API 호출 (토큰 기반)
 */
export async function guestApi(token: string, endpoint: string = '') {
  const response = await fetch(`${API_URL}/api/guest/${token}${endpoint}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Invalid token');
    }
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * 타입 정의
 */
export interface Reservation {
  id: string;
  reservationNumber: string;
  guestName: string;
  email: string;
  phone?: string;
  checkin: string;
  checkout: string;
  roomType: string;
  assignedRoom?: string;
  amount: string;
  status: 'pending' | 'assigned' | 'checked_in' | 'checked_out' | 'cancelled';
  uniqueToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  reservationId: string;
  type: 'bbq' | 'fire';
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'delivering' | 'completed';
  createdAt: string;
  deliveryTime?: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}
