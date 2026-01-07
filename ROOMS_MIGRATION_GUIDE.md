# 방 데이터 마이그레이션 가이드

## 문제 상황

Railway 로그에서 `[getRooms] Found rooms: 1`로 확인되었습니다. 데이터베이스에 방이 1개만 있어서 방 목록이 제대로 표시되지 않습니다.

## 해결 방법

Railway PostgreSQL 데이터베이스에 마이그레이션을 실행하여 10개 방 (A1~A8, B1~B2)을 추가해야 합니다.

### 방법 1: Railway 대시보드에서 직접 실행 (권장)

1. **Railway 대시보드 접속**
   - Railway 프로젝트로 이동
   - PostgreSQL 데이터베이스 선택

2. **Query 탭 열기**
   - 데이터베이스 상세 페이지에서 "Query" 탭 클릭

3. **다음 SQL 실행**:

```sql
-- 현재 방 개수 확인
SELECT COUNT(*) as current_room_count FROM rooms;

-- 방 데이터 삽입 (A1~A8, B1~B2)
INSERT INTO rooms (id, name, type, capacity, status, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'A1', '오션뷰카라반', 4, 'available', NOW(), NOW()),
  (gen_random_uuid(), 'A2', '오션뷰카라반', 4, 'available', NOW(), NOW()),
  (gen_random_uuid(), 'A3', '오션뷰카라반', 4, 'available', NOW(), NOW()),
  (gen_random_uuid(), 'A4', '오션뷰카라반', 4, 'available', NOW(), NOW()),
  (gen_random_uuid(), 'A5', '오션뷰카라반', 4, 'available', NOW(), NOW()),
  (gen_random_uuid(), 'A6', '오션뷰카라반', 4, 'available', NOW(), NOW()),
  (gen_random_uuid(), 'A7', '오션뷰카라반', 4, 'available', NOW(), NOW()),
  (gen_random_uuid(), 'A8', '오션뷰카라반', 4, 'available', NOW(), NOW()),
  (gen_random_uuid(), 'B1', '오션뷰카라반', 2, 'available', NOW(), NOW()),
  (gen_random_uuid(), 'B2', '오션뷰카라반', 2, 'available', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- 최종 방 개수 확인 (10개가 나와야 함)
SELECT COUNT(*) as final_room_count FROM rooms;
SELECT name, type, capacity, status FROM rooms ORDER BY name;
```

### 방법 2: psql 또는 다른 PostgreSQL 클라이언트 사용

1. **Railway에서 데이터베이스 연결 정보 확인**
   - Railway 대시보드에서 PostgreSQL 데이터베이스의 연결 정보 확인
   - `DATABASE_URL` 또는 개별 연결 정보 사용

2. **연결 후 SQL 실행**:
   - `railway-backend/migrations/002_default_rooms.sql` 파일 내용 실행

### 방법 3: Railway CLI 사용

```bash
# Railway CLI 설치 (없는 경우)
npm i -g @railway/cli

# 로그인
railway login

# 프로젝트 연결
railway link

# 데이터베이스 연결
railway connect

# SQL 파일 실행
psql $DATABASE_URL -f railway-backend/migrations/002_default_rooms.sql
```

## 확인 방법

마이그레이션 실행 후:

1. **Railway 로그 확인**:
   - Railway 대시보드에서 로그 확인
   - `[getRooms] Found rooms: 10`이 표시되어야 함

2. **브라우저 콘솔 확인**:
   - 방 관리 페이지 새로고침
   - 콘솔에서 `[RoomsPage] Fetched rooms: 10` 확인

3. **방 관리 페이지 확인**:
   - 10개 방 (A1~A8, B1~B2)이 모두 표시되는지 확인

## 문제 해결

### 에러: "duplicate key value violates unique constraint"

- 이미 방이 존재하는 경우입니다.
- `ON CONFLICT (name) DO NOTHING`이 자동으로 처리합니다.
- 특정 방만 추가하려면 개별적으로 INSERT:

```sql
-- 예: A2 방만 추가
INSERT INTO rooms (id, name, type, capacity, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'A2', '오션뷰카라반', 4, 'available', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;
```

### 에러: "column 'description' does not exist"

- `rooms` 테이블에 `description` 컬럼이 없는 경우입니다.
- 마이그레이션 파일에서 `description` 제거 (이미 수정됨)

## 참고

- `rooms` 테이블의 `name` 컬럼은 UNIQUE 제약이 있어 중복 방지됩니다.
- `ON CONFLICT (name) DO NOTHING`으로 이미 존재하는 방은 건너뜁니다.
- 마이그레이션은 여러 번 실행해도 안전합니다.
