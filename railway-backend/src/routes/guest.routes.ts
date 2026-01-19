import express from 'express';
import { validateCreateOrder } from '../middleware/validation.middleware';
import {
  getGuestInfo,
  getGuestOrders,
  createGuestOrder,
  checkIn,
  checkOut,
} from '../controllers/guest.controller';
import { getGuestAnnouncements } from '../controllers/announcements.controller';

const router = express.Router();

router.get('/:token', getGuestInfo);
router.get('/:token/orders', getGuestOrders);
router.get('/:token/announcements', getGuestAnnouncements);
router.post('/:token/orders', validateCreateOrder, createGuestOrder);
router.post('/:token/checkin', checkIn);
router.post('/:token/checkout', checkOut);

export default router;
