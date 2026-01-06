# n8n 환경 변수 없이 API Key 사용하기

## 🔍 문제

**n8n 환경 변수는 Enterprise 플랜에서만 사용 가능합니다.**

**해결 방법:**
- n8n 환경 변수 대신 다른 방법 사용
- HTTP Request 노드에서 직접 API Key 입력
- 또는 Set 노드에서 API Key 설정

---

## ✅ 해결 방법

### 방법 1: HTTP Request 노드에서 직접 API Key 입력 (권장)

**HTTP Request 노드 설정:**

1. **"HTTP Request"** 노드 클릭
2. **Method:** `POST`
3. **URL:** `https://ouscaravan-production.up.railway.app/api/admin/reservations`
4. **Headers:**
   - **Name:** `X-API-Key`
   - **Value:** Railway에서 생성한 API Key 직접 입력
     - 예: `your-railway-api-key-here`
   - **Name:** `Content-Type`
   - **Value:** `application/json`
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

**주의사항:**
- API Key를 직접 입력하면 워크플로우에 노출됨
- 워크플로우를 공유할 때 주의 필요
- 보안을 위해 n8n Credentials 사용 권장 (방법 2)

---

### 방법 2: n8n Credentials 사용 (더 안전)

**n8n Credentials 설정:**

1. **n8n 대시보드** → **"Credentials"** 메뉴 클릭
2. **"Add Credential"** 클릭
3. **"Header Auth"** 또는 **"Generic Credential Type"** 선택
4. **Credential 설정:**
   - **Name:** `Railway API Key`
   - **Header Name:** `X-API-Key`
   - **Header Value:** Railway에서 생성한 API Key 입력
5. **"Save"** 클릭

**HTTP Request 노드에서 사용:**

1. **"HTTP Request"** 노드 클릭
2. **Authentication:** `Header Auth` 또는 생성한 Credential 선택
3. **Headers:**
   - Credential에서 자동으로 `X-API-Key` 헤더 추가됨
4. 나머지 설정은 방법 1과 동일

---

### 방법 3: Set 노드에서 API Key 설정

**워크플로우 구조:**
```
Gmail Trigger → Code (이메일 파싱) → Set (API Key 추가) → HTTP Request
```

**Set 노드 설정:**

1. **"Set"** 노드 추가 (Code 노드 다음)
2. **Values:**
```json
{
  "reservationNumber": "{{ $json.reservationNumber }}",
  "guestName": "{{ $json.guestName }}",
  "email": "{{ $json.email }}",
  "checkin": "{{ $json.checkin }}",
  "checkout": "{{ $json.checkout }}",
  "roomType": "{{ $json.roomType }}",
  "amount": {{ $json.amount }},
  "apiKey": "your-railway-api-key-here"
}
```

**HTTP Request 노드 설정:**

1. **Headers:**
   - **Name:** `X-API-Key`
   - **Value:** `{{ $json.apiKey }}`

---

## 📋 Railway API Key 생성 방법

**Railway 대시보드 → OUSCARAVAN 서비스 → Variables:**

1. **"Add Variable"** 클릭
2. **Name:** `N8N_API_KEY`
3. **Value:** 강력한 랜덤 문자열 생성

**PowerShell에서 생성:**
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))
```

**또는 온라인 생성기 사용:**
- https://www.random.org/strings/
- 길이: 32자 이상
- 문자 유형: 영문 대소문자, 숫자

---

## 🔧 수정된 n8n Code 노드 (email, amount 선택적)

**Mode:** `Run Once for All Items`

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

// 이메일 주소 추출 (선택적 - 없어도 됨)
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

---

## 📋 체크리스트

### Railway API 수정:

- [ ] Railway 코드 수정 (email, amount 선택적 필드로 변경)
- [ ] Railway 코드 배포

### n8n 워크플로우 설정:

- [ ] Code 노드 수정 (email, amount 선택적 처리)
- [ ] HTTP Request 노드에서 API Key 설정
  - [ ] 방법 1: 직접 입력
  - [ ] 방법 2: n8n Credentials 사용 (권장)
  - [ ] 방법 3: Set 노드 사용
- [ ] 워크플로우 테스트

---

**문서 버전**: 1.0  
**최종 업데이트**: 2026-01-06
