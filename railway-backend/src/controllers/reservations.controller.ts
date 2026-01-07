import { Request, Response } from 'express';
import {
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation,
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
      amount,
      options,
    } = req.body;

    // 필수 필드 검증
    if (!reservationNumber || !guestName || !checkin || !checkout || !roomType) {
      return res.status(400).json({
        error: 'Missing required fields',
        code: 'MISSING_FIELDS',
        details: {
          required: ['reservationNumber', 'guestName', 'checkin', 'checkout', 'roomType'],
          optional: ['email', 'amount', 'options'],
        },
      });
    }

    // email이 없으면 기본값 사용 (n8n에서 이메일이 추출되지 않은 경우)
    const finalEmail = email || `reservation-${reservationNumber}@ouscaravan.local`;
    
    // amount가 없으면 기본값 0 사용 (n8n에서 금액이 추출되지 않은 경우)
    const finalAmount = amount !== undefined && amount !== null ? amount : 0;

    // options 배열 검증 및 정규화
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
      amount: finalAmount,
      optionsCount: finalOptions.length,
      options: finalOptions,
    });

    const reservation = await createReservation({
      reservationNumber,
      guestName,
      email: finalEmail,
      checkin,
      checkout,
      roomType,
      amount: finalAmount.toString(), // amount는 문자열로 저장
      options: finalOptions.length > 0 ? finalOptions : undefined,
    });

    // 디버깅 로그 추가
    console.log('[CREATE_RESERVATION] Created reservation:', {
      id: reservation.id,
      reservationNumber: reservation.reservationNumber,
      options: reservation.options,
    });

    // UPSERT이므로 200 또는 201 반환
    // 새로 생성된 경우 201, 업데이트된 경우 200
    const isNew = reservation.createdAt === reservation.updatedAt;
    res.status(isNew ? 201 : 200).json(reservation);
  } catch (error: any) {
    console.error('Create reservation error:', error);
    
    // UPSERT로 변경했으므로 중복 에러는 발생하지 않음
    // 하지만 다른 에러는 처리
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
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
