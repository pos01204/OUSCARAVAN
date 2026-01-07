# n8n Code 노드 - Gmail Get 노드용 파싱 코드

## 📋 개요

Gmail Trigger → Gmail Get 노드 → Code 노드 구조에서 사용하는 파싱 코드입니다.

Gmail Get 노드는 `format: full`로 설정하여 전체 이메일 본문을 가져옵니다.

---

## ✅ 최종 코드 (전체 버전)

```javascript
// Gmail Get 노드에서 전달된 이메일 데이터
const emailData = $input.item.json;

// 전체 이메일 본문 가져오기
let emailBody = '';

// payload에서 전체 본문 추출
if (emailData.payload) {
  emailBody = extractBodyFromPayload(emailData.payload);
}

// payload가 없거나 본문 추출 실패 시 snippet 사용 (fallback)
if (!emailBody && emailData.snippet) {
  emailBody = emailData.snippet;
}

// HTML 태그 제거 및 공백 정리
const textBody = emailBody
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

// payload에서 본문 추출하는 함수
function extractBodyFromPayload(payload) {
  let body = '';
  
  // 직접 body가 있는 경우 (text/plain)
  if (payload.body && payload.body.data) {
    try {
      body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    } catch (e) {
      console.log('Failed to decode body.data:', e);
    }
  }
  
  // parts가 있는 경우 (multipart 이메일)
  if (payload.parts) {
    for (const part of payload.parts) {
      // text/plain 부분 찾기 (우선)
      if (part.mimeType === 'text/plain' && part.body && part.body.data) {
        try {
          const decoded = Buffer.from(part.body.data, 'base64').toString('utf-8');
          body += decoded + '\n';
        } catch (e) {
          console.log('Failed to decode text/plain part:', e);
        }
      }
      // text/html 부분도 사용 (HTML 태그 제거 후)
      else if (part.mimeType === 'text/html' && part.body && part.body.data) {
        try {
          const htmlBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
          // HTML 태그 제거
          const textFromHtml = htmlBody.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
          body += textFromHtml + '\n';
        } catch (e) {
          console.log('Failed to decode text/html part:', e);
        }
      }
      // 중첩된 parts 처리 (multipart/alternative 내부)
      else if (part.parts) {
        body += extractBodyFromPayload(part);
      }
    }
  }
  
  return body;
}

// 예약 번호 추출 (예: "예약번호 1124870293")
const reservationNumberMatch = textBody.match(/예약번호[:\s]*(\d+)/i);
const reservationNumber = reservationNumberMatch ? reservationNumberMatch[1] : '';

// 예약자명 추출 (예: "예약자명 장*령님")
const guestNameMatch = textBody.match(/예약자명[:\s]*([^\n\r]+?)(?:\s*예약신청|$)/i);
const guestName = guestNameMatch ? guestNameMatch[1].trim().replace(/\s+/g, ' ') : '';

// 이메일 주소 추출
const emailMatch = textBody.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
let email = emailMatch ? emailMatch[1] : '';

// Gmail Get 노드의 payload에서 이메일 주소 가져오기 시도
if (!email && emailData.payload) {
  const headers = emailData.payload.headers || [];
  const toHeader = headers.find((h) => h.name === 'To');
  if (toHeader && toHeader.value) {
    const toMatch = toHeader.value.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
    if (toMatch) {
      email = toMatch[1];
    }
  }
}

// 체크인 날짜 추출 (예: "이용일시 2026.01.26.(월)")
const checkinMatch = textBody.match(/이용일시[:\s]*(\d{4})\.(\d{2})\.(\d{2})\./i);
let checkin = '';
if (checkinMatch) {
  checkin = `${checkinMatch[1]}-${checkinMatch[2]}-${checkinMatch[3]}`;
}

// 체크아웃 날짜 추출 (예: "~2026.01.27.(화)")
const checkoutMatch = textBody.match(/~(\d{4})\.(\d{2})\.(\d{2})\./i);
let checkout = '';
if (checkoutMatch) {
  checkout = `${checkoutMatch[1]}-${checkoutMatch[2]}-${checkoutMatch[3]}`;
}

// 객실 타입 추출 (예: "예약상품 2인실(2인기준) 오션뷰카라반 예약")
const roomTypeMatch = textBody.match(/예약상품[:\s]*([^\n\r]+?)(?:\s*이용일시|$)/i);
const roomType = roomTypeMatch ? roomTypeMatch[1].trim() : '';

// 결제 금액 추출 (개선된 방법)
// 이메일 본문 예시: "결제금액	2인실(2인기준) 오션뷰카라반 예약(1) 150,000원 + [알림,저장이벤트] 오로라2개(1) 0원 = 150,000원"
let amount = 0;

// 방법 1: "=" 다음의 총액 추출 (가장 정확)
// 패턴: "= 150,000원" 또는 "=150,000원"
const totalMatch = textBody.match(/=\s*(\d{1,3}(?:,\d{3})*)\s*원/i);
if (totalMatch) {
  amount = parseInt(totalMatch[1].replace(/,/g, '')) || 0;
  console.log('Amount extracted from total (method 1):', amount);
}

// 방법 2: "결제금액" 섹션에서 마지막 숫자 추출
if (amount === 0) {
  const amountSection = textBody.match(/결제금액[:\s\t]*([^\n\r]+?)(?:\s*요청사항|$)/i);
  if (amountSection) {
    // 모든 금액 패턴 찾기 (예: "150,000원", "0원")
    const numbers = amountSection[1].match(/(\d{1,3}(?:,\d{3})*)\s*원/g);
    if (numbers && numbers.length > 0) {
      // 마지막 숫자 (총액) 사용
      const lastAmount = numbers[numbers.length - 1];
      const amountValue = lastAmount.match(/(\d{1,3}(?:,\d{3})*)/);
      if (amountValue) {
        amount = parseInt(amountValue[1].replace(/,/g, '')) || 0;
        console.log('Amount extracted from payment section (method 2):', amount);
      }
    }
  }
}

// 방법 3: 모든 금액 패턴 찾기 (가장 큰 값 사용 - fallback)
if (amount === 0) {
  const allAmounts = textBody.match(/(\d{1,3}(?:,\d{3})*)\s*원/g);
  if (allAmounts) {
    const amounts = allAmounts.map(m => {
      const num = m.match(/(\d{1,3}(?:,\d{3})*)/);
      return num ? parseInt(num[1].replace(/,/g, '')) : 0;
    });
    // 0원이 아닌 값 중 가장 큰 값 사용
    const nonZeroAmounts = amounts.filter(a => a > 0);
    if (nonZeroAmounts.length > 0) {
      amount = Math.max(...nonZeroAmounts);
      console.log('Amount extracted from all amounts (method 3):', amount);
    }
  }
}

// 디버깅을 위한 로그
console.log('=== Parsed Reservation Data ===');
console.log('Reservation Number:', reservationNumber);
console.log('Guest Name:', guestName);
console.log('Email:', email || '(not found, will use default)');
console.log('Check-in:', checkin);
console.log('Check-out:', checkout);
console.log('Room Type:', roomType);
console.log('Amount:', amount || 0);
console.log('Email Body Length:', textBody.length);
console.log('Has Payload:', !!emailData.payload);
console.log('Has Snippet:', !!emailData.snippet);
console.log('==============================');

// Railway API로 전송할 데이터
return {
  reservationNumber,
  guestName,
  email: email || '',
  checkin,
  checkout,
  roomType,
  amount: amount || 0
};
```

