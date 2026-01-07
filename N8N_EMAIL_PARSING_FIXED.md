# n8n 이메일 파싱 코드 수정 (Gmail Trigger)

## 🔍 문제 분석

**이미지에서 확인된 사항:**
- Gmail Trigger에서 이메일 본문이 `snippet` 필드에 있음
- 코드에서 `$input.item.json.body`를 사용하고 있지만 실제로는 `snippet`을 사용해야 함
- 코드에 오타: `onst` → `const`
- 날짜 형식: `2026.01.05.(일)` 형식 (점과 요일 포함)

---

## ✅ 수정된 코드

### Code 노드 (이메일 파싱)

**Mode:** `Run Once for All Items`

**Code:**
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
  const toHeader = headers.find((h: any) => h.name === 'To');
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

// 결제 금액 추출 (개선된 방법)
// 이메일 본문 예시: "결제금액 2인실(2인기준) 오션뷰카라반 예약(1) 150,000원 + [알림, 저장이벤트] 오로라2개(1) 0원 = 150,000원"
let amount = 0;

// 방법 1: "=" 다음의 총액 추출 (가장 정확)
const totalMatch = emailBody.match(/=\s*(\d{1,3}(?:,\d{3})*)\s*원/i);
if (totalMatch) {
  amount = parseInt(totalMatch[1].replace(/,/g, '')) || 0;
}

// 방법 2: "결제금액" 섹션에서 마지막 숫자 추출
if (amount === 0) {
  const amountSection = emailBody.match(/결제금액[:\s]*([^\n\r]+?)(?:\s*요청사항|$)/i);
  if (amountSection) {
    const numbers = amountSection[1].match(/(\d{1,3}(?:,\d{3})*)/g);
    if (numbers && numbers.length > 0) {
      // 마지막 숫자 (총액) 사용
      const lastAmount = numbers[numbers.length - 1];
      amount = parseInt(lastAmount.replace(/,/g, '')) || 0;
    }
  }
}

// 방법 3: 모든 금액 패턴 찾기 (가장 큰 값 사용 - fallback)
if (amount === 0) {
  const allAmounts = emailBody.match(/(\d{1,3}(?:,\d{3})*)\s*원/g);
  if (allAmounts) {
    const amounts = allAmounts.map(m => {
      const num = m.match(/(\d{1,3}(?:,\d{3})*)/);
      return num ? parseInt(num[1].replace(/,/g, '')) : 0;
    });
    amount = Math.max(...amounts);
  }
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

## 🔧 주요 수정 사항

### 1. 이메일 본문 접근 수정
```javascript
// 이전 (잘못된 코드)
const emailBody = $input.item.json.body;

// 수정 (올바른 코드)
const emailBody = $input.item.json.snippet || $input.item.json.body || '';
```

### 2. 오타 수정
```javascript
// 이전 (오타)
onst emailBody = ...

// 수정
const emailBody = ...
```

### 3. 날짜 형식 처리 개선
```javascript
// 이전 (YYYY-MM-DD 형식만 지원)
const checkinMatch = emailBody.match(/체크인[:\s]*(\d{4}-\d{2}-\d{2})/i);

// 수정 (YYYY.MM.DD.(요일) 형식 지원)
const checkinMatch = emailBody.match(/이용일시[:\s]*(\d{4})\.(\d{2})\.(\d{2})\./i);
if (checkinMatch) {
  checkin = `${checkinMatch[1]}-${checkinMatch[2]}-${checkinMatch[3]}`;
}
```

### 4. 예약자명 추출 개선
```javascript
// 이전
const guestNameMatch = emailBody.match(/예약자[:\s]*([^\n\r]+)/i);

// 수정 (더 정확한 추출)
const guestNameMatch = emailBody.match(/예약자명[:\s]*([^\n\r]+?)(?:\s*예약신청|$)/i);
const guestName = guestNameMatch ? guestNameMatch[1].trim().replace(/\s+/g, ' ') : '';
```

### 5. 이메일 주소 추출 개선
```javascript
// Gmail Trigger의 payload에서 이메일 주소 가져오기
if (!email && $input.item.json.payload) {
  const headers = $input.item.json.payload.headers || [];
  const toHeader = headers.find((h: any) => h.name === 'To');
  if (toHeader && toHeader.value) {
    const toMatch = toHeader.value.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
    if (toMatch) {
      email = toMatch[1];
    }
  }
}
```

---

## 📋 n8n 워크플로우 설정 단계

### 1단계: Code 노드 수정

1. **n8n 워크플로우** → **Code 노드** 클릭
2. **Mode:** `Run Once for All Items` 선택
3. 위의 수정된 코드를 복사하여 붙여넣기
4. **"Save"** 클릭

### 2단계: 테스트 실행

1. **"Execute Workflow"** 클릭
2. **"Test step"** 클릭
3. 출력 결과 확인:
   - `reservationNumber`: "1122689451"
   - `guestName`: "이종님" (또는 실제 예약자명)
   - `email`: 이메일 주소
   - `checkin`: "2026-01-05"
   - `checkout`: "2026-01-06"
   - `roomType`: "4인실(기준2인, 1인추가2만원) 오션뷰카라반 예약"
   - `amount`: 숫자 (금액)

### 3단계: HTTP Request 노드 확인

**HTTP Request 노드 설정:**
- **Method:** `POST`
- **URL:** `https://ouscaravan-production.up.railway.app/api/admin/reservations`
- **Headers:**
  - **Name:** `X-API-Key`
  - **Value:** `{{ $env.N8N_API_KEY }}` (또는 직접 입력)
  - **Name:** `Content-Type`
  - **Value:** `application/json`
- **Body:**
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

---

## 🐛 문제 해결

### 문제 1: "Unexpected identifier 'emailBody'"

**원인:** `onst` 오타

**해결:** `const`로 수정

---

### 문제 2: 이메일 본문이 비어있음

**원인:** `$input.item.json.body`가 존재하지 않음

**해결:** `$input.item.json.snippet` 사용

---

### 문제 3: 날짜 추출 실패

**원인:** 날짜 형식이 `2026.01.05.(일)` 형식

**해결:** 정규식을 `이용일시[:\s]*(\d{4})\.(\d{2})\.(\d{2})\.`로 수정

---

### 문제 4: 예약자명 추출 실패

**원인:** 정규식이 너무 넓게 매칭

**해결:** `예약자명[:\s]*([^\n\r]+?)(?:\s*예약신청|$)`로 수정

---

## 📋 체크리스트

### Code 노드 수정:

- [ ] `onst` → `const` 오타 수정
- [ ] `$input.item.json.body` → `$input.item.json.snippet` 수정
- [ ] 날짜 추출 정규식 수정 (YYYY.MM.DD.(요일) 형식 지원)
- [ ] 예약자명 추출 정규식 개선
- [ ] 이메일 주소 추출 개선 (payload에서 가져오기)
- [ ] 코드 저장

### 테스트:

- [ ] 워크플로우 테스트 실행
- [ ] 출력 결과 확인
- [ ] 모든 필드가 올바르게 추출되는지 확인

### HTTP Request 노드 확인:

- [ ] Railway API URL 확인
- [ ] API Key 헤더 설정 확인
- [ ] Body 매핑 확인

---

**문서 버전**: 1.0  
**최종 업데이트**: 2026-01-06
