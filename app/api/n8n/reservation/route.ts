import { NextRequest, NextResponse } from 'next/server';
import { N8N_CONFIG } from '@/lib/constants';

/**
 * 예약 배정 n8n 웹훅 프록시
 * 클라이언트에서 n8n 웹훅을 직접 호출하지 않고 내부 API 라우트를 통해 호출
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // n8n 웹훅 URL 확인
    const webhookUrl = N8N_CONFIG.webhookUrl;
    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'N8N_WEBHOOK_URL is not configured' },
        { status: 500 }
      );
    }
    
    // n8n 웹훅 호출
    const response = await fetch(`${webhookUrl}/reservation-assigned`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n webhook error:', errorText);
      return NextResponse.json(
        { error: 'Failed to call n8n webhook' },
        { status: response.status }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error calling n8n webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
