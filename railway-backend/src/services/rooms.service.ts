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
  const query = `
    SELECT 
      r.id,
      r.name,
      r.type,
      r.capacity,
      r.status,
      r.created_at,
      r.updated_at,
      res.id as reservation_id,
      res.guest_name,
      res.checkin,
      res.checkout,
      res.status as reservation_status
    FROM rooms r
    LEFT JOIN LATERAL (
      SELECT 
        res.id,
        res.guest_name,
        res.checkin,
        res.checkout,
        res.status as reservation_status
      FROM reservations res
      WHERE res.assigned_room = r.name 
        AND res.status IN ('assigned', 'checked_in', 'checked_out')
        AND res.checkout::date >= CURRENT_DATE
      ORDER BY res.checkin DESC
      LIMIT 1
    ) res ON true
    ORDER BY 
      CASE 
        WHEN r.name ~ '^[AB]\\d+$' THEN 
          CASE SUBSTRING(r.name FROM 1 FOR 1)
            WHEN 'A' THEN 0
            WHEN 'B' THEN 1
            ELSE 999
          END * 1000 + CAST(SUBSTRING(r.name FROM 2) AS INTEGER)
        ELSE 999
      END ASC,
      r.name ASC
  `;

  const result = await pool.query(query);

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    capacity: row.capacity,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    reservation: row.reservation_id ? {
      id: row.reservation_id,
      guestName: row.guest_name,
      checkin: row.checkin,
      checkout: row.checkout,
      status: row.reservation_status,
    } : null,
  }));
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
