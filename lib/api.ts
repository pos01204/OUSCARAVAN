/**
 * n8n 웹훅 API 유틸리티
 * 향후 n8n 연동 시 사용
 */

const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

export interface CheckInData {
  guest: string;
  room: string;
  checkinTime: string;
  source: string;
}

export interface CheckOutData {
  guest: string;
  room: string;
  checkoutTime: string;
  checklist: {
    gasLocked: boolean;
    trashCleaned: boolean;
  };
}

export interface OrderData {
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
}

/**
 * n8n 웹훅으로 체크인 데이터 전송
 */
export async function sendCheckInToN8N(data: CheckInData): Promise<boolean> {
  if (!N8N_WEBHOOK_URL) {
    console.log('[N8N] Check-in data (webhook not configured):', data);
    return false;
  }

  try {
    const response = await fetch(`${N8N_WEBHOOK_URL}/checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('[N8N] Failed to send check-in data:', error);
    return false;
  }
}

/**
 * n8n 웹훅으로 체크아웃 데이터 전송
 */
export async function sendCheckOutToN8N(data: CheckOutData): Promise<boolean> {
  if (!N8N_WEBHOOK_URL) {
    console.log('[N8N] Check-out data (webhook not configured):', data);
    return false;
  }

  try {
    const response = await fetch(`${N8N_WEBHOOK_URL}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('[N8N] Failed to send check-out data:', error);
    return false;
  }
}

/**
 * n8n 웹훅으로 주문 데이터 전송
 */
export async function sendOrderToN8N(data: OrderData): Promise<boolean> {
  if (!N8N_WEBHOOK_URL) {
    console.log('[N8N] Order data (webhook not configured):', data);
    return false;
  }

  try {
    const response = await fetch(`${N8N_WEBHOOK_URL}/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('[N8N] Failed to send order data:', error);
    return false;
  }
}
