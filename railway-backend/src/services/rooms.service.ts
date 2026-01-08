import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface Room {
  id: string;
  name: string;
  type: string;
  capacity: number;
  status: 'available' | 'occupied' | 'maintenance';
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomData {
  name: string;
  type: string;
  capacity: number;
  status?: 'available' | 'occupied' | 'maintenance';
  description?: string;
}

export interface UpdateRoomData {
  name?: string;
  type?: string;
  capacity?: number;
  status?: 'available' | 'occupied' | 'maintenance';
}

export interface RoomWithReservation extends Room {
  reservation?: {
    id: string;
    guestName: string;
    checkin: string;
    checkout: string;
    status: string;
  } | null;
}

/**
 * 방 목록 조회 (배정 정보 포함)
 */
export async function getRooms(): Promise<RoomWithReservation[]> {
  // 먼저 모든 방을 조회
  // 1호~10호 순서로 정렬
  const roomsQuery = `
    SELECT 
      id,
      name,
      type,
      capacity,
      status,
      created_at,
      updated_at
    FROM rooms
    ORDER BY 
      CASE 
        WHEN name ~ '^\\d+호$' THEN 
          CAST(SUBSTRING(name FROM '^(\\d+)') AS INTEGER)
        ELSE 999
      END ASC,
      name ASC
  `;

  try {
    const roomsResult = await pool.query(roomsQuery);
    const rooms = roomsResult.rows;
    console.log('[getRooms] Found rooms:', rooms.length);

    // 각 방에 대한 최신 예약 정보 조회
    const reservationsQuery = `
      SELECT 
        id,
        assigned_room,
        guest_name,
        checkin,
        checkout,
        status
      FROM reservations
      WHERE assigned_room IS NOT NULL
        AND status IN ('assigned', 'checked_in', 'checked_out')
        AND checkout::date >= CURRENT_DATE
      ORDER BY assigned_room, checkin DESC
    `;

    const reservationsResult = await pool.query(reservationsQuery);
    const reservations = reservationsResult.rows;

    // 방별로 최신 예약 정보 매핑
    const reservationMap = new Map<string, typeof reservations[0]>();
    for (const res of reservations) {
      if (!reservationMap.has(res.assigned_room)) {
        reservationMap.set(res.assigned_room, res);
      }
    }

    // 방 목록과 예약 정보 결합
    return rooms.map((room) => {
      const reservation = reservationMap.get(room.name);
      return {
        id: room.id,
        name: room.name,
        type: room.type,
        capacity: room.capacity,
        status: room.status,
        createdAt: room.created_at,
        updatedAt: room.updated_at,
        reservation: reservation ? {
          id: reservation.id,
          guestName: reservation.guest_name,
          checkin: reservation.checkin,
          checkout: reservation.checkout,
          status: reservation.status,
        } : null,
      };
    });
  } catch (error) {
    console.error('[getRooms] SQL query error:', error);
    throw error;
  }
}

export async function getRoomById(id: string): Promise<Room | null> {
  const query = `
    SELECT 
      id,
      name,
      type,
      capacity,
      status,
      created_at,
      updated_at
    FROM rooms
    WHERE id = $1
  `;

  const result = await pool.query(query, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    capacity: row.capacity,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createRoom(data: CreateRoomData): Promise<Room> {
  const id = uuidv4();
  const query = `
    INSERT INTO rooms (id, name, type, capacity, status, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    RETURNING id, name, type, capacity, status, created_at, updated_at
  `;

  const result = await pool.query(query, [
    id,
    data.name,
    data.type,
    data.capacity,
    data.status || 'available',
  ]);

  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    capacity: row.capacity,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function updateRoom(id: string, data: UpdateRoomData): Promise<Room> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.type !== undefined) {
    updates.push(`type = $${paramIndex++}`);
    values.push(data.type);
  }
  if (data.capacity !== undefined) {
    updates.push(`capacity = $${paramIndex++}`);
    values.push(data.capacity);
  }
  if (data.status !== undefined) {
    updates.push(`status = $${paramIndex++}`);
    values.push(data.status);
  }

  if (updates.length === 0) {
    const room = await getRoomById(id);
    if (!room) {
      throw new Error('Room not found');
    }
    return room;
  }

  updates.push(`updated_at = NOW()`);
  values.push(id);

  const query = `
    UPDATE rooms
    SET ${updates.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id, name, type, capacity, status, created_at, updated_at
  `;

  const result = await pool.query(query, values);

  if (result.rows.length === 0) {
    throw new Error('Room not found');
  }

  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    capacity: row.capacity,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function deleteRoom(id: string): Promise<void> {
  const query = `DELETE FROM rooms WHERE id = $1`;
  await pool.query(query, [id]);
}
