# 빠른 마이그레이션 가이드

## 🚀 3단계로 데이터베이스 마이그레이션 실행

### 1단계: Railway 대시보드에서 Postgres 접속

1. Railway 대시보드 → **Postgres** 서비스 선택
2. **"Database"** 탭 클릭
3. **"Query"** 탭 찾기
   - "Data" 탭 옆에 있을 수 있습니다
   - 또는 상단 네비게이션에서 찾아보세요
   - "Query" 탭이 없다면 **"Connect"** 버튼을 사용하여 외부 클라이언트 연결

### 2단계: SQL 파일 내용 복사 및 실행

1. 아래 SQL 코드 전체를 복사
2. Railway Query 탭에 붙여넣기
3. **"Run"** 또는 **"Execute"** 클릭

### 3단계: 테이블 생성 확인

Query 탭에서 다음 쿼리 실행:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

**4개 테이블이 보여야 합니다:**
- `reservations`
- `orders`
- `check_in_out_logs`
- `rooms`

---

## 📋 마이그레이션 SQL (복사하여 사용)

```sql
-- 예약 테이블
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
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  unique_token VARCHAR(255) UNIQUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 주문 테이블
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('bbq', 'fire')),
  items JSONB NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'delivering', 'completed', 'cancelled')),
  delivery_time VARCHAR(10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 체크인/체크아웃 로그 테이블
CREATE TABLE IF NOT EXISTS check_in_out_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  action VARCHAR(10) NOT NULL CHECK (action IN ('checkin', 'checkout')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  source VARCHAR(50),
  checklist JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 방 테이블
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(100) NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0 AND capacity <= 20),
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_checkin ON reservations(checkin);
CREATE INDEX IF NOT EXISTS idx_reservations_checkout ON reservations(checkout);
CREATE INDEX IF NOT EXISTS idx_reservations_token ON reservations(unique_token);
CREATE INDEX IF NOT EXISTS idx_orders_reservation_id ON orders(reservation_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_check_in_out_logs_reservation_id ON check_in_out_logs(reservation_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거 생성
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
