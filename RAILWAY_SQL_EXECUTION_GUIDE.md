# Railway에서 SQL 실행 가이드

## 📋 Railway UI 구조

Railway PostgreSQL 서비스의 UI 구조:
- **Database** 탭
  - **Data** 탭 (현재 선택됨) - 테이블 목록 및 데이터 보기
  - **Extensions** 탭 - PostgreSQL 확장 관리
  - **Credentials** 탭 - 연결 정보 확인

## 🔧 SQL 실행 방법

### 방법 1: Query 탭 사용 (가장 간단)

1. **Postgres 서비스 선택**
   - Railway 대시보드 → **Postgres** 서비스 클릭

2. **Query 탭 찾기**
   - "Database" 탭 아래에 **"Query"** 또는 **"SQL Editor"** 탭이 있을 수 있습니다
   - 또는 상단 네비게이션에서 **"Query"** 탭을 찾아보세요
   - "Data" 탭 옆에 있을 수 있습니다

3. **SQL 실행**
   - Query 탭에서 SQL 입력 필드에 아래 SQL 코드 붙여넣기
   - **"Run"** 또는 **"Execute"** 버튼 클릭

### 방법 2: Connect 버튼 사용 (외부 클라이언트)

1. **연결 정보 확인**
   - Railway 대시보드 → Postgres → **"Database"** 탭 → **"Credentials"** 탭
   - 또는 **"Connect"** 버튼 클릭
   - 연결 정보 복사

2. **외부 PostgreSQL 클라이언트 사용**
   - **pgAdmin**, **DBeaver**, **TablePlus** 등 사용
   - 연결 정보 입력:
     - Host: Railway에서 제공한 호스트
     - Port: `5432`
     - Database: `railway`
     - Username: `postgres`
     - Password: Railway에서 제공한 비밀번호

3. **SQL 파일 실행**
   - 클라이언트에서 SQL 쿼리 창 열기
   - `railway-backend/migrations/001_initial_schema.sql` 파일 내용 붙여넣기
   - 실행

### 방법 3: Railway CLI 사용

1. **Railway CLI 설치**
   ```bash
   npm install -g @railway/cli
   ```

2. **Railway 로그인**
   ```bash
   railway login
   ```

3. **프로젝트 연결**
   ```bash
   railway link
   ```

4. **데이터베이스 연결**
   ```bash
   railway connect postgres
   ```

5. **SQL 파일 실행**
   - 연결 후 psql이 열리면:
   ```sql
   -- SQL 파일 내용 붙여넣기
   ```

### 방법 4: Railway Web SQL Editor (있는 경우)

일부 Railway 프로젝트에서는 웹 기반 SQL Editor를 제공합니다:

1. Postgres 서비스 → **"Query"** 또는 **"SQL"** 탭 확인
2. SQL 입력 필드에 코드 붙여넣기
3. 실행

## 📝 실행할 SQL 코드

아래 SQL 코드를 복사하여 Railway Query 탭에 붙여넣고 실행하세요:

```sql
-- OUSCARAVAN 예약 관리 시스템 초기 스키마
-- Railway PostgreSQL 데이터베이스용

-- 1. reservations 테이블
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_number VARCHAR(50) UNIQUE NOT NULL,
  guest_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  checkin DATE NOT NULL,
  checkout DATE NOT NULL,
  room_type VARCHAR(100) NOT NULL,
  assigned_room VARCHAR(50),
  amount VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  unique_token UUID UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reservations_token ON reservations(unique_token);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_checkin ON reservations(checkin);
CREATE INDEX IF NOT EXISTS idx_reservations_checkout ON reservations(checkout);
CREATE INDEX IF NOT EXISTS idx_reservations_reservation_number ON reservations(reservation_number);

-- 2. orders 테이블
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('bbq', 'fire')),
  items JSONB NOT NULL,
  total_amount INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  delivery_time VARCHAR(10),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_reservation_id ON orders(reservation_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_type ON orders(type);

-- 3. check_in_out_logs 테이블
CREATE TABLE IF NOT EXISTS check_in_out_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('checkin', 'checkout')),
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  checklist JSONB,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_check_in_out_logs_reservation_id ON check_in_out_logs(reservation_id);
CREATE INDEX IF NOT EXISTS idx_check_in_out_logs_type ON check_in_out_logs(type);
CREATE INDEX IF NOT EXISTS idx_check_in_out_logs_timestamp ON check_in_out_logs(timestamp);

-- 4. rooms 테이블
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  type VARCHAR(100) NOT NULL,
  capacity INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(type);

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## ✅ 실행 후 확인

### 1. 테이블 생성 확인

Query 탭에서 다음 쿼리 실행:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**예상 결과** (4개 테이블):
- `check_in_out_logs`
- `orders`
- `reservations`
- `rooms`

### 2. Data 탭에서 확인

1. **"Data"** 탭으로 이동
2. 테이블 목록에 4개 테이블이 표시되는지 확인
3. 각 테이블을 클릭하여 구조 확인

## 🐛 문제 해결

### Query 탭이 보이지 않는 경우

1. **"Database"** 탭 아래의 다른 탭 확인
2. **"Settings"** 탭에서 SQL Editor 활성화 옵션 확인
3. **"Connect"** 버튼을 통해 외부 클라이언트 사용

### SQL 실행 오류가 발생하는 경우

1. 에러 메시지 확인
2. SQL 구문 확인
3. 권한 확인
4. Railway 로그 확인

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
