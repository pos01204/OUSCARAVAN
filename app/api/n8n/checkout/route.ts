import { NextRequest, NextResponse } from 'next/server';
import { N8N_CONFIG } from '@/lib/constants';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || N8N_CONFIG.webhookUrl || '';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 데이터 검증
    if (!data.guest || !data.room || !data.checkoutTime) {
      return NextResponse.json(
        { error: 'Missing required fields: guest, room, checkoutTime' },
        { status: 400 }
      );
    }
    
    // n8n 웹훅으로 직접 전송
    if (!N8N_WEBHOOK_URL) {
      console.warn('N8N_WEBHOOK_URL is not set');
      return NextResponse.json(
        { error: 'N8N webhook URL is not configured' },
        { status: 500 }
      );
    }
    
    const response = await fetch(`${N8N_WEBHOOK_URL}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        guest: data.guest,
        room: data.room,
        checkoutTime: data.checkoutTime,
        checklist: data.checklist || {
          gasLocked: false,
          trashCleaned: false,
        },
      }),
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to send to n8n' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Check-out API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
