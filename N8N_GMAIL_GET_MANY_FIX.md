# n8n Gmail Get Many 노드 - 본문 추출 문제 해결

## 🔍 문제 상황

Gmail "Get Many" 노드를 사용할 때:
- `format: full` 옵션이 없음
- `payload`에 `mimeType: "multipart/alternative"`만 있고 실제 본문 데이터가 없음
- `snippet`만 사용 가능한 상황

---

## ✅ 해결 방법 1: Gmail Get Many → Loop → Gmail Get (개별)

각 이메일 ID를 사용하여 개별 이메일의 전체 본문을 가져오는 방법입니다.

### 워크플로우 구조:
```
Gmail Trigger → Gmail Get Many → Loop Over Items → Gmail Get → Code Node
```

### 1단계: Gmail Get Many 노드 설정

1. **Operation**: `Get Many` (현재 유지)
2. **Simplify**: `No` (비활성화 - 중요!)
3. **Limit**: `100` (또는 원하는 개수)
4. **Filters**:
   - **Search**: `subject:[네이버 예약] after:2024-01-01`
   - **Sender**: `naverbooking_noreply@navercorp.com`

### 2단계: Loop Over Items 노드 추가

1. **Loop Over Items** 노드 추가 (또는 **Split In Batches** 사용)
2. Gmail Get Many 노드의 각 이메일을 개별적으로 처리

### 3단계: Gmail Get 노드 추가 (개별 이메일)

1. **Operation**: `Get` 선택
2. **Message ID**: `{{ $json.id }}` (Loop에서 전달된 이메일 ID)
3. **Simplify**: `No` (비활성화 - 중요!)
4. 이 노드가 전체 본문을 포함한 `payload`를 반환합니다

### 4단계: Code 노드

위의 `N8N_CODE_NODE_GMAIL_GET.md` 파일의 코드 사용

---

## ✅ 해결 방법 2: snippet만 사용 (개선된 파싱)

`Get Many`에서 반환된 `snippet`만 사용하되, 결제 금액 추출 로직을 개선하는 방법입니다.

### 워크플로우 구조:
```
Gmail Get Many → Code Node (snippet 파싱)
```

### Code 노드 코드 (snippet 전용):

```javascript
// Gmail Get Many 노드에서 전달된 이메일 데이터
const emailData = $input.item.json;

// snippet 사용 (Get Many에서는 payload에 본문이 없음)
const textBody = (emailData.snippet || '').trim();

// 예약 번호 추출
const reservationNumberMatch = textBody.match(/예약번호[:\s]*(\d+)/i);
const reservationNumber = reservationNumberMatch ? reservationNumberMatch[1] : '';

// 예약자명 추출
const guestNameMatch = textBody.match(/예약자명[:\s]*([^\n\r]+?)(?:\s*예약신청|$)/i);
const guestName = guestNameMatch ? guestNameMatch[1].trim().replace(/\s+/g, ' ') : '';

// 이메일 주소 추출
const emailMatch = textBody.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
let email = emailMatch ? emailMatch[1] : '';

// Gmail Get Many의 payload에서 이메일 주소 가져오기 시도
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

// 결제 금액 추출 (snippet에서 가능한 범위 내)
// snippet 예시: "결제상태 결제완료 결제수단 신용카드"
// snippet에는 결제 금액이 잘릴 수 있음
let amount = 0;

// 방법 1: snippet에서 금액 패턴 찾기 (잘릴 수 있음)
const amountMatch = textBody.match(/(\d{1,3}(?:,\d{3})*)\s*원/i);
if (amountMatch) {
  amount = parseInt(amountMatch[1].replace(/,/g, '')) || 0;
  console.log('Amount extracted from snippet (method 1):', amount);
}

// 방법 2: "결제" 키워드 주변에서 금액 찾기
if (amount === 0) {
  const paymentSection = textBody.match(/결제[^\n\r]*(\d{1,3}(?:,\d{3})*)\s*원/i);
  if (paymentSection) {
    amount = parseInt(paymentSection[1].replace(/,/g, '')) || 0;
    console.log('Amount extracted from payment section (method 2):', amount);
  }
}

// snippet에는 결제 금액이 없을 수 있으므로 기본값 0 사용
// Railway API가 기본값 0을 처리함

// 디버깅을 위한 로그
console.log('=== Parsed Reservation Data (from snippet) ===');
console.log('Reservation Number:', reservationNumber);
console.log('Guest Name:', guestName);
console.log('Email:', email || '(not found, will use default)');
console.log('Check-in:', checkin);
console.log('Check-out:', checkout);
console.log('Room Type:', roomType);
console.log('Amount:', amount || 0, '(may be 0 if not in snippet)');
console.log('Snippet Length:', textBody.length);
console.log('==============================================');

// Railway API로 전송할 데이터
return {
  reservationNumber,
  guestName,
  email: email || '',
  checkin,
  checkout,
  roomType,
  amount: amount || 0 // snippet에 없으면 0 (Railway API가 기본값 사용)
};
```

