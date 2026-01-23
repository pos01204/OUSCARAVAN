import pool from '../config/database';
import { DEFAULT_ADMIN_ID } from '../constants/admin';

export type NotificationType =
  | 'checkin'
  | 'checkout'
  | 'order_created'
  | 'order_status_changed'
  | 'order_cancelled'
  | 'reservation_assigned'
  | 'reservation_cancelled';

export type NotificationPriority = 'low' | 'medium' | 'high';

export type NotificationLinkType = 'reservation' | 'order' | 'dashboard';

export interface Notification {
  id: string;
  adminId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  readAt?: string;
  metadata?: Record<string, unknown>;
  linkType?: NotificationLinkType;
  linkId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationData {
  adminId?: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  metadata?: Record<string, unknown>;
  linkType?: NotificationLinkType;
  linkId?: string;
}

export interface NotificationFilters {
  type?: NotificationType;
  isRead?: boolean;
  priority?: NotificationPriority;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface NotificationSettings {
  id: string;
  adminId: string;
  checkinEnabled: boolean;
  checkoutEnabled: boolean;
  orderCreatedEnabled: boolean;
  orderStatusChangedEnabled: boolean;
  orderCancelledEnabled: boolean;
  reservationAssignedEnabled: boolean;
  reservationCancelledEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoDeleteDays: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 알림 생성
 */
export async function createNotification(data: CreateNotificationData): Promise<Notification> {
  const adminId = data.adminId || DEFAULT_ADMIN_ID;
  const priority = data.priority || 'medium';

  // 알림 설정 확인 (해당 타입의 알림이 활성화되어 있는지)
  const settings = await getNotificationSettings(adminId);
  if (!isNotificationTypeEnabled(settings, data.type)) {
    throw new Error(`Notification type ${data.type} is disabled`);
  }

  const query = `
    INSERT INTO notifications (
      admin_id,
      type,
      title,
      message,
      priority,
      metadata,
      link_type,
      link_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING 
      id,
      admin_id,
      type,
      title,
      message,
      priority,
      is_read,
      read_at,
      metadata,
      link_type,
      link_id,
      created_at,
      updated_at
  `;

  const result = await pool.query(query, [
    adminId,
    data.type,
    data.title,
    data.message,
    priority,
    data.metadata ? JSON.stringify(data.metadata) : null,
    data.linkType || null,
    data.linkId || null,
  ]);

  const row = result.rows[0];
  return mapRowToNotification(row);
}

/**
 * 알림 목록 조회
 */
export async function getNotifications(
  adminId: string = DEFAULT_ADMIN_ID,
  filters: NotificationFilters = {}
): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;

  let whereConditions = ['admin_id = $1'];
  const params: unknown[] = [adminId];
  let paramIndex = 2;

  if (filters.type) {
    whereConditions.push(`type = $${paramIndex}`);
    params.push(filters.type);
    paramIndex++;
  }

  if (filters.isRead !== undefined) {
    whereConditions.push(`is_read = $${paramIndex}`);
    params.push(filters.isRead);
    paramIndex++;
  }

  if (filters.priority) {
    whereConditions.push(`priority = $${paramIndex}`);
    params.push(filters.priority);
    paramIndex++;
  }

  if (filters.startDate) {
    whereConditions.push(`created_at >= $${paramIndex}`);
    params.push(filters.startDate);
    paramIndex++;
  }

  if (filters.endDate) {
    whereConditions.push(`created_at <= $${paramIndex}`);
    params.push(filters.endDate);
    paramIndex++;
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  // 알림 목록 조회
  const query = `
    SELECT 
      id,
      admin_id,
      type,
      title,
      message,
      priority,
      is_read,
      read_at,
      metadata,
      link_type,
      link_id,
      created_at,
      updated_at
    FROM notifications
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  params.push(limit, offset);

  const result = await pool.query(query, params);

  // 전체 개수 조회
  const countQuery = `
    SELECT COUNT(*) as total
    FROM notifications
    ${whereClause}
  `;

  const countResult = await pool.query(countQuery, params.slice(0, -2));
  const total = parseInt(countResult.rows[0].total, 10);

  // 읽지 않은 알림 개수 조회
  const unreadQuery = `
    SELECT COUNT(*) as count
    FROM notifications
    WHERE admin_id = $1 AND is_read = FALSE
  `;

  const unreadResult = await pool.query(unreadQuery, [adminId]);
  const unreadCount = parseInt(unreadResult.rows[0].count, 10);

  return {
    notifications: result.rows.map(mapRowToNotification),
    total,
    unreadCount,
  };
}

/**
 * 알림 읽음 처리
 */
export async function markNotificationAsRead(
  id: string,
  adminId: string = DEFAULT_ADMIN_ID
): Promise<Notification> {
  const query = `
    UPDATE notifications
    SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND admin_id = $2
    RETURNING 
      id,
      admin_id,
      type,
      title,
      message,
      priority,
      is_read,
      read_at,
      metadata,
      link_type,
      link_id,
      created_at,
      updated_at
  `;

  const result = await pool.query(query, [id, adminId]);

  if (result.rows.length === 0) {
    throw new Error('Notification not found');
  }

  return mapRowToNotification(result.rows[0]);
}

/**
 * 모든 알림 읽음 처리
 */
export async function markAllNotificationsAsRead(adminId: string = DEFAULT_ADMIN_ID): Promise<number> {
  const query = `
    UPDATE notifications
    SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
    WHERE admin_id = $1 AND is_read = FALSE
    RETURNING id
  `;

  const result = await pool.query(query, [adminId]);
  return result.rows.length;
}

/**
 * 알림 삭제
 */
export async function deleteNotification(id: string, adminId: string = DEFAULT_ADMIN_ID): Promise<void> {
  const query = `
    DELETE FROM notifications
    WHERE id = $1 AND admin_id = $2
  `;

  const result = await pool.query(query, [id, adminId]);

  if (result.rowCount === 0) {
    throw new Error('Notification not found');
  }
}

/**
 * 알림 설정 조회
 */
export async function getNotificationSettings(adminId: string = DEFAULT_ADMIN_ID): Promise<NotificationSettings> {
  const query = `
    SELECT 
      id,
      admin_id,
      checkin_enabled,
      checkout_enabled,
      order_created_enabled,
      order_status_changed_enabled,
      order_cancelled_enabled,
      reservation_assigned_enabled,
      reservation_cancelled_enabled,
      sound_enabled,
      vibration_enabled,
      auto_delete_days,
      created_at,
      updated_at
    FROM notification_settings
    WHERE admin_id = $1
  `;

  const result = await pool.query(query, [adminId]);

  if (result.rows.length === 0) {
    // 기본 설정 생성
    return await createDefaultNotificationSettings(adminId);
  }

  const row = result.rows[0];
  return {
    id: row.id,
    adminId: row.admin_id,
    checkinEnabled: row.checkin_enabled,
    checkoutEnabled: row.checkout_enabled,
    orderCreatedEnabled: row.order_created_enabled,
    orderStatusChangedEnabled: row.order_status_changed_enabled,
    orderCancelledEnabled: row.order_cancelled_enabled,
    reservationAssignedEnabled: row.reservation_assigned_enabled,
    reservationCancelledEnabled: row.reservation_cancelled_enabled,
    soundEnabled: row.sound_enabled,
    vibrationEnabled: row.vibration_enabled,
    autoDeleteDays: row.auto_delete_days,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * 알림 설정 업데이트
 */
export async function updateNotificationSettings(
  adminId: string = DEFAULT_ADMIN_ID,
  data: Partial<NotificationSettings>
): Promise<NotificationSettings> {
  const updateFields: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (data.checkinEnabled !== undefined) {
    updateFields.push(`checkin_enabled = $${paramIndex}`);
    params.push(data.checkinEnabled);
    paramIndex++;
  }

  if (data.checkoutEnabled !== undefined) {
    updateFields.push(`checkout_enabled = $${paramIndex}`);
    params.push(data.checkoutEnabled);
    paramIndex++;
  }

  if (data.orderCreatedEnabled !== undefined) {
    updateFields.push(`order_created_enabled = $${paramIndex}`);
    params.push(data.orderCreatedEnabled);
    paramIndex++;
  }

  if (data.orderStatusChangedEnabled !== undefined) {
    updateFields.push(`order_status_changed_enabled = $${paramIndex}`);
    params.push(data.orderStatusChangedEnabled);
    paramIndex++;
  }

  if (data.orderCancelledEnabled !== undefined) {
    updateFields.push(`order_cancelled_enabled = $${paramIndex}`);
    params.push(data.orderCancelledEnabled);
    paramIndex++;
  }

  if (data.reservationAssignedEnabled !== undefined) {
    updateFields.push(`reservation_assigned_enabled = $${paramIndex}`);
    params.push(data.reservationAssignedEnabled);
    paramIndex++;
  }

  if (data.reservationCancelledEnabled !== undefined) {
    updateFields.push(`reservation_cancelled_enabled = $${paramIndex}`);
    params.push(data.reservationCancelledEnabled);
    paramIndex++;
  }

  if (data.soundEnabled !== undefined) {
    updateFields.push(`sound_enabled = $${paramIndex}`);
    params.push(data.soundEnabled);
    paramIndex++;
  }

  if (data.vibrationEnabled !== undefined) {
    updateFields.push(`vibration_enabled = $${paramIndex}`);
    params.push(data.vibrationEnabled);
    paramIndex++;
  }

  if (data.autoDeleteDays !== undefined) {
    updateFields.push(`auto_delete_days = $${paramIndex}`);
    params.push(data.autoDeleteDays);
    paramIndex++;
  }

  if (updateFields.length === 0) {
    return await getNotificationSettings(adminId);
  }

  params.push(adminId);

  const query = `
    UPDATE notification_settings
    SET ${updateFields.join(', ')}
    WHERE admin_id = $${paramIndex}
    RETURNING 
      id,
      admin_id,
      checkin_enabled,
      checkout_enabled,
      order_created_enabled,
      order_status_changed_enabled,
      order_cancelled_enabled,
      reservation_assigned_enabled,
      reservation_cancelled_enabled,
      sound_enabled,
      vibration_enabled,
      auto_delete_days,
      created_at,
      updated_at
  `;

  const result = await pool.query(query, params);

  if (result.rows.length === 0) {
    return await createDefaultNotificationSettings(adminId);
  }

  const row = result.rows[0];
  return {
    id: row.id,
    adminId: row.admin_id,
    checkinEnabled: row.checkin_enabled,
    checkoutEnabled: row.checkout_enabled,
    orderCreatedEnabled: row.order_created_enabled,
    orderStatusChangedEnabled: row.order_status_changed_enabled,
    orderCancelledEnabled: row.order_cancelled_enabled,
    reservationAssignedEnabled: row.reservation_assigned_enabled,
    reservationCancelledEnabled: row.reservation_cancelled_enabled,
    soundEnabled: row.sound_enabled,
    vibrationEnabled: row.vibration_enabled,
    autoDeleteDays: row.auto_delete_days,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * 알림 통계 조회
 */
export async function getNotificationStats(adminId: string = DEFAULT_ADMIN_ID) {
  const totalQuery = `
    SELECT COUNT(*) as count
    FROM notifications
    WHERE admin_id = $1
  `;

  const unreadQuery = `
    SELECT COUNT(*) as count
    FROM notifications
    WHERE admin_id = $1 AND is_read = FALSE
  `;

  const todayQuery = `
    SELECT COUNT(*) as count
    FROM notifications
    WHERE admin_id = $1 AND DATE(created_at) = CURRENT_DATE
  `;

  const thisWeekQuery = `
    SELECT COUNT(*) as count
    FROM notifications
    WHERE admin_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '7 days'
  `;

  const byTypeQuery = `
    SELECT type, COUNT(*) as count
    FROM notifications
    WHERE admin_id = $1
    GROUP BY type
  `;

  const [totalResult, unreadResult, todayResult, thisWeekResult, byTypeResult] = await Promise.all([
    pool.query(totalQuery, [adminId]),
    pool.query(unreadQuery, [adminId]),
    pool.query(todayQuery, [adminId]),
    pool.query(thisWeekQuery, [adminId]),
    pool.query(byTypeQuery, [adminId]),
  ]);

  const byType: Record<string, number> = {};
  byTypeResult.rows.forEach((row) => {
    byType[row.type] = parseInt(row.count, 10);
  });

  return {
    total: parseInt(totalResult.rows[0].count, 10),
    unread: parseInt(unreadResult.rows[0].count, 10),
    today: parseInt(todayResult.rows[0].count, 10),
    thisWeek: parseInt(thisWeekResult.rows[0].count, 10),
    byType,
  };
}

/**
 * 알림 타입별 활성화 여부 확인
 */
function isNotificationTypeEnabled(settings: NotificationSettings, type: NotificationType): boolean {
  switch (type) {
    case 'checkin':
      return settings.checkinEnabled;
    case 'checkout':
      return settings.checkoutEnabled;
    case 'order_created':
      return settings.orderCreatedEnabled;
    case 'order_status_changed':
      return settings.orderStatusChangedEnabled;
    case 'order_cancelled':
      return settings.orderCancelledEnabled;
    case 'reservation_assigned':
      return settings.reservationAssignedEnabled;
    case 'reservation_cancelled':
      return settings.reservationCancelledEnabled;
    default:
      return true;
  }
}

/**
 * 기본 알림 설정 생성
 */
async function createDefaultNotificationSettings(adminId: string): Promise<NotificationSettings> {
  const query = `
    INSERT INTO notification_settings (admin_id)
    VALUES ($1)
    RETURNING 
      id,
      admin_id,
      checkin_enabled,
      checkout_enabled,
      order_created_enabled,
      order_status_changed_enabled,
      order_cancelled_enabled,
      reservation_assigned_enabled,
      reservation_cancelled_enabled,
      sound_enabled,
      vibration_enabled,
      auto_delete_days,
      created_at,
      updated_at
  `;

  const result = await pool.query(query, [adminId]);
  const row = result.rows[0];

  return {
    id: row.id,
    adminId: row.admin_id,
    checkinEnabled: row.checkin_enabled,
    checkoutEnabled: row.checkout_enabled,
    orderCreatedEnabled: row.order_created_enabled,
    orderStatusChangedEnabled: row.order_status_changed_enabled,
    orderCancelledEnabled: row.order_cancelled_enabled,
    reservationAssignedEnabled: row.reservation_assigned_enabled,
    reservationCancelledEnabled: row.reservation_cancelled_enabled,
    soundEnabled: row.sound_enabled,
    vibrationEnabled: row.vibration_enabled,
    autoDeleteDays: row.auto_delete_days,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * 데이터베이스 행을 Notification 객체로 변환
 */
function mapRowToNotification(row: any): Notification {
  return {
    id: row.id,
    adminId: row.admin_id,
    type: row.type,
    title: row.title,
    message: row.message,
    priority: row.priority,
    isRead: row.is_read,
    readAt: row.read_at || undefined,
    metadata: row.metadata || undefined,
    linkType: row.link_type || undefined,
    linkId: row.link_id || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
