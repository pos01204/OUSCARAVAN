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

-- 방 데이터 삽입 (name이 UNIQUE이므로 ON CONFLICT 사용)
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
