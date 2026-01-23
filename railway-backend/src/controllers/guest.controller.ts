import { Request, Response } from 'express';
import { getReservationByToken } from '../services/reservations.service';
import {
  getOrdersByReservationId,
  createOrder,
} from '../services/orders.service';
import {
  createCheckInOutLog,
  updateReservationStatus,
} from '../services/checkinout.service';
import { setupGuestOrdersSSE, sendGuestOrdersEvent } from '../services/guest-orders-sse.service';

export async function getGuestInfo(req: Request, res: Response) {
  try {
    const { token } = req.params;

    const reservation = await getReservationByToken(token);

    if (!reservation) {
      return res.status(404).json({
        error: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
    }

    res.json(reservation);
  } catch (error) {
    console.error('Get guest info error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}

export async function getGuestOrders(req: Request, res: Response) {
  try {
    const { token } = req.params;

    // 토큰으로 예약 조회
    const reservation = await getReservationByToken(token);

    if (!reservation) {
      return res.status(404).json({
        error: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
    }

    // 예약 ID로 주문 목록 조회
    const orders = await getOrdersByReservationId(reservation.id);

    res.json({ orders });
  } catch (error) {
    console.error('Get guest orders error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}

export async function createGuestOrder(req: Request, res: Response) {
  try {
    const { token } = req.params;
    const { type, items, totalAmount, deliveryTime, notes } = req.body;

    // 입력 검증
    if (!type || !items || !totalAmount) {
      return res.status(400).json({
        error: 'Missing required fields',
        code: 'MISSING_FIELDS',
        details: {
          required: ['type', 'items', 'totalAmount'],
        },
      });
    }

    if (!['bbq', 'fire', 'kiosk'].includes(type)) {
      return res.status(400).json({
        error: 'Invalid order type',
        code: 'INVALID_ORDER_TYPE',
      });
    }

    // 토큰으로 예약 조회
    const reservation = await getReservationByToken(token);

    if (!reservation) {
      return res.status(404).json({
        error: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
    }

    // 주문 생성
    const order = await createOrder({
      reservationId: reservation.id,
      type,
      items,
      totalAmount,
      deliveryTime,
      notes,
    });

    // 게스트 주문 SSE 알림(비동기): 해당 예약(reservationId)의 연결된 클라이언트에게 “변경됨” 신호
    try {
      sendGuestOrdersEvent(reservation.id, {
        type: 'order_created',
        data: { orderId: order.id, status: order.status, createdAt: order.createdAt },
      });
    } catch {
      // ignore
    }

    // 알림 생성 (비동기, 실패해도 주문은 완료)
    import('../services/notifications-helper.service').then(({ createOrderCreatedNotification }) => {
      createOrderCreatedNotification(order.id).catch((error) => {
        console.error('Failed to create order created notification:', error);
      });
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Create guest order error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}

export async function streamGuestOrders(req: Request, res: Response) {
  try {
    const { token } = req.params;

    // 토큰으로 예약 조회
    const reservation = await getReservationByToken(token);
    if (!reservation) {
      return res.status(404).json({
        error: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
    }

    // 최초 스냅샷(주문 목록)
    const orders = await getOrdersByReservationId(reservation.id);
    setupGuestOrdersSSE(req, res, reservation.id, { orders });
  } catch (error) {
    console.error('Guest orders SSE error:', error);
    // SSE 연결 자체가 실패했을 때는 일반 JSON 에러로 응답
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}

export async function checkIn(req: Request, res: Response) {
  try {
    const { token } = req.params;
    const { timestamp } = req.body;

    // 토큰으로 예약 조회
    const reservation = await getReservationByToken(token);

    if (!reservation) {
      return res.status(404).json({
        error: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
    }

    // 체크인 로그 생성
    const log = await createCheckInOutLog({
      reservationId: reservation.id,
      type: 'checkin',
      timestamp: timestamp || new Date().toISOString(),
    });

    // 예약 상태 업데이트
    await updateReservationStatus(reservation.id, 'checked_in');

    // 알림 생성 (비동기, 실패해도 체크인은 완료)
    import('../services/notifications-helper.service').then(({ createCheckInNotification }) => {
      createCheckInNotification(reservation.id).catch((error) => {
        console.error('Failed to create check-in notification:', error);
      });
    });

    res.json(log);
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}

export async function checkOut(req: Request, res: Response) {
  try {
    const { token } = req.params;
    const { timestamp, checklist, notes } = req.body;

    // 토큰으로 예약 조회
    const reservation = await getReservationByToken(token);

    if (!reservation) {
      return res.status(404).json({
        error: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
    }

    // 체크아웃 로그 생성
    const log = await createCheckInOutLog({
      reservationId: reservation.id,
      type: 'checkout',
      timestamp: timestamp || new Date().toISOString(),
      checklist,
      notes,
    });

    // 예약 상태 업데이트
    await updateReservationStatus(reservation.id, 'checked_out');

    // 알림 생성 (비동기, 실패해도 체크아웃은 완료)
    import('../services/notifications-helper.service').then(({ createCheckOutNotification }) => {
      createCheckOutNotification(reservation.id).catch((error) => {
        console.error('Failed to create check-out notification:', error);
      });
    });

    res.json(log);
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}
