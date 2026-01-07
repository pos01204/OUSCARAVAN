import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface Reservation {
  id: string;
  reservationNumber: string;
  guestName: string;
  email: string;
  phone?: string;
  checkin: string;
  checkout: string;
  roomType: string;
  assignedRoom?: string;
  amount: string;
  status: string;
  uniqueToken?: string;
  options?: Array<{
    optionName: string;
    optionPrice: number;
    category: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReservationData {
  reservationNumber: string;
  guestName: string;
  email: string;
  checkin: string;
  checkout: string;
  roomType: string;
  amount: string;
  options?: Array<{
    optionName: string;
    optionPrice: number;
    category: string;
  }>;
}

export interface UpdateReservationData {
  assignedRoom?: string;
  phone?: string;
  uniqueToken?: string;
  status?: string;
}

export async function getReservations(filters: {
  status?: string;
  checkin?: string;
  checkout?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ reservations: Reservation[]; total: number }> {
  const {
    status,
    checkin,
    checkout,
    search,
    page = 1,
    limit = 20,
  } = filters;

  const offset = (page - 1) * limit;
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  // 상태 필터
  if (status && status !== 'all') {
    conditions.push(`status = $${paramIndex}`);
    params.push(status);
    paramIndex++;
  }

  // 체크인 날짜 필터
  if (checkin) {
    conditions.push(`checkin = $${paramIndex}`);
    params.push(checkin);
    paramIndex++;
  }

  // 체크아웃 날짜 필터
  if (checkout) {
    conditions.push(`checkout = $${paramIndex}`);
    params.push(checkout);
    paramIndex++;
  }

  // 검색 필터 (예약자명, 예약번호)
  if (search) {
    conditions.push(`(guest_name ILIKE $${paramIndex} OR reservation_number ILIKE $${paramIndex})`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // 전체 개수 조회
  const countQuery = `SELECT COUNT(*) FROM reservations ${whereClause}`;
  const countResult = await pool.query(countQuery, params);
  const total = parseInt(countResult.rows[0].count);

  // 목록 조회
  const query = `
    SELECT 
      id,
      reservation_number,
      guest_name,
      email,
      phone,
      checkin,
      checkout,
      room_type,
      assigned_room,
      amount,
      status,
      unique_token,
      options,
      created_at,
      updated_at
    FROM reservations
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  params.push(limit, offset);

  const result = await pool.query(query, params);

  const reservations: Reservation[] = result.rows.map((row) => ({
    id: row.id,
    reservationNumber: row.reservation_number,
    guestName: row.guest_name,
    email: row.email,
    phone: row.phone || undefined,
    checkin: row.checkin,
    checkout: row.checkout,
    roomType: row.room_type,
    assignedRoom: row.assigned_room || undefined,
    amount: row.amount,
    status: row.status,
    uniqueToken: row.unique_token || undefined,
    options: row.options || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return { reservations, total };
}

export async function getReservationById(id: string): Promise<Reservation | null> {
  const query = `
    SELECT 
      id,
      reservation_number,
      guest_name,
      email,
      phone,
      checkin,
      checkout,
      room_type,
      assigned_room,
      amount,
      status,
      unique_token,
      options,
      created_at,
      updated_at
    FROM reservations
    WHERE id = $1
  `;

  const result = await pool.query(query, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    reservationNumber: row.reservation_number,
    guestName: row.guest_name,
    email: row.email,
    phone: row.phone || undefined,
    checkin: row.checkin,
    checkout: row.checkout,
    roomType: row.room_type,
    assignedRoom: row.assigned_room || undefined,
    amount: row.amount,
    status: row.status,
    uniqueToken: row.unique_token || undefined,
    options: row.options || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getReservationByToken(token: string): Promise<Reservation | null> {
  const query = `
    SELECT 
      id,
      reservation_number,
      guest_name,
      email,
      phone,
      checkin,
      checkout,
      room_type,
      assigned_room,
      amount,
      status,
      unique_token,
      options,
      created_at,
      updated_at
    FROM reservations
    WHERE unique_token = $1
  `;

  const result = await pool.query(query, [token]);

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    reservationNumber: row.reservation_number,
    guestName: row.guest_name,
    email: row.email,
    phone: row.phone || undefined,
    checkin: row.checkin,
    checkout: row.checkout,
    roomType: row.room_type,
    assignedRoom: row.assigned_room || undefined,
    amount: row.amount,
    status: row.status,
    uniqueToken: row.unique_token || undefined,
    options: row.options || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createReservation(data: CreateReservationData): Promise<Reservation> {
  // UPSERT: 예약번호가 이미 있으면 업데이트, 없으면 생성
  const query = `
    INSERT INTO reservations (
      reservation_number,
      guest_name,
      email,
      checkin,
      checkout,
      room_type,
      amount,
      status,
      options
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (reservation_number) 
    DO UPDATE SET
      guest_name = EXCLUDED.guest_name,
      email = EXCLUDED.email,
      checkin = EXCLUDED.checkin,
      checkout = EXCLUDED.checkout,
      room_type = EXCLUDED.room_type,
      amount = EXCLUDED.amount,
      options = EXCLUDED.options,
      updated_at = CURRENT_TIMESTAMP
    RETURNING 
      id,
      reservation_number,
      guest_name,
      email,
      phone,
      checkin,
      checkout,
      room_type,
      assigned_room,
      amount,
      status,
      unique_token,
      options,
      created_at,
      updated_at
  `;

  // options를 JSONB로 변환
  const optionsJson = data.options ? JSON.stringify(data.options) : '[]';

  const result = await pool.query(query, [
    data.reservationNumber,
    data.guestName,
    data.email,
    data.checkin,
    data.checkout,
    data.roomType,
    data.amount,
    'pending',
    optionsJson,
  ]);

  const row = result.rows[0];
  return {
    id: row.id,
    reservationNumber: row.reservation_number,
    guestName: row.guest_name,
    email: row.email,
    phone: row.phone || undefined,
    checkin: row.checkin,
    checkout: row.checkout,
    roomType: row.room_type,
    assignedRoom: row.assigned_room || undefined,
    amount: row.amount,
    status: row.status,
    uniqueToken: row.unique_token || undefined,
    options: row.options || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * n8n에서 개별 상품(ROOM/OPTION)을 받아서 예약에 추가/업데이트
 * - category가 "ROOM"이면 예약 기본 정보(roomType, amount) 업데이트
 * - category가 "OPTION"이면 options 배열에 추가
 */
export async function createOrUpdateReservationItem(data: {
  reservationNumber: string;
  guestName: string;
  email: string;
  checkin: string;
  checkout: string;
  roomType: string;
  amount: string;
  category: string;
}): Promise<Reservation> {
  try {
    console.log('[createOrUpdateReservationItem] Input data:', {
      reservationNumber: data.reservationNumber,
      category: data.category,
      roomType: data.roomType,
      amount: data.amount,
    });

    // 먼저 기존 예약 조회
    const existingQuery = `
      SELECT 
        id,
        reservation_number,
        guest_name,
        email,
        phone,
        checkin,
        checkout,
        room_type,
        assigned_room,
        amount,
        status,
        unique_token,
        options,
        created_at,
        updated_at
      FROM reservations
      WHERE reservation_number = $1
    `;

    const existingResult = await pool.query(existingQuery, [data.reservationNumber]);
    const existing = existingResult.rows[0];

    if (existing) {
      console.log('[createOrUpdateReservationItem] Existing reservation found:', {
        id: existing.id,
        roomType: existing.room_type,
        amount: existing.amount,
        optionsType: typeof existing.options,
        optionsValue: existing.options,
      });

      // 기존 예약이 있는 경우
      let updatedRoomType = existing.room_type;
      let updatedAmount = existing.amount;
      
      // JSONB 필드 파싱 (안전하게 처리)
      let updatedOptions: Array<{
        optionName: string;
        optionPrice: number;
        category: string;
      }> = [];

      if (existing.options) {
        try {
          // JSONB는 이미 파싱된 객체일 수 있음
          if (Array.isArray(existing.options)) {
            updatedOptions = existing.options;
          } else if (typeof existing.options === 'string') {
            updatedOptions = JSON.parse(existing.options);
          } else if (typeof existing.options === 'object') {
            // 이미 객체인 경우 배열로 변환 시도
            updatedOptions = Array.isArray(existing.options) ? existing.options : [];
          }
        } catch (parseError) {
          console.error('[createOrUpdateReservationItem] Error parsing options:', parseError);
          updatedOptions = [];
        }
      }

      if (data.category === 'ROOM') {
        // ROOM인 경우: 예약 기본 정보 업데이트
        updatedRoomType = data.roomType;
        updatedAmount = data.amount;
        console.log('[createOrUpdateReservationItem] Updating ROOM:', {
          roomType: updatedRoomType,
          amount: updatedAmount,
        });
      } else if (data.category === 'OPTION') {
        // OPTION인 경우: options 배열에 추가 (중복 체크)
        const newOption = {
          optionName: data.roomType, // roomType에 옵션명이 들어있음
          optionPrice: parseInt(data.amount) || 0,
          category: 'OPTION',
        };

        console.log('[createOrUpdateReservationItem] Adding OPTION:', newOption);

        // 중복 체크: 같은 optionName이 이미 있으면 업데이트, 없으면 추가
        const existingOptionIndex = updatedOptions.findIndex(
          (opt) => opt.optionName === newOption.optionName
        );

        if (existingOptionIndex >= 0) {
          // 기존 옵션 업데이트
          updatedOptions[existingOptionIndex] = newOption;
          console.log('[createOrUpdateReservationItem] Updated existing option at index:', existingOptionIndex);
        } else {
          // 새 옵션 추가
          updatedOptions.push(newOption);
          console.log('[createOrUpdateReservationItem] Added new option, total options:', updatedOptions.length);
        }
      }

      // 예약 업데이트
      const updateQuery = `
        UPDATE reservations
        SET
          guest_name = $1,
          email = $2,
          checkin = $3,
          checkout = $4,
          room_type = $5,
          amount = $6,
          options = $7::jsonb,
          updated_at = CURRENT_TIMESTAMP
        WHERE reservation_number = $8
        RETURNING 
          id,
          reservation_number,
          guest_name,
          email,
          phone,
          checkin,
          checkout,
          room_type,
          assigned_room,
          amount,
          status,
          unique_token,
          options,
          created_at,
          updated_at
      `;

      const optionsJson = JSON.stringify(updatedOptions);
      console.log('[createOrUpdateReservationItem] Updating with options JSON:', optionsJson);

      const updateResult = await pool.query(updateQuery, [
        data.guestName,
        data.email,
        data.checkin,
        data.checkout,
        updatedRoomType,
        updatedAmount,
        optionsJson,
        data.reservationNumber,
      ]);

      if (updateResult.rows.length === 0) {
        throw new Error('Failed to update reservation');
      }

      const row = updateResult.rows[0];
      
      // options 파싱
      let parsedOptions = undefined;
      if (row.options) {
        try {
          parsedOptions = Array.isArray(row.options) ? row.options : JSON.parse(row.options);
        } catch (e) {
          console.error('[createOrUpdateReservationItem] Error parsing returned options:', e);
        }
      }

      console.log('[createOrUpdateReservationItem] Update successful');
      
      return {
        id: row.id,
        reservationNumber: row.reservation_number,
        guestName: row.guest_name,
        email: row.email,
        phone: row.phone || undefined,
        checkin: row.checkin,
        checkout: row.checkout,
        roomType: row.room_type,
        assignedRoom: row.assigned_room || undefined,
        amount: row.amount,
        status: row.status,
        uniqueToken: row.unique_token || undefined,
        options: parsedOptions,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    } else {
      console.log('[createOrUpdateReservationItem] No existing reservation, creating new');
      
      // 기존 예약이 없는 경우: 새로 생성
      let initialRoomType = data.roomType;
      let initialAmount = data.amount;
      let initialOptions: Array<{
        optionName: string;
        optionPrice: number;
        category: string;
      }> = [];

      if (data.category === 'ROOM') {
        // ROOM인 경우: 예약 기본 정보로 저장
        initialRoomType = data.roomType;
        initialAmount = data.amount;
        console.log('[createOrUpdateReservationItem] Creating with ROOM:', {
          roomType: initialRoomType,
          amount: initialAmount,
        });
      } else if (data.category === 'OPTION') {
        // OPTION인 경우: options 배열에 추가 (ROOM이 없으므로 임시로 저장)
        initialOptions.push({
          optionName: data.roomType,
          optionPrice: parseInt(data.amount) || 0,
          category: 'OPTION',
        });
        // ROOM 정보가 없으므로 기본값 사용
        initialRoomType = '객실 정보 없음';
        initialAmount = '0';
        console.log('[createOrUpdateReservationItem] Creating with OPTION only:', initialOptions);
      }

      const insertQuery = `
        INSERT INTO reservations (
          reservation_number,
          guest_name,
          email,
          checkin,
          checkout,
          room_type,
          amount,
          status,
          options
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
        RETURNING 
          id,
          reservation_number,
          guest_name,
          email,
          phone,
          checkin,
          checkout,
          room_type,
          assigned_room,
          amount,
          status,
          unique_token,
          options,
          created_at,
          updated_at
      `;

      const optionsJson = JSON.stringify(initialOptions);
      console.log('[createOrUpdateReservationItem] Inserting with options JSON:', optionsJson);

      const insertResult = await pool.query(insertQuery, [
        data.reservationNumber,
        data.guestName,
        data.email,
        data.checkin,
        data.checkout,
        initialRoomType,
        initialAmount,
        'pending',
        optionsJson,
      ]);

      if (insertResult.rows.length === 0) {
        throw new Error('Failed to create reservation');
      }

      const row = insertResult.rows[0];
      
      // options 파싱
      let parsedOptions = undefined;
      if (row.options) {
        try {
          parsedOptions = Array.isArray(row.options) ? row.options : JSON.parse(row.options);
        } catch (e) {
          console.error('[createOrUpdateReservationItem] Error parsing returned options:', e);
        }
      }

      console.log('[createOrUpdateReservationItem] Insert successful');
      
      return {
        id: row.id,
        reservationNumber: row.reservation_number,
        guestName: row.guest_name,
        email: row.email,
        phone: row.phone || undefined,
        checkin: row.checkin,
        checkout: row.checkout,
        roomType: row.room_type,
        assignedRoom: row.assigned_room || undefined,
        amount: row.amount,
        status: row.status,
        uniqueToken: row.unique_token || undefined,
        options: parsedOptions,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    }
  } catch (error: any) {
    console.error('[createOrUpdateReservationItem] Error:', error);
    console.error('[createOrUpdateReservationItem] Error stack:', error.stack);
    throw error;
  }
}

export async function updateReservation(
  id: string,
  data: UpdateReservationData
): Promise<Reservation> {
  const updates: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (data.assignedRoom !== undefined) {
    updates.push(`assigned_room = $${paramIndex}`);
    params.push(data.assignedRoom);
    paramIndex++;
  }

  if (data.phone !== undefined) {
    updates.push(`phone = $${paramIndex}`);
    params.push(data.phone);
    paramIndex++;
  }

  if (data.uniqueToken !== undefined) {
    updates.push(`unique_token = $${paramIndex}`);
    params.push(data.uniqueToken);
    paramIndex++;
  }

  if (data.status !== undefined) {
    updates.push(`status = $${paramIndex}`);
    params.push(data.status);
    paramIndex++;
  }

  if (updates.length === 0) {
    // 업데이트할 항목이 없으면 기존 데이터 반환
    const existing = await getReservationById(id);
    if (!existing) {
      throw new Error('Reservation not found');
    }
    return existing;
  }

  params.push(id);

  const query = `
    UPDATE reservations
    SET ${updates.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING 
      id,
      reservation_number,
      guest_name,
      email,
      phone,
      checkin,
      checkout,
      room_type,
      assigned_room,
      amount,
      status,
      unique_token,
      created_at,
      updated_at
  `;

  const result = await pool.query(query, params);

  if (result.rows.length === 0) {
    throw new Error('Reservation not found');
  }

  const row = result.rows[0];
  return {
    id: row.id,
    reservationNumber: row.reservation_number,
    guestName: row.guest_name,
    email: row.email,
    phone: row.phone || undefined,
    checkin: row.checkin,
    checkout: row.checkout,
    roomType: row.room_type,
    assignedRoom: row.assigned_room || undefined,
    amount: row.amount,
    status: row.status,
    uniqueToken: row.unique_token || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function deleteReservation(id: string): Promise<void> {
  const query = 'DELETE FROM reservations WHERE id = $1';
  const result = await pool.query(query, [id]);

  if (result.rowCount === 0) {
    throw new Error('Reservation not found');
  }
}
