# Gmail 기존 이메일 처리 및 전체 본문 가져오기 해결 방법

## 🔍 문제 분석

### 문제 1: Gmail Trigger가 기존 이메일을 가져오지 않음
- **원인**: Gmail Trigger는 이미 처리한 이메일을 다시 처리하지 않습니다
- **증상**: `after "날짜"` 필터를 사용해도 노드 세팅 이후의 최신 메일만 가져옴
- **해결**: Gmail Trigger 대신 Gmail 노드의 "Get Many" 액션 사용

### 문제 2: snippet에 결제 금액이 포함되지 않음
- **원인**: `snippet`은 Gmail이 자동 생성하는 요약본으로, 전체 본문이 아닙니다
- **증상**: 결제 금액, 상세 내역 등이 snippet에서 누락됨
- **해결**: 전체 이메일 본문을 가져오는 방법 사용

---

## ✅ 해결 방법: Gmail 노드로 전환

### 방법 1: Gmail "Get Many" 노드 사용 (권장)

#### 1단계: 새로운 워크플로우 생성 또는 기존 워크플로우 수정

1. n8n 워크플로우 편집 모드 진입
2. **Gmail Trigger** 노드를 **Gmail** 노드로 교체

#### 2단계: Gmail 노드 설정

1. **Gmail** 노드 추가
2. **Credential**: 기존 Gmail 계정 선택
3. **Operation**: `Get Many` 선택
4. **Return All**: `Yes` (모든 이메일 가져오기)
5. **Limit**: `100` (한 번에 가져올 최대 이메일 수)
6. **Simple**: `No` (전체 본문 가져오기 위해)
7. **Filters**:
   - **Search**: `subject:[네이버 예약] after:2024-01-01`
   - **Sender**: `naverbooking_noreply@navercorp.com`

#### 3단계: 전체 이메일 본문 가져오기

**Gmail 노드 설정:**
- **Simple**: `No`로 설정하면 전체 이메일 본문을 가져올 수 있습니다
- **Format**: `full` 또는 `raw` 선택

#### 4단계: Code 노드 수정 (전체 본문 파싱)

**Code 노드 수정:**

