-- 기존 예약 데이터 초기화
-- 주의: 이 스크립트는 모든 예약 데이터를 삭제합니다

-- 1. 외래 키 제약 조건 확인 및 임시 비활성화 (필요한 경우)
-- reservations 테이블을 참조하는 다른 테이블이 있는지 확인

-- 2. 예약 데이터 삭제
DELETE FROM reservations;

-- 3. 시퀀스 리셋 (UUID를 사용하므로 필요 없지만, 다른 ID 타입을 사용하는 경우)
-- ALTER SEQUENCE reservations_id_seq RESTART WITH 1;

-- 4. 확인
SELECT COUNT(*) as remaining_count FROM reservations;
-- 결과가 0이어야 함
