# OUSCARAVAN 예약 관리 시스템 - 개정 기획서

## 📋 프로젝트 개요

### 목적
예약 확정 이메일을 기반으로 고객 정보를 자동으로 정리하고, 관리자가 방 배정과 전화번호만 입력하면, 개인별 맞춤 페이지 링크를 문자로 보내서 모든 고객 안내를 자동화하는 시스템입니다.

### 핵심 가치
- ✅ **관리자 효율성**: 방 배정과 전화번호 입력만으로 자동 처리
- ✅ **고객 편의성**: 모든 정보와 주문을 한 페이지에서 확인
- ✅ **자동화**: 예약 확정부터 문자 발송까지 자동 처리
- ✅ **개인화**: 고객별 맞춤 페이지 제공

---

## 🎯 전체 시스템 플로우

### Phase 1: 예약 확정 → 관리자 페이지 생성

```
[네이버 예약 확정]
  ↓
[예약 확정 이메일 발송]
  ↓
[n8n Gmail Trigger]
  ↓
[Code: 이메일 파싱]
  ↓
[IF: 예약 확정/취소 구분]
  ├─ True (확정)
  │   ↓
  │   [Code: 고객 정보 추출]
  │   ↓
  │   [HTTP Request: 관리자 페이지 API]
  │   ↓
   │   [Railway 백엔드에 예약 정보 자동 등록]
  │
  └─ False (취소)
      ↓
      [관리자 페이지에서 예약 취소 처리]
```

### Phase 2: 관리자 페이지에서 방 배정 및 전화번호 입력

```
[관리자 페이지 접속]
  ↓
[예약 목록 확인]
  ↓
[예약 선택]
  ↓
[방 배정 선택]
  ↓
[전화번호 입력]
  ↓
[저장]
  ↓
[개인화된 페이지 링크 생성]
  ↓
[알림톡 발송 트리거]
```

### Phase 3: 알림톡 발송 및 고객 전용 페이지 제공

```
[관리자 페이지에서 저장]
  ↓
[n8n Webhook 트리거]
  ↓
[Code: 개인화된 링크 생성]
  ↓
[Code: 전화번호 포맷 변환]
  ↓
[SolAPI: 알림톡 발송]
  ↓
[고객이 링크 클릭]
  ↓
[고객 전용 페이지 접속]
  ↓
[모든 서비스 이용 가능]
```

---

## 🏗️ 시스템 아키텍처

### 1. 데이터베이스 구조

#### 예약 정보 테이블 (Reservations)

```typescript
interface Reservation {
  id: string; // UUID
  reservationNumber: string; // 네이버 예약번호
  guestName: string; // 예약자명
  email: string; // 이메일
  phone: string | null; // 전화번호 (관리자 입력)
  checkin: string; // 체크인 날짜 (YYYY-MM-DD)
  checkout: string; // 체크아웃 날짜 (YYYY-MM-DD)
  roomType: string; // 예약 상품
  amount: string; // 결제금액
  status: 'pending' | 'assigned' | 'confirmed' | 'cancelled'; // 상태
  assignedRoom: string | null; // 배정된 방
  createdAt: Date; // 예약 확정 시간
  updatedAt: Date; // 최종 수정 시간
  uniqueToken: string; // 고유 토큰 (개인화된 링크용)
}
```

#### 주문 정보 테이블 (Orders)

```typescript
interface Order {
  id: string; // UUID
  reservationId: string; // 예약 ID
  type: 'bbq' | 'fire'; // 주문 유형
  items: string[]; // 주문 항목
  quantity: number; // 수량
  deliveryTime: string; // 배송 시간
  notes: string; // 특이사항
  status: 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}
```

#### 체크인/체크아웃 로그 테이블 (CheckInOutLogs)

```typescript
interface CheckInOutLog {
  id: string;
  reservationId: string;
  type: 'checkin' | 'checkout';
  timestamp: Date;
  notes: string;
}
```

### 2. 관리자 페이지 구조

#### 페이지 구성

1. **대시보드** (`/admin`)
   - 오늘의 예약 현황
   - 체크인/체크아웃 현황
   - 주문 현황
   - 통계

2. **예약 관리** (`/admin/reservations`)
   - 예약 목록 (테이블)
   - 예약 상세 정보
   - 방 배정
   - 전화번호 입력
   - 상태 변경

3. **방 관리** (`/admin/rooms`)
   - 방 목록
   - 방 상태 관리
   - 방별 예약 현황

