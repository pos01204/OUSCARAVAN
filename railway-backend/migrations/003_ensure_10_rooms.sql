-- 10개 방 데이터 확인 및 삽입
-- A1~A8 (4인실), B1~B2 (2인실)
-- 기존 방이 있으면 건너뛰고, 없으면 추가

-- 먼저 기존 방 확인
DO $$
DECLARE
  room_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO room_count FROM rooms;
  RAISE NOTICE 'Current room count: %', room_count;
END $$;

-- 방 데이터 삽입 (ON CONFLICT로 중복 방지)
-- rooms 테이블에 name에 대한 UNIQUE 제약이 있다고 가정
-- 만약 없다면, 기존 방을 확인하고 추가

-- 방법 1: name이 UNIQUE인 경우
INSERT INTO rooms (id, name, type, capacity, status, description, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'A1', '오션뷰카라반', 4, 'available', '오션뷰 4인실', NOW(), NOW()),
  (gen_random_uuid(), 'A2', '오션뷰카라반', 4, 'available', '오션뷰 4인실', NOW(), NOW()),
  (gen_random_uuid(), 'A3', '오션뷰카라반', 4, 'available', '오션뷰 4인실', NOW(), NOW()),
  (gen_random_uuid(), 'A4', '오션뷰카라반', 4, 'available', '오션뷰 4인실', NOW(), NOW()),
  (gen_random_uuid(), 'A5', '오션뷰카라반', 4, 'available', '오션뷰 4인실', NOW(), NOW()),
  (gen_random_uuid(), 'A6', '오션뷰카라반', 4, 'available', '오션뷰 4인실', NOW(), NOW()),
  (gen_random_uuid(), 'A7', '오션뷰카라반', 4, 'available', '오션뷰 4인실', NOW(), NOW()),
  (gen_random_uuid(), 'A8', '오션뷰카라반', 4, 'available', '오션뷰 4인실', NOW(), NOW()),
  (gen_random_uuid(), 'B1', '오션뷰카라반', 2, 'available', '오션뷰 2인실', NOW(), NOW()),
  (gen_random_uuid(), 'B2', '오션뷰카라반', 2, 'available', '오션뷰 2인실', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- 방법 2: name에 UNIQUE 제약이 없는 경우 (위의 방법이 실패하면 이 방법 사용)
-- INSERT INTO rooms (id, name, type, capacity, status, description, created_at, updated_at)
-- SELECT 
--   gen_random_uuid(),
--   room_name,
--   '오션뷰카라반',
--   room_capacity,
--   'available',
--   room_description,
--   NOW(),
--   NOW()
-- FROM (VALUES
--   ('A1', 4, '오션뷰 4인실'),
--   ('A2', 4, '오션뷰 4인실'),
--   ('A3', 4, '오션뷰 4인실'),
--   ('A4', 4, '오션뷰 4인실'),
--   ('A5', 4, '오션뷰 4인실'),
--   ('A6', 4, '오션뷰 4인실'),
--   ('A7', 4, '오션뷰 4인실'),
--   ('A8', 4, '오션뷰 4인실'),
--   ('B1', 2, '오션뷰 2인실'),
--   ('B2', 2, '오션뷰 2인실')
-- ) AS rooms_to_insert(room_name, room_capacity, room_description)
-- WHERE NOT EXISTS (
--   SELECT 1 FROM rooms WHERE rooms.name = rooms_to_insert.room_name
-- );

-- 최종 방 개수 확인
DO $$
DECLARE
  final_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO final_count FROM rooms;
  RAISE NOTICE 'Final room count: %', final_count;
END $$;
