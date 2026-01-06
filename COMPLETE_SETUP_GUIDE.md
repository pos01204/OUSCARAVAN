# 완전한 설정 가이드: Railway + n8n 연동

## 🎯 목표

1. Railway 서버 안정화 (종료 문제 해결)
2. n8n 워크플로우 설정 (네이버 예약 확정 이메일 처리)
3. n8n ↔ Railway API 연동
4. 전체 데이터 흐름 완성

---

## 📋 Part 1: Railway 서버 안정화

### 문제: Railway 서버가 시작 후 종료됨

**해결 방법:**

#### 방법 1: Railway 헬스체크 비활성화 (권장)

**Railway 대시보드 → OUSCARAVAN 서비스 → Settings:**

1. **"Health Check"** 섹션 찾기
2. **"Disable Health Check"** 또는 **"Health Check Path"**를 비워두기
3. **"Save"** 클릭

**또는:**

1. **"Networking"** 섹션 찾기
2. **"Health Check"** 설정 찾기
3. 비활성화

#### 방법 2: Railway 헬스체크 설정 조정

**Railway 대시보드 → OUSCARAVAN 서비스 → Settings:**

1. **Health Check Path:** `/` 또는 `/health`
2. **Health Check Port:** `8080` (또는 Railway가 할당한 포트)
3. **Health Check Timeout:** `30` (초) 이상
4. **"Save"** 클릭

---

## 📋 Part 2: Railway API Key 설정 (n8n 연동용)

### Railway 환경 변수 추가

**Railway 대시보드 → OUSCARAVAN 서비스 → Variables:**

1. **"Add Variable"** 클릭
2. **Name:** `N8N_API_KEY`
3. **Value:** 강력한 랜덤 문자열 생성 (예: `openssl rand -base64 32`)
4. **"Save"** 클릭

**API Key 생성 방법:**
```bash
# PowerShell에서
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))

# 또는 온라인 생성기 사용
```

---

## 📋 Part 3: n8n 워크플로우 설정

### 워크플로우 1: 네이버 예약 확정 이메일 처리

#### 1단계: n8n 워크플로우 생성

1. **n8n 대시보드** → **"Add workflow"** 클릭
2. 워크플로우 이름: `네이버 예약 확정 처리`

#### 2단계: Gmail Trigger 노드 추가

1. **"Gmail"** 노드 추가
2. **Trigger:** `Message Received`
3. **Settings:**
   - **From:** `naver.com` (또는 네이버 예약 이메일 주소)
   - **Subject Contains:** `[네이버 예약]` 또는 `확정`
   - **Poll Times:** `Every 5 minutes`

#### 3단계: Code 노드 추가 (이메일 파싱)

1. **"Code"** 노드 추가
2. **Mode:** `Run Once for All Items`
3. **Code:**
```javascript
// Gmail Trigger에서 이메일 데이터 가져오기
// snippet 필드에 전체 이메일 본문이 있음
const emailBody = $input.item.json.snippet || $input.item.json.body || '';
const subject = $input.item.json.subject || '';

// 예약 번호 추출 (예: "예약번호 1122689451")
const reservationNumberMatch = emailBody.match(/예약번호[:\s]*(\d+)/i);
const reservationNumber = reservationNumberMatch ? reservationNumberMatch[1] : '';

// 예약자명 추출 (예: "예약자명 이종님")
// "예약자명" 다음에 오는 이름 추출
const guestNameMatch = emailBody.match(/예약자명[:\s]*([^\n\r]+?)(?:\s*예약신청|$)/i);
const guestName = guestNameMatch ? guestNameMatch[1].trim().replace(/\s+/g, ' ') : '';

// 이메일 주소 추출 (Gmail Trigger에서 직접 가져올 수도 있음)
// 이메일 본문에서 이메일 주소 찾기
const emailMatch = emailBody.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
let email = emailMatch ? emailMatch[1] : '';

// Gmail Trigger의 payload에서 이메일 주소 가져오기 시도
if (!email && $input.item.json.payload) {
  const headers = $input.item.json.payload.headers || [];
  const toHeader = headers.find((h) => h.name === 'To');
  if (toHeader && toHeader.value) {
    const toMatch = toHeader.value.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
    if (toMatch) {
      email = toMatch[1];
    }
  }
}

// 체크인 날짜 추출 (예: "2026.01.05.(일)")
// 형식: YYYY.MM.DD.(요일)
const checkinMatch = emailBody.match(/이용일시[:\s]*(\d{4})\.(\d{2})\.(\d{2})\./i);
let checkin = '';
if (checkinMatch) {
  // YYYY-MM-DD 형식으로 변환
  checkin = `${checkinMatch[1]}-${checkinMatch[2]}-${checkinMatch[3]}`;
}

// 체크아웃 날짜 추출 (예: "2026.01.06.(화)")
// 형식: YYYY.MM.DD.(요일)
const checkoutMatch = emailBody.match(/~(\d{4})\.(\d{2})\.(\d{2})\./i);
let checkout = '';
if (checkoutMatch) {
  // YYYY-MM-DD 형식으로 변환
  checkout = `${checkoutMatch[1]}-${checkoutMatch[2]}-${checkoutMatch[3]}`;
}

// 객실 타입 추출 (예: "4인실(기준2인, 1인추가2만원) 오션뷰카라반 예약")
const roomTypeMatch = emailBody.match(/예약상품[:\s]*([^\n\r]+?)(?:\s*이용일시|$)/i);
const roomType = roomTypeMatch ? roomTypeMatch[1].trim() : '';

// 금액 추출 (선택적 - 없어도 됨, 기본값 0 사용)
// "결제" 또는 "금액" 키워드 주변에서 금액 찾기
const amountMatch = emailBody.match(/(?:금액|결제금액|총액|결제상태)[:\s]*([0-9,]+)/i);
let amount = 0;
if (amountMatch) {
  amount = parseInt(amountMatch[1].replace(/,/g, '')) || 0;
}

// 디버깅을 위한 로그 (n8n 실행 로그에서 확인 가능)
console.log('Parsed reservation data:', {
  reservationNumber,
  guestName,
  email: email || '(not found, will use default)',
  checkin,
  checkout,
  roomType,
  amount: amount || 0
});

// Railway API로 전송할 데이터
// email과 amount는 선택적 필드 (없어도 Railway API가 기본값 사용)
return {
  reservationNumber,
  guestName,
  email: email || '', // 없으면 빈 문자열 (Railway API가 기본값 사용)
  checkin,
  checkout,
  roomType,
  amount: amount || 0 // 없으면 0 (Railway API가 기본값 사용)
};
```

