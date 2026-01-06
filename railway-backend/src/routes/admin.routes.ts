import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
// TODO: 컨트롤러 구현 필요
// import {
//   getReservations,
//   getReservation,
//   updateReservation,
//   getRooms,
//   createRoom,
//   updateRoom,
//   deleteRoom,
//   getOrders,
//   updateOrderStatus,
//   getStats,
// } from '../controllers';

const router = express.Router();

router.use(authenticate); // 모든 관리자 라우트에 인증 적용

// TODO: 컨트롤러 구현 후 주석 해제 및 임시 라우트 제거
// router.get('/reservations', getReservations);
// router.get('/reservations/:id', getReservation);
// router.patch('/reservations/:id', updateReservation);
// router.get('/rooms', getRooms);
// router.post('/rooms', createRoom);
// router.patch('/rooms/:id', updateRoom);
// router.delete('/rooms/:id', deleteRoom);
// router.get('/orders', getOrders);
// router.patch('/orders/:id', updateOrderStatus);
// router.get('/stats', getStats);

// 임시 구현 (개발용)
router.get('/reservations', (req, res) => {
  res.json({ reservations: [], total: 0 });
});

router.get('/reservations/:id', (req, res) => {
  res.status(404).json({ error: 'Not implemented', code: 'NOT_IMPLEMENTED' });
});

router.patch('/reservations/:id', (req, res) => {
  res.status(404).json({ error: 'Not implemented', code: 'NOT_IMPLEMENTED' });
});

router.get('/rooms', (req, res) => {
  res.json({ rooms: [] });
});

router.post('/rooms', (req, res) => {
  res.status(404).json({ error: 'Not implemented', code: 'NOT_IMPLEMENTED' });
});

router.patch('/rooms/:id', (req, res) => {
  res.status(404).json({ error: 'Not implemented', code: 'NOT_IMPLEMENTED' });
});

router.delete('/rooms/:id', (req, res) => {
  res.status(404).json({ error: 'Not implemented', code: 'NOT_IMPLEMENTED' });
});

router.get('/orders', (req, res) => {
  res.json({ orders: [], total: 0 });
});

router.patch('/orders/:id', (req, res) => {
  res.status(404).json({ error: 'Not implemented', code: 'NOT_IMPLEMENTED' });
});

router.get('/stats', (req, res) => {
  res.json({
    todayReservations: 0,
    pendingCheckins: 0,
    pendingCheckouts: 0,
    pendingOrders: 0,
  });
});

export default router;