```javascript
// Gmail 노드에서 전체 이메일 데이터 가져오기
const items = $input.all();

// 각 이메일을 처리
const results = items.map((item) => {
  const emailData = item.json;
  
  // 전체 이메일 본문 가져오기
  // Simple: No인 경우 payload에서 본문 추출
  let emailBody = '';
  
  // 방법 1: payload에서 본문 추출
  if (emailData.payload) {
    emailBody = extractBodyFromPayload(emailData.payload);
  }
  
  // 방법 2: snippet 사용 (fallback)
  if (!emailBody && emailData.snippet) {
    emailBody = emailData.snippet;
  }
  
  // 방법 3: body 필드 사용
  if (!emailBody && emailData.body) {
    emailBody = emailData.body;
  }
  
  // HTML 태그 제거
  const textBody = emailBody
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // 예약 번호 추출
  const reservationNumberMatch = textBody.match(/예약번호[:\s]*(\d+)/i);
  const reservationNumber = reservationNumberMatch ? reservationNumberMatch[1] : '';
  
  // 예약자명 추출
  const guestNameMatch = textBody.match(/예약자명[:\s]*([^\n\r]+?)(?:\s*예약신청|$)/i);
  const guestName = guestNameMatch ? guestNameMatch[1].trim().replace(/\s+/g, ' ') : '';
  
  // 이메일 주소 추출
  const emailMatch = textBody.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
  let email = emailMatch ? emailMatch[1] : '';
  
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
  
  // 결제 금액 추출 (개선된 정규식)
  // "결제금액" 다음에 오는 금액 추출
  const amountMatch = textBody.match(/결제금액[:\s]*([^\n\r]+?)(?:\s*요청사항|$)/i);
  let amount = 0;
  if (amountMatch) {
    // 금액 문자열에서 숫자만 추출 (예: "150,000원" → 150000)
    const amountStr = amountMatch[1];
    const numbers = amountStr.match(/(\d{1,3}(?:,\d{3})*)/g);
    if (numbers && numbers.length > 0) {
      // 마지막 숫자 (총액) 사용
      const lastAmount = numbers[numbers.length - 1];
      amount = parseInt(lastAmount.replace(/,/g, '')) || 0;
    }
  }
  
  // 결제 금액 추출 (대체 방법: "=" 다음의 총액)
  if (amount === 0) {
    const totalMatch = textBody.match(/=\s*(\d{1,3}(?:,\d{3})*)\s*원/i);
    if (totalMatch) {
      amount = parseInt(totalMatch[1].replace(/,/g, '')) || 0;
    }
  }
  
  // 결제 금액 추출 (대체 방법 2: 숫자 패턴)
  if (amount === 0) {
    const numberMatch = textBody.match(/(\d{1,3}(?:,\d{3})*)\s*원(?:\s*요청사항|$)/i);
    if (numberMatch) {
      amount = parseInt(numberMatch[1].replace(/,/g, '')) || 0;
    }
  }
  
  return {
    reservationNumber,
    guestName,
    email: email || '',
    checkin,
    checkout,
    roomType,
    amount: amount || 0
  };
});

// payload에서 본문 추출하는 함수
function extractBodyFromPayload(payload) {
  let body = '';
  
  if (payload.body && payload.body.data) {
    // Base64 디코딩
    body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
  }
  
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body && part.body.data) {
        body += Buffer.from(part.body.data, 'base64').toString('utf-8');
      } else if (part.mimeType === 'text/html' && part.body && part.body.data) {
        const htmlBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
        // HTML 태그 제거
        body += htmlBody.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      } else if (part.parts) {
        // 중첩된 parts 처리
        body += extractBodyFromPayload(part);
      }
    }
  }
  
  return body;
}

return results;
```

#### 5단계: HTTP Request 노드 설정

1. **HTTP Request** 노드 추가
2. **Method**: `POST`
3. **URL**: `https://ouscaravan-production.up.railway.app/api/admin/reservations`
4. **Headers**:
   - `X-API-Key`: `{N8N_API_KEY}`
   - `Content-Type`: `application/json`
5. **Body**: Code 노드에서 전달된 데이터 사용

---

## ✅ 해결 방법: Gmail Trigger 유지 + 전체 본문 가져오기

### 방법 2: Gmail Trigger + Gmail 노드 조합

기존 Gmail Trigger를 유지하면서 전체 본문을 가져오는 방법:

#### 워크플로우 구조:
```
Gmail Trigger → Gmail (Get) → Code Node → HTTP Request
```

#### 1단계: Gmail Trigger 설정 (현재 유지)
- Search: `subject:[네이버 예약]`
- Sender: `naverbooking_noreply@navercorp.com`

#### 2단계: Gmail 노드 추가 (Get 액션)
1. Gmail Trigger 다음에 **Gmail** 노드 추가
2. **Operation**: `Get` 선택
3. **Message ID**: `{{ $json.id }}` (Gmail Trigger에서 전달된 이메일 ID)
4. **Format**: `full` 또는 `raw` 선택
5. **Simple**: `No`

#### 3단계: Code 노드 수정
위의 Code 노드 코드 사용 (전체 본문 추출)

---

## 🔧 결제 금액 추출 개선

### 개선된 정규식 패턴

이메일 본문 예시:
```
결제금액 2인실(2인기준) 오션뷰카라반 예약(1) 150,000원 + [알림, 저장이벤트] 오로라2개(1) 0원 = 150,000원
```

**추출 방법:**

