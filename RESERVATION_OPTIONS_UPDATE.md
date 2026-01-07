# 예약 옵션 필드 추가 가이드

## 🔍 변경 사항

n8n에서 전송하는 `options` 배열을 서버에서 처리할 수 있도록 데이터베이스 스키마와 서버 로직을 수정했습니다.

### 추가된 기능:
- `reservations` 테이블에 `options` JSONB 필드 추가
- 서버 API에서 `options` 배열 수신 및 저장
- 예약 조회 시 `options` 포함하여 반환

---

## ✅ 데이터베이스 마이그레이션

### 방법 1: Railway Query 탭에서 실행 (권장)

1. [Railway Dashboard](https://railway.app) 접속
2. PostgreSQL 서비스 클릭
3. **Query** 탭 클릭
4. 다음 SQL 실행:

```sql
-- reservations 테이블에 options 필드 추가 (JSONB)
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'::jsonb;

-- options 필드에 인덱스 추가 (선택사항)
CREATE INDEX IF NOT EXISTS idx_reservations_options ON reservations USING GIN (options);
```

### 방법 2: 자동 마이그레이션

서버 재시작 시 자동으로 마이그레이션이 실행됩니다 (`railway-backend/src/migrations/run-migrations.ts`).

---

## 📋 수정된 파일

### 1. `railway-backend/migrations/004_add_reservation_options.sql`
- `reservations` 테이블에 `options` JSONB 필드 추가

### 2. `railway-backend/src/services/reservations.service.ts`
- `Reservation` 인터페이스에 `options` 필드 추가
- `CreateReservationData` 인터페이스에 `options` 필드 추가
- `createReservation`, `getReservations`, `getReservationById`, `getReservationByToken` 함수에서 `options` 처리

### 3. `railway-backend/src/controllers/reservations.controller.ts`
- `createReservationHandler`에서 `options` 배열 수신 및 검증

---

## 🎯 API 요청 형식

### n8n HTTP Request Body:

```json
{
  "reservationNumber": "1124870293",
  "guestName": "장*령",
  "checkin": "2026-01-26",
  "checkout": "2026-01-27",
  "amount": 150000,
  "roomType": "2인실(2인기준) 오션뷰카라반 예약(1)",
  "options": [
    {
      "optionName": "[알림,저장이벤트] 오로라2개(1)",
      "optionPrice": 0,
      "category": "OPTION"
    }
  ]
}
```

### 서버 응답:

```json
{
  "id": "uuid",
  "reservationNumber": "1124870293",
  "guestName": "장*령",
  "email": "reservation-1124870293@ouscaravan.local",
  "checkin": "2026-01-26",
  "checkout": "2026-01-27",
  "roomType": "2인실(2인기준) 오션뷰카라반 예약(1)",
  "amount": "150000",
  "status": "pending",
  "options": [
    {
      "optionName": "[알림,저장이벤트] 오로라2개(1)",
      "optionPrice": 0,
      "category": "OPTION"
    }
  ],
  "createdAt": "2026-01-07T02:24:36.000Z",
  "updatedAt": "2026-01-07T02:24:36.000Z"
}
```

---

## 🔧 n8n Code Node 수정 사항

### 첫 번째 Code Node (중복 제거):

현재 두 개의 Code Node가 동일한 로직을 수행하고 있습니다. 하나로 통합하거나, 첫 번째 노드만 사용하세요.

### HTTP Request Body 설정:

```json
{
  "reservationNumber": "{{ $json.reservationNumber }}",
  "guestName": "{{ $json.guestName }}",
  "checkin": "{{ $json.checkin }}",
  "checkout": "{{ $json.checkout }}",
  "amount": {{ $json.amount }},
  "roomType": "{{ $json.roomItems.filter(i => i.category === 'ROOM')[0].name }}",
  "options": {{ JSON.stringify($json.roomItems.filter(i => i.category === 'OPTION').map(item => ({
    "optionName": item.name,
    "optionPrice": item.price,
    "category": "OPTION"
  }))) }}
}
```

**주의**: `options`가 빈 배열일 경우 `[]`로 전송됩니다.

---

## 📊 데이터베이스 스키마

### reservations 테이블 구조:

```sql
CREATE TABLE reservations (
  id UUID PRIMARY KEY,
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
  options JSONB DEFAULT '[]'::jsonb,  -- 새로 추가된 필드
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### options 필드 형식:

```json
[
  {
    "optionName": "[알림,저장이벤트] 오로라2개(1)",
    "optionPrice": 0,
    "category": "OPTION"
  },
  {
    "optionName": "추가 옵션 2",
    "optionPrice": 10000,
    "category": "OPTION"
  }
]
```

---

## 🔍 테스트 방법

### 1. 마이그레이션 확인:

```sql
-- options 필드 존재 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'reservations' AND column_name = 'options';

-- 결과: options | jsonb
```

### 2. API 테스트:

```bash
curl -X POST https://ouscaravan-production.up.railway.app/api/admin/reservations \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "reservationNumber": "TEST001",
    "guestName": "테스트",
    "checkin": "2026-01-01",
    "checkout": "2026-01-02",
    "roomType": "2인실",
    "amount": "100000",
    "options": [
      {
        "optionName": "테스트 옵션",
        "optionPrice": 0,
        "category": "OPTION"
      }
    ]
  }'
```

### 3. 데이터 확인:

```sql
-- 저장된 options 확인
SELECT 
  reservation_number,
  room_type,
  amount,
  options
FROM reservations
WHERE reservation_number = 'TEST001';
```

---

## ⚠️ 주의사항

### 1. 기존 데이터
- 기존 예약 데이터의 `options` 필드는 빈 배열 `[]`로 초기화됩니다
- 기존 데이터에 영향을 주지 않습니다

### 2. UPSERT 동작
- 예약번호가 이미 있으면 `options`도 함께 업데이트됩니다
- 기존 `options`는 새 값으로 덮어씌워집니다

### 3. n8n Code Node
- 두 개의 동일한 Code Node가 있다면 하나로 통합하세요
- `roomItems` 배열에서 ROOM과 OPTION을 올바르게 필터링하는지 확인하세요

---

## 📚 참고

- [PostgreSQL JSONB 문서](https://www.postgresql.org/docs/current/datatype-json.html)
- [Railway PostgreSQL 가이드](https://docs.railway.app/databases/postgresql)
