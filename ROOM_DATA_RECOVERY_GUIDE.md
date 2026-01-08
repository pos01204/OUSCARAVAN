# 방 데이터 복구 가이드

## 📋 상황

마이그레이션 실행 전에 기존 방 데이터를 수동으로 삭제하여 현재 `rooms` 테이블에 데이터가 없는 상황입니다.

---

## 🔧 해결 방법

### 방법 1: Railway Query 탭에서 직접 실행 (권장)

1. **Railway 대시보드 접속**
   - Railway 프로젝트 → PostgreSQL 서비스 선택

2. **Query 탭 열기**
   - PostgreSQL 서비스 → **Query** 탭 클릭

3. **방 데이터 생성 SQL 복사**
   - 아래 SQL을 복사하여 Query 탭에 붙여넣기

4. **SQL 실행**
   - **Run** 버튼 클릭하여 실행

---

## 📝 방 데이터 생성 SQL

```sql
-- 방 데이터 삭제 후 1호~10호 방 재생성
-- 6호, 10호: 2인실
-- 나머지 (1~5, 7~9): 4인실

BEGIN;

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
```

---

## ✅ 실행 후 확인

### 1. 방 목록 확인

```sql
SELECT name, type, capacity, status 
FROM rooms 
WHERE name ~ '^\d+호$'
ORDER BY CAST(SUBSTRING(name FROM '^(\d+)') AS INTEGER);
```

**예상 결과**:
```
name | type         | capacity | status
-----|--------------|----------|--------
1호  | 오션뷰카라반 | 4        | available
2호  | 오션뷰카라반 | 4        | available
3호  | 오션뷰카라반 | 4        | available
4호  | 오션뷰카라반 | 4        | available
5호  | 오션뷰카라반 | 4        | available
6호  | 오션뷰카라반 | 2        | available
7호  | 오션뷰카라반 | 4        | available
8호  | 오션뷰카라반 | 4        | available
9호  | 오션뷰카라반 | 4        | available
10호 | 오션뷰카라반 | 2        | available
```

### 2. 방 개수 확인

```sql
SELECT COUNT(*) as total_rooms FROM rooms WHERE name ~ '^\d+호$';
```

**예상 결과**: `10`

### 3. capacity 확인

```sql
-- 2인실 확인 (6호, 10호)
SELECT name, capacity FROM rooms WHERE name IN ('6호', '10호');

-- 4인실 확인 (나머지)
SELECT name, capacity FROM rooms WHERE name IN ('1호', '2호', '3호', '4호', '5호', '7호', '8호', '9호');
```

---

## 🔍 문제 해결

### 문제 1: "duplicate key value violates unique constraint" 오류

**증상**: 
```
ERROR: duplicate key value violates unique constraint "rooms_name_key"
```

**원인**: 이미 1호~10호 방이 존재하는 경우

**해결 방법**:
1. 기존 방 데이터 확인:
   ```sql
   SELECT name FROM rooms WHERE name ~ '^\d+호$';
   ```
2. 기존 방 데이터 삭제 후 재실행:
   ```sql
   DELETE FROM rooms WHERE name ~ '^\d+호$';
   ```
3. 위의 INSERT SQL 재실행

### 문제 2: 일부 방만 생성됨

**증상**: 10개가 아닌 일부 방만 생성됨

**원인**: ON CONFLICT로 인해 일부 방이 업데이트만 되고 생성되지 않음

**해결 방법**:
1. 모든 방 삭제:
   ```sql
   DELETE FROM rooms;
   ```
2. INSERT SQL 재실행

### 문제 3: capacity가 잘못 설정됨

**증상**: 6호나 10호가 4인실로 표시됨

**해결 방법**:
```sql
-- 6호와 10호를 2인실로 수정
UPDATE rooms 
SET capacity = 2, updated_at = NOW()
WHERE name IN ('6호', '10호');

-- 나머지를 4인실로 수정
UPDATE rooms 
SET capacity = 4, updated_at = NOW()
WHERE name IN ('1호', '2호', '3호', '4호', '5호', '7호', '8호', '9호');
```

---

## 📊 방 데이터 상세 정보

| 방 번호 | 수용 인원 | 타입 | 상태 |
|---------|----------|------|------|
| 1호 | 4인 | 오션뷰카라반 | available |
| 2호 | 4인 | 오션뷰카라반 | available |
| 3호 | 4인 | 오션뷰카라반 | available |
| 4호 | 4인 | 오션뷰카라반 | available |
| 5호 | 4인 | 오션뷰카라반 | available |
| 6호 | 2인 | 오션뷰카라반 | available |
| 7호 | 4인 | 오션뷰카라반 | available |
| 8호 | 4인 | 오션뷰카라반 | available |
| 9호 | 4인 | 오션뷰카라반 | available |
| 10호 | 2인 | 오션뷰카라반 | available |

---

## 📁 관련 파일

- **복구 SQL 파일**: `railway-backend/migrations/007_create_rooms_after_deletion.sql`
- **마이그레이션 가이드**: `ROOM_MIGRATION_GUIDE.md`
- **마이그레이션 확인 가이드**: `MIGRATION_VERIFICATION_GUIDE.md`

---

## ⚠️ 주의사항

1. **데이터 백업**: SQL 실행 전 데이터베이스 백업 권장
2. **트랜잭션**: BEGIN/COMMIT으로 트랜잭션 처리되어 안전하게 실행됨
3. **중복 방지**: ON CONFLICT로 이미 존재하는 방은 업데이트만 됨
4. **예약 데이터**: 예약 테이블의 `assigned_room`은 별도로 확인 필요

---

## 🔄 예약 데이터 확인

방 데이터를 생성한 후, 예약 테이블의 `assigned_room`도 확인하세요:

```sql
-- 예약의 assigned_room 확인
SELECT DISTINCT assigned_room, COUNT(*) as count 
FROM reservations 
WHERE assigned_room IS NOT NULL 
GROUP BY assigned_room 
ORDER BY assigned_room;
```

만약 예약 테이블에 A1~A8, B1~B2가 남아있다면, 마이그레이션 SQL의 예약 업데이트 부분을 실행하세요:

```sql
-- 예약 테이블의 assigned_room 업데이트
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
```

---

**작성 일시**: 2026-01-08  
**작성자**: AI Assistant  
**버전**: 1.0  
**상태**: 방 데이터 복구 가이드 완료