4. **주문 관리** (`/admin/orders`)
   - 주문 목록
   - 주문 상태 변경
   - 주문 통계

5. **설정** (`/admin/settings`)
   - 시스템 설정
   - 알림톡 템플릿 관리
   - API 키 관리

#### 주요 기능

**예약 목록 페이지:**
- 예약 확정 이메일에서 자동으로 등록된 예약 표시
- 상태별 필터링 (대기, 배정 완료, 확정, 취소)
- 검색 기능 (예약번호, 예약자명, 날짜)
- 정렬 기능

**예약 상세 페이지:**
- 예약 정보 표시
- 방 배정 드롭다운
- 전화번호 입력 필드
- 저장 버튼 클릭 시:
  - 고유 토큰 생성
  - 개인화된 링크 생성
  - n8n Webhook 호출
  - 알림톡 발송

### 3. 고객 전용 페이지 구조

#### 페이지 구성

1. **홈** (`/guest/[token]`)
   - 예약 정보 요약
   - 체크인/체크아웃 카운트다운
   - 빠른 액션 버튼
   - 주문 현황

2. **가이드** (`/guest/[token]/guide`)
   - 디지털 매뉴얼
   - 시설 안내
   - 이용 안내

3. **주문** (`/guest/[token]/order`)
   - 불멍/바베큐 주문
   - 주문 내역
   - 주문 상태 확인

4. **체크인/체크아웃** (`/guest/[token]/checkinout`)
   - 체크인/체크아웃 처리
   - 체크리스트
   - 상태 확인

5. **도움말** (`/guest/[token]/help`)
   - FAQ
   - 비상 연락처
   - 문의하기

#### 주요 기능

**개인화된 정보 표시:**
- 예약자명
- 배정된 방
- 체크인/체크아웃 날짜
- 예약 상품 정보

**주문 기능:**
- 불멍/바베큐 세트 주문
- 배송 시간 선택
- 특이사항 입력
- 주문 내역 확인

**체크인/체크아웃:**
- 체크인 처리
- 체크아웃 체크리스트
- 자동 체크아웃 알림

---

## 🔄 상세 워크플로우

### 1. 예약 확정 이메일 처리

#### n8n 워크플로우

**노드 구성:**
1. **Gmail Trigger**
   - Event: `Message Received`
   - Filters:
     - From: `naver.com`
     - Subject: `[네이버 예약]`
   
2. **IF 노드**
   - Condition: `{{ $json.Subject }}` contains `확정`
   - True: 예약 확정 처리
   - False: 예약 취소 처리

3. **Code 노드 (이메일 파싱)**
   ```javascript
   // 예약 정보 추출
   const reservationData = {
     reservationNumber: extractReservationNumber(emailBody),
     guestName: extractGuestName(emailBody),
     email: extractEmail(emailBody),
     checkin: extractCheckinDate(emailBody),
     checkout: extractCheckoutDate(emailBody),
     roomType: extractRoomType(emailBody),
     amount: extractAmount(emailBody)
   };
   ```

4. **HTTP Request (Railway 백엔드 API)**
   - Method: `POST`
   - URL: `https://ouscaravan-api.railway.app/api/admin/reservations`
   - Body: 예약 정보 JSON
   - Headers:
     - `Authorization: Bearer {admin_api_key}`
     - `Content-Type: application/json`

5. **응답 처리**
   - 성공: 예약 정보 저장 완료
   - 실패: 에러 로깅

#### 백엔드 API 엔드포인트 (Railway)

**POST `https://ouscaravan-api.railway.app/api/admin/reservations`**

**Request Body:**
```json
{
  "reservationNumber": "1122689451",
  "guestName": "이관종",
  "email": "guest@example.com",
  "checkin": "2026-01-05",
  "checkout": "2026-01-06",
  "roomType": "4인실(기준2인, 1인추가2만원) 오션뷰카라반 예약",
  "amount": "150,000"
}
```

**Response:**
```json
{
  "success": true,
  "reservation": {
    "id": "uuid",
    "reservationNumber": "1122689451",
    "status": "pending",
    ...
  }
}
```

### 2. 관리자 페이지에서 방 배정 및 전화번호 입력

#### 관리자 페이지 UI

**예약 목록 테이블:**
```
| 예약번호 | 예약자명 | 체크인 | 체크아웃 | 방 배정 | 전화번호 | 상태 | 액션 |
|---------|---------|--------|---------|---------|---------|------|------|
| 1122689451 | 이관종 | 2026-01-05 | 2026-01-06 | [선택] | [입력] | 대기 | 저장 |
```

