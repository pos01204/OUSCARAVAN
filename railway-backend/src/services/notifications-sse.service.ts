import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Notification } from './notifications.service';

// SSE 클라이언트 관리
const clients = new Map<string, Response>();

/**
 * SSE 연결 설정
 */
export function setupNotificationSSE(req: AuthRequest, res: Response) {
  const adminId = req.user?.id || 'admin';

  // SSE 헤더 설정
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Nginx 버퍼링 비활성화

  // 클라이언트 등록
  clients.set(adminId, res);

  // 연결 종료 시 클라이언트 제거
  req.on('close', () => {
    clients.delete(adminId);
    console.log(`[SSE] Client disconnected: ${adminId}`);
  });

  // 초기 연결 메시지
  res.write(`data: ${JSON.stringify({ type: 'connected', adminId })}\n\n`);
  console.log(`[SSE] Client connected: ${adminId}`);

  // Keep-alive 메시지 (30초마다)
  const keepAliveInterval = setInterval(() => {
    if (clients.has(adminId)) {
      try {
        res.write(`: keep-alive\n\n`);
      } catch (error) {
        console.error(`[SSE] Keep-alive error for ${adminId}:`, error);
        clearInterval(keepAliveInterval);
        clients.delete(adminId);
      }
    } else {
      clearInterval(keepAliveInterval);
    }
  }, 30000);

  // 연결 종료 시 interval 정리
  req.on('close', () => {
    clearInterval(keepAliveInterval);
  });
}

/**
 * 알림 전송
 */
export function sendNotification(adminId: string, notification: Notification): boolean {
  const client = clients.get(adminId);
  if (client) {
    try {
      client.write(`data: ${JSON.stringify({ type: 'notification', data: notification })}\n\n`);
      console.log(`[SSE] Notification sent to ${adminId}: ${notification.type}`);
      return true;
    } catch (error) {
      console.error(`[SSE] Error sending notification to ${adminId}:`, error);
      clients.delete(adminId);
      return false;
    }
  }
  return false;
}

/**
 * 연결된 클라이언트 수 조회
 */
export function getConnectedClientsCount(): number {
  return clients.size;
}

/**
 * 모든 클라이언트에게 알림 전송 (브로드캐스트)
 */
export function broadcastNotification(notification: Notification): number {
  let sentCount = 0;
  clients.forEach((client, adminId) => {
    if (sendNotification(adminId, notification)) {
      sentCount++;
    }
  });
  return sentCount;
}
