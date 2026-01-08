-- 방 데이터 삭제 후 1호~10호 방 재생성
-- 6호, 10호: 2인실
-- 나머지 (1~5, 7~9): 4인실

BEGIN;

-- 기존 방 데이터가 있는지 확인하고 삭제 (선택사항)
-- DELETE FROM rooms WHERE name IN ('A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'B1', 'B2', '1호', '2호', '3호', '4호', '5호', '6호', '7호', '8호', '9호', '10호');

-- 1호~10호 방 생성
INSERT INTO rooms (id, name, type, capacity, status, created_at, updated_at)
VALUES
  (gen_random_uuid(), '1호', '오션뷰카라반', 4, 'available', NOW(), NOW()),
  (gen_random_uuid(), '2호', '오션뷰카라반', 4, 'available', NOW(), NOW()),
  (gen_random_uuid(), '3호', '오션뷰카라반', 4, 'available', NOW(), NOW()),
  (gen_random_uuid(), '4호', '오션뷰카라반', 4, 'available', NOW(), NOW()),
  (gen_random_uuid(), '5호', '오션뷰카라반', 4, 'available', NOW(), NOW()),
  (gen_random_uuid(), '6호', '오션뷰카라반', 2, 'available', NOW(), NOW()),
  (gen_random_uuid(), '7호', '오션뷰카라반', 4, 'available', NOW(), NOW()),
  (gen_random_uuid(), '8호', '오션뷰카라반', 4, 'available', NOW(), NOW()),
  (gen_random_uuid(), '9호', '오션뷰카라반', 4, 'available', NOW(), NOW()),
  (gen_random_uuid(), '10호', '오션뷰카라반', 2, 'available', NOW(), NOW())
ON CONFLICT (name) DO UPDATE
SET 
  type = EXCLUDED.type,
  capacity = EXCLUDED.capacity,
  status = EXCLUDED.status,
  updated_at = NOW();

COMMIT;

-- 생성 결과 확인
DO $$
DECLARE
  room_count INTEGER;
  room_list TEXT;
BEGIN
  SELECT COUNT(*) INTO room_count FROM rooms WHERE name ~ '^\d+호$';
  SELECT string_agg(name || '(' || capacity || '인실)', ', ' ORDER BY 
    CAST(SUBSTRING(name FROM '^(\d+)') AS INTEGER)
  ) INTO room_list
  FROM rooms 
  WHERE name ~ '^\d+호$';
  
  RAISE NOTICE '총 방 개수: %', room_count;
  RAISE NOTICE '방 목록: %', room_list;
END $$;