---

## 🔧 주요 특징

### 1. Gmail Get 노드 출력 구조 지원

Gmail Get 노드에서 `format: full`로 설정하면 `payload`에 전체 이메일 본문이 포함됩니다.

```javascript
// payload 구조 확인
if (emailData.payload) {
  emailBody = extractBodyFromPayload(emailData.payload);
}
```

### 2. 결제 금액 추출 로직 (3단계 Fallback)

#### 방법 1: `=` 다음의 총액 (우선)
```javascript
// 패턴: "= 150,000원" 또는 "=150,000원"
const totalMatch = textBody.match(/=\s*(\d{1,3}(?:,\d{3})*)\s*원/i);
```

#### 방법 2: 결제금액 섹션의 마지막 숫자
```javascript
// "결제금액 ... 150,000원 ... 0원 = 150,000원"
// 마지막 숫자 (총액) 추출
```

#### 방법 3: 모든 금액 중 최대값 (Fallback)
```javascript
// 0원이 아닌 값 중 가장 큰 값 사용
```

### 3. payload 본문 추출 함수

```javascript
function extractBodyFromPayload(payload) {
  // 1. 직접 body가 있는 경우
  if (payload.body && payload.body.data) {
    body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
  }
  
  // 2. parts 배열 처리 (multipart/alternative)
  if (payload.parts) {
    for (const part of payload.parts) {
      // text/plain 우선
      if (part.mimeType === 'text/plain' && part.body && part.body.data) {
        body += Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
      // text/html도 사용 (태그 제거 후)
      else if (part.mimeType === 'text/html' && part.body && part.body.data) {
        const htmlBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
        body += htmlBody.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      }
      // 중첩된 parts 처리
      else if (part.parts) {
        body += extractBodyFromPayload(part);
      }
    }
  }
  
  return body;
}
```