#### 4단계: HTTP Request 노드 추가 (Railway API 호출)

**⚠️ 중요: n8n 환경 변수는 Enterprise 플랜에서만 사용 가능합니다.**

**방법 1: HTTP Request 노드에서 직접 API Key 입력 (권장)**

**⚠️ 중요 사항:**
1. **Authentication을 `None`으로 설정** (Header Auth Credential 사용 시 에러 발생)
2. **Expression 모드 비활성화** (fx 아이콘 클릭)

**단계별 설정:**

1. **"HTTP Request"** 노드 추가
2. **Method:** `POST` 선택
3. **URL:** `https://ouscaravan-production.up.railway.app/api/admin/reservations`
4. **Authentication:** `None` 선택
   - ⚠️ **중요:** "Header Auth" 또는 "Generic Credential Type"을 사용하지 마세요
   - Header Auth Credential의 Header Name이 공백을 포함하면 에러 발생
5. **Send Headers:** `ON` (활성화)
6. **Specify Headers:** `Using Fields Below` 선택
7. **Header Parameters:**
   - **첫 번째 헤더:**
     - **Name:** `X-API-Key` (공백 없음, 하이픈 사용)
     - **Value:** Railway API Key 직접 입력
       - **중요:** Value 필드 옆의 Expression 아이콘(`fx`)이 있으면 클릭하여 비활성화
       - Expression 모드가 활성화되어 있으면 API Key가 문자열로 해석되지 않음
       - Railway 대시보드 → OUSCARAVAN 서비스 → Variables → `N8N_API_KEY` 값 복사
       - 일반 텍스트 모드로 직접 붙여넣기
   - **"Add Parameter"** 클릭
   - **두 번째 헤더:**
     - **Name:** `Content-Type`
     - **Value:** `application/json`
8. **Send Body:** `ON` (활성화)
9. **Body Content Type:** `JSON` 선택
10. **Specify Body:** `Using Fields Below` 선택
11. **Body:**
```json
{
  "reservationNumber": "{{ $json.reservationNumber }}",
  "guestName": "{{ $json.guestName }}",
  "email": "{{ $json.email || '' }}",
  "checkin": "{{ $json.checkin }}",
  "checkout": "{{ $json.checkout }}",
  "roomType": "{{ $json.roomType }}",
  "amount": {{ $json.amount || 0 }}
}
```

**참고:**
- `email`이 없으면 Railway API가 기본값 `reservation-{예약번호}@ouscaravan.local` 사용
- `amount`가 없으면 Railway API가 기본값 `0` 사용

#### 5단계: 워크플로우 활성화

1. 우측 상단 **"Active"** 토글 활성화
2. **"Save"** 클릭

---

### 워크플로우 2: 예약 배정 알림톡 발송

#### 1단계: n8n 워크플로우 생성

