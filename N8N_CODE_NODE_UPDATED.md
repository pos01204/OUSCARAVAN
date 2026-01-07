# n8n Code 노드 업데이트 가이드 (결제 금액 추출 개선)

## 🔍 현재 코드의 문제점

### 문제 1: snippet만 사용
- `snippet`은 Gmail이 자동 생성하는 요약본으로, 전체 본문이 아닙니다
- 결제 금액 등 상세 정보가 잘릴 수 있습니다

### 문제 2: 결제 금액 추출 로직 부족
- 현재 정규식: `(?:금액|결제금액|총액|결제상태)[:\s]*([0-9,]+)`
- 이 정규식은 첫 번째 숫자만 가져오지만, 실제 이메일에는 여러 금액이 있습니다
- 예시: `결제금액 2인실(2인기준) 오션뷰카라반 예약(1) 150,000원 + [알림, 저장이벤트] 오로라2개(1) 0원 = 150,000원`
- **목표**: 마지막 `= 150,000원` 부분의 총액을 추출해야 합니다

---

## ✅ 수정된 코드 (전체 버전)

```javascript
// Gmail Trigger에서 이메일 데이터 가져오기
const emailData = $input.item.json;

// 전체 이메일 본문 가져오기 (여러 경로 시도)
let emailBody = '';

// 방법 1: payload에서 전체 본문 추출 (가장 정확)
if (emailData.payload) {
  emailBody = extractBodyFromPayload(emailData.payload);
}

// 방법 2: snippet 사용 (fallback)
if (!emailBody && emailData.snippet) {
  emailBody = emailData.snippet;
}

// 방법 3: body 필드 사용 (fallback)
if (!emailBody && emailData.body) {
  emailBody = emailData.body;
}

// HTML 태그 제거 및 공백 정리
const textBody = emailBody
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

// payload에서 본문 추출하는 함수
function extractBodyFromPayload(payload) {
  let body = '';
  
  // 직접 body가 있는 경우
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
      // text/plain 부분 찾기
      if (part.mimeType === 'text/plain' && part.body && part.body.data) {
        try {
          const decoded = Buffer.from(part.body.data, 'base64').toString('utf-8');
          body += decoded + '\n';
        } catch (e) {
          console.log('Failed to decode part body:', e);
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
          console.log('Failed to decode HTML part:', e);
        }
      }
      // 중첩된 parts 처리
      else if (part.parts) {
        body += extractBodyFromPayload(part);
      }
    }
  }
  
  return body;
}

// 예약 번호 추출
const reservationNumberMatch = textBody.match(/예약번호[:\s]*(\d+)/i);
const reservationNumber = reservationNumberMatch ? reservationNumberMatch[1] : '';

// 예약자명 추출
const guestNameMatch = textBody.match(/예약자명[:\s]*([^\n\r]+?)(?:\s*예약신청|$)/i);
const guestName = guestNameMatch ? guestNameMatch[1].trim().replace(/\s+/g, ' ') : '';

// 이메일 주소 추출
const emailMatch = textBody.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
let email = emailMatch ? emailMatch[1] : '';

// Gmail Trigger의 payload에서 이메일 주소 가져오기 시도
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

// 체크인 날짜 추출
const checkinMatch = textBody.match(/이용일시[:\s]*(\d{4})\.(\d{2})\.(\d{2})\./i);
let checkin = '';
if (checkinMatch) {
  checkin = `${checkinMatch[1]}-${checkinMatch[2]}-${checkinMatch[3]}`;
}

// 체크아웃 날짜 추출
const checkoutMatch = textBody.match(/~(\d{4})\.(\d{2})\.(\d{2})\./i);
let checkout = '';
if (checkoutMatch) {
  checkout = `${checkoutMatch[1]}-${checkoutMatch[2]}-${checkoutMatch[3]}`;
}

// 객실 타입 추출
const roomTypeMatch = textBody.match(/예약상품[:\s]*([^\n\r]+?)(?:\s*이용일시|$)/i);
const roomType = roomTypeMatch ? roomTypeMatch[1].trim() : '';

// 결제 금액 추출 (개선된 방법)
// 이메일 본문 예시: "결제금액 2인실(2인기준) 오션뷰카라반 예약(1) 150,000원 + [알림, 저장이벤트] 오로라2개(1) 0원 = 150,000원"
let amount = 0;

// 방법 1: "=" 다음의 총액 추출 (가장 정확)
const totalMatch = textBody.match(/=\s*(\d{1,3}(?:,\d{3})*)\s*원/i);
if (totalMatch) {
  amount = parseInt(totalMatch[1].replace(/,/g, '')) || 0;
}

// 방법 2: "결제금액" 섹션에서 마지막 숫자 추출
if (amount === 0) {
  const amountSection = textBody.match(/결제금액[:\s]*([^\n\r]+?)(?:\s*요청사항|$)/i);
  if (amountSection) {
    // 모든 금액 패턴 찾기
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
  const allAmounts = textBody.match(/(\d{1,3}(?:,\d{3})*)\s*원/g);
  if (allAmounts) {
    const amounts = allAmounts.map(m => {
      const num = m.match(/(\d{1,3}(?:,\d{3})*)/);
      return num ? parseInt(num[1].replace(/,/g, '')) : 0;
    });
    amount = Math.max(...amounts);
  }
}

// 디버깅을 위한 로그
console.log('Parsed reservation data:', {
  reservationNumber,
  guestName,
  email: email || '(not found, will use default)',
  checkin,
  checkout,
  roomType,
  amount: amount || 0,
  emailBodyLength: textBody.length,
  hasPayload: !!emailData.payload,
  hasSnippet: !!emailData.snippet
});

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

## 🔧 주요 변경 사항

### 1. 전체 본문 가져오기 추가

**이전:**
```javascript
const emailBody = $input.item.json.snippet || $input.item.json.body || '';
```

**수정:**
```javascript
// payload에서 전체 본문 추출 (가장 정확)
if (emailData.payload) {
  emailBody = extractBodyFromPayload(emailData.payload);
}
// snippet 사용 (fallback)
if (!emailBody && emailData.snippet) {
  emailBody = emailData.snippet;
}
```

### 2. 결제 금액 추출 로직 개선

**이전:**
```javascript
const amountMatch = emailBody.match(/(?:금액|결제금액|총액|결제상태)[:\s]*([0-9,]+)/i);
let amount = 0;
if (amountMatch) {
  amount = parseInt(amountMatch[1].replace(/,/g, '')) || 0;
}
```

**수정:**
```javascript
// 방법 1: "=" 다음의 총액 추출 (가장 정확)
const totalMatch = textBody.match(/=\s*(\d{1,3}(?:,\d{3})*)\s*원/i);
if (totalMatch) {
  amount = parseInt(totalMatch[1].replace(/,/g, '')) || 0;
}

