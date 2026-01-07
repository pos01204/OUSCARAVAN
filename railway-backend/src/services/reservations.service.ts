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
      status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (reservation_number) 
    DO UPDATE SET
      guest_name = EXCLUDED.guest_name,
      email = EXCLUDED.email,
      checkin = EXCLUDED.checkin,
      checkout = EXCLUDED.checkout,
      room_type = EXCLUDED.room_type,
      amount = EXCLUDED.amount,
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
      created_at,
      updated_at
  `;

  const result = await pool.query(query, [
    data.reservationNumber,
    data.guestName,
    data.email,
    data.checkin,
    data.checkout,
    data.roomType,
    data.amount,
    'pending',
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
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
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