1. **n8n 대시보드** → **"Add workflow"** 클릭
2. 워크플로우 이름: `예약 배정 알림톡 발송`

#### 2단계: Webhook Trigger 노드 추가

1. **"Webhook"** 노드 추가
2. **HTTP Method:** `POST`
3. **Path:** `reservation-assigned`
4. **Response Mode:** `Respond to Webhook`
5. **Webhook URL 복사** (예: `https://your-n8n-instance.com/webhook/reservation-assigned`)

#### 3단계: SolAPI 노드 추가 (알림톡 발송)

1. **"HTTP Request"** 노드 추가 (SolAPI API 호출)
2. **Method:** `POST`
3. **URL:** `https://api.solapi.com/messages/v4/send`
4. **Headers:**
   - **Authorization:** `HMAC-SHA256 {API_KEY}:{SECRET_KEY}`
   - **Content-Type:** `application/json`
5. **Body:**
```json
{
  "message": {
    "to": "{{ $json.body.phone }}",
    "from": "01012345678",
    "text": "{{ $json.body.guestName }}님, 예약이 확정되었습니다.\n객실: {{ $json.body.assignedRoom }}\n체크인: {{ $json.body.checkin }}\n체크아웃: {{ $json.body.checkout }}\n예약 확인: https://ouscaravan.vercel.app/guest/{{ $json.body.uniqueToken }}"
  }
}
```

#### 4단계: 워크플로우 활성화

1. 우측 상단 **"Active"** 토글 활성화
2. **"Save"** 클릭
3. **Webhook URL 복사** → Vercel 환경 변수에 추가

---

## 📋 Part 4: Vercel 환경 변수 설정

**Vercel 대시보드 → 프로젝트 → Settings → Environment Variables:**

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://ouscaravan-production.up.railway.app` | Production, Preview, Development |
| `NEXT_PUBLIC_N8N_WEBHOOK_URL` | `https://your-n8n-instance.com/webhook` | Production, Preview, Development |

**설정 후 재배포:**
1. Vercel 대시보드 → Deployments
2. 최신 배포의 **"..."** 메뉴 클릭
3. **"Redeploy"** 선택

---

## 📋 Part 5: Railway 코드 업데이트

### API Key 인증 추가

**파일:** `railway-backend/src/routes/admin.routes.ts`

**변경 사항:**
- n8n에서 API Key로 인증할 수 있도록 수정
- JWT 토큰 인증과 API Key 인증 모두 지원

**배포:**
```powershell
cd "C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화"
git add railway-backend/src/routes/admin.routes.ts
git commit -m "Add API Key authentication for n8n integration"
git push origin main
```

---

## 📋 체크리스트

### Railway 설정:

- [ ] Railway 헬스체크 비활성화 또는 설정 조정
- [ ] Railway 환경 변수 `N8N_API_KEY` 추가
- [ ] Railway 코드 업데이트 및 배포
- [ ] Railway 로그 확인 (서버가 계속 실행 중인지)

### n8n 설정:

- [ ] n8n 계정 생성/확인
- [ ] 워크플로우 1 생성: 네이버 예약 확정 이메일 처리
  - [ ] Gmail Trigger 설정
  - [ ] 이메일 파싱 Code 노드 설정
  - [ ] Railway API 호출 HTTP Request 노드 설정
  - [ ] n8n 환경 변수 `N8N_API_KEY` 설정
  - [ ] 워크플로우 활성화
- [ ] 워크플로우 2 생성: 예약 배정 알림톡 발송
  - [ ] Webhook Trigger 설정
  - [ ] SolAPI 알림톡 발송 노드 설정
  - [ ] 워크플로우 활성화
  - [ ] Webhook URL 복사

### Vercel 설정:

- [ ] `NEXT_PUBLIC_API_URL` 설정
- [ ] `NEXT_PUBLIC_N8N_WEBHOOK_URL` 설정
- [ ] 재배포

---

## 🚀 테스트 방법

### 1단계: Railway 서버 안정화 확인

1. Railway 로그 확인
2. "Stopping Container" 메시지 없음 확인
3. Health check 테스트: `https://ouscaravan-production.up.railway.app/health`

### 2단계: n8n 워크플로우 테스트

1. 테스트 이메일 전송 (네이버 예약 확정 형식)
2. n8n 워크플로우 실행 확인
3. Railway 로그에서 예약 생성 요청 확인
4. PostgreSQL 데이터베이스에서 예약 데이터 확인

### 3단계: 관리자 페이지 테스트

1. 로그인
2. 예약 목록 확인 (n8n에서 받은 예약)
3. 방 배정 및 전화번호 입력
4. 알림톡 발송 확인

---

**문서 버전**: 1.0  
**최종 업데이트**: 2026-01-06
