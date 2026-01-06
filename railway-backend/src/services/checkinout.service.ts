import pool from '../config/database';
import { updateReservation } from './reservations.service';

export interface CheckInOutLog {
  id: string;
  reservationId: string;
  type: 'checkin' | 'checkout';
  timestamp: string;
  checklist?: {
    gasLocked?: boolean;
    trashCleaned?: boolean;
  };
  notes?: string;
  createdAt: string;
}

export interface CreateCheckInOutLogData {
  reservationId: string;
  type: 'checkin' | 'checkout';
  timestamp: string;
  checklist?: {
    gasLocked?: boolean;
    trashCleaned?: boolean;
  };
  notes?: string;
}

export async function createCheckInOutLog(data: CreateCheckInOutLogData): Promise<CheckInOutLog> {
  const query = `
    INSERT INTO check_in_out_logs (
      reservation_id,
      type,
      timestamp,
      checklist,
      notes
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING 
      id,
      reservation_id,
      type,
      timestamp,
      checklist,
      notes,
      created_at
  `;

  const result = await pool.query(query, [
    data.reservationId,
    data.type,
    data.timestamp,
    data.checklist ? JSON.stringify(data.checklist) : null,
    data.notes || null,
  ]);

  const row = result.rows[0];
  return {
    id: row.id,
    reservationId: row.reservation_id,
    type: row.type,
    timestamp: row.timestamp,
    checklist: row.checklist || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
  };
}

export async function updateReservationStatus(
  reservationId: string,
  status: string
): Promise<void> {
  await updateReservation(reservationId, { status });
}
