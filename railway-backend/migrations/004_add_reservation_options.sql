-- reservations 테이블에 options 필드 추가 (JSONB)
-- 옵션 상품들을 저장하기 위한 필드

ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'::jsonb;

-- options 필드에 인덱스 추가 (선택사항, 옵션 검색이 필요한 경우)
CREATE INDEX IF NOT EXISTS idx_reservations_options ON reservations USING GIN (options);