```javascript
// 방법 1: "=" 다음의 총액 추출 (가장 정확)
const totalMatch = textBody.match(/=\s*(\d{1,3}(?:,\d{3})*)\s*원/i);
if (totalMatch) {
  amount = parseInt(totalMatch[1].replace(/,/g, '')) || 0;
}

// 방법 2: "결제금액" 섹션에서 마지막 숫자 추출
const amountSection = textBody.match(/결제금액[:\s]*([^\n\r]+?)(?:\s*요청사항|$)/i);
if (amountSection) {
  const numbers = amountSection[1].match(/(\d{1,3}(?:,\d{3})*)/g);
  if (numbers && numbers.length > 0) {
    // 마지막 숫자 (총액) 사용
    const lastAmount = numbers[numbers.length - 1];
    amount = parseInt(lastAmount.replace(/,/g, '')) || 0;
  }
}

// 방법 3: 모든 금액 패턴 찾기 (가장 큰 값 사용)
const allAmounts = textBody.match(/(\d{1,3}(?:,\d{3})*)\s*원/g);
if (allAmounts) {
  const amounts = allAmounts.map(m => {
    const num = m.match(/(\d{1,3}(?:,\d{3})*)/);
    return num ? parseInt(num[1].replace(/,/g, '')) : 0;
  });
  amount = Math.max(...amounts);
}
```

---

## 📋 단계별 설정 가이드

### 옵션 A: Gmail "Get Many" 노드 사용 (기존 이메일 일괄 처리)

1. **Gmail 노드 추가**
   - Operation: `Get Many`
   - Search: `subject:[네이버 예약] after:2024-01-01`
   - Return All: `Yes`
   - Limit: `100`
   - Simple: `No`

2. **Code 노드 수정**
   - 위의 전체 본문 추출 코드 사용

3. **HTTP Request 노드**
   - 기존 설정 유지

4. **워크플로우 실행**
   - Execute Workflow 버튼 클릭
   - 모든 이메일이 한 번에 처리됨

### 옵션 B: Gmail Trigger + Gmail Get 조합 (실시간 + 전체 본문)

1. **Gmail Trigger 유지**
   - 현재 설정 그대로

2. **Gmail 노드 추가** (Trigger 다음)
   - Operation: `Get`
   - Message ID: `{{ $json.id }}`
   - Format: `full`
   - Simple: `No`

3. **Code 노드 수정**
   - 전체 본문 추출 코드 사용

4. **HTTP Request 노드**
   - 기존 설정 유지

---

## 🚀 빠른 해결 방법

### 가장 간단한 방법: Gmail "Get Many" 사용

1. **기존 Gmail Trigger 비활성화** (또는 삭제)
2. **Gmail 노드 추가**
   ```
   Operation: Get Many
   Search: subject:[네이버 예약] after:2024-01-01
   Return All: Yes
   Limit: 100
   Simple: No
   ```
3. **Code 노드 수정** (위의 전체 본문 추출 코드)
4. **워크플로우 실행**
   - Execute Workflow 버튼 클릭
   - 모든 기존 이메일이 한 번에 처리됨

---

## ⚠️ 주의사항

### 1. Gmail API 제한
- 한 번에 가져올 수 있는 이메일 수 제한
- 많은 이메일이 있으면 배치 처리 필요

### 2. 중복 방지
- Railway API는 예약번호 중복을 자동으로 방지
- `409 Conflict` 에러는 정상 동작

### 3. 처리 시간
- 많은 이메일을 처리할 경우 시간이 걸릴 수 있음
- 배치 크기를 조절하여 처리

---

## 📊 검증 방법

### 1. 전체 본문 확인
- Gmail 노드 출력에서 `payload` 확인
- `body` 또는 `parts`에 전체 본문 포함 확인

### 2. 결제 금액 추출 확인
- Code 노드 출력에서 `amount` 필드 확인
- 예상 금액과 일치하는지 확인

### 3. Railway 로그 확인
- 예약 생성 로그 확인
- 결제 금액이 올바르게 저장되었는지 확인

---

## 📚 참고 자료

- [n8n Gmail 노드 문서](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.gmail/)
- [Gmail API 메시지 형식](https://developers.google.com/gmail/api/reference/rest/v1/users.messages)
- [Railway API 문서](./railway-backend/README.md)
