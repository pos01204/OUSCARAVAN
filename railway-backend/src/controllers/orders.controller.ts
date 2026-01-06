import { Request, Response } from 'express';
import {
  getAllOrders,
  getOrderById,
  updateOrder,
} from '../services/orders.service';

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

    const order = await updateOrder(id, { status });

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
