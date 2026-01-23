import { Request, Response } from 'express';
import {
  getAllOrders,
  getOrderById,
  updateOrder,
} from '../services/orders.service';
import { sendGuestOrdersEvent } from '../services/guest-orders-sse.service';

export async function listOrders(req: Request, res: Response) {
  try {
    const { status, page, limit } = req.query;

    const filters = {
      status: status as string | undefined,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    };

    const result = await getAllOrders(filters);

    res.json({
      orders: result.orders,
      total: result.total,
    });
  } catch (error) {
    console.error('List orders error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}

export async function getOrder(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const order = await getOrderById(id);

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        code: 'ORDER_NOT_FOUND',
      });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}

export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 입력 검증
    if (!status) {
      return res.status(400).json({
        error: 'Status is required',
        code: 'MISSING_STATUS',
      });
    }

    const validStatuses = ['pending', 'preparing', 'delivering', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        code: 'INVALID_STATUS',
        details: {
          validStatuses,
        },
      });
    }

    // 기존 주문 조회 (상태 변경 전)
    const oldOrder = await getOrderById(id);
    const oldStatus = oldOrder?.status || 'pending';

    const order = await updateOrder(id, { status });

    // 게스트 주문 SSE 알림(비동기): 해당 예약(reservationId)의 연결된 클라이언트에게 “변경됨” 신호
    try {
      sendGuestOrdersEvent(order.reservationId, {
        type: 'order_status_changed',
        data: { orderId: order.id, oldStatus, status },
      });
    } catch {
      // ignore
    }

    // 주문 상태 변경 알림 생성 (비동기, 실패해도 상태 변경은 완료)
    if (oldStatus !== status) {
      if (status === 'cancelled') {
        import('../services/notifications-helper.service').then(({ createOrderCancelledNotification }) => {
          createOrderCancelledNotification(order.id).catch((error) => {
            console.error('Failed to create order cancelled notification:', error);
          });
        });
      } else {
        import('../services/notifications-helper.service').then(({ createOrderStatusChangedNotification }) => {
          createOrderStatusChangedNotification(order.id, oldStatus, status).catch((error) => {
            console.error('Failed to create order status changed notification:', error);
          });
        });
      }
    }

    res.json(order);
  } catch (error: any) {
    console.error('Update order status error:', error);
    
    if (error.message === 'Order not found') {
      return res.status(404).json({
        error: 'Order not found',
        code: 'ORDER_NOT_FOUND',
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}