**예약 상세 모달:**
- 예약 정보 전체 표시
- 방 배정 드롭다운
- 전화번호 입력 필드
- 저장 버튼

#### 저장 시 처리

**프론트엔드 (관리자 페이지 - Vercel):**
```typescript
async function saveReservation(reservationId: string, data: {
  assignedRoom: string;
  phone: string;
}) {
  // 1. 고유 토큰 생성
  const uniqueToken = generateUniqueToken();
  
  // 2. 예약 정보 업데이트 (Railway 백엔드 API 호출)
  const response = await fetch(`https://ouscaravan-api.railway.app/api/admin/reservations/${reservationId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      ...data,
      uniqueToken,
      status: 'assigned'
    })
  });
  
  // 3. n8n Webhook 호출
  await fetch(n8nWebhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      reservationId,
      phone: data.phone,
      uniqueToken,
      assignedRoom: data.assignedRoom
    })
  });
}
```

**백엔드 API (Railway):**
```typescript
// PATCH /api/admin/reservations/:id
// Railway Express 서버 또는 Next.js API Routes
export async function updateReservation(req: Request, res: Response) {
  const { id } = req.params;
  const body = req.body;
  
  // 예약 정보 업데이트
  const reservation = await updateReservationInDB(id, {
    assignedRoom: body.assignedRoom,
    phone: body.phone,
    uniqueToken: body.uniqueToken,
    status: 'assigned'
  });
  
  res.json({ success: true, reservation });
}
```

### 3. 알림톡 발송

#### n8n 워크플로우 (Webhook 트리거)

**노드 구성:**
1. **Webhook 노드**
   - Method: `POST`
   - Path: `/reservation-assigned`
   - Response Mode: `Last Node`

2. **Code 노드 (링크 생성)**
   ```javascript
   const webhookData = $input.item.json;
   
   const baseUrl = $env.WEB_APP_URL;
   const guestPageUrl = `${baseUrl}/guest/${webhookData.uniqueToken}`;
   
   return {
     ...webhookData,
     guestPageUrl
   };
   ```

3. **Code 노드 (전화번호 포맷 변환)**
   ```javascript
   let phone = $input.item.json.phone || '';
   phone = phone.replace(/[-\s()]/g, '');
   
   if (phone.startsWith('010')) {
     phone = phone.substring(0, 11);
   }
   
   return {
     ...$input.item.json,
     phone: phone
   };
   ```

4. **SolAPI 노드 (알림톡 발송)**
   - Operation: `Send AlimTalk`
   - to: `{{ $json.phone }}`
   - templateId: `{{ $env.SOLAPI_ALIMTALK_TEMPLATE_ID }}`
   - variables:
     ```json
     {
       "#{guest_name}": "{{ $json.guestName }}",
       "#{reservation_number}": "{{ $json.reservationNumber }}",
       "#{checkin_date}": "{{ $json.checkin }}",
       "#{checkout_date}": "{{ $json.checkout }}",
       "#{assigned_room}": "{{ $json.assignedRoom }}",
       "#{service_link}": "{{ $json.guestPageUrl }}"
     }
     ```

#### 알림톡 템플릿

**템플릿 내용:**
```
#{guest_name}님, OUSCARAVAN 예약이 완료되었습니다!

📅 예약번호: #{reservation_number}
📅 체크인: #{checkin_date} 15:00
📅 체크아웃: #{checkout_date} 11:00
🏠 배정된 방: #{assigned_room}

예약 정보 확인 및 주문은 아래 버튼을 클릭하세요.
```

**버튼:**
- 링크 버튼: "예약 정보 확인하기"
- 링크: `#{service_link}`

### 4. 고객 전용 페이지

#### 토큰 기반 인증

**페이지 접근:**
- URL: `/guest/[token]`
- 토큰으로 예약 정보 조회 (Railway 백엔드 API 호출)
- 토큰이 유효하지 않으면 404 페이지

