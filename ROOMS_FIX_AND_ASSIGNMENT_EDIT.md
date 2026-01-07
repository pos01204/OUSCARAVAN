# 방 목록 표시 문제 해결 및 방 배정 수정 기능 추가

## 해결한 문제

### 1. 방이 1개만 표시되는 문제

**원인:**
- 데이터베이스에 방이 1개만 있거나 마이그레이션이 실행되지 않았을 가능성
- API 응답 처리 문제

**해결 방법:**
1. **API 응답 처리 개선** (`app/api/admin/rooms/route.ts`):
   - 배열이 아닌 응답에 대한 처리 추가
   - 빈 배열 반환으로 에러 방지

2. **프론트엔드 로깅 추가** (`app/admin/rooms/page.tsx`):
   - 방 목록 조회 시 로그 출력으로 디버깅 용이

3. **데이터베이스 마이그레이션 확인 필요**:
   - Railway PostgreSQL 데이터베이스에 `002_default_rooms.sql` 마이그레이션 실행 필요
   - 10개 방 (A1~A8, B1~B2)이 모두 생성되어야 함

### 2. 방 배정 수정 기능 추가

**구현 내용:**
- 방 관리 페이지에서 배정된 방에 "방 배정 수정" 버튼 추가
- 버튼 클릭 시 해당 예약의 상세 페이지로 이동
- 예약 상세 페이지에서 방 배정 수정 가능

**변경 사항:**
1. **방 관리 페이지** (`app/admin/rooms/page.tsx`):
   - `useRouter` 추가
   - 배정된 방에 "방 배정 수정" 버튼 추가
   - 버튼 클릭 시 `/admin/reservations/{reservationId}`로 이동

2. **예약 상세 페이지** (`app/admin/reservations/[id]/page.tsx`):
   - 이미 방 배정 수정 기능이 구현되어 있음
   - 기존 상태 유지하며 방 배정 수정 가능

## 다음 단계

### 1. Railway 마이그레이션 실행

Railway PostgreSQL 데이터베이스에 연결하여 다음 SQL을 실행하세요:

```sql
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
```

### 2. Vercel 배포

변경 사항이 자동으로 배포됩니다.

### 3. 테스트

1. **방 목록 확인**:
   - 방 관리 페이지에서 10개 방 (A1~A8, B1~B2)이 모두 표시되는지 확인
   - 브라우저 콘솔에서 `[RoomsPage] Fetched rooms: 10` 로그 확인

2. **방 배정 수정 기능 테스트**:
   - 방 관리 페이지에서 배정된 방의 "방 배정 수정" 버튼 클릭
   - 예약 상세 페이지로 이동하는지 확인
   - 방 배정을 다른 방으로 변경하고 저장
   - 방 관리 페이지에서 변경된 배정 정보가 반영되는지 확인

## 변경된 파일

1. `app/api/admin/rooms/route.ts` - API 응답 처리 개선
2. `app/admin/rooms/page.tsx` - 방 배정 수정 버튼 추가 및 로깅
3. `railway-backend/src/services/rooms.service.ts` - SQL 쿼리 개선 (LATERAL JOIN 사용)
