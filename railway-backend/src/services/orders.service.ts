import pool from '../config/database';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  reservationId: string;
  type: 'bbq' | 'fire' | 'kiosk';
  items: OrderItem[];
  totalAmount: number;
  status: string;
  deliveryTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  reservationId: string;
  type: 'bbq' | 'fire' | 'kiosk';
  items: OrderItem[];
  totalAmount: number;
  deliveryTime?: string;
  notes?: string;
}

export interface UpdateOrderData {
  status?: string;
}

export async function getOrdersByReservationId(reservationId: string): Promise<Order[]> {
  const query = `
    SELECT 
      id,
      reservation_id,
      type,
      items,
      total_amount,
      status,
      delivery_time,
      notes,
      created_at,
      updated_at
    FROM orders
    WHERE reservation_id = $1
    ORDER BY created_at DESC
  `;

  const result = await pool.query(query, [reservationId]);

  return result.rows.map((row) => ({
    id: row.id,
    reservationId: row.reservation_id,
    type: row.type,
    items: row.items,
    totalAmount: row.total_amount,
    status: row.status,
    deliveryTime: row.delivery_time || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function getAllOrders(filters: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ orders: Order[]; total: number }> {
  const { status, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (status && status !== 'all') {
    conditions.push(`status = $${paramIndex}`);
    params.push(status);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // 전체 개수 조회
  const countQuery = `SELECT COUNT(*) FROM orders ${whereClause}`;
  const countResult = await pool.query(countQuery, params);
  const total = parseInt(countResult.rows[0].count);

  // 목록 조회
  const query = `
    SELECT 
      id,
      reservation_id,
      type,
      items,
      total_amount,
      status,
      delivery_time,
      notes,
      created_at,
      updated_at
    FROM orders
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  params.push(limit, offset);

  const result = await pool.query(query, params);

  const orders: Order[] = result.rows.map((row) => ({
    id: row.id,
    reservationId: row.reservation_id,
    type: row.type,
    items: row.items,
    totalAmount: row.total_amount,
    status: row.status,
    deliveryTime: row.delivery_time || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return { orders, total };
}

/**
 * 객실별 주문 내역 조회
 */
export async function getOrdersByRoomName(roomName: string): Promise<Order[]> {
  const query = `
    SELECT 
      o.id,
      o.reservation_id,
      o.type,
      o.items,
      o.total_amount,
      o.status,
      o.delivery_time,
      o.notes,
      o.created_at,
      o.updated_at
    FROM orders o
    INNER JOIN reservations r ON o.reservation_id = r.id
    WHERE r.assigned_room = $1
    ORDER BY o.created_at DESC
  `;

  const result = await pool.query(query, [roomName]);

  return result.rows.map((row) => ({
    id: row.id,
    reservationId: row.reservation_id,
    type: row.type,
    items: row.items,
    totalAmount: row.total_amount,
    status: row.status,
    deliveryTime: row.delivery_time || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function getOrderById(id: string): Promise<Order | null> {
  const query = `
    SELECT 
      id,
      reservation_id,
      type,
      items,
      total_amount,
      status,
      delivery_time,
      notes,
      created_at,
      updated_at
    FROM orders
    WHERE id = $1
  `;

  const result = await pool.query(query, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    reservationId: row.reservation_id,
    type: row.type,
    items: row.items,
    totalAmount: row.total_amount,
    status: row.status,
    deliveryTime: row.delivery_time || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createOrder(data: CreateOrderData): Promise<Order> {
  const query = `
    INSERT INTO orders (
      reservation_id,
      type,
      items,
      total_amount,
      status,
      delivery_time,
      notes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING 
      id,
      reservation_id,
      type,
      items,
      total_amount,
      status,
      delivery_time,
      notes,
      created_at,
      updated_at
  `;

  const result = await pool.query(query, [
    data.reservationId,
    data.type,
    JSON.stringify(data.items),
    data.totalAmount,
    'pending',
    data.deliveryTime || null,
    data.notes || null,
  ]);

  const row = result.rows[0];
  return {
    id: row.id,
    reservationId: row.reservation_id,
    type: row.type,
    items: row.items,
    totalAmount: row.total_amount,
    status: row.status,
    deliveryTime: row.delivery_time || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function updateOrder(id: string, data: UpdateOrderData): Promise<Order> {
  const updates: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (data.status !== undefined) {
    updates.push(`status = $${paramIndex}`);
    params.push(data.status);
    paramIndex++;
  }

  if (updates.length === 0) {
    const existing = await getOrderById(id);
    if (!existing) {
      throw new Error('Order not found');
    }
    return existing;
  }

  params.push(id);

  const query = `
    UPDATE orders
    SET ${updates.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING 
      id,
      reservation_id,
      type,
      items,
      total_amount,
      status,
      delivery_time,
      notes,
      created_at,
      updated_at
  `;

  const result = await pool.query(query, params);

  if (result.rows.length === 0) {
    throw new Error('Order not found');
  }

  const row = result.rows[0];
  return {
    id: row.id,
    reservationId: row.reservation_id,
    type: row.type,
    items: row.items,
    totalAmount: row.total_amount,
    status: row.status,
    deliveryTime: row.delivery_time || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
