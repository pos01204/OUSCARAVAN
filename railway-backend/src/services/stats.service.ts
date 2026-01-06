import pool from '../config/database';

export interface AdminStats {
  todayReservations: number;
  pendingCheckins: number;
  pendingCheckouts: number;
  pendingOrders: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const today = new Date().toISOString().split('T')[0];

  // 오늘 예약 수
  const todayReservationsQuery = `
    SELECT COUNT(*) 
    FROM reservations 
    WHERE DATE(created_at) = $1
  `;
  const todayReservationsResult = await pool.query(todayReservationsQuery, [today]);
  const todayReservations = parseInt(todayReservationsResult.rows[0].count);

  // 체크인 예정 수 (오늘 체크인 예정이고 아직 체크인하지 않은 예약)
  const pendingCheckinsQuery = `
    SELECT COUNT(*) 
    FROM reservations 
    WHERE checkin = $1 
    AND status NOT IN ('checked_in', 'checked_out', 'cancelled')
  `;
  const pendingCheckinsResult = await pool.query(pendingCheckinsQuery, [today]);
  const pendingCheckins = parseInt(pendingCheckinsResult.rows[0].count);

  // 체크아웃 예정 수 (오늘 체크아웃 예정이고 아직 체크아웃하지 않은 예약)
  const pendingCheckoutsQuery = `
    SELECT COUNT(*) 
    FROM reservations 
    WHERE checkout = $1 
    AND status NOT IN ('checked_out', 'cancelled')
  `;
  const pendingCheckoutsResult = await pool.query(pendingCheckoutsQuery, [today]);
  const pendingCheckouts = parseInt(pendingCheckoutsResult.rows[0].count);

  // 처리 대기 주문 수
  const pendingOrdersQuery = `
    SELECT COUNT(*) 
    FROM orders 
    WHERE status = 'pending'
  `;
  const pendingOrdersResult = await pool.query(pendingOrdersQuery);
  const pendingOrders = parseInt(pendingOrdersResult.rows[0].count);

  return {
    todayReservations,
    pendingCheckins,
    pendingCheckouts,
    pendingOrders,
  };
}