---

## ✅ 해결 방법 3: Gmail Get Many → HTTP Request (Gmail API 직접 호출)

n8n의 Gmail 노드 대신 HTTP Request 노드로 Gmail API를 직접 호출하는 방법입니다.

### 워크플로우 구조:
```
Gmail Get Many → Loop Over Items → HTTP Request (Gmail API) → Code Node
```

### HTTP Request 노드 설정:

1. **Method**: `GET`
2. **URL**: 
   ```
   https://gmail.googleapis.com/gmail/v1/users/me/messages/{{ $json.id }}?format=full
   ```
3. **Authentication**: `OAuth2` (Gmail Credential 사용)
4. **Headers**:
   - `Accept`: `application/json`

이 방법은 Gmail API의 `format=full` 파라미터를 직접 사용하여 전체 본문을 가져옵니다.

---

## 🎯 권장 방법

### 상황별 권장 방법:

1. **실시간 처리 (Gmail Trigger 사용)**: 
   - **방법 1** (Gmail Get 개별 호출) 권장
   - 각 새 이메일마다 전체 본문을 가져올 수 있음

2. **기존 이메일 일괄 처리 (Get Many 사용)**:
   - **방법 2** (snippet 파싱) 권장
   - 결제 금액은 snippet에 없을 수 있으므로 기본값 0 사용
   - Railway API가 기본값을 처리하므로 문제없음

3. **정확한 결제 금액이 필요한 경우**:
   - **방법 1** 또는 **방법 3** 사용
   - 개별 이메일의 전체 본문을 가져와야 함

---

## 📋 Gmail Get Many 노드 설정 체크리스트

### ❌ 잘못된 설정:
- ✅ **Simplify**: `Yes` (활성화) → 본문 데이터 손실 가능
- ❌ **Format 옵션 없음** → Get Many는 기본적으로 메타데이터만 반환

### ✅ 올바른 설정 (방법 1 사용 시):
1. Gmail Get Many → Loop Over Items
2. Loop 내부에서 Gmail Get (개별)
3. **Simplify**: `No` (비활성화)
4. **Message ID**: `{{ $json.id }}`

---

## 🔍 디버깅

### payload 확인:

```javascript
// Code 노드에서 payload 구조 확인
console.log('Payload structure:', JSON.stringify($input.item.json.payload, null, 2));
```

### 예상 출력:

**Get Many 사용 시 (본문 없음):**
```json
{
  "mimeType": "multipart/alternative"
}
```

**Get (개별) 사용 시 (본문 있음):**
```json
{
  "mimeType": "multipart/alternative",
  "parts": [
    {
      "mimeType": "text/plain",
      "body": {
        "data": "base64_encoded_content..."
      }
    }
  ]
}
```

---

## ⚠️ 주의사항

### 1. Get Many의 제한사항
- `Get Many`는 기본적으로 메타데이터만 반환합니다
- 전체 본문을 가져오려면 개별 `Get` 호출이 필요합니다

### 2. API 호출 제한
- Gmail API는 분당 호출 제한이 있습니다
- 많은 이메일을 처리할 때는 배치 처리나 지연 시간 추가를 고려하세요

### 3. snippet의 한계
- `snippet`은 Gmail이 자동 생성하는 요약본입니다
- 결제 금액 등 상세 정보가 잘릴 수 있습니다
- Railway API가 기본값 0을 처리하므로 문제없습니다

---

## 📚 참고

- [Gmail API Messages: get](https://developers.google.com/gmail/api/reference/rest/v1/users.messages/get)
- [Gmail API Messages: list](https://developers.google.com/gmail/api/reference/rest/v1/users.messages/list)
- [n8n Gmail 노드 문서](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.gmail/)