// 방법 2: "결제금액" 섹션에서 마지막 숫자 추출
if (amount === 0) {
  const amountSection = textBody.match(/결제금액[:\s]*([^\n\r]+?)(?:\s*요청사항|$)/i);
  if (amountSection) {
    const numbers = amountSection[1].match(/(\d{1,3}(?:,\d{3})*)/g);
    if (numbers && numbers.length > 0) {
      const lastAmount = numbers[numbers.length - 1];
      amount = parseInt(lastAmount.replace(/,/g, '')) || 0;
    }
  }
}
```

### 3. payload 본문 추출 함수 추가

```javascript
function extractBodyFromPayload(payload) {
  let body = '';
  
  // 직접 body가 있는 경우
  if (payload.body && payload.body.data) {
    body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
  }
  
  // parts가 있는 경우 (multipart 이메일)
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body && part.body.data) {
        body += Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
      // HTML도 사용 (태그 제거 후)
      else if (part.mimeType === 'text/html' && part.body && part.body.data) {
        const htmlBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
        body += htmlBody.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      }
    }
  }
  
  return body;
}
```

---

## 📋 적용 방법

### 1단계: Code 노드 열기
1. n8n 워크플로우에서 **Code 노드** 클릭
2. **Mode**: `Run Once for All Items` 확인

### 2단계: 코드 교체
1. 기존 코드 전체 선택 및 삭제
2. 위의 **수정된 코드 (전체 버전)** 복사하여 붙여넣기
3. **"Save"** 클릭

### 3단계: 테스트
1. **"Execute Workflow"** 클릭
2. 또는 Gmail Trigger에서 **"Fetch Test Event"** 클릭
3. Code 노드 출력 확인:
   - `amount` 필드에 올바른 금액이 표시되는지 확인
   - `emailBodyLength`로 전체 본문이 가져와졌는지 확인

---

## 🎯 결제 금액 추출 로직 설명

### 이메일 본문 예시:
```
결제금액 2인실(2인기준) 오션뷰카라반 예약(1) 150,000원 + [알림, 저장이벤트] 오로라2개(1) 0원 = 150,000원
```

### 추출 방법:

1. **방법 1 (우선)**: `=\s*(\d{1,3}(?:,\d{3})*)\s*원`
   - `= 150,000원` 부분에서 총액 추출
   - 가장 정확한 방법

2. **방법 2 (대체)**: 결제금액 섹션에서 마지막 숫자
   - `결제금액 ... 150,000원 ... 0원 = 150,000원`
   - 마지막 숫자(`150,000`) 추출

3. **방법 3 (Fallback)**: 모든 금액 중 최대값
   - 모든 금액 패턴을 찾아 가장 큰 값 사용

---

## 🔍 디버깅

### 로그 확인 항목:
- `emailBodyLength`: 전체 본문 길이 (snippet보다 길어야 함)
- `hasPayload`: payload 존재 여부
- `hasSnippet`: snippet 존재 여부
- `amount`: 추출된 금액

### 예상 출력:
```json
{
  "reservationNumber": "1124870293",
  "guestName": "장*령님",
  "email": "",
  "checkin": "2026-01-26",
  "checkout": "2026-01-27",
  "roomType": "2인실(2인기준) 오션뷰카라반 예약",
  "amount": 150000,
  "emailBodyLength": 500,
  "hasPayload": true,
  "hasSnippet": true
}
```

---

## ⚠️ 주의사항

### 1. Buffer 사용
- n8n Code 노드에서 `Buffer`는 Node.js 내장 객체이므로 바로 사용 가능합니다
- Base64 디코딩에 필요합니다

### 2. payload 구조
- Gmail Trigger의 `payload` 구조는 이메일 형식에 따라 다를 수 있습니다
- `multipart/alternative` 형식의 경우 `parts` 배열을 확인해야 합니다

### 3. 에러 처리
- Base64 디코딩 실패 시 try-catch로 처리
- 본문 추출 실패 시 snippet으로 fallback

---

## 📚 참고

- [Gmail API 메시지 형식](https://developers.google.com/gmail/api/reference/rest/v1/users.messages)
- [n8n Code 노드 문서](https://docs.n8n.io/code-examples/methods-variables-examples/)
