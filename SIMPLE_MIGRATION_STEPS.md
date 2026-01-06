# 간단한 마이그레이션 실행 가이드

## 🚀 Railway CLI 사용 (가장 간단)

### 1단계: Railway CLI 설치 및 로그인

터미널에서 실행:

```bash
# Railway CLI 설치 (아직 설치하지 않은 경우)
npm install -g @railway/cli

# Railway 로그인
railway login
```

브라우저가 열리면 Railway 계정으로 로그인하세요.

### 2단계: 프로젝트 연결

```bash
# 프로젝트 디렉토리로 이동 (이미 있는 경우 생략)
cd "C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화"

# Railway 프로젝트 연결
railway link
```

프롬프트가 나타나면:
- 프로젝트 선택: `dynamic-radiance` (또는 해당 프로젝트)
- 서비스 선택: `Postgres`

### 3단계: 데이터베이스 연결 및 SQL 실행

```bash
# 데이터베이스 연결 (psql이 열림)
railway connect Postgres
```

psql이 열리면:

1. `MIGRATION_SQL_COMPLETE.sql` 파일을 열어서 전체 내용 복사
2. psql 창에 붙여넣기 (Ctrl+V)
3. Enter 키를 눌러 실행

또는 파일을 직접 읽어서 실행:

```sql
-- psql에서 실행
\i MIGRATION_SQL_COMPLETE.sql
```

**주의**: 파일 경로가 정확해야 합니다. 전체 경로를 사용하거나, 파일이 있는 디렉토리에서 실행하세요.

### 4단계: 테이블 생성 확인

psql에서 다음 쿼리 실행:

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

---

## 📋 실행할 SQL 코드

`MIGRATION_SQL_COMPLETE.sql` 파일을 열어서 전체 내용을 복사하세요.

또는 아래 코드를 복사하세요:

```sql
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

---

## ✅ 마이그레이션 후 작업

### 1. Railway 서버 재배포

1. Railway 대시보드 → **OUSCARAVAN** 서비스 선택
2. **"Deploy"** 또는 **"Redeploy"** 클릭
3. 배포 완료 대기

### 2. 로그 확인

Railway 대시보드 → OUSCARAVAN → Logs:

**확인할 메시지**:
- ✅ "Server is running on port 8080"
- ✅ "Database connected"
- ❌ 에러 메시지 없음

### 3. Health Check 테스트

브라우저에서:
```
https://ouscaravan-production.up.railway.app/health
```

**예상 응답**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

### 4. 로그인 테스트

1. Vercel 로그인 페이지 접속
2. 로그인 시도
3. 성공 시 관리자 대시보드로 이동

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
