# n8n Gmail 전체 본문 가져오기 - HTTP Request 노드 사용

## 🔍 문제 상황

n8n의 Gmail 노드 (Get Many, Get 모두)가 `payload`에 본문을 반환하지 않고 `snippet`만 반환하는 경우:
- `payload`에 `mimeType: "multipart/alternative"`만 있고 실제 본문 데이터가 없음
- `format: full` 옵션이 노드 UI에 없음

---

## ✅ 해결 방법: HTTP Request 노드로 Gmail API 직접 호출

Gmail API를 직접 호출하여 `format=full` 파라미터를 사용하는 방법입니다.

### 워크플로우 구조:
```
Gmail Get Many → Loop Over Items → HTTP Request (Gmail API) → Code Node
```

---

## 📋 단계별 설정

### 1단계: Gmail Get Many 노드 (현재 유지)

1. **Operation**: `Get Many`
2. **Simplify**: `No` (비활성화)
3. **Limit**: `100`
4. **Filters**:
   - **Search**: `subject:[네이버 예약] after:2024-01-01`
   - **Sender**: `naverbooking_noreply@navercorp.com`

### 2단계: Loop Over Items 노드 추가

1. **Loop Over Items** 노드 추가
2. Gmail Get Many 노드의 각 이메일을 개별적으로 처리

### 3단계: HTTP Request 노드 추가 (Gmail API 직접 호출)

#### 기본 설정:
1. **Method**: `GET`
2. **URL**: 
   ```
   https://gmail.googleapis.com/gmail/v1/users/me/messages/{{ $json.id }}?format=full
   ```
   - `{{ $json.id }}`: Loop에서 전달된 이메일 ID

#### Authentication 설정:
1. **Authentication**: `OAuth2 API` 선택
2. **Credential**: Gmail OAuth2 Credential 사용
   - 또는 **Generic Credential Type** 사용:
     - **Header Name**: `Authorization`
     - **Header Value**: `Bearer {{ $credentials.gmail.oauth2.access_token }}`

#### Headers 설정:
1. **Add Header**:
   - **Name**: `Accept`
   - **Value**: `application/json`

#### Options 설정 (선택):
1. **Response Format**: `JSON`
2. **Response Include**: `Body`

### 4단계: Code 노드 (전체 본문 파싱)

HTTP Request 노드에서 반환된 전체 본문을 파싱하는 코드:

```javascript
// HTTP Request 노드에서 전달된 Gmail API 응답
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

// 예약 번호 추출
const reservationNumberMatch = textBody.match(/예약번호[:\s]*(\d+)/i);
const reservationNumber = reservationNumberMatch ? reservationNumberMatch[1] : '';

// 예약자명 추출
const guestNameMatch = textBody.match(/예약자명[:\s]*([^\n\r]+?)(?:\s*예약신청|$)/i);
const guestName = guestNameMatch ? guestNameMatch[1].trim().replace(/\s+/g, ' ') : '';

// 이메일 주소 추출
const emailMatch = textBody.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
let email = emailMatch ? emailMatch[1] : '';

// Gmail API 응답의 payload에서 이메일 주소 가져오기 시도
if (!email && emailData.payload && emailData.payload.headers) {
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
// 이메일 본문 예시: "결제금액	2인실(2인기준) 오션뷰카라반 예약(1) 150,000원 + [알림,저장이벤트] 오로라2개(1) 0원 = 150,000원"
let amount = 0;

// 방법 1: "=" 다음의 총액 추출 (가장 정확)
const totalMatch = textBody.match(/=\s*(\d{1,3}(?:,\d{3})*)\s*원/i);
if (totalMatch) {
  amount = parseInt(totalMatch[1].replace(/,/g, '')) || 0;
  console.log('Amount extracted from total (method 1):', amount);
}

// 방법 2: "결제금액" 섹션에서 마지막 숫자 추출
if (amount === 0) {
  const amountSection = textBody.match(/결제금액[:\s\t]*([^\n\r]+?)(?:\s*요청사항|$)/i);
  if (amountSection) {
    // 모든 금액 패턴 찾기
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
console.log('Has Payload Parts:', !!(emailData.payload && emailData.payload.parts));
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

## 🔧 HTTP Request 노드 상세 설정

### URL 구성:
```
https://gmail.googleapis.com/gmail/v1/users/me/messages/{{ $json.id }}?format=full
```

- `{{ $json.id }}`: Loop에서 전달된 이메일 ID
- `format=full`: 전체 본문 포함 (필수!)

### Authentication 방법 1: OAuth2 API

1. **Authentication**: `OAuth2 API` 선택
2. **Credential**: 기존 Gmail OAuth2 Credential 사용
3. n8n이 자동으로 Access Token을 관리합니다

### Authentication 방법 2: Generic Credential Type

1. **Authentication**: `Generic Credential Type` 선택
2. **Credential**: 새로 생성
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer YOUR_ACCESS_TOKEN`
   - 또는 Expression 사용: `Bearer {{ $credentials.gmail.oauth2.access_token }}`

