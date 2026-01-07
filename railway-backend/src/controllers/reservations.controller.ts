import { Request, Response } from 'express';
import {
  getReservations,
  getReservationById,
  createReservation,
  createOrUpdateReservationItem,
  updateReservation,
  deleteReservation,
  type Reservation,
} from '../services/reservations.service';
import { v4 as uuidv4 } from 'uuid';

export async function listReservations(req: Request, res: Response) {
  try {
    const {
      status,
      checkin,
      checkout,
      search,
      page,
      limit,
    } = req.query;

    const filters = {
      status: status as string | undefined,
      checkin: checkin as string | undefined,
      checkout: checkout as string | undefined,
      search: search as string | undefined,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    };

    const result = await getReservations(filters);

    res.json({
      reservations: result.reservations,
      total: result.total,
    });
  } catch (error) {
    console.error('List reservations error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}

export async function getReservation(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const reservation = await getReservationById(id);

    if (!reservation) {
      return res.status(404).json({
        error: 'Reservation not found',
        code: 'RESERVATION_NOT_FOUND',
      });
    }

    res.json(reservation);
  } catch (error) {
    console.error('Get reservation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}

export async function createReservationHandler(req: Request, res: Response) {
  try {
    const {
      reservationNumber,
      guestName,
      email,
      checkin,
      checkout,
      roomType,
      amount, // 총 결제금액
      roomAmount, // 객실 개별 가격 (새로 추가)
      options, // 옵션 배열 (이미 파싱됨)
      category, // 레거시 지원용 (더 이상 사용하지 않음)
    } = req.body;

    // 필수 필드 검증 (roomType은 빈 문자열도 허용하지 않음)
    if (!reservationNumber || !guestName || !checkin || !checkout || !roomType || roomType.trim() === '') {
      return res.status(400).json({
        error: 'Missing required fields',
        code: 'MISSING_FIELDS',
        details: {
          required: ['reservationNumber', 'guestName', 'checkin', 'checkout', 'roomType'],
          optional: ['email', 'amount', 'roomAmount', 'options'],
          received: {
            reservationNumber: reservationNumber || 'missing',
            guestName: guestName || 'missing',
            checkin: checkin || 'missing',
            checkout: checkout || 'missing',
            roomType: roomType || 'missing',
          },
        },
      });
    }

    // email이 없으면 기본값 사용
    const finalEmail = email || `reservation-${reservationNumber}@ouscaravan.local`;
    
    // amount 처리: 총 결제금액 (roomAmount + options 합계)
    // roomAmount가 있으면 우선 사용, 없으면 amount 사용
    const finalRoomAmount = roomAmount !== undefined && roomAmount !== null 
      ? roomAmount.toString() 
      : (amount !== undefined && amount !== null ? amount.toString() : '0');
    
    // 총 결제금액: amount가 있으면 사용, 없으면 roomAmount + options 합계
    let finalTotalAmount = amount !== undefined && amount !== null 
      ? amount.toString() 
      : finalRoomAmount;

    // options 배열 정규화
    let finalOptions: Array<{
      optionName: string;
      optionPrice: number;
      category: string;
    }> = [];
    
    if (options && Array.isArray(options)) {
      finalOptions = options.map((opt: any) => ({
        optionName: opt.optionName || opt.name || '',
        optionPrice: typeof opt.optionPrice === 'number' ? opt.optionPrice : (parseInt(String(opt.optionPrice || 0)) || 0),
        category: opt.category || 'OPTION',
      }));
    }

    // 디버깅 로그 추가
    console.log('[CREATE_RESERVATION] Request body:', {
      reservationNumber,
      guestName,
      checkin,
      checkout,
      roomType,
      roomAmount: finalRoomAmount,
      totalAmount: finalTotalAmount,
      optionsCount: finalOptions.length,
      options: finalOptions,
    });

    // 새로운 구조: roomAmount 필드가 있는 경우 (그룹화된 데이터)
    // 레거시 지원: category가 있는 경우는 기존 로직 사용
    let reservation: Reservation;
    
    // roomAmount 필드가 요청에 포함되어 있으면 새로운 방식 (그룹화된 데이터)
    const hasRoomAmount = 'roomAmount' in req.body;
    const hasOptions = 'options' in req.body;
    
    if (hasRoomAmount || (hasOptions && Array.isArray(options))) {
      // 새로운 방식: 한 번에 모든 정보를 받아서 처리 (그룹화된 데이터)
      console.log('[CREATE_RESERVATION] Using new grouped data format');
      reservation = await createReservation({
        reservationNumber,
        guestName,
        email: finalEmail,
        checkin,
        checkout,
        roomType,
        amount: finalRoomAmount, // 객실 금액 저장 (roomAmount)
        options: finalOptions.length > 0 ? finalOptions : undefined,
      });
    } else if (category) {
      // 레거시 방식: category로 분리된 경우
      console.log('[CREATE_RESERVATION] Using legacy category-based format');
      const itemCategory = category || (roomType.includes('예약') ? 'ROOM' : 'OPTION');
      reservation = await createOrUpdateReservationItem({
        reservationNumber,
        guestName,
        email: finalEmail,
        checkin,
        checkout,
        roomType,
        amount: finalRoomAmount,
        category: itemCategory,
      });
    } else {
      // 기본 방식: createReservation 사용
      console.log('[CREATE_RESERVATION] Using default format');
      reservation = await createReservation({
        reservationNumber,
        guestName,
        email: finalEmail,
        checkin,
        checkout,
        roomType,
        amount: finalRoomAmount,
        options: finalOptions.length > 0 ? finalOptions : undefined,
      });
    }

    // 디버깅 로그 추가
    console.log('[CREATE_RESERVATION] Processed reservation:', {
      id: reservation.id,
      reservationNumber: reservation.reservationNumber,
      roomType: reservation.roomType,
      amount: reservation.amount,
      optionsCount: reservation.options?.length || 0,
      options: reservation.options,
    });

    // UPSERT이므로 200 또는 201 반환
    // 새로 생성된 경우 201, 업데이트된 경우 200
    const isNew = reservation.createdAt === reservation.updatedAt;
    res.status(isNew ? 201 : 200).json(reservation);
  } catch (error: any) {
    console.error('[CREATE_RESERVATION] Error details:', {
      message: error.message,
      stack: error.stack,
      reservationNumber: req.body.reservationNumber,
      category: req.body.category,
    });
    
    // 더 구체적인 에러 메시지 반환
    const errorMessage = error.message || 'Internal server error';
    const statusCode = error.statusCode || 500;
    
    res.status(statusCode).json({
      error: errorMessage,
      code: error.code || 'INTERNAL_ERROR',
      details: process.env.NODE_ENV !== 'production' ? {
        message: error.message,
        reservationNumber: req.body.reservationNumber,
      } : undefined,
    });
  }
}

export async function updateReservationHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      assignedRoom,
      phone,
      uniqueToken,
      status,
    } = req.body;

    // uniqueToken이 없으면 자동 생성
    const finalUniqueToken = uniqueToken || uuidv4();

    const reservation = await updateReservation(id, {
      assignedRoom,
      phone,
      uniqueToken: finalUniqueToken,
      status,
    });

    res.json(reservation);
  } catch (error: any) {
    console.error('Update reservation error:', error);
    
    if (error.message === 'Reservation not found') {
      return res.status(404).json({
        error: 'Reservation not found',
        code: 'RESERVATION_NOT_FOUND',
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}

export async function deleteReservationHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await deleteReservation(id);

    res.status(204).send();
  } catch (error: any) {
    console.error('Delete reservation error:', error);
    
    if (error.message === 'Reservation not found') {
      return res.status(404).json({
        error: 'Reservation not found',
        code: 'RESERVATION_NOT_FOUND',
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}
