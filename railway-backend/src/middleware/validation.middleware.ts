import { Request, Response, NextFunction } from 'express';
import {
  validateEmail,
  validatePhone,
  validateDate,
  validateUUID,
  validateLength,
  validateRange,
  validateRequired,
  validateReservationStatus,
  validateOrderStatus,
  validateRoomStatus,
  validateOrderType,
  validateOrderItems,
} from '../utils/validation';

/**
 * 예약 생성 요청 검증
 */
export function validateCreateReservation(req: Request, res: Response, next: NextFunction) {
  const { reservationNumber, guestName, email, checkin, checkout, roomType, amount } = req.body;

  const errors: string[] = [];

  // 필수 필드 검증
  if (!validateRequired(reservationNumber)) {
    errors.push('reservationNumber is required');
  } else if (!validateLength(reservationNumber, 1, 50)) {
    errors.push('reservationNumber must be between 1 and 50 characters');
  }

  if (!validateRequired(guestName)) {
    errors.push('guestName is required');
  } else if (!validateLength(guestName, 1, 100)) {
    errors.push('guestName must be between 1 and 100 characters');
  }

  // email은 선택적 필드 (없으면 기본값 사용)
  if (email && !validateEmail(email)) {
    errors.push('email is invalid');
  }

  if (!validateRequired(checkin)) {
    errors.push('checkin is required');
  } else if (!validateDate(checkin)) {
    errors.push('checkin must be a valid date (YYYY-MM-DD)');
  }

  if (!validateRequired(checkout)) {
    errors.push('checkout is required');
  } else if (!validateDate(checkout)) {
    errors.push('checkout must be a valid date (YYYY-MM-DD)');
  }

  if (!validateRequired(roomType) || (typeof roomType === 'string' && roomType.trim() === '')) {
    errors.push('roomType is required and cannot be empty');
  } else if (!validateLength(roomType, 1, 100)) {
    errors.push('roomType must be between 1 and 100 characters');
  }

  // amount는 선택적 필드 (없으면 기본값 0 사용)
  // amount 검증 제거

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors,
    });
  }

  next();
}

/**
 * 예약 업데이트 요청 검증
 */
export function validateUpdateReservation(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;
  const { phone, status } = req.body;

  const errors: string[] = [];

  if (!validateUUID(id)) {
    errors.push('id must be a valid UUID');
  }

  if (phone !== undefined && !validatePhone(phone)) {
    errors.push('phone must be a valid phone number (010-1234-5678)');
  }

  if (status !== undefined && !validateReservationStatus(status)) {
    errors.push(`status must be one of: pending, assigned, checked_in, checked_out, cancelled`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors,
    });
  }

  next();
}

/**
 * 방 생성/업데이트 요청 검증
 */
export function validateRoom(req: Request, res: Response, next: NextFunction) {
  const { name, type, capacity, status } = req.body;

  const errors: string[] = [];

  if (name !== undefined) {
    if (!validateRequired(name)) {
      errors.push('name is required');
    } else if (!validateLength(name, 1, 50)) {
      errors.push('name must be between 1 and 50 characters');
    }
  }

  if (type !== undefined) {
    if (!validateRequired(type)) {
      errors.push('type is required');
    } else if (!validateLength(type, 1, 100)) {
      errors.push('type must be between 1 and 100 characters');
    }
  }

  if (capacity !== undefined) {
    if (typeof capacity !== 'number') {
      errors.push('capacity must be a number');
    } else if (!validateRange(capacity, 1, 20)) {
      errors.push('capacity must be between 1 and 20');
    }
  }

  if (status !== undefined && !validateRoomStatus(status)) {
    errors.push('status must be one of: available, occupied, maintenance');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors,
    });
  }

  next();
}

/**
 * 주문 생성 요청 검증
 */
export function validateCreateOrder(req: Request, res: Response, next: NextFunction) {
  const { type, items, totalAmount, deliveryTime } = req.body;

  const errors: string[] = [];

  if (!validateRequired(type)) {
    errors.push('type is required');
  } else if (!validateOrderType(type)) {
    errors.push('type must be either "bbq" or "fire"');
  }

  if (!validateRequired(items)) {
    errors.push('items is required');
  } else if (!validateOrderItems(items)) {
    errors.push('items must be a non-empty array of valid order items');
  }

  if (!validateRequired(totalAmount)) {
    errors.push('totalAmount is required');
  } else if (typeof totalAmount !== 'number' || totalAmount < 0) {
    errors.push('totalAmount must be a non-negative number');
  }

  if (deliveryTime !== undefined && !validateLength(deliveryTime, 1, 10)) {
    errors.push('deliveryTime must be between 1 and 10 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors,
    });
  }

  next();
}

/**
 * 주문 상태 업데이트 요청 검증
 */
export function validateUpdateOrderStatus(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;
  const { status } = req.body;

  const errors: string[] = [];

  if (!validateUUID(id)) {
    errors.push('id must be a valid UUID');
  }

  if (!validateRequired(status)) {
    errors.push('status is required');
  } else if (!validateOrderStatus(status)) {
    errors.push(`status must be one of: pending, preparing, delivering, completed, cancelled`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors,
    });
  }

  next();
}
