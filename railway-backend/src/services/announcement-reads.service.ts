import pool from '../config/database';

export async function listAnnouncementReads(reservationId: string): Promise<string[]> {
  const result = await pool.query(
    `
    SELECT announcement_id
    FROM announcement_reads
    WHERE reservation_id = $1
    ORDER BY read_at DESC
    `,
    [reservationId]
  );

  return result.rows.map((r) => r.announcement_id);
}

export async function markAnnouncementRead(reservationId: string, announcementId: string): Promise<void> {
  await pool.query(
    `
    INSERT INTO announcement_reads (reservation_id, announcement_id)
    VALUES ($1, $2)
    ON CONFLICT (reservation_id, announcement_id) DO NOTHING
    `,
    [reservationId, announcementId]
  );
}

