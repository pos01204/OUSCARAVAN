# Railway 백엔드 API 스펙 문서

## 📋 개요

이 문서는 OUSCARAVAN 예약 관리 시스템의 Railway 백엔드 API 스펙을 정의합니다.

**기본 URL**: `https://ouscaravan-api.railway.app`

---

## 🗄️ 데이터베이스 스키마

### 1. reservations 테이블

```sql
CREATE TABLE reservations (
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

CREATE INDEX idx_reservations_token ON reservations(unique_token);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_checkin ON reservations(checkin);
CREATE INDEX idx_reservations_checkout ON reservations(checkout);
```

**상태 값**:
- `pending`: 대기 (방 미배정)
- `assigned`: 배정 완료 (방 배정 및 전화번호 입력 완료)
- `checked_in`: 체크인 완료
- `checked_out`: 체크아웃 완료
- `cancelled`: 취소

### 2. orders 테이블

```sql
CREATE TABLE orders (
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

CREATE INDEX idx_orders_reservation_id ON orders(reservation_id);
CREATE INDEX idx_orders_status ON orders(status);
```

**상태 값**:
- `pending`: 대기
- `preparing`: 준비 중
- `delivering`: 배송 중
- `completed`: 완료
- `cancelled`: 취소

**items JSONB 구조**:
```json
[
  {
    "id": "bbq-small",
    "name": "바베큐 세트 (소)",
    "quantity": 1,
    "price": 30000
  }
]
```

### 3. check_in_out_logs 테이블

```sql
CREATE TABLE check_in_out_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('checkin', 'checkout')),
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  checklist JSONB,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_check_in_out_logs_reservation_id ON check_in_out_logs(reservation_id);
CREATE INDEX idx_check_in_out_logs_type ON check_in_out_logs(type);
```

**checklist JSONB 구조 (checkout만)**:
```json
{
  "gasLocked": true,
  "trashCleaned": true
}
```

### 4. rooms 테이블

```sql
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(100) NOT NULL,
  capacity INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'available',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rooms_status ON rooms(status);
```

**상태 값**:
- `available`: 사용 가능
- `occupied`: 사용 중
- `maintenance`: 점검 중

---

## 🔐 인증

### 관리자 인증

**방식**: Bearer Token (JWT 또는 세션 토큰)

**헤더**:
```
Authorization: Bearer <admin-token>
```

---

## 📡 API 엔드포인트

### 1. 관리자 인증 API

#### POST /api/auth/login

관리자 로그인

**Request Body**:
```json
{
  "id": "admin",
  "password": "password"
}
```

**Response** (200 OK):
```json
{
  "token": "admin-token-123...",
  "expiresIn": 604800
}
```

**Response** (401 Unauthorized):
```json
{
  "error": "Invalid credentials"
}
```

---

### 2. 예약 관리 API

#### GET /api/admin/reservations

예약 목록 조회

**Headers**:
```
Authorization: Bearer <admin-token>
```

**Query Parameters**:
- `status` (optional): 예약 상태 필터 (`pending`, `assigned`, `checked_in`, `checked_out`, `cancelled`)
- `checkin` (optional): 체크인 날짜 필터 (YYYY-MM-DD)
- `checkout` (optional): 체크아웃 날짜 필터 (YYYY-MM-DD)
- `page` (optional): 페이지 번호 (기본값: 1)
- `limit` (optional): 페이지당 항목 수 (기본값: 20)

