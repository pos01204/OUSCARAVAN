-- 알림 시스템 테이블 생성

-- 1. notifications 테이블
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id VARCHAR(50) NOT NULL DEFAULT 'ouscaravan',
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'checkin',
    'checkout',
    'order_created',
    'order_status_changed',
    'order_cancelled',
    'reservation_assigned',
    'reservation_cancelled'
  )),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMP,
  
  -- 관련 데이터 (JSONB)
  metadata JSONB,
  
  -- 링크 정보
  link_type VARCHAR(50),
  link_id VARCHAR(255),
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_notifications_admin_id ON notifications(admin_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_admin_read ON notifications(admin_id, is_read, created_at DESC);

-- 2. notification_settings 테이블
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id VARCHAR(50) NOT NULL UNIQUE DEFAULT 'ouscaravan',
  
  -- 알림 타입별 수신 여부
  checkin_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  checkout_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  order_created_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  order_status_changed_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  order_cancelled_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  reservation_assigned_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  reservation_cancelled_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- 알림 설정
  sound_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  vibration_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  auto_delete_days INTEGER DEFAULT 30,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 기본 설정 데이터 삽입
INSERT INTO notification_settings (admin_id) 
VALUES ('ouscaravan')
ON CONFLICT (admin_id) DO NOTHING;

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON notification_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
