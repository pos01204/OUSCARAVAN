import pool from '../config/database';

/**
 * reservations 테이블에 options 필드 추가 마이그레이션
 */
const migration004AddReservationOptions = `
-- reservations 테이블에 options 필드 추가 (JSONB)
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'::jsonb;

-- options 필드에 인덱스 추가 (선택사항)
CREATE INDEX IF NOT EXISTS idx_reservations_options ON reservations USING GIN (options);
`;

/**
 * 알림 시스템 테이블 추가 마이그레이션
 */
const migration005AddNotifications = `
-- 알림 시스템 테이블 생성

-- 1. notifications 테이블
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id VARCHAR(50) NOT NULL DEFAULT 'admin',
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'checkin',
    'checkout',
    'order_created',
    'order_status_changed',
    'order_cancelled',
    'reservation_assigned',
    'reservation_cancelled'
  )),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMP,
  
  -- 관련 데이터 (JSONB)
  metadata JSONB,
  
  -- 링크 정보
  link_type VARCHAR(50),
  link_id VARCHAR(255),
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_notifications_admin_id ON notifications(admin_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_admin_read ON notifications(admin_id, is_read, created_at DESC);

-- 2. notification_settings 테이블
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id VARCHAR(50) NOT NULL UNIQUE DEFAULT 'admin',
  
  -- 알림 타입별 수신 여부
  checkin_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  checkout_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  order_created_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  order_status_changed_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  order_cancelled_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  reservation_assigned_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  reservation_cancelled_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- 알림 설정
  sound_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  vibration_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  auto_delete_days INTEGER DEFAULT 30,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 기본 설정 데이터 삽입
INSERT INTO notification_settings (admin_id) 
VALUES ('admin')
ON CONFLICT (admin_id) DO NOTHING;

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON notification_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

/**
 * 기본 10개 방 데이터 삽입 마이그레이션
 */
const migration002DefaultRooms = `
-- 기본 10개 방 데이터 삽입 (오션뷰 전용)
-- 1호~10호로 표준화 (6호, 10호만 2인실)
-- 이미 존재하는 방은 upsert로 보정 (ON CONFLICT (name) DO UPDATE)

-- 현재 방 개수 확인
DO $$
DECLARE
  room_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO room_count FROM rooms;
  RAISE NOTICE '현재 방 개수: %', room_count;
END $$;

-- 방 데이터 삽입
INSERT INTO rooms (id, name, type, capacity, status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  room_name,
  '오션뷰카라반',
  room_capacity,
  'available',
  NOW(),
  NOW()
FROM (VALUES
  ('1호', 4),
  ('2호', 4),
  ('3호', 4),
  ('4호', 4),
  ('5호', 4),
  ('6호', 2),
  ('7호', 4),
  ('8호', 4),
  ('9호', 4),
  ('10호', 2)
) AS rooms_data(room_name, room_capacity)
ON CONFLICT (name) DO UPDATE
SET
  type = EXCLUDED.type,
  capacity = EXCLUDED.capacity,
  status = EXCLUDED.status,
  updated_at = NOW();

-- 최종 방 개수 확인
DO $$
DECLARE
  final_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO final_count FROM rooms;
  RAISE NOTICE '최종 방 개수: %', final_count;
END $$;
`;

/**
 * 마이그레이션 실행
 */
async function runMigration(name: string, sql: string): Promise<void> {
  try {
    console.log(`[MIGRATION] Running ${name}...`);
    await pool.query(sql);
    console.log(`[MIGRATION] ✓ ${name} completed`);
  } catch (error: any) {
    // 이미 실행된 마이그레이션은 무시 (ON CONFLICT 등)
    if (error.code === '23505' || error.message?.includes('already exists') || error.message?.includes('duplicate')) {
      console.log(`[MIGRATION] ⚠ ${name} skipped (already applied or conflict)`);
      return;
    }
    console.error(`[MIGRATION] ✗ ${name} failed:`, error.message);
    // 에러를 throw하지 않고 로그만 출력 (서버가 계속 실행되도록)
  }
}

/**
 * 모든 마이그레이션 실행
 */
export async function runMigrations(): Promise<void> {
  try {
    console.log('[MIGRATION] Starting migrations...');
    
    // 기본 방 데이터 마이그레이션 실행
    await runMigration('002_default_rooms', migration002DefaultRooms);
    
    // reservations options 필드 추가 마이그레이션 실행
    await runMigration('004_add_reservation_options', migration004AddReservationOptions);
    
    // 알림 시스템 테이블 추가 마이그레이션 실행
    await runMigration('005_add_notifications', migration005AddNotifications);
    
    // 방 이름을 1호~10호로 변경하는 마이그레이션 실행
    // 마이그레이션 SQL을 직접 포함 (파일 읽기 대신)
    const migration006UpdateRoomsToNumbered = `
-- rooms 표준화: 항상 1호~10호만 유지 (웹/자동화/마이그레이션 충돌 방지)
-- - 예약 assigned_room은 A1~B2 → 1호~10호로 매핑
-- - rooms는 1호~10호 upsert로 보정
-- - 그 외 rooms는 삭제하여 항상 10개만 유지

-- 1) 예약 테이블의 assigned_room 업데이트 (레거시 코드 매핑)
UPDATE reservations
SET assigned_room = CASE
  WHEN assigned_room = 'A1' THEN '1호'
  WHEN assigned_room = 'A2' THEN '2호'
  WHEN assigned_room = 'A3' THEN '3호'
  WHEN assigned_room = 'A4' THEN '4호'
  WHEN assigned_room = 'A5' THEN '5호'
  WHEN assigned_room = 'A6' THEN '6호'
  WHEN assigned_room = 'A7' THEN '7호'
  WHEN assigned_room = 'A8' THEN '8호'
  WHEN assigned_room = 'B1' THEN '9호'
  WHEN assigned_room = 'B2' THEN '10호'
  ELSE assigned_room
END
WHERE assigned_room IN ('A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'B1', 'B2');

-- 2) rooms upsert (표준 10개)
INSERT INTO rooms (id, name, type, capacity, status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  room_name,
  '오션뷰카라반',
  room_capacity,
  'available',
  NOW(),
  NOW()
FROM (VALUES
  ('1호', 4),
  ('2호', 4),
  ('3호', 4),
  ('4호', 4),
  ('5호', 4),
  ('6호', 2),
  ('7호', 4),
  ('8호', 4),
  ('9호', 4),
  ('10호', 2)
) AS rooms_data(room_name, room_capacity)
ON CONFLICT (name) DO UPDATE
SET
  type = EXCLUDED.type,
  capacity = EXCLUDED.capacity,
  status = EXCLUDED.status,
  updated_at = NOW();

-- 3) 표준 10개 외에는 삭제 (항상 10개만 유지)
DELETE FROM rooms
WHERE name NOT IN ('1호','2호','3호','4호','5호','6호','7호','8호','9호','10호');
`;
    await runMigration('006_update_rooms_to_numbered', migration006UpdateRoomsToNumbered);
    
    // 방 개수 확인
    const result = await pool.query('SELECT COUNT(*) as count FROM rooms');
    const roomCount = parseInt(result.rows[0].count, 10);
    console.log(`[MIGRATION] Current room count: ${roomCount}`);
    
    console.log('[MIGRATION] All migrations completed');
  } catch (error) {
    console.error('[MIGRATION] Migration failed:', error);
    // 마이그레이션 실패해도 서버는 계속 실행 (이미 적용된 경우 등)
  }
}
