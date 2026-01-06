-- 기본 10개 방 데이터 삽입 (오션뷰 전용)
-- 4인실 8개 (1호~8호), 2인실 2개 (9호~10호)
-- 이미 존재하는 방은 무시 (ON CONFLICT DO NOTHING)

INSERT INTO rooms (id, name, type, capacity, status, description, created_at, updated_at)
VALUES
  (gen_random_uuid(), '1호', '오션뷰카라반', 4, 'available', '오션뷰 4인실', NOW(), NOW()),
  (gen_random_uuid(), '2호', '오션뷰카라반', 4, 'available', '오션뷰 4인실', NOW(), NOW()),
  (gen_random_uuid(), '3호', '오션뷰카라반', 4, 'available', '오션뷰 4인실', NOW(), NOW()),
  (gen_random_uuid(), '4호', '오션뷰카라반', 4, 'available', '오션뷰 4인실', NOW(), NOW()),
  (gen_random_uuid(), '5호', '오션뷰카라반', 4, 'available', '오션뷰 4인실', NOW(), NOW()),
  (gen_random_uuid(), '6호', '오션뷰카라반', 4, 'available', '오션뷰 4인실', NOW(), NOW()),
  (gen_random_uuid(), '7호', '오션뷰카라반', 4, 'available', '오션뷰 4인실', NOW(), NOW()),
  (gen_random_uuid(), '8호', '오션뷰카라반', 4, 'available', '오션뷰 4인실', NOW(), NOW()),
  (gen_random_uuid(), '9호', '오션뷰카라반', 2, 'available', '오션뷰 2인실', NOW(), NOW()),
  (gen_random_uuid(), '10호', '오션뷰카라반', 2, 'available', '오션뷰 2인실', NOW(), NOW())
ON CONFLICT DO NOTHING;
