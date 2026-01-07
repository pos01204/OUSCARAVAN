import pool from '../config/database';

/**
 * 기본 10개 방 데이터 삽입 마이그레이션
 */
const migration002DefaultRooms = `
-- 기본 10개 방 데이터 삽입 (오션뷰 전용)
-- 4인실 8개 (A1~A8), 2인실 2개 (B1~B2)
-- 이미 존재하는 방은 무시 (ON CONFLICT (name) DO NOTHING)

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
VALUES
  (gen_random_uuid(), 'A1', '오션뷰카라반', 4, 'available', NOW(), NOW()),
  (gen_random_uuid(), 'A2', '오션뷰카라반', 4, 'available', NOW(), NOW()),
  (gen_random_uuid(), 'A3', '오션뷰카라반', 4, 'available', NOW(), NOW()),
  (gen_random_uuid(), 'A4', '오션뷰카라반', 4, 'available', NOW(), NOW()),
  (gen_random_uuid(), 'A5', '오션뷰카라반', 4, 'available', NOW(), NOW()),
  (gen_random_uuid(), 'A6', '오션뷰카라반', 4, 'available', NOW(), NOW()),
  (gen_random_uuid(), 'A7', '오션뷰카라반', 4, 'available', NOW(), NOW()),
  (gen_random_uuid(), 'A8', '오션뷰카라반', 4, 'available', NOW(), NOW()),
  (gen_random_uuid(), 'B1', '오션뷰카라반', 2, 'available', NOW(), NOW()),
  (gen_random_uuid(), 'B2', '오션뷰카라반', 2, 'available', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

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