**프론트엔드 (Vercel):**
```typescript
// app/guest/[token]/page.tsx
async function getGuestInfo(token: string) {
  const response = await fetch(`https://ouscaravan-api.railway.app/api/guest/${token}`);
  if (!response.ok) {
    return null;
  }
  return await response.json();
}
```

**백엔드 API (Railway):**
```typescript
// GET /api/guest/:token
export async function getGuestInfo(req: Request, res: Response) {
  const { token } = req.params;
  const reservation = await getReservationByToken(token);
  
  if (!reservation) {
    return res.status(404).json({ error: 'Invalid token' });
  }
  
  res.json({
    reservation: {
      guestName: reservation.guestName,
      assignedRoom: reservation.assignedRoom,
      checkin: reservation.checkin,
      checkout: reservation.checkout,
      roomType: reservation.roomType
    }
  });
}
```

#### 고객 전용 페이지 기능

**1. 홈 페이지 (`/guest/[token]`)**
- 예약 정보 카드
- 체크인/체크아웃 카운트다운
- 빠른 메뉴 버튼
- 주문 현황

**2. 안내 페이지 (`/guest/[token]/guide`)**
- 이용 안내서
- 시설 안내
- 이용 방법
- 바베큐 사용법

**3. 주문 페이지 (`/guest/[token]/order`)**
- 불멍/바베큐 세트 선택
- 수량 선택
- 배송 시간 선택
- 특이사항 입력
- 주문하기

**4. 체크인/체크아웃 페이지 (`/guest/[token]/checkinout`)**
- 체크인 처리
- 체크아웃 체크리스트
- 상태 확인

**5. 도움말 페이지 (`/guest/[token]/help`)**
- 자주 묻는 질문
- 비상 연락처
- 문의하기

---

## 🛠️ 기술 스택

### 프론트엔드
- **Next.js 14+** (App Router)
- **TypeScript** (Strict Mode)
- **Tailwind CSS**
- **Shadcn UI**
- **Zustand** (상태 관리)
- **React Query** (서버 상태 관리)

### 백엔드
- **Railway** (백엔드 서버)
- **Node.js + Express** 또는 **Next.js API Routes**
- **데이터베이스**: Railway Postgres 또는 Supabase
- **인증**: NextAuth.js (관리자 페이지용)

### 자동화
- **n8n** (워크플로우 자동화)
- **SolAPI** (알림톡 발송)

### 배포
- **Vercel** (프론트엔드: 관리자 페이지 + 고객 페이지)
- **Railway** (백엔드 API 서버)
- **n8n Cloud** (워크플로우)

---

## 📁 프로젝트 구조

### 단일 레포지토리 구조 (권장)

**하나의 GitHub 레포지토리에서 모든 프론트엔드 코드 관리:**

```
ouscaravan/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 인증 그룹
│   │   └── login/
│   │       └── page.tsx          # 관리자 로그인
│   ├── admin/                    # 관리자 페이지 (인증 필요)
│   │   ├── layout.tsx            # 관리자 레이아웃 (인증 체크)
│   │   ├── page.tsx              # 관리자 대시보드
│   │   ├── reservations/
│   │   │   ├── page.tsx          # 예약 목록
│   │   │   └── [id]/
│   │   │       └── page.tsx      # 예약 상세
│   │   ├── rooms/
│   │   │   └── page.tsx          # 방 관리
│   │   └── orders/
│   │       └── page.tsx          # 주문 관리
│   ├── guest/                    # 고객 페이지 (공개)
│   │   └── [token]/
│   │       ├── page.tsx          # 고객 홈
│   │       ├── guide/
│   │       │   └── page.tsx      # 안내
│   │       ├── order/
│   │       │   └── page.tsx      # 주문
│   │       ├── checkinout/
│   │       │   └── page.tsx      # 체크인/체크아웃
│   │       └── help/
│   │           └── page.tsx      # 도움말
│   ├── layout.tsx                # 루트 레이아웃
│   └── page.tsx                  # 루트 페이지 (리다이렉트)
├── components/
│   ├── admin/
│   │   ├── ReservationList.tsx
│   │   ├── ReservationDetail.tsx
│   │   └── RoomAssignment.tsx
│   └── guest/
│       ├── ReservationCard.tsx
│       ├── OrderForm.tsx
│       └── CheckInOut.tsx
├── lib/
│   ├── api.ts                    # Railway API 호출 함수
│   ├── auth.ts                   # 인증 유틸리티
│   └── utils.ts
├── middleware.ts                 # Next.js 미들웨어 (인증 체크)
├── types/
│   └── index.ts                  # TypeScript 타입 정의
├── package.json
├── next.config.js
└── tsconfig.json
```

### Railway 백엔드 (별도 레포지토리 또는 동일 레포지토리)

**옵션 1: 별도 레포지토리 (권장)**
```
ouscaravan-backend/               # 별도 GitHub 레포지토리
├── src/
│   ├── routes/
│   │   ├── admin/
│   │   │   └── reservations.ts   # 예약 관리 API
│   │   └── guest/
│   │       └── info.ts           # 고객 정보 API
│   ├── controllers/
│   │   ├── reservationController.ts
│   │   └── orderController.ts
│   ├── models/
│   │   ├── Reservation.ts
│   │   └── Order.ts
│   ├── db/
│   │   └── connection.ts         # 데이터베이스 연결
│   └── server.ts                 # Express 서버
├── package.json
└── tsconfig.json
```

**옵션 2: 동일 레포지토리 (모노레포)**
```
ouscaravan/
├── frontend/                     # Vercel 배포
│   └── (위의 app/ 구조)
├── backend/                      # Railway 배포
│   └── (위의 src/ 구조)
└── package.json                  # 루트 package.json
```

---

## 🔐 보안 및 인증

### 관리자 페이지 인증
- **NextAuth.js** 사용
- 관리자 계정만 접근 가능
- 세션 기반 인증

### 고객 페이지 인증
- **토큰 기반 인증**
- 고유 토큰으로만 접근 가능
- 토큰은 예측 불가능한 UUID 사용

### API 보안
- 관리자 API: Bearer Token 인증
- 고객 API: 토큰 검증
- Rate Limiting 적용

---

## 📊 데이터베이스 스키마

### Reservations 테이블

```sql
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_number VARCHAR(50) UNIQUE NOT NULL,
  guest_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  checkin DATE NOT NULL,
  checkout DATE NOT NULL,
  room_type TEXT,
  amount VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending',
  assigned_room VARCHAR(50),
  unique_token UUID UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reservation_number ON reservations(reservation_number);
