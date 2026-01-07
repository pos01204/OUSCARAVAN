-- 기본 10개 방 데이터 삽입 (오션뷰 전용)
-- 4인실 8개 (A1~A8), 2인실 2개 (B1~B2)
-- 이미 존재하는 방은 무시 (ON CONFLICT DO NOTHING)

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
ON CONFLICT DO NOTHING;
