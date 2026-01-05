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
 * 타입 정의는 types/index.ts에서 import
 */
export type { Reservation, Order, OrderItem, Room, AdminStats } from '@/types';

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
