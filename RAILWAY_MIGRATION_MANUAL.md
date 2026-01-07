# Railway 마이그레이션 수동 실행 가이드

## 🔍 Railway Query 탭이 없는 경우

Railway의 새로운 인터페이스에서는 Query 탭이 없을 수 있습니다. 대신 다음 방법을 사용하세요.

---

## ✅ 방법 1: Railway CLI 사용 (권장)

### 1단계: Railway CLI 설치 및 로그인

```bash
# Railway CLI 설치
npm i -g @railway/cli

# Railway 로그인
railway login
```

### 2단계: 프로젝트 연결

```bash
# 프로젝트 디렉토리로 이동
cd "C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화\railway-backend"

# Railway 프로젝트 연결
railway link
```

### 3단계: PostgreSQL에 연결하여 SQL 실행

```bash
# PostgreSQL에 직접 연결
railway connect postgresql
```

연결 후 다음 SQL 실행:

```sql
-- reservations 테이블에 options 필드 추가 (JSONB)
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'::jsonb;

-- options 필드에 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_reservations_options ON reservations USING GIN (options);
```

---

## ✅ 방법 2: 서버 재시작으로 자동 마이그레이션 (가장 간단)

서버 코드에 마이그레이션이 포함되어 있으므로, Railway에서 서버를 재시작하면 자동으로 실행됩니다.

### Railway 대시보드에서:

1. **OUSCARAVAN** 서비스 클릭
2. **Settings** 탭 클릭
3. **Restart** 버튼 클릭

또는:

1. **Deployments** 탭 클릭
2. 최신 배포의 **Redeploy** 클릭

### 마이그레이션 확인:

Railway 로그에서 다음 메시지를 확인하세요:

```
[MIGRATION] Starting migrations...
[MIGRATION] Running 002_default_rooms...
[MIGRATION] ✓ 002_default_rooms completed
[MIGRATION] Running 004_add_reservation_options...
[MIGRATION] ✓ 004_add_reservation_options completed
[MIGRATION] All migrations completed
```

---

## ✅ 방법 3: Railway Data 탭 사용 (새 인터페이스)

Railway의 새로운 인터페이스에서는:

1. **Postgres** 서비스 클릭
2. **Data** 탭 클릭
3. **Tables** 섹션에서 `reservations` 테이블 클릭
4. **Edit row** 또는 **+ Row** 버튼 옆의 **SQL** 아이콘 클릭 (있는 경우)
5. SQL 쿼리 입력 및 실행

---

## ✅ 방법 4: 외부 PostgreSQL 클라이언트 사용

### Railway에서 연결 정보 가져오기:

1. **Postgres** 서비스 클릭
2. **Variables** 탭에서 `DATABASE_URL` 또는 연결 정보 확인
3. 외부 클라이언트 (pgAdmin, DBeaver, TablePlus 등)로 연결
4. SQL 실행

---

## 🔧 마이그레이션 SQL (복사하여 사용)

```sql
-- reservations 테이블에 options 필드 추가 (JSONB)
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'::jsonb;

-- options 필드에 인덱스 추가 (선택사항)
CREATE INDEX IF NOT EXISTS idx_reservations_options ON reservations USING GIN (options);

-- 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'reservations' AND column_name = 'options';
```

---

## 📋 마이그레이션 확인

마이그레이션이 성공했는지 확인:

```sql
-- options 필드 존재 확인
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'reservations' AND column_name = 'options';

-- 결과 예상:
-- column_name: options
-- data_type: jsonb
-- column_default: '[]'::jsonb
```

---

## ⚠️ 주의사항

### 1. 기존 데이터
- 기존 예약 데이터의 `options` 필드는 빈 배열 `[]`로 초기화됩니다
- 기존 데이터에 영향을 주지 않습니다

### 2. 서버 재시작
- 서버 재시작 시 자동으로 마이그레이션이 실행됩니다
- 이미 실행된 마이그레이션은 건너뜁니다 (`IF NOT EXISTS` 사용)

---

## 🔍 문제 해결

### 마이그레이션이 실행되지 않는 경우:

1. **Railway 로그 확인**:
   - Railway 대시보드 → OUSCARAVAN 서비스 → **Logs** 탭
   - `[MIGRATION]` 메시지 확인

2. **수동 실행**:
   - Railway CLI 또는 외부 클라이언트로 SQL 직접 실행

3. **에러 확인**:
   - 로그에서 마이그레이션 에러 메시지 확인
   - `IF NOT EXISTS`를 사용하므로 중복 실행해도 안전합니다

---

## 📚 참고

- [Railway CLI 문서](https://docs.railway.app/develop/cli)
- [Railway PostgreSQL 가이드](https://docs.railway.app/databases/postgresql)
- [PostgreSQL ALTER TABLE 문서](https://www.postgresql.org/docs/current/sql-altertable.html)
