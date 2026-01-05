import { NextRequest, NextResponse } from 'next/server';
import { sendOrderToN8N } from '@/lib/api';

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
    
    // n8n 웹훅으로 전송
    const success = await sendOrderToN8N({
      guest: data.guest,
      room: data.room,
      orderType: data.orderType,
      items: data.items,
      totalAmount: data.totalAmount,
      deliveryTime: data.deliveryTime,
      notes: data.notes,
    });
    
    if (!success) {
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
