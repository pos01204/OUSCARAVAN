import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
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

const router = express.Router();

router.use(authenticate); // 모든 관리자 라우트에 인증 적용

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

export default router;
