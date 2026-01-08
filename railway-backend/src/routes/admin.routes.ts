import express from 'express';
import { Request, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import {
  validateCreateReservation,
  validateUpdateReservation,
  validateRoom,
  validateUpdateOrderStatus,
} from '../middleware/validation.middleware';
import {
  listReservations,
  getReservation,
  createReservationHandler,
  updateReservationHandler,
  deleteReservationHandler,
} from '../controllers/reservations.controller';
import {
  listRooms,
  getRoom,
  createRoomHandler,
  updateRoomHandler,
  deleteRoomHandler,
} from '../controllers/rooms.controller';
import {
  listOrders,
  getOrder,
  updateOrderStatus,
} from '../controllers/orders.controller';
import { getStats } from '../controllers/stats.controller';
import {
  listNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotificationHandler,
  getSettings,
  updateSettings,
  getStats as getNotificationStats,
} from '../controllers/notifications.controller';
import { setupNotificationSSE } from '../services/notifications-sse.service';

const router = express.Router();

// n8n에서 예약 생성 시 API Key 인증 허용
const authenticateOrApiKey = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Express는 헤더 이름을 소문자로 변환하므로 여러 형식 확인
  const apiKey = req.headers['x-api-key'] || 
                 req.headers['x-apikey'] || 
                 req.headers['api-key'] ||
                 (req.headers['x-api-key'] as string)?.trim();
  
  // 디버깅을 위한 로그
  console.log('API Key check:', {
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey ? String(apiKey).length : 0,
    hasEnvKey: !!process.env.N8N_API_KEY,
    envKeyLength: process.env.N8N_API_KEY ? process.env.N8N_API_KEY.length : 0,
    headers: Object.keys(req.headers).filter(k => k.toLowerCase().includes('api')),
  });
  
  // API Key 인증 (n8n에서 사용)
  if (apiKey && process.env.N8N_API_KEY) {
    const apiKeyStr = String(apiKey).trim();
    const envKeyStr = String(process.env.N8N_API_KEY).trim();
    
    if (apiKeyStr === envKeyStr) {
      console.log('API Key authentication successful');
      return next();
    } else {
      console.log('API Key mismatch:', {
        received: apiKeyStr.substring(0, 10) + '...',
        expected: envKeyStr.substring(0, 10) + '...',
      });
    }
  }
  
  // JWT 토큰 인증 (관리자 페이지에서 사용)
  authenticate(req, res, next);
};

router.use(authenticateOrApiKey); // 모든 관리자 라우트에 인증 적용

// 예약 관리
router.get('/reservations', listReservations);
router.get('/reservations/:id', getReservation);
router.post('/reservations', validateCreateReservation, createReservationHandler);
router.patch('/reservations/:id', validateUpdateReservation, updateReservationHandler);
router.delete('/reservations/:id', deleteReservationHandler);

// 방 관리
router.get('/rooms', listRooms);
router.get('/rooms/:id', getRoom);
router.post('/rooms', validateRoom, createRoomHandler);
router.patch('/rooms/:id', validateRoom, updateRoomHandler);
router.delete('/rooms/:id', deleteRoomHandler);

// 주문 관리
router.get('/orders', listOrders);
router.get('/orders/:id', getOrder);
router.patch('/orders/:id', validateUpdateOrderStatus, updateOrderStatus);

// 통계
router.get('/stats', getStats);

// 알림 관리
router.get('/notifications', listNotifications);
router.get('/notifications/stats', getNotificationStats);
router.get('/notifications/stream', setupNotificationSSE);
router.patch('/notifications/:id/read', markAsRead);
router.patch('/notifications/read-all', markAllAsRead);
router.delete('/notifications/:id', deleteNotificationHandler);
router.get('/notifications/settings', getSettings);
router.patch('/notifications/settings', updateSettings);

export default router;
