import express from 'express';
import { Request, Response, NextFunction } from 'express';
// 인증 미들웨어 제거 - 모든 사용자가 접근 가능
// import { authenticate, AuthRequest } from '../middleware/auth.middleware';
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

// 인증 체크 제거 - 모든 사용자가 접근 가능
// n8n API Key 체크도 제거 (필요시 나중에 추가 가능)
// router.use(authenticateOrApiKey); // 주석 처리 - 인증 없이 접근 가능

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
