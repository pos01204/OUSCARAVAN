import pool from '../config/database';

export type AnnouncementLevel = 'info' | 'warning' | 'critical';
export type AnnouncementStatus = 'all' | 'active' | 'inactive' | 'expired' | 'scheduled';

export interface Announcement {
  id: string;
  adminId: string;
  title: string;
  content: string;
  level: AnnouncementLevel;
  startsAt: string;
  endsAt?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementData {
  adminId?: string;
  title: string;
  content: string;
  level?: AnnouncementLevel;
  startsAt?: string;
  endsAt?: string | null;
  isActive?: boolean;
}

export interface AnnouncementFilters {
  status?: AnnouncementStatus;
  level?: AnnouncementLevel;
  search?: string;
  page?: number;
  limit?: number;
}

function mapRowToAnnouncement(row: any): Announcement {
  return {
    id: row.id,
    adminId: row.admin_id,
    title: row.title,
    content: row.content,
    level: row.level,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createAnnouncement(data: CreateAnnouncementData): Promise<Announcement> {
  const adminId = data.adminId || 'admin';
  const level = data.level || 'info';
  const startsAt = data.startsAt || new Date().toISOString();
  const isActive = data.isActive !== undefined ? data.isActive : true;

  const query = `
    INSERT INTO announcements (
      admin_id,
      title,
      content,
      level,
      starts_at,
      ends_at,
      is_active
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING
      id,
      admin_id,
      title,
      content,
      level,
      starts_at,
      ends_at,
      is_active,
      created_at,
      updated_at
  `;

  const result = await pool.query(query, [
    adminId,
    data.title,
    data.content,
    level,
    startsAt,
    data.endsAt || null,
    isActive,
  ]);

  return mapRowToAnnouncement(result.rows[0]);
}

export async function getAnnouncements(
  adminId: string = 'admin',
  filters: AnnouncementFilters = {}
): Promise<{ announcements: Announcement[]; total: number }> {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;

  const whereConditions: string[] = ['admin_id = $1'];
  const params: unknown[] = [adminId];
  let paramIndex = 2;

  if (filters.level) {
    whereConditions.push(`level = $${paramIndex}`);
    params.push(filters.level);
    paramIndex++;
  }

  if (filters.search) {
    whereConditions.push(`(title ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`);
    params.push(`%${filters.search}%`);
    paramIndex++;
  }

  switch (filters.status) {
    case 'active':
      whereConditions.push(
        'is_active = TRUE AND starts_at <= NOW() AND (ends_at IS NULL OR ends_at >= NOW())'
      );
      break;
    case 'inactive':
      whereConditions.push('is_active = FALSE');
      break;
    case 'expired':
      whereConditions.push('is_active = TRUE AND ends_at IS NOT NULL AND ends_at < NOW()');
      break;
    case 'scheduled':
      whereConditions.push('is_active = TRUE AND starts_at > NOW()');
      break;
    default:
      break;
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  const query = `
    SELECT
      id,
      admin_id,
      title,
      content,
      level,
      starts_at,
      ends_at,
      is_active,
      created_at,
      updated_at
    FROM announcements
    ${whereClause}
    ORDER BY starts_at DESC, created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  params.push(limit, offset);
  const result = await pool.query(query, params);

  const countQuery = `
    SELECT COUNT(*) as total
    FROM announcements
    ${whereClause}
  `;

  const countResult = await pool.query(countQuery, params.slice(0, -2));
  const total = parseInt(countResult.rows[0].total, 10);

  return {
    announcements: result.rows.map(mapRowToAnnouncement),
    total,
  };
}

export async function updateAnnouncement(
  id: string,
  adminId: string,
  data: Partial<CreateAnnouncementData>
): Promise<Announcement> {
  const fields: string[] = [];
  const params: unknown[] = [id, adminId];
  let paramIndex = 3;

  if (data.title !== undefined) {
    fields.push(`title = $${paramIndex}`);
    params.push(data.title);
    paramIndex++;
  }
  if (data.content !== undefined) {
    fields.push(`content = $${paramIndex}`);
    params.push(data.content);
    paramIndex++;
  }
  if (data.level !== undefined) {
    fields.push(`level = $${paramIndex}`);
    params.push(data.level);
    paramIndex++;
  }
  if (data.startsAt !== undefined) {
    fields.push(`starts_at = $${paramIndex}`);
    params.push(data.startsAt);
    paramIndex++;
  }
  if (data.endsAt !== undefined) {
    fields.push(`ends_at = $${paramIndex}`);
    params.push(data.endsAt || null);
    paramIndex++;
  }
  if (data.isActive !== undefined) {
    fields.push(`is_active = $${paramIndex}`);
    params.push(data.isActive);
    paramIndex++;
  }

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  const query = `
    UPDATE announcements
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND admin_id = $2
    RETURNING
      id,
      admin_id,
      title,
      content,
      level,
      starts_at,
      ends_at,
      is_active,
      created_at,
      updated_at
  `;

  const result = await pool.query(query, params);
  if (result.rows.length === 0) {
    throw new Error('Announcement not found');
  }
  return mapRowToAnnouncement(result.rows[0]);
}

export async function deleteAnnouncement(id: string, adminId: string): Promise<void> {
  const result = await pool.query(
    'DELETE FROM announcements WHERE id = $1 AND admin_id = $2',
    [id, adminId]
  );

  if (result.rowCount === 0) {
    throw new Error('Announcement not found');
  }
}

export async function getActiveAnnouncements(limit: number = 50): Promise<Announcement[]> {
  const query = `
    SELECT
      id,
      admin_id,
      title,
      content,
      level,
      starts_at,
      ends_at,
      is_active,
      created_at,
      updated_at
    FROM announcements
    WHERE is_active = TRUE
      AND starts_at <= NOW()
      AND (ends_at IS NULL OR ends_at >= NOW())
    ORDER BY
      CASE level
        WHEN 'critical' THEN 0
        WHEN 'warning' THEN 1
        ELSE 2
      END,
      starts_at DESC,
      created_at DESC
    LIMIT $1
  `;

  const result = await pool.query(query, [limit]);
  return result.rows.map(mapRowToAnnouncement);
}
