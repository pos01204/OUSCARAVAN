-- OUSCARAVAN 예약 관리 시스템 초기 스키마
-- Railway PostgreSQL 데이터베이스용
-- 이 파일을 Railway Query 탭에 복사하여 실행하세요

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
