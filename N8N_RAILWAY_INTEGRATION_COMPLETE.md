# n8n ↔ Railway 완전 연동 가이드

## 🔍 현재 상황 분석

**문제:**
1. Railway 서버가 시작 후 종료되는 문제가 계속 발생
2. n8n 연동이 되어있지 않아 처리할 데이터가 없음
3. 예약 정보를 n8n에서 받아와야 함

**데이터 흐름:**
```
네이버 예약 확정 이메일 
  → n8n (Gmail Trigger) 
  → Railway API (예약 생성) 
  → PostgreSQL 데이터베이스
  → 관리자 페이지 (방 배정)
  → n8n (알림톡 발송)
```

---

## 📋 전체 데이터 흐름

### 1단계: 네이버 예약 확정 이메일 수신

**n8n 워크플로우:**
- Gmail Trigger: 네이버 예약 확정 이메일 수신
- 이메일 파싱: 예약 정보 추출
- Railway API 호출: 예약 정보 전송

### 2단계: Railway API에서 예약 저장

**Railway 백엔드:**
- POST `/api/admin/reservations` 엔드포인트
- 예약 정보를 PostgreSQL에 저장
- 상태: `pending` (방 배정 대기)

### 3단계: 관리자 페이지에서 방 배정

**Vercel 프론트엔드:**
- 관리자 로그인
- 예약 목록 확인
- 방 배정 및 전화번호 입력
- n8n 웹훅 호출 (알림톡 발송)

### 4단계: n8n에서 알림톡 발송

**n8n 워크플로우:**
- Webhook Trigger: 예약 배정 정보 수신
- SolAPI 연동: 알림톡 발송
- 고객에게 예약 정보 전송

---

## 🚀 n8n 워크플로우 설정

### 워크플로우 1: 네이버 예약 확정 이메일 처리

**목적:** 네이버 예약 확정 이메일을 받아 Railway API로 전송

#### 1단계: n8n 워크플로우 생성

1. **n8n 대시보드** → **"Add workflow"** 클릭
2. 워크플로우 이름: `네이버 예약 확정 처리`

#### 2단계: Gmail Trigger 노드 추가

1. **"Gmail"** 노드 추가
2. **Trigger:** `Message Received`
3. **Settings:**
   - **From:** `naver.com` (또는 네이버 예약 이메일 주소)
   - **Subject Contains:** `[네이버 예약]` 또는 `확정`
   - **Poll Times:** `Every 5 minutes` (또는 원하는 주기)

#### 3단계: Code 노드 추가 (이메일 파싱)

1. **"Code"** 노드 추가
2. **Mode:** `Run Once for All Items`
3. **Code:**
```javascript
// 이메일 본문에서 예약 정보 추출
const emailBody = $input.item.json.body;
const subject = $input.item.json.subject;

// 예약 번호 추출 (예: "예약번호: 1122689451")
const reservationNumberMatch = emailBody.match(/예약번호[:\s]*(\d+)/i);
const reservationNumber = reservationNumberMatch ? reservationNumberMatch[1] : '';

// 예약자명 추출 (예: "예약자: 이관종")
const guestNameMatch = emailBody.match(/예약자[:\s]*([^\n\r]+)/i);
const guestName = guestNameMatch ? guestNameMatch[1].trim() : '';

// 이메일 주소 추출
const emailMatch = emailBody.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
const email = emailMatch ? emailMatch[1] : '';

// 체크인 날짜 추출 (예: "체크인: 2026-01-05")
const checkinMatch = emailBody.match(/체크인[:\s]*(\d{4}-\d{2}-\d{2})/i);
const checkin = checkinMatch ? checkinMatch[1] : '';

// 체크아웃 날짜 추출 (예: "체크아웃: 2026-01-06")
const checkoutMatch = emailBody.match(/체크아웃[:\s]*(\d{4}-\d{2}-\d{2})/i);
const checkout = checkoutMatch ? checkoutMatch[1] : '';

// 객실 타입 추출 (예: "객실: 4인실(기준2인, 1인추가2만원) 오션뷰카라반 예약")
const roomTypeMatch = emailBody.match(/객실[:\s]*([^\n\r]+)/i);
const roomType = roomTypeMatch ? roomTypeMatch[1].trim() : '';

// 금액 추출 (예: "금액: 150,000원")
const amountMatch = emailBody.match(/금액[:\s]*([0-9,]+)/i);
const amount = amountMatch ? amountMatch[1].replace(/,/g, '') : '0';

// Railway API로 전송할 데이터
return {
  reservationNumber,
  guestName,
  email,
  checkin,
  checkout,
  roomType,
  amount: parseInt(amount) || 0
};
```

#### 4단계: HTTP Request 노드 추가 (Railway API 호출)

