import { Request, Response } from 'express';
import {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} from '../services/rooms.service';
import { getOrdersByRoomName } from '../services/orders.service';

export async function listRooms(req: Request, res: Response) {
  try {
    const rooms = await getRooms();
    // 배열로 직접 반환 (배정 정보 포함)
    res.json(rooms);
  } catch (error: any) {
    console.error('List rooms error:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
    });
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined,
    });
  }
}

export async function getRoom(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const room = await getRoomById(id);

    if (!room) {
      return res.status(404).json({
        error: 'Room not found',
        code: 'ROOM_NOT_FOUND',
      });
    }

    res.json(room);
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}

export async function createRoomHandler(req: Request, res: Response) {
  try {
    const { name, type, capacity, status } = req.body;

    // 입력 검증
    if (!name || !type || !capacity) {
      return res.status(400).json({
        error: 'Missing required fields',
        code: 'MISSING_FIELDS',
        details: {
          required: ['name', 'type', 'capacity'],
        },
      });
    }

    if (typeof capacity !== 'number' || capacity < 1 || capacity > 20) {
      return res.status(400).json({
        error: 'Capacity must be a number between 1 and 20',
        code: 'INVALID_CAPACITY',
      });
    }

    const room = await createRoom({
      name,
      type,
      capacity,
      status,
    });

    res.status(201).json(room);
  } catch (error: any) {
    console.error('Create room error:', error);
    
    // 중복 방 이름 에러 처리
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Room name already exists',
        code: 'DUPLICATE_ROOM',
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}

export async function updateRoomHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, type, capacity, status } = req.body;

    // capacity 검증
    if (capacity !== undefined && (typeof capacity !== 'number' || capacity < 1 || capacity > 20)) {
      return res.status(400).json({
        error: 'Capacity must be a number between 1 and 20',
        code: 'INVALID_CAPACITY',
      });
    }

    const room = await updateRoom(id, {
      name,
      type,
      capacity,
      status,
    });

    res.json(room);
  } catch (error: any) {
    console.error('Update room error:', error);
    
    if (error.message === 'Room not found') {
      return res.status(404).json({
        error: 'Room not found',
        code: 'ROOM_NOT_FOUND',
      });
    }

    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Room name already exists',
        code: 'DUPLICATE_ROOM',
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}

export async function deleteRoomHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await deleteRoom(id);

    res.status(204).send();
  } catch (error: any) {
    console.error('Delete room error:', error);
    
    if (error.message === 'Room not found') {
      return res.status(404).json({
        error: 'Room not found',
        code: 'ROOM_NOT_FOUND',
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}

/**
 * 객실별 주문 내역 조회
 * GET /api/admin/rooms/:roomName/orders
 */
export async function getRoomOrders(req: Request, res: Response) {
  try {
    const { roomName } = req.params;

    if (!roomName) {
      return res.status(400).json({
        error: 'Room name is required',
        code: 'MISSING_ROOM_NAME',
      });
    }

    const orders = await getOrdersByRoomName(roomName);

    res.json({
      orders,
      total: orders.length,
    });
  } catch (error) {
    console.error('Get room orders error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}
