-- 방 이름을 1호~10호로 변경
-- 6호, 10호: 2인실
-- 나머지 (1~5, 7~9): 4인실

-- 기존 A1~A8, B1~B2를 1호~10호로 변경
-- 먼저 기존 방 이름과 새 방 이름 매핑
-- A1 -> 1호, A2 -> 2호, ..., A8 -> 8호
-- B1 -> 9호, B2 -> 10호

-- 예약 테이블의 assigned_room도 함께 업데이트
BEGIN;

-- 1. 예약 테이블의 assigned_room 업데이트
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

-- 2. 방 테이블의 name 업데이트 및 capacity 수정
-- 주의: capacity는 원래 name 기준으로 계산해야 하므로 서브쿼리 사용
UPDATE rooms
SET 
  name = CASE
    WHEN name = 'A1' THEN '1호'
    WHEN name = 'A2' THEN '2호'
    WHEN name = 'A3' THEN '3호'
    WHEN name = 'A4' THEN '4호'
    WHEN name = 'A5' THEN '5호'
    WHEN name = 'A6' THEN '6호'
    WHEN name = 'A7' THEN '7호'
    WHEN name = 'A8' THEN '8호'
    WHEN name = 'B1' THEN '9호'
    WHEN name = 'B2' THEN '10호'
    ELSE name
  END,
  capacity = CASE
    -- 원래 name 기준으로 capacity 계산 (변경 전 값 사용)
    WHEN rooms.name IN ('A6', 'B2') THEN 2  -- 6호(A6), 10호(B2)는 2인실
    WHEN rooms.name IN ('A1', 'A2', 'A3', 'A4', 'A5', 'A7', 'A8', 'B1') THEN 4  -- 나머지는 4인실
    ELSE capacity  -- 기타 경우는 기존 값 유지
  END,
  updated_at = NOW()
WHERE name IN ('A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'B1', 'B2');

-- 3. 만약 기존 방이 없다면 새로 생성
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
WHERE NOT EXISTS (
  SELECT 1 FROM rooms WHERE name = rooms_data.room_name
)
ON CONFLICT (name) DO NOTHING;

COMMIT;

-- 변경 결과 확인
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