1. **"HTTP Request"** 노드 추가
2. **Method:** `POST`
3. **URL:** `https://ouscaravan-production.up.railway.app/api/admin/reservations`
4. **Authentication:** `Generic Credential Type`
   - **Name:** `Railway API`
   - **Header Name:** `Authorization`
   - **Header Value:** `Bearer {JWT_TOKEN}` (또는 API Key)
5. **Body:**
```json
{
  "reservationNumber": "{{ $json.reservationNumber }}",
  "guestName": "{{ $json.guestName }}",
  "email": "{{ $json.email }}",
  "checkin": "{{ $json.checkin }}",
  "checkout": "{{ $json.checkout }}",
  "roomType": "{{ $json.roomType }}",
  "amount": {{ $json.amount }}
}
```

#### 5단계: IF 노드 추가 (성공/실패 처리)

1. **"IF"** 노드 추가
2. **Condition:** `{{ $json.statusCode }}` equals `200`
3. **True:** 성공 로그
4. **False:** 에러 로그

#### 6단계: 워크플로우 활성화

1. 우측 상단 **"Active"** 토글 활성화
2. **"Save"** 클릭

---

### 워크플로우 2: 예약 배정 알림톡 발송

**목적:** 관리자가 방 배정 시 고객에게 알림톡 발송

#### 1단계: n8n 워크플로우 생성

1. **n8n 대시보드** → **"Add workflow"** 클릭
2. 워크플로우 이름: `예약 배정 알림톡 발송`

#### 2단계: Webhook Trigger 노드 추가

1. **"Webhook"** 노드 추가
2. **HTTP Method:** `POST`
3. **Path:** `reservation-assigned`
4. **Response Mode:** `Respond to Webhook`
5. **Webhook URL 복사** (예: `https://your-n8n-instance.com/webhook/reservation-assigned`)

#### 3단계: Set 노드 추가 (데이터 정리)

1. **"Set"** 노드 추가
2. **Values:**
```json
{
  "reservationId": "{{ $json.body.reservationId }}",
  "guestName": "{{ $json.body.guestName }}",
  "phone": "{{ $json.body.phone }}",
  "uniqueToken": "{{ $json.body.uniqueToken }}",
  "assignedRoom": "{{ $json.body.assignedRoom }}",
  "checkin": "{{ $json.body.checkin }}",
  "checkout": "{{ $json.body.checkout }}"
}
```

#### 4단계: SolAPI 노드 추가 (알림톡 발송)

1. **"SolAPI"** 노드 추가 (또는 HTTP Request로 SolAPI API 호출)
2. **Method:** `POST`
3. **URL:** `https://api.solapi.com/messages/v4/send`
4. **Headers:**
   - `Authorization`: `HMAC-SHA256 {API_KEY}:{SECRET_KEY}`
   - `Content-Type`: `application/json`
5. **Body:**
```json
{
  "message": {
    "to": "{{ $json.phone }}",
    "from": "01012345678",
    "text": "{{ $json.guestName }}님, 예약이 확정되었습니다.\n객실: {{ $json.assignedRoom }}\n체크인: {{ $json.checkin }}\n체크아웃: {{ $json.checkout }}\n예약 확인: https://ouscaravan.vercel.app/guest/{{ $json.uniqueToken }}"
  }
}
```

#### 5단계: 워크플로우 활성화

1. 우측 상단 **"Active"** 토글 활성화
2. **"Save"** 클릭
3. **Webhook URL 복사** → Vercel 환경 변수에 추가

---

## 🔧 Railway API 엔드포인트 확인

### 예약 생성 엔드포인트

**POST `/api/admin/reservations`**

**Request Body:**
```json
{
  "reservationNumber": "1122689451",
  "guestName": "이관종",
  "email": "guest@example.com",
  "checkin": "2026-01-05",
  "checkout": "2026-01-06",
  "roomType": "4인실(기준2인, 1인추가2만원) 오션뷰카라반 예약",
  "amount": 150000
}
```

**Response:**
```json
{
  "id": "uuid",
  "reservationNumber": "1122689451",
  "guestName": "이관종",
  "email": "guest@example.com",
  "checkin": "2026-01-05",
  "checkout": "2026-01-06",
  "roomType": "4인실(기준2인, 1인추가2만원) 오션뷰카라반 예약",
  "amount": 150000,
  "status": "pending",
  "createdAt": "2026-01-06T06:00:00.000Z"
}
```

---

## 🔐 환경 변수 설정

### Vercel 환경 변수

**Vercel 대시보드 → 프로젝트 → Settings → Environment Variables:**

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://ouscaravan-production.up.railway.app` | Production, Preview, Development |
| `NEXT_PUBLIC_N8N_WEBHOOK_URL` | `https://your-n8n-instance.com/webhook` | Production, Preview, Development |

### Railway 환경 변수

**Railway 대시보드 → OUSCARAVAN 서비스 → Variables:**

