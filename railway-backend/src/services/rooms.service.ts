import pool from '../config/database';

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
}

export interface UpdateRoomData {
  name?: string;
  type?: string;
  capacity?: number;
  status?: 'available' | 'occupied' | 'maintenance';
}

export async function getRooms(): Promise<Room[]> {
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
    ORDER BY name ASC
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
  const query = `
    INSERT INTO rooms (name, type, capacity, status)
    VALUES ($1, $2, $3, $4)
    RETURNING 
      id,
      name,
      type,
      capacity,
      status,
      created_at,
      updated_at
  `;

  const result = await pool.query(query, [
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
  const params: any[] = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    updates.push(`name = $${paramIndex}`);
    params.push(data.name);
    paramIndex++;
  }

  if (data.type !== undefined) {
    updates.push(`type = $${paramIndex}`);
    params.push(data.type);
    paramIndex++;
  }

  if (data.capacity !== undefined) {
    updates.push(`capacity = $${paramIndex}`);
    params.push(data.capacity);
    paramIndex++;
  }

  if (data.status !== undefined) {
    updates.push(`status = $${paramIndex}`);
    params.push(data.status);
    paramIndex++;
  }

  if (updates.length === 0) {
    const existing = await getRoomById(id);
    if (!existing) {
      throw new Error('Room not found');
    }
    return existing;
  }

  params.push(id);

  const query = `
    UPDATE rooms
    SET ${updates.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING 
      id,
      name,
      type,
      capacity,
      status,
      created_at,
      updated_at
  `;

  const result = await pool.query(query, params);

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
  const query = 'DELETE FROM rooms WHERE id = $1';
  const result = await pool.query(query, [id]);

  if (result.rowCount === 0) {
    throw new Error('Room not found');
  }
}
