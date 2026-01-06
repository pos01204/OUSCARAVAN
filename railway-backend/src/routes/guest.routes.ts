import express from 'express';
// TODO: 컨트롤러 구현 필요
// import {
//   getGuestInfo,
//   getOrders,
//   createOrder,
//   checkIn,
//   checkOut,
// } from '../controllers/guest.controller';

const router = express.Router();

// TODO: 컨트롤러 구현 후 주석 해제 및 임시 라우트 제거
// router.get('/:token', getGuestInfo);
// router.get('/:token/orders', getOrders);
// router.post('/:token/orders', createOrder);
// router.post('/:token/checkin', checkIn);
// router.post('/:token/checkout', checkOut);

// 임시 구현 (개발용)
router.get('/:token', (req, res) => {
  res.status(404).json({ 
    error: 'Reservation not found',
    code: 'RESERVATION_NOT_FOUND',
  });
});

router.get('/:token/orders', (req, res) => {
  res.json({ orders: [] });
});

router.post('/:token/orders', (req, res) => {
  res.status(404).json({ error: 'Not implemented', code: 'NOT_IMPLEMENTED' });
});

router.post('/:token/checkin', (req, res) => {
  res.status(404).json({ error: 'Not implemented', code: 'NOT_IMPLEMENTED' });
});

router.post('/:token/checkout', (req, res) => {
  res.status(404).json({ error: 'Not implemented', code: 'NOT_IMPLEMENTED' });
});

export default router;