CREATE INDEX idx_unique_token ON reservations(unique_token);
CREATE INDEX idx_status ON reservations(status);
CREATE INDEX idx_checkin ON reservations(checkin);
```

### Orders 테이블

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID REFERENCES reservations(id),
  type VARCHAR(20) NOT NULL,
  items TEXT[],
  quantity INTEGER DEFAULT 1,
  delivery_time TIMESTAMP,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reservation_id ON orders(reservation_id);
CREATE INDEX idx_status ON orders(status);
```

### CheckInOutLogs 테이블

```sql
CREATE TABLE check_in_out_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID REFERENCES reservations(id),
  type VARCHAR(20) NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  notes TEXT
);

CREATE INDEX idx_reservation_id ON check_in_out_logs(reservation_id);
CREATE INDEX idx_timestamp ON check_in_out_logs(timestamp);
```

---

## 🚀 구현 단계

### Phase 1: 기본 인프라 구축 (1주)
- [ ] Railway 프로젝트 생성 및 설정
- [ ] 데이터베이스 설정 (Railway Postgres)
- [ ] Railway 백엔드 서버 기본 구조 생성
- [ ] Vercel 프로젝트 생성 및 Next.js 설정
- [ ] 기본 레이아웃 및 라우팅
- [ ] 인증 시스템 구축

### Phase 2: 백엔드 API 개발 (1주)
- [ ] Railway 백엔드 서버 구축 (Express 또는 Next.js API)
- [ ] 데이터베이스 스키마 생성
- [ ] 예약 관리 API 개발
- [ ] 고객 정보 조회 API 개발
- [ ] 주문 관리 API 개발
- [ ] 인증 미들웨어 개발

### Phase 3: 관리자 페이지 개발 (2주)
- [ ] 예약 목록 페이지 (Vercel)
- [ ] 예약 상세 페이지
- [ ] 방 배정 기능
- [ ] 전화번호 입력 기능
- [ ] Railway API 연동

### Phase 4: n8n 워크플로우 구축 (1주)
- [ ] 예약 확정 이메일 처리 워크플로우
- [ ] Railway 백엔드 API 연동
- [ ] 알림톡 발송 워크플로우
- [ ] Webhook 설정

### Phase 5: 고객 전용 페이지 개발 (2주)
- [ ] 고객 레이아웃 (`app/guest/[token]/layout.tsx`)
- [ ] 토큰 기반 인증 (Railway API 연동)
- [ ] 홈 페이지 (`app/guest/[token]/page.tsx`)
- [ ] 안내 페이지 (`app/guest/[token]/guide/page.tsx`)
- [ ] 주문 페이지 (`app/guest/[token]/order/page.tsx`)
- [ ] 체크인/체크아웃 페이지 (`app/guest/[token]/checkinout/page.tsx`)
- [ ] 도움말 페이지 (`app/guest/[token]/help/page.tsx`)
- [ ] Railway API 연동 (`lib/api.ts`)