---

## 📋 적용 방법

### 1단계: Gmail Get 노드 설정

1. **Gmail Trigger** 다음에 **Gmail** 노드 추가
2. **Operation**: `Get` 선택
3. **Message ID**: `{{ $json.id }}` (Gmail Trigger에서 전달된 이메일 ID)
4. **Format**: `full` 선택 (중요!)
5. **Simple**: `No` 선택

### 2단계: Code 노드 설정

1. **Code** 노드 추가
2. **Mode**: `Run Once for All Items` 선택
3. 위의 **최종 코드** 복사하여 붙여넣기
4. **Save** 클릭

### 3단계: 테스트

1. **Execute Workflow** 클릭
2. Code 노드 출력 확인:
   - `amount` 필드에 올바른 금액이 표시되는지 확인
   - `emailBodyLength`로 전체 본문이 가져와졌는지 확인

---

## 🎯 결제 금액 추출 예시

### 입력 이메일 본문:
```
결제금액	2인실(2인기준) 오션뷰카라반 예약(1) 150,000원 + [알림,저장이벤트] 오로라2개(1) 0원 = 150,000원
```

### 추출 과정:

1. **방법 1**: `=\s*(\d{1,3}(?:,\d{3})*)\s*원`
   - 매치: `= 150,000원`
   - 결과: `150000` ✅

2. **방법 2** (방법 1 실패 시):
   - 결제금액 섹션: `2인실(2인기준) 오션뷰카라반 예약(1) 150,000원 + [알림,저장이벤트] 오로라2개(1) 0원 = 150,000원`
   - 모든 금액: `["150,000원", "0원", "150,000원"]`
   - 마지막 숫자: `150,000원` → `150000` ✅

3. **방법 3** (방법 2 실패 시):
   - 모든 금액: `[150000, 0, 150000]`
   - 0원 제외: `[150000, 150000]`
   - 최대값: `150000` ✅

---

## 🔍 디버깅

### 로그 확인 항목:

```javascript
console.log('=== Parsed Reservation Data ===');
console.log('Reservation Number:', reservationNumber);
console.log('Guest Name:', guestName);
console.log('Email:', email || '(not found, will use default)');
console.log('Check-in:', checkin);
console.log('Check-out:', checkout);
console.log('Room Type:', roomType);
console.log('Amount:', amount || 0);
console.log('Email Body Length:', textBody.length);
console.log('Has Payload:', !!emailData.payload);
console.log('Has Snippet:', !!emailData.snippet);
```

### 예상 출력:

```json
{
  "reservationNumber": "1124870293",
  "guestName": "장*령님",
  "email": "",
  "checkin": "2026-01-26",
  "checkout": "2026-01-27",
  "roomType": "2인실(2인기준) 오션뷰카라반 예약",
  "amount": 150000
}
```

---

## ⚠️ 주의사항

### 1. Gmail Get 노드 Format 설정

- **반드시 `full`로 설정**: `format: full`을 선택해야 `payload`에 전체 본문이 포함됩니다.
- `metadata` 또는 `minimal`로 설정하면 본문이 없을 수 있습니다.

### 2. Buffer 사용

- n8n Code 노드에서 `Buffer`는 Node.js 내장 객체이므로 바로 사용 가능합니다.
- Base64 디코딩에 필요합니다.

### 3. payload 구조

- Gmail 이메일은 `multipart/alternative` 형식일 수 있습니다.
- `text/plain`과 `text/html` 둘 다 확인합니다.
- 중첩된 `parts` 배열도 재귀적으로 처리합니다.

### 4. 결제 금액 추출

- **우선순위**: `=` 다음의 총액 → 결제금액 섹션의 마지막 숫자 → 모든 금액 중 최대값
- **0원 제외**: 방법 3에서는 0원을 제외하고 최대값을 찾습니다.

---

## 📚 참고

- [Gmail API 메시지 형식](https://developers.google.com/gmail/api/reference/rest/v1/users.messages)
- [n8n Gmail 노드 문서](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.gmail/)
- [n8n Code 노드 문서](https://docs.n8n.io/code-examples/methods-variables-examples/)