### Authentication 방법 3: Header 직접 설정

1. **Authentication**: `None` 선택
2. **Headers** 섹션에서:
   - **Name**: `Authorization`
   - **Value**: `Bearer YOUR_ACCESS_TOKEN`
   - Access Token은 Gmail OAuth2 Credential에서 가져와야 합니다

---

## 🔑 Gmail API Access Token 얻는 방법

### 방법 1: n8n Gmail Credential 사용

1. n8n에서 Gmail Credential 생성/확인
2. HTTP Request 노드에서 OAuth2 API 선택
3. n8n이 자동으로 토큰을 관리

### 방법 2: 수동으로 Access Token 얻기

1. Google Cloud Console에서 OAuth2 클라이언트 생성
2. Gmail API 스코프 추가: `https://www.googleapis.com/auth/gmail.readonly`
3. OAuth2 플로우로 Access Token 획득
4. HTTP Request 노드의 Header에 직접 입력

---

## 📋 워크플로우 예시

### 전체 구조:
```
1. Gmail Get Many
   ↓
2. Loop Over Items
   ↓
3. HTTP Request (Gmail API - format=full)
   ↓
4. Code Node (파싱)
   ↓
5. HTTP Request (Railway API)
```

### Loop Over Items 노드 설정:
- **Mode**: `Run Once for Each Item`
- 각 이메일을 개별적으로 처리

---

## ⚠️ 주의사항

### 1. API 호출 제한
- Gmail API는 분당 호출 제한이 있습니다 (기본 250회/분)
- 많은 이메일을 처리할 때는:
  - **Wait** 노드 추가 (요청 간 지연)
  - 또는 배치 처리

### 2. Access Token 만료
- OAuth2 Access Token은 만료됩니다
- n8n OAuth2 API를 사용하면 자동 갱신됩니다
- 수동 토큰 사용 시 갱신 로직 필요

### 3. 에러 처리
- HTTP Request 노드에서 에러 발생 시:
  - **Continue On Fail**: 활성화하여 다음 이메일 계속 처리
  - 또는 **IF** 노드로 에러 필터링

---

## 🔍 디버깅

### HTTP Request 노드 출력 확인:

```javascript
// Code 노드에서 payload 구조 확인
console.log('Full email data:', JSON.stringify($input.item.json, null, 2));
console.log('Payload parts:', $input.item.json.payload?.parts?.length || 0);
```

### 예상 출력 (format=full 사용 시):

```json
{
  "id": "19b94573411e62b2",
  "threadId": "19b94573411e62b2",
  "snippet": "...",
  "payload": {
    "mimeType": "multipart/alternative",
    "parts": [
      {
        "mimeType": "text/plain",
        "body": {
          "data": "base64_encoded_content..."
        }
      },
      {
        "mimeType": "text/html",
        "body": {
          "data": "base64_encoded_html..."
        }
      }
    ]
  }
}
```

---

## 📚 참고

- [Gmail API Messages: get](https://developers.google.com/gmail/api/reference/rest/v1/users.messages/get)
- [Gmail API Format 파라미터](https://developers.google.com/gmail/api/reference/rest/v1/users.messages/get#query-parameters)
- [n8n HTTP Request 노드 문서](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)