### Phase 6: 통합 및 테스트 (1주)
- [ ] 전체 플로우 테스트
- [ ] 버그 수정
- [ ] 성능 최적화
- [ ] Vercel 및 Railway 배포

---

## 📋 체크리스트

### 개발 전 준비사항
- [ ] GitHub 레포지토리 생성 및 설정
- [ ] Railway 계정 생성 및 프로젝트 설정
- [ ] 데이터베이스 선택 및 설정 (Railway Postgres)
- [ ] Vercel 계정 생성 및 GitHub 연동
- [ ] Vercel 프로젝트 생성 (단일 프로젝트)
- [ ] Railway 프로젝트 생성 (백엔드)
- [ ] SolAPI 계정 생성 및 템플릿 등록
- [ ] n8n 계정 설정
- [ ] 환경 변수 설정 (Vercel, Railway)
- [ ] 도메인 설정 (선택사항)

### 기능 구현
- [ ] Railway 백엔드 서버 구축
- [ ] 데이터베이스 스키마 생성
- [ ] 예약 확정 이메일 파싱 (n8n)
- [ ] Railway 백엔드 API 개발
- [ ] 관리자 페이지 예약 목록 (Vercel)
- [ ] 방 배정 기능
- [ ] 전화번호 입력 기능
- [ ] 알림톡 발송 (n8n + SolAPI)
- [ ] 고객 전용 페이지 (Vercel)
- [ ] 주문 기능
- [ ] 체크인/체크아웃 기능

### 테스트
- [ ] 예약 확정 이메일 처리 테스트
- [ ] 관리자 페이지 기능 테스트
- [ ] 알림톡 발송 테스트
- [ ] 고객 전용 페이지 테스트
- [ ] 전체 플로우 통합 테스트

---

## 💡 추가 고려사항

### 배포 구조

**Vercel (프론트엔드 - 단일 프로젝트):**
- **하나의 Vercel 프로젝트**로 관리자 페이지와 고객 페이지 모두 배포
- 메인 도메인: `https://ouscaravan.vercel.app`
- 관리자 페이지: `https://ouscaravan.vercel.app/admin/*`
- 고객 페이지: `https://ouscaravan.vercel.app/guest/[token]`
- 환경 변수: Railway API URL, 인증 키 등

**Railway (백엔드):**
- API 서버: `https://ouscaravan-api.railway.app`
- 데이터베이스: Railway Postgres
- 환경 변수: 데이터베이스 연결 정보, API 키 등

**연동:**
- Vercel 프론트엔드 → Railway 백엔드 API 호출
- n8n → Railway 백엔드 API 호출 (예약 등록)
- Railway 백엔드 → n8n Webhook 호출 (알림톡 발송)

### 확장 가능성
- 다중 예약 플랫폼 지원 (네이버 외)
- 다국어 지원
- 실시간 채팅 기능
- 리뷰 시스템

### 모니터링 및 분석
- 예약 통계
- 주문 통계
- 사용자 행동 분석
- 에러 로깅

### 백업 및 복구
- 데이터베이스 백업 (Railway 자동 백업)
- 예약 정보 백업
- 재해 복구 계획

### 용어 순화 가이드

**기존 용어 → 순화된 용어:**
- 컨시어지 서비스 → 예약 정보 확인 / 서비스 이용
- 컨시어지 → 예약 관리 / 안내
- 디지털 매뉴얼 → 이용 안내서
- 가이드 → 안내
- 주문 제출 → 주문하기
- 빠른 액션 버튼 → 빠른 메뉴 버튼

---

---

## 📚 참고 문서

- [배포 아키텍처 가이드](./DEPLOYMENT_ARCHITECTURE.md) - Vercel 및 Railway 배포 상세 가이드
- [Vercel 배포 가이드](./VERCEL_DEPLOYMENT_GUIDE.md) - Vercel 단일 프로젝트 배포 상세 가이드
- [프로젝트 구조 상세 가이드](./PROJECT_STRUCTURE_DETAILED.md) - 레포지토리 구조 및 파일별 상세 설명

---

**문서 버전**: 2.1  
**최종 업데이트**: 2024-01-15  
**작성자**: AI Assistant