| Name | Value | 설명 |
|------|-------|------|
| `DATABASE_URL` | (자동 생성) | PostgreSQL 연결 문자열 |
| `JWT_SECRET` | (설정 필요) | JWT 토큰 비밀키 |
| `NODE_ENV` | `production` | Node.js 환경 |
| `PORT` | (자동 할당) | 서버 포트 |

### n8n 환경 변수

**n8n 대시보드 → Settings → Environment Variables:**

| Name | Value | 설명 |
|------|-------|------|
| `RAILWAY_API_URL` | `https://ouscaravan-production.up.railway.app` | Railway API URL |
| `RAILWAY_API_KEY` | (JWT 토큰 또는 API Key) | Railway API 인증 |
| `SOLAPI_API_KEY` | (SolAPI API Key) | SolAPI 알림톡 발송 |
| `SOLAPI_SECRET_KEY` | (SolAPI Secret Key) | SolAPI 알림톡 발송 |

---

## 🐛 Railway 서버 종료 문제 해결

### 문제: Railway 서버가 시작 후 종료됨

**가능한 원인:**
1. Railway 헬스체크 실패
2. 데이터베이스 연결 실패
3. Railway 리소스 제한

**해결 방법:**

#### 방법 1: Railway 헬스체크 설정 확인

**Railway 대시보드 → OUSCARAVAN 서비스 → Settings:**

1. **Health Check 설정:**
   - **Health Check Path:** `/` 또는 `/health`
   - **Health Check Port:** `8080` (또는 Railway가 할당한 포트)
   - **Health Check Timeout:** `30` (초)

2. **또는 Health Check 비활성화:**
   - Health Check를 비활성화하면 헬스체크 실패로 인한 종료를 방지할 수 있음

#### 방법 2: Railway 서비스 재시작 정책 확인

**Railway 대시보드 → OUSCARAVAN 서비스 → Settings:**

1. **Restart Policy:**
   - "On Failure" 또는 "Always" 확인
   - 필요시 조정

#### 방법 3: Railway Metrics 확인

**Railway 대시보드 → OUSCARAVAN 서비스 → Metrics:**

1. **메모리 사용량 확인:**
   - 메모리 제한 확인
   - OOMKilled 발생 여부 확인

2. **CPU 사용량 확인:**
   - CPU 제한 확인

---

## 📋 체크리스트

### n8n 워크플로우 설정:

- [ ] n8n 계정 생성/확인
- [ ] 워크플로우 1 생성: 네이버 예약 확정 이메일 처리
  - [ ] Gmail Trigger 설정
  - [ ] 이메일 파싱 Code 노드 설정
  - [ ] Railway API 호출 HTTP Request 노드 설정
  - [ ] 워크플로우 활성화
- [ ] 워크플로우 2 생성: 예약 배정 알림톡 발송
  - [ ] Webhook Trigger 설정
  - [ ] SolAPI 알림톡 발송 노드 설정
  - [ ] 워크플로우 활성화
  - [ ] Webhook URL 복사

### 환경 변수 설정:

- [ ] Vercel: `NEXT_PUBLIC_API_URL` 설정
- [ ] Vercel: `NEXT_PUBLIC_N8N_WEBHOOK_URL` 설정
- [ ] Railway: `JWT_SECRET` 설정
- [ ] n8n: `RAILWAY_API_URL` 설정
- [ ] n8n: `RAILWAY_API_KEY` 설정 (선택사항)
- [ ] n8n: `SOLAPI_API_KEY` 설정
- [ ] n8n: `SOLAPI_SECRET_KEY` 설정

### Railway 서버 안정화:

- [ ] Railway 헬스체크 설정 확인
- [ ] Railway 서비스 재시작 정책 확인
- [ ] Railway Metrics 확인
- [ ] Railway 로그 확인 (서버가 계속 실행 중인지)

---

## 🚀 테스트 방법

### 1단계: n8n 워크플로우 테스트

1. **테스트 이메일 전송:**
   - 네이버 예약 확정 이메일 형식으로 테스트 이메일 전송
   - n8n 워크플로우 실행 확인

2. **Railway API 호출 확인:**
   - Railway 로그에서 예약 생성 요청 확인
   - PostgreSQL 데이터베이스에서 예약 데이터 확인

### 2단계: 관리자 페이지 테스트

1. **로그인:**
   - Vercel 로그인 페이지 접속
   - 관리자 계정으로 로그인

2. **예약 목록 확인:**
   - 예약 목록 페이지에서 n8n에서 받은 예약 확인

3. **방 배정:**
   - 예약 상세 페이지에서 방 배정
   - 전화번호 입력
   - 저장

4. **알림톡 발송 확인:**
   - n8n 워크플로우 실행 확인
   - 고객에게 알림톡 발송 확인

---

**문서 버전**: 1.0  
**최종 업데이트**: 2026-01-06
