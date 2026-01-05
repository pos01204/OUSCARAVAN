import { NextRequest, NextResponse } from 'next/server';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 데이터 검증
    if (!data.guest || !data.room || !data.orderType || !data.items || !data.totalAmount) {
      return NextResponse.json(
        { 
          error: 'Missing required fields: guest, room, orderType, items, totalAmount' 
        },
        { status: 400 }
      );
    }
    
    // 주문 ID 생성 (없는 경우)
    const orderId = data.orderId || `order-${Date.now()}`;
    
    // n8n 웹훅으로 직접 전송
    if (!N8N_WEBHOOK_URL) {
      console.warn('N8N_WEBHOOK_URL is not set');
      return NextResponse.json(
        { error: 'N8N webhook URL is not configured' },
        { status: 500 }
      );
    }
    
    const response = await fetch(`${N8N_WEBHOOK_URL}/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        guest: data.guest,
        room: data.room,
        orderType: data.orderType,
        items: data.items,
        totalAmount: data.totalAmount,
        deliveryTime: data.deliveryTime,
        notes: data.notes,
      }),
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to send to n8n' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, orderId });
  } catch (error) {
    console.error('Order API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
