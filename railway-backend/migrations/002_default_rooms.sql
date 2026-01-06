-- 기본 10개 방 데이터 삽입
-- 이미 존재하는 방은 무시 (ON CONFLICT DO NOTHING)

INSERT INTO rooms (id, name, type, capacity, status, description, created_at, updated_at)
VALUES
  (gen_random_uuid(), '오션뷰 1호', '오션뷰카라반', 4, 'available', '오션뷰 전망의 프리미엄 카라반', NOW(), NOW()),
  (gen_random_uuid(), '오션뷰 2호', '오션뷰카라반', 4, 'available', '오션뷰 전망의 프리미엄 카라반', NOW(), NOW()),
  (gen_random_uuid(), '오션뷰 3호', '오션뷰카라반', 4, 'available', '오션뷰 전망의 프리미엄 카라반', NOW(), NOW()),
  (gen_random_uuid(), '오션뷰 4호', '오션뷰카라반', 4, 'available', '오션뷰 전망의 프리미엄 카라반', NOW(), NOW()),
  (gen_random_uuid(), '오션뷰 5호', '오션뷰카라반', 4, 'available', '오션뷰 전망의 프리미엄 카라반', NOW(), NOW()),
  (gen_random_uuid(), '가든뷰 1호', '가든뷰카라반', 4, 'available', '정원 전망의 아늑한 카라반', NOW(), NOW()),
  (gen_random_uuid(), '가든뷰 2호', '가든뷰카라반', 4, 'available', '정원 전망의 아늑한 카라반', NOW(), NOW()),
  (gen_random_uuid(), '가든뷰 3호', '가든뷰카라반', 4, 'available', '정원 전망의 아늑한 카라반', NOW(), NOW()),
  (gen_random_uuid(), '가든뷰 4호', '가든뷰카라반', 4, 'available', '정원 전망의 아늑한 카라반', NOW(), NOW()),
  (gen_random_uuid(), '가든뷰 5호', '가든뷰카라반', 4, 'available', '정원 전망의 아늑한 카라반', NOW(), NOW())
ON CONFLICT DO NOTHING;