**Response** (200 OK):
```json
{
  "reservations": [
    {
      "id": "uuid",
      "reservationNumber": "1122689451",
      "guestName": "이*종",
      "email": "example@email.com",
      "phone": "010-1234-5678",
      "checkin": "2026-01-05",
      "checkout": "2026-01-06",
      "roomType": "4인실(기준2인, 1인추가2만원) 오션뷰카라반 예약",
      "assignedRoom": "A1",
      "amount": "180,000원",
      "status": "assigned",
      "uniqueToken": "uuid",
      "createdAt": "2026-01-04T17:35:29Z",
      "updatedAt": "2026-01-04T18:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

#### GET /api/admin/reservations/:id

예약 상세 조회

**Headers**:
```
Authorization: Bearer <admin-token>
```

**Response** (200 OK):
```json
{
  "id": "uuid",
  "reservationNumber": "1122689451",
  "guestName": "이*종",
  "email": "example@email.com",
  "phone": "010-1234-5678",
  "checkin": "2026-01-05",
  "checkout": "2026-01-06",
  "roomType": "4인실(기준2인, 1인추가2만원) 오션뷰카라반 예약",
  "assignedRoom": "A1",
  "amount": "180,000원",
  "status": "assigned",
  "uniqueToken": "uuid",
  "createdAt": "2026-01-04T17:35:29Z",
  "updatedAt": "2026-01-04T18:00:00Z"
}
```

#### POST /api/admin/reservations

예약 등록 (n8n에서 호출)

**Request Body**:
```json
{
  "reservationNumber": "1122689451",
  "guestName": "이*종",
  "email": "example@email.com",
  "checkin": "2026-01-05",
  "checkout": "2026-01-06",
  "roomType": "4인실(기준2인, 1인추가2만원) 오션뷰카라반 예약",
  "amount": "180,000원"
}
```

**Response** (201 Created):
```json
{
  "id": "uuid",
  "reservationNumber": "1122689451",
  "guestName": "이*종",
  "email": "example@email.com",
  "checkin": "2026-01-05",
  "checkout": "2026-01-06",
  "roomType": "4인실(기준2인, 1인추가2만원) 오션뷰카라반 예약",
  "amount": "180,000원",
  "status": "pending",
  "createdAt": "2026-01-04T17:35:29Z",
  "updatedAt": "2026-01-04T17:35:29Z"
}
```

#### PATCH /api/admin/reservations/:id

예약 정보 업데이트 (방 배정, 전화번호 입력, 토큰 생성)

**Headers**:
```
Authorization: Bearer <admin-token>
```

**Request Body**:
```json
{
  "assignedRoom": "A1",
  "phone": "010-1234-5678",
  "uniqueToken": "uuid",
  "status": "assigned"
}
```

**Response** (200 OK):
```json
{
  "id": "uuid",
  "reservationNumber": "1122689451",
  "guestName": "이*종",
  "email": "example@email.com",
  "phone": "010-1234-5678",
  "checkin": "2026-01-05",
  "checkout": "2026-01-06",
  "roomType": "4인실(기준2인, 1인추가2만원) 오션뷰카라반 예약",
  "assignedRoom": "A1",
  "amount": "180,000원",
  "status": "assigned",
  "uniqueToken": "uuid",
  "createdAt": "2026-01-04T17:35:29Z",
  "updatedAt": "2026-01-04T18:00:00Z"
}
```

#### DELETE /api/admin/reservations/:id

예약 삭제

**Headers**:
```
Authorization: Bearer <admin-token>
```

**Response** (204 No Content)

---

### 3. 고객 정보 API

#### GET /api/guest/:token

고객 정보 조회 (토큰 기반)

**Response** (200 OK):
```json
{
  "id": "uuid",
  "reservationNumber": "1122689451",
  "guestName": "이*종",
  "email": "example@email.com",
  "phone": "010-1234-5678",
  "checkin": "2026-01-05",
  "checkout": "2026-01-06",
  "roomType": "4인실(기준2인, 1인추가2만원) 오션뷰카라반 예약",
  "assignedRoom": "A1",
  "amount": "180,000원",
  "status": "assigned",
  "uniqueToken": "uuid",
  "createdAt": "2026-01-04T17:35:29Z",
  "updatedAt": "2026-01-04T18:00:00Z"
}
```

**Response** (404 Not Found):
```json
{
  "error": "Invalid token"
}
```

---

### 4. 주문 API

#### GET /api/guest/:token/orders

고객 주문 목록 조회

**Response** (200 OK):
```json
{
  "orders": [
    {
      "id": "uuid",
      "reservationId": "uuid",
      "type": "bbq",
      "items": [
        {
          "id": "bbq-small",
          "name": "바베큐 세트 (소)",
          "quantity": 1,
          "price": 30000
        }
      ],
      "totalAmount": 30000,
      "status": "pending",
      "deliveryTime": "18:00",
      "notes": "문 앞에 놓아주세요",
      "createdAt": "2026-01-05T10:00:00Z",
      "updatedAt": "2026-01-05T10:00:00Z"
    }
  ]
}
```

#### POST /api/guest/:token/orders

주문 생성

**Request Body**:
```json
{
  "type": "bbq",
  "items": [
    {
      "id": "bbq-small",
      "name": "바베큐 세트 (소)",
      "quantity": 1,
      "price": 30000
    }
  ],
  "totalAmount": 30000,
  "deliveryTime": "18:00",
  "notes": "문 앞에 놓아주세요"
}
```

**Response** (201 Created):
```json
{
  "id": "uuid",
  "reservationId": "uuid",
  "type": "bbq",
  "items": [
    {
      "id": "bbq-small",
      "name": "바베큐 세트 (소)",
      "quantity": 1,
      "price": 30000
    }
  ],
  "totalAmount": 30000,
  "status": "pending",
  "deliveryTime": "18:00",
  "notes": "문 앞에 놓아주세요",
  "createdAt": "2026-01-05T10:00:00Z",
  "updatedAt": "2026-01-05T10:00:00Z"
}
```

#### GET /api/admin/orders

관리자 주문 목록 조회

**Headers**:
```
Authorization: Bearer <admin-token>
```

**Query Parameters**:
- `status` (optional): 주문 상태 필터
- `page` (optional): 페이지 번호
- `limit` (optional): 페이지당 항목 수

**Response** (200 OK):
```json
{
  "orders": [
    {
      "id": "uuid",
      "reservationId": "uuid",
      "type": "bbq",
      "items": [
        {
          "id": "bbq-small",
          "name": "바베큐 세트 (소)",
          "quantity": 1,
          "price": 30000
        }
      ],
      "totalAmount": 30000,
      "status": "pending",
      "deliveryTime": "18:00",
      "notes": "문 앞에 놓아주세요",
      "createdAt": "2026-01-05T10:00:00Z",
      "updatedAt": "2026-01-05T10:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20
}
```

#### GET /api/admin/orders/:id

주문 상세 조회

**Headers**:
```
Authorization: Bearer <admin-token>
```

**Response** (200 OK):
```json
{
  "id": "uuid",
  "reservationId": "uuid",
  "type": "bbq",
  "items": [
    {
      "id": "bbq-small",
      "name": "바베큐 세트 (소)",
      "quantity": 1,
      "price": 30000
    }
  ],
  "totalAmount": 30000,
  "status": "pending",
  "deliveryTime": "18:00",
  "notes": "문 앞에 놓아주세요",
  "createdAt": "2026-01-05T10:00:00Z",
  "updatedAt": "2026-01-05T10:00:00Z"
}
```

#### PATCH /api/admin/orders/:id

주문 상태 업데이트

**Headers**:
```
Authorization: Bearer <admin-token>
```

**Request Body**:
```json
{
  "status": "preparing"
}
```

**Response** (200 OK):
```json
{
  "id": "uuid",
  "reservationId": "uuid",
  "type": "bbq",
  "items": [
    {
      "id": "bbq-small",
      "name": "바베큐 세트 (소)",
      "quantity": 1,
      "price": 30000
    }
  ],
  "totalAmount": 30000,
  "status": "preparing",
  "deliveryTime": "18:00",
  "notes": "문 앞에 놓아주세요",
  "createdAt": "2026-01-05T10:00:00Z",
  "updatedAt": "2026-01-05T10:30:00Z"
}
```

---

### 5. 체크인/체크아웃 API

#### POST /api/guest/:token/checkin

체크인 처리

**Request Body** (optional):
```json
{
  "timestamp": "2026-01-05T15:00:00Z"
}
```

**Response** (200 OK):
```json
{
  "id": "uuid",
  "reservationId": "uuid",
  "type": "checkin",
  "timestamp": "2026-01-05T15:00:00Z",
  "createdAt": "2026-01-05T15:00:00Z"
}
```

**또한 예약 상태 업데이트**:
- `reservations.status`를 `checked_in`으로 변경

#### POST /api/guest/:token/checkout

체크아웃 처리

**Request Body**:
```json
{
  "timestamp": "2026-01-06T11:00:00Z",
  "checklist": {
    "gasLocked": true,
    "trashCleaned": true
  },
  "notes": "추가 메모"
}
```

**Response** (200 OK):
```json
{
  "id": "uuid",
  "reservationId": "uuid",
  "type": "checkout",
  "timestamp": "2026-01-06T11:00:00Z",
  "checklist": {
    "gasLocked": true,
    "trashCleaned": true
  },
  "notes": "추가 메모",
  "createdAt": "2026-01-06T11:00:00Z"
}
```

**또한 예약 상태 업데이트**:
- `reservations.status`를 `checked_out`으로 변경

---

### 6. 방 관리 API

#### GET /api/admin/rooms

방 목록 조회

**Headers**:
```
Authorization: Bearer <admin-token>
```

**Response** (200 OK):
```json
{
  "rooms": [
    {
      "id": "uuid",
      "name": "A1",
      "type": "오션뷰카라반",
      "capacity": 4,
      "status": "available",
      "description": "오션뷰 전망",
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/admin/rooms

방 추가

**Headers**:
```
Authorization: Bearer <admin-token>
```

**Request Body**:
```json
{
  "name": "A1",
  "type": "오션뷰카라반",
  "capacity": 4,
  "status": "available",
  "description": "오션뷰 전망"
}
```

**Response** (201 Created):
```json
{
  "id": "uuid",
  "name": "A1",
  "type": "오션뷰카라반",
  "capacity": 4,
  "status": "available",
  "description": "오션뷰 전망",
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-01T00:00:00Z"
}
```

#### PATCH /api/admin/rooms/:id

방 정보 수정

**Headers**:
```
Authorization: Bearer <admin-token>
```

**Request Body**:
```json
{
  "name": "A1",
  "type": "오션뷰카라반",
  "capacity": 4,
  "status": "maintenance",
  "description": "오션뷰 전망 (점검 중)"
}
```

**Response** (200 OK):
```json
{
  "id": "uuid",
  "name": "A1",
  "type": "오션뷰카라반",
  "capacity": 4,
  "status": "maintenance",
  "description": "오션뷰 전망 (점검 중)",
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-05T10:00:00Z"
}
```

#### DELETE /api/admin/rooms/:id

방 삭제

**Headers**:
```
Authorization: Bearer <admin-token>
```

**Response** (204 No Content)

---

### 7. 통계 API

#### GET /api/admin/stats

관리자 대시보드 통계

**Headers**:
```
Authorization: Bearer <admin-token>
```

**Response** (200 OK):
```json
{
  "todayReservations": 5,
  "pendingCheckins": 3,
  "pendingCheckouts": 2,
  "pendingOrders": 4
}
```

---

## 🔒 보안 고려사항

### CORS 설정

**허용된 Origin**:
- `https://ouscaravan.vercel.app`
- `http://localhost:3000` (개발 환경)

### Rate Limiting

- 관리자 API: 분당 60회
- 고객 API: 분당 30회

### 입력 검증

- 모든 입력값 검증 (길이, 형식, 타입)
- SQL Injection 방지 (Prepared Statements)
- XSS 방지 (입력값 이스케이프)

---

## 📝 에러 응답 형식

모든 에러 응답은 다음 형식을 따릅니다:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  }
}
```

**HTTP 상태 코드**:
- `400 Bad Request`: 잘못된 요청
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 리소스 없음
- `500 Internal Server Error`: 서버 오류

---

## 🧪 테스트 예시

### cURL 예시

#### 관리자 로그인
```bash
curl -X POST https://ouscaravan-api.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"id":"admin","password":"password"}'
```

#### 예약 목록 조회
```bash
curl -X GET https://ouscaravan-api.railway.app/api/admin/reservations \
  -H "Authorization: Bearer admin-token-123..."
```

#### 고객 정보 조회
```bash
curl -X GET https://ouscaravan-api.railway.app/api/guest/abc123def456...
```

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15  
**작성자**: AI Assistant
