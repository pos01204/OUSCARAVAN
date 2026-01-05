import { NextRequest, NextResponse } from 'next/server';
import { sendCheckInToN8N } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 데이터 검증
    if (!data.guest || !data.room || !data.checkinTime) {
      return NextResponse.json(
        { error: 'Missing required fields: guest, room, checkinTime' },
        { status: 400 }
      );
    }
    
    // n8n 웹훅으로 전송
    const success = await sendCheckInToN8N({
      guest: data.guest,
      room: data.room,
      checkinTime: data.checkinTime,
      source: data.source || 'web_app',
    });
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send to n8n' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Check-in API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
