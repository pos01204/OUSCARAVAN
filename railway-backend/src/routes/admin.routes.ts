import express from 'express';
import { authenticateOrApiKey } from '../middleware/auth.middleware';
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
  assignRoomHandler,
} from '../controllers/reservations.controller';
import {
  listRooms,
  getRoom,
  createRoomHandler,
  updateRoomHandler,
  deleteRoomHandler,
  getRoomOrders,
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

/**
 * 인증 미들웨어 활성화 (하이브리드 인증)
 * - Authorization 헤더 (Bearer 토큰) - 웹뷰 호환
 * - 쿠키 (admin-token) - 일반 브라우저 폴백
 * - X-API-Key 헤더 - n8n 자동화용
 */
router.use(authenticateOrApiKey);

// 예약 관리
router.get('/reservations', listReservations);
router.get('/reservations/:id', getReservation);
router.post('/reservations', validateCreateReservation, createReservationHandler);
router.patch('/reservations/:id', validateUpdateReservation, updateReservationHandler);
router.patch('/reservations/:id/assign', assignRoomHandler); // 방 배정 완료 API
router.delete('/reservations/:id', deleteReservationHandler);

// 방 관리
router.get('/rooms', listRooms);
router.get('/rooms/:id', getRoom);
router.get('/rooms/:roomName/orders', getRoomOrders); // 객실별 주문 내역
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
