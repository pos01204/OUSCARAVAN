# 방 번호 마이그레이션 실행 가이드

## 📋 개요

데이터베이스의 기존 방 이름 **A1~A8, B1~B2**를 **1호~10호**로 변경하는 마이그레이션을 실행하는 방법을 안내합니다.

---

## ⚠️ 사전 준비사항

### 1. 데이터 백업 (필수)
마이그레이션 실행 전 반드시 데이터베이스를 백업하세요.

**Railway에서 백업하는 방법**:
1. Railway 대시보드 → 프로젝트 선택
2. PostgreSQL 서비스 → **Data** 탭
3. **Backup** 버튼 클릭하여 백업 생성

또는 Railway CLI 사용:
```bash
railway backup
```

### 2. 현재 데이터 확인
마이그레이션 전 현재 상태를 확인하세요:

```sql
-- 현재 방 목록 확인
SELECT name, type, capacity, status FROM rooms ORDER BY name;

-- 현재 예약의 assigned_room 확인
SELECT DISTINCT assigned_room, COUNT(*) as count 
FROM reservations 
WHERE assigned_room IS NOT NULL 
GROUP BY assigned_room 
ORDER BY assigned_room;
```

---

## 🔄 마이그레이션 실행 방법

### 방법 1: Railway Query 탭에서 직접 실행 (권장)

1. **Railway 대시보드 접속**
   - Railway 프로젝트 → PostgreSQL 서비스 선택

2. **Query 탭 열기**
   - PostgreSQL 서비스 → **Query** 탭 클릭

3. **마이그레이션 SQL 복사**
   - `railway-backend/migrations/006_update_rooms_to_numbered.sql` 파일 내용 전체 복사

4. **SQL 실행**
   - Query 탭에 SQL 붙여넣기
   - **Run** 버튼 클릭하여 실행

5. **결과 확인**
   - 마이그레이션 완료 후 다음 쿼리로 확인:
   ```sql
   -- 방 목록 확인 (1호~10호 형식)
   SELECT name, type, capacity, status 
   FROM rooms 
   WHERE name ~ '^\d+호$'
   ORDER BY CAST(SUBSTRING(name FROM '^(\d+)') AS INTEGER);
   
   -- 예약의 assigned_room 확인
   SELECT DISTINCT assigned_room, COUNT(*) as count 
   FROM reservations 
   WHERE assigned_room IS NOT NULL 
   GROUP BY assigned_room 
   ORDER BY assigned_room;
   ```

### 방법 2: 백엔드 서버 재시작으로 자동 실행

Railway 백엔드 서버가 시작될 때 자동으로 마이그레이션이 실행됩니다.

1. **Railway 대시보드 접속**
   - Railway 프로젝트 → 백엔드 서비스 선택

2. **서비스 재시작**
   - **Settings** 탭 → **Restart** 버튼 클릭
   - 또는 **Deployments** 탭에서 최신 배포 확인

3. **로그 확인**
   - **Logs** 탭에서 마이그레이션 실행 로그 확인:
   ```
   [MIGRATION] Starting migrations...
   [MIGRATION] Running 006_update_rooms_to_numbered...
   [MIGRATION] ✓ 006_update_rooms_to_numbered completed
   ```

---

## 📝 마이그레이션 내용

### 변경 사항

1. **예약 테이블 (`reservations`)**
   - `assigned_room` 컬럼 업데이트:
     - A1 → 1호
     - A2 → 2호
     - A3 → 3호
     - A4 → 4호
     - A5 → 5호
     - A6 → 6호
     - A7 → 7호
     - A8 → 8호
     - B1 → 9호
     - B2 → 10호

2. **방 테이블 (`rooms`)**
   - `name` 컬럼 업데이트: A1~A8, B1~B2 → 1호~10호
   - `capacity` 컬럼 업데이트:
     - 6호, 10호: 2인실
     - 나머지 (1~5, 7~9): 4인실

3. **기존 방이 없는 경우**
   - 1호~10호 방이 없으면 자동으로 생성

---

## ✅ 마이그레이션 후 확인 사항

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

### 2. 예약 데이터 확인
```sql
SELECT DISTINCT assigned_room, COUNT(*) as count 
FROM reservations 
WHERE assigned_room IS NOT NULL 
GROUP BY assigned_room 
ORDER BY assigned_room;
```

**예상 결과**: A1~A8, B1~B2가 모두 1호~10호로 변경되어야 함

### 3. A1~A8, B1~B2 남아있는지 확인
```sql
-- 방 테이블에서 A1~A8, B1~B2가 남아있는지 확인
SELECT name FROM rooms 
WHERE name IN ('A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'B1', 'B2');

-- 예약 테이블에서 A1~A8, B1~B2가 남아있는지 확인
SELECT DISTINCT assigned_room FROM reservations 
WHERE assigned_room IN ('A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'B1', 'B2');
```

**예상 결과**: 두 쿼리 모두 빈 결과 (0 rows)여야 함

---

## 🔧 문제 해결

### 문제 1: 마이그레이션 실행 중 오류 발생

**증상**: 
```
ERROR: duplicate key value violates unique constraint "rooms_name_key"
```

**원인**: 이미 1호~10호 방이 존재하는 경우

**해결 방법**:
1. 기존 A1~A8, B1~B2 방 삭제 후 재실행:
   ```sql
   DELETE FROM rooms WHERE name IN ('A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'B1', 'B2');
   ```
2. 마이그레이션 SQL 재실행

### 문제 2: 일부 데이터만 변경됨

**증상**: 일부 예약의 `assigned_room`만 변경되고 나머지는 그대로

**해결 방법**:
1. 변경되지 않은 데이터 확인:
   ```sql
   SELECT id, assigned_room FROM reservations 
   WHERE assigned_room IN ('A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'B1', 'B2');
   ```
2. 수동으로 업데이트:
   ```sql
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
   END
   WHERE assigned_room IN ('A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'B1', 'B2');
   ```

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

## 📁 관련 파일

- **마이그레이션 SQL**: `railway-backend/migrations/006_update_rooms_to_numbered.sql`
- **자동 실행 로직**: `railway-backend/src/migrations/run-migrations.ts`
- **사전 작업 문서**: `ROOM_NUMBERING_PREPARATION_SUMMARY.md`

---

## 📞 지원

마이그레이션 실행 중 문제가 발생하면:
1. Railway 로그 확인
2. 데이터베이스 백업 확인
3. 위의 문제 해결 섹션 참고

---

**작성 일시**: 2026-01-XX  
**작성자**: AI Assistant  
**버전**: 1.0  
**상태**: 마이그레이션 실행 가이드 완료
