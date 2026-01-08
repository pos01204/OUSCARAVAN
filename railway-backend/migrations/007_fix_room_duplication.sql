-- 방 데이터 중복 해결 및 정규화 (A1..B2 -> 1호..10호)
BEGIN;

-- 1. 먼저 목표로 하는 1호~10호 방이 없으면 생성 (있다면 건너뜀)
-- 이렇게 하면 '1호'가 이미 있어서 A1을 이름 변경할 때 나는 충돌을 피할 수 있습니다.
INSERT INTO rooms (id, name, type, capacity, status, created_at, updated_at)
SELECT gen_random_uuid(), room_name, '오션뷰카라반', room_capacity, 'available', NOW(), NOW()
FROM (VALUES 
  ('1호', 4), ('2호', 4), ('3호', 4), ('4호', 4), ('5호', 4),
  ('6호', 2), ('7호', 4), ('8호', 4), ('9호', 4), ('10호', 2)
) AS v(room_name, room_capacity)
WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE name = v.room_name);

-- 2. 예약 테이블의 기존 방 이름(A1..B2)을 새 이름(1호..10호)으로 업데이트
UPDATE reservations SET assigned_room = '1호' WHERE assigned_room = 'A1';
UPDATE reservations SET assigned_room = '2호' WHERE assigned_room = 'A2';
UPDATE reservations SET assigned_room = '3호' WHERE assigned_room = 'A3';
UPDATE reservations SET assigned_room = '4호' WHERE assigned_room = 'A4';
UPDATE reservations SET assigned_room = '5호' WHERE assigned_room = 'A5';
UPDATE reservations SET assigned_room = '6호' WHERE assigned_room = 'A6';
UPDATE reservations SET assigned_room = '7호' WHERE assigned_room = 'A7';
UPDATE reservations SET assigned_room = '8호' WHERE assigned_room = 'A8';
UPDATE reservations SET assigned_room = '9호' WHERE assigned_room = 'B1';
UPDATE reservations SET assigned_room = '10호' WHERE assigned_room = 'B2';

-- 3. 이제 불필요해진 기존 방(A1..B2)을 안전하게 삭제
DELETE FROM rooms WHERE name IN ('A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'B1', 'B2');

COMMIT;

-- 결과 확인
DO $$
DECLARE
  room_count INTEGER;
  old_room_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO room_count FROM rooms WHERE name ~ '^\d+호$';
  SELECT COUNT(*) INTO old_room_count FROM rooms WHERE name IN ('A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'B1', 'B2');
  
  RAISE NOTICE '생성된 신규 방(1호~10호) 개수: %', room_count;
  RAISE NOTICE '삭제된 구형 방(A1~B2) 잔여 개수: % (0이어야 함)', old_room_count;
END $$;
