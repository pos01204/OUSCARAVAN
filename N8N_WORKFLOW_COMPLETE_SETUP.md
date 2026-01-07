# n8n 워크플로우 완전 재구성 가이드

## 📋 개요

Gmail Trigger부터 Extract from HTML, Code, HTTP Request까지의 전체 워크플로우를 처음부터 다시 설정하는 가이드입니다.

**워크플로우 구조 (권장):**
```
Gmail Trigger → Gmail Get → Code → HTTP Request
```

**워크플로우 구조 (Extract from HTML 사용 시):**
```
Gmail Trigger → Gmail Get → Extract from HTML → Code → HTTP Request
```

**워크플로우 구조 (간단한 버전, snippet만 사용):**
```
Gmail Trigger → Code → HTTP Request
```

---

## 1단계: Gmail Trigger 설정

### 1.1 Gmail Trigger 노드 추가

1. n8n 대시보드에서 **"Workflows"** 클릭
2. **"Add Workflow"** 또는 기존 워크플로우 선택
3. **"+" 버튼** 클릭
4. 검색: **"Gmail Trigger"**
5. **"Gmail Trigger"** 노드 선택

### 1.2 Gmail Credential 설정

**처음 설정하는 경우:**
1. **"Credential"** 드롭다운에서 **"Create New Credential"** 선택
2. **"Gmail OAuth2 API"** 선택
3. **"Connect my account"** 클릭
4. Google 계정 로그인 및 권한 승인
5. **"Save"** 클릭

**기존 Credential이 있는 경우:**
- **"Credential"** 드롭다운에서 기존 Gmail 계정 선택

### 1.3 Gmail Trigger 설정

**Poll Times:**
- **"Every Minute"** 선택 (1분마다 확인)

**Event:**
- **"Message Received"** 선택

**Filters:**
- **Search:** `subject:[네이버 예약]`
- **Sender:** `naverbooking_noreply@navercorp.com`

**설명:**
- 제목에 "[네이버 예약]"이 포함된 이메일만 감지
- 발신자가 네이버 예약 시스템인 이메일만 처리

**Save** 클릭

---

## 2단계: Gmail Get 노드 추가 (Extract from HTML 사용 시 필수)

### 2.1 문제점

**Gmail Trigger는 binary 데이터를 제공하지 않습니다:**
- Gmail Trigger는 JSON 데이터만 제공 (`snippet`, `payload` 등)
- Extract from HTML 노드는 binary 파일 데이터를 기대함
- 따라서 Gmail Trigger → Extract from HTML 직접 연결은 불가능

### 2.2 해결 방법: Gmail Get 노드 추가

**워크플로우 구조:**
```
Gmail Trigger → Gmail Get → Extract from HTML → Code
```

#### Gmail Get 노드 추가

1. Gmail Trigger 노드 우측의 **"+" 버튼** 클릭
2. 검색: **"Gmail"**
3. **"Gmail"** 노드 선택

#### Gmail Get 노드 설정

**Operation:**
- **"Get"** 선택

**Message ID:**
- `{{ $json.id }}` (Gmail Trigger에서 전달된 이메일 ID)

**Format:**
- **"Full"** 선택 (전체 이메일 본문 가져오기)

**Simple:**
- **"No"** 선택 (전체 데이터 구조 유지)

**Save** 클릭

---

## 3단계: Extract from HTML 노드 설정 (선택사항)

### 3.1 Extract from HTML 노드 추가

1. Gmail Get 노드 우측의 **"+" 버튼** 클릭
2. 검색: **"Extract from File"**
3. **"Extract from File"** 노드 선택

### 3.2 HTML 노드 설정 (Extract HTML Content)

**Operation:**
- **"Extract HTML Content"** 선택

**Source Data:**
- **"JSON"** 선택

**JSON Property:**
- Gmail Get 노드의 출력을 확인하여 HTML 본문이 있는 필드 경로 입력
- 예시:
  - `htmlBody` (HTML 본문이 직접 있는 경우)
  - `body` (텍스트 본문이 있는 경우)
  - `payload.body.data` (Base64 인코딩된 데이터인 경우, 디코딩 필요)

**중요:** Gmail Trigger의 출력에는 `data` 필드가 없습니다!
- Gmail Trigger → HTML 노드 직접 연결 시: `snippet` 사용 (텍스트만, HTML 아님)
- Gmail Trigger → Gmail Get → HTML 노드: Gmail Get 노드 출력 확인 후 정확한 필드 경로 사용

**Extraction Values (선택사항):**
- HTML에서 특정 데이터를 추출하려면 여기에 설정
- 예: 
  - Key: `예약번호`
  - CSS Selector: `.reservation-number` 또는 적절한 선택자
  - Return Value: `Text`

### 3.3 Extract from HTML 사용 시 주의사항

**Gmail Get 노드 출력 확인:**
1. Gmail Get 노드 클릭
2. **"Test step"** 또는 **"Execute step"** 클릭
3. **OUTPUT** 패널에서 실제 필드 이름 확인:
   - `body` (text/plain)
   - `htmlBody` (text/html)
   - `payload.body.data` (Base64 인코딩된 데이터)

**Input Binary Field 설정 예시:**
- `{{ $json.htmlBody }}` (HTML 본문이 있는 경우)
- `{{ $json.body }}` (텍스트 본문이 있는 경우)
- `{{ $json.payload.body.data }}` (Base64 데이터인 경우, Code 노드에서 디코딩 필요)

### 3.4 Extract from HTML 대신 Code 노드 사용 (권장)

**Extract from HTML 노드는 복잡하고 제한적입니다:**
- Gmail Get 노드의 출력 구조에 따라 필드 경로가 달라질 수 있음
- Base64 인코딩된 데이터는 직접 처리 불가
- Code 노드에서 직접 파싱하는 것이 더 유연하고 안정적

**권장 워크플로우 구조:**
```
Gmail Trigger → Gmail Get → Code (HTML 파싱) → HTTP Request
```

Extract from HTML 노드를 건너뛰고 Code 노드에서 직접 HTML을 파싱하는 것을 권장합니다.

---

## 3단계: Code 노드 설정 (이메일 파싱)

### 3.1 Code 노드 추가

1. Gmail Trigger 노드 우측의 **"+" 버튼** 클릭
2. 검색: **"Code"**
3. **"Code"** 노드 선택

### 3.2 Code 노드 설정

**Mode:**
- **"Run Once for All Items"** 선택

**JavaScript Code:**

**중요:** HTML 노드를 사용하는 경우와 사용하지 않는 경우에 따라 다른 코드를 사용해야 합니다.

#### HTML 노드를 사용하는 경우 (HTML 노드 출력 처리)

HTML 노드의 출력을 직접 사용하는 코드:

```javascript
// HTML 노드에서 전달된 데이터 가져오기
// HTML 노드 출력이 배열인 경우 첫 번째 요소 사용
let htmlOutput = $input.item.json;
if (Array.isArray(htmlOutput) && htmlOutput.length > 0) {
  htmlOutput = htmlOutput[0];
}
const allInputs = $input.all();

// HTML 노드 출력에서 데이터 추출
let reservationNumber = '';
let guestName = '';
let checkin = '';
let checkout = '';
let roomType = '';
let amount = 0;
let options = [];

// 예약번호 추출 (이미지 URL 등 제거)
if (htmlOutput['예약번호']) {
  const reservationNumberMatch = htmlOutput['예약번호'].match(/(\d+)/);
  reservationNumber = reservationNumberMatch ? reservationNumberMatch[1] : '';
}

// 예약자명 추출 ("님" 제거)
if (htmlOutput['예약자명']) {
  guestName = htmlOutput['예약자명'].replace(/님\s*$/, '').trim();
}

// 이용일시에서 체크인/체크아웃 추출
if (htmlOutput['이용일시']) {
  // 체크인 날짜 추출: "2026.01.08.(목)~2026.01.09.(금)"
  const checkinMatch = htmlOutput['이용일시'].match(/(\d{4})\.(\d{2})\.(\d{2})\./);
  if (checkinMatch) {
    checkin = `${checkinMatch[1]}-${checkinMatch[2]}-${checkinMatch[3]}`;
  }
  
  // 체크아웃 날짜 추출: "~2026.01.09.(금)"
  const checkoutMatch = htmlOutput['이용일시'].match(/~(\d{4})\.(\d{2})\.(\d{2})\./);
  if (checkoutMatch) {
    checkout = `${checkoutMatch[1]}-${checkoutMatch[2]}-${checkoutMatch[3]}`;
  }
}

// 상품명 추출
if (htmlOutput['상품명']) {
  roomType = htmlOutput['상품명'].trim();
}

// 결제금액에서 총액 추출
if (htmlOutput['결제금액']) {
  // "=" 다음의 총액 추출 (가장 정확)
  const totalMatch = htmlOutput['결제금액'].match(/=\s*(\d{1,3}(?:,\d{3})*)\s*원/i);
  if (totalMatch) {
    amount = parseInt(totalMatch[1].replace(/,/g, '')) || 0;
  }
  
  // 옵션 추출 (예: "[알림,저장이벤트] 오로라2개(1) 0원")
  const optionPattern = /\[([^\]]+)\]\s*([^\n\r]+?)(?:\s*\d+원|$)/g;
  let optionMatch;
  while ((optionMatch = optionPattern.exec(htmlOutput['결제금액'])) !== null) {
    const tags = optionMatch[1].split(',').map(tag => tag.trim());
    const optionName = optionMatch[2].trim();
    options.push({
      optionName: optionName,
      optionPrice: 0,
      category: tags.join(',')
    });
  }
}

// 이메일 주소 추출 (HTML 노드 출력에는 없으므로 이전 노드에서 가져오기)
let email = '';
if (allInputs && allInputs.length > 0) {
  const gmailData = allInputs[0].json;
  
  // Gmail Trigger의 payload에서 이메일 주소 가져오기
  if (gmailData.payload) {
    const headers = gmailData.payload.headers || [];
    const toHeader = headers.find((h) => h.name === 'To');
    if (toHeader && toHeader.value) {
      const toMatch = toHeader.value.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
      if (toMatch) {
        email = toMatch[1];
      }
    }
  }
  
  // 또는 From 헤더에서 가져오기
  if (!email && gmailData.From) {
    const fromMatch = gmailData.From.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
    if (fromMatch) {
      email = fromMatch[1];
    }
  }
}

// 디버깅을 위한 로그
console.log('Parsed reservation data from HTML output:', {
  reservationNumber,
  guestName,
  email: email || '(not found)',
  checkin,
  checkout,
  roomType,
  amount: amount || 0,
  optionsCount: options.length,
  htmlOutput: htmlOutput
});

// Railway API로 전송할 데이터
return {
  reservationNumber,
  guestName,
  email: email || '',
  checkin,
  checkout,
  roomType,
  amount: amount || 0,
  options: options.length > 0 ? options : undefined
};
```

#### HTML 노드를 사용하지 않는 경우 (기존 파싱 로직)

Gmail Trigger/Gmail Get에서 직접 이메일 본문을 파싱하는 코드:

```javascript
// Gmail Trigger/Gmail Get에서 이메일 데이터 가져오기
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
          console.log('Failed to decode HTML part:', e);
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

// 체크인 날짜 추출 (예: "이용일시 2026.01.26.(일)")
const checkinMatch = textBody.match(/이용일시[:\s]*(\d{4})\.(\d{2})\.(\d{2})\./i);
let checkin = '';
if (checkinMatch) {
  checkin = `${checkinMatch[1]}-${checkinMatch[2]}-${checkinMatch[3]}`;
}

// 체크아웃 날짜 추출 (예: "~2026.01.27.(월)")
const checkoutMatch = textBody.match(/~(\d{4})\.(\d{2})\.(\d{2})\./i);
let checkout = '';
if (checkoutMatch) {
  checkout = `${checkoutMatch[1]}-${checkoutMatch[2]}-${checkoutMatch[3]}`;
}

// 객실 타입 추출 (예: "예약상품 2인실(2인기준) 오션뷰카라반 예약")
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

// 옵션 추출 (예: "[알림, 저장이벤트] 오로라2개(1)")
const options = [];
const optionPattern = /\[([^\]]+)\]\s*([^\n\r]+?)(?:\s*\d+원|$)/g;
let optionMatch;
while ((optionMatch = optionPattern.exec(textBody)) !== null) {
  const tags = optionMatch[1].split(',').map(tag => tag.trim());
  const optionName = optionMatch[2].trim();
  options.push({
    optionName: optionName,
    optionPrice: 0, // 옵션 가격은 별도로 추출 필요
    category: tags.join(',')
  });
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
  optionsCount: options.length,
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
  amount: amount || 0,
  options: options.length > 0 ? options : undefined
};
```

**Save** 클릭

---

## 4단계: HTTP Request 노드 설정 (Railway API 전송)

### 4.1 HTTP Request 노드 추가

1. Code 노드 우측의 **"+" 버튼** 클릭
2. 검색: **"HTTP Request"**
3. **"HTTP Request"** 노드 선택

### 4.2 HTTP Request 기본 설정

**Method:**
- **"POST"** 선택

**URL:**
```
https://ouscaravan-production.up.railway.app/api/admin/reservations
```

**Authentication:**
- **"None"** 선택 (헤더에서 직접 API Key 전송)

### 4.3 HTTP Request 헤더 설정

**Send Headers:**
- **"ON"** (활성화)

**Specify Headers:**
- **"Using Fields Below"** 선택

**Header Parameters:**

1. **첫 번째 헤더:**
   - **Name:** `X-API-Key`
   - **Value:** Railway API Key 직접 입력
     - Railway 대시보드 → OUSCARAVAN 서비스 → Variables → `N8N_API_KEY` 값 복사
     - **중요:** Expression 모드(`fx` 아이콘)가 활성화되어 있으면 비활성화
     - 일반 텍스트 모드로 직접 붙여넣기

2. **"Add Parameter"** 클릭

3. **두 번째 헤더:**
   - **Name:** `Content-Type`
   - **Value:** `application/json`

### 4.4 HTTP Request Body 설정

**Send Body:**
- **"ON"** (활성화)

**Body Content Type:**
- **"JSON"** 선택

**Specify Body:**
- **"Using Fields Below"** 선택

**Body 필드에 입력:**

```json
{
  "reservationNumber": "{{ $json.reservationNumber }}",
  "guestName": "{{ $json.guestName }}",
  "email": "{{ $json.email || '' }}",
  "checkin": "{{ $json.checkin }}",
  "checkout": "{{ $json.checkout }}",
  "roomType": "{{ $json.roomType }}",
  "amount": "{{ $json.amount || 0 }}",
  "options": {{ JSON.stringify($json.options || []) }}
}
```

**또는 Expression 모드 사용:**

**Body Content Type:** `JSON`

**Specify Body:** `Using Expression`

**Expression:**
```javascript
{
  "reservationNumber": $json.reservationNumber,
  "guestName": $json.guestName,
  "email": $json.email || "",
  "checkin": $json.checkin,
  "checkout": $json.checkout,
  "roomType": $json.roomType,
  "amount": String($json.amount || 0),
  "options": $json.options || []
}
```

**Save** 클릭

---

## 5단계: Railway API Key 확인 및 생성

### 5.1 Railway API Key 확인

1. Railway 대시보드 접속: https://railway.app
2. **OUSCARAVAN** 서비스 선택
3. **"Variables"** 탭 클릭
4. **`N8N_API_KEY`** 변수 확인
5. 값 복사 (전체 복사)

### 5.2 Railway API Key 생성 (없는 경우)

**PowerShell에서 생성:**
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))
```

**또는 온라인 UUID 생성기 사용:**
- https://www.uuidgenerator.net/
- 두 개의 UUID를 연결하여 Base64 인코딩

**Railway에 추가:**
1. Railway 대시보드 → OUSCARAVAN 서비스 → Variables
2. **"Add Variable"** 클릭
3. **Name:** `N8N_API_KEY`
4. **Value:** 생성한 API Key 붙여넣기
5. **"Save"** 클릭

---

## 6단계: 워크플로우 테스트

### 6.1 수동 테스트

1. n8n 워크플로우 편집 화면에서 **"Execute Workflow"** 클릭
2. 또는 Gmail Trigger 노드에서 **"Fetch Test Event"** 클릭
3. 각 노드의 출력 확인:
   - **Gmail Trigger:** 이메일 데이터 확인
   - **Code:** 파싱된 예약 데이터 확인
   - **HTTP Request:** Railway API 응답 확인

### 6.2 출력 확인 항목

**Code 노드 출력 예시:**
```json
{
  "reservationNumber": "1124870293",
  "guestName": "장*령님",
  "email": "example@email.com",
  "checkin": "2026-01-26",
  "checkout": "2026-01-27",
  "roomType": "2인실(2인기준) 오션뷰카라반 예약",
  "amount": 150000,
  "options": [
    {
      "optionName": "오로라2개(1)",
      "optionPrice": 0,
      "category": "알림, 저장이벤트"
    }
  ]
}
```

**HTTP Request 노드 출력 예시:**
```json
{
  "id": "uuid",
  "reservationNumber": "1124870293",
  "guestName": "장*령님",
  "status": "pending",
  ...
}
```

### 6.3 Railway 로그 확인

1. Railway 대시보드 → OUSCARAVAN 서비스 → **"Logs"** 탭
2. 예약 생성 로그 확인:
   - `API Key authentication successful`
   - `Reservation created: { id: "...", ... }`

---

## 7단계: 워크플로우 활성화

### 7.1 워크플로우 저장

1. n8n 워크플로우 편집 화면에서 **"Save"** 클릭
2. 워크플로우 이름 입력 (예: "네이버 예약 자동 등록")

### 7.2 워크플로우 활성화

1. 워크플로우 상단의 **"Active"** 토글을 **"ON"**으로 설정
2. 또는 워크플로우 목록에서 **"Active"** 토글 활성화

---

## 🔧 문제 해결

### 문제 1: Gmail Trigger가 이메일을 감지하지 않음

**해결 방법:**
1. Gmail Trigger 필터 확인:
   - Search: `subject:[네이버 예약]`
   - Sender: `naverbooking_noreply@navercorp.com`
2. Gmail Credential 재인증
3. Gmail에서 실제로 해당 이메일이 있는지 확인

### 문제 2: Code 노드에서 데이터가 비어있음

**해결 방법:**
1. `emailBodyLength` 로그 확인
2. `hasPayload` 및 `hasSnippet` 확인
3. Gmail Trigger 출력에서 `payload` 또는 `snippet` 확인
4. 필요시 Gmail Get 노드 추가 (Gmail Trigger → Gmail Get → Code)

### 문제 3: HTTP Request에서 "Authorization failed" 에러

**해결 방법:**
1. Header Value의 Expression 모드(`fx`) 비활성화 확인
2. Railway API Key 값 확인
3. Railway Variables에서 `N8N_API_KEY` 확인
4. Railway 로그에서 헤더 확인

### 문제 4: 결제 금액이 0으로 추출됨

**해결 방법:**
1. Code 노드의 `emailBodyLength` 확인 (너무 짧으면 snippet만 사용 중)
2. `textBody` 로그 출력하여 실제 본문 확인
3. 정규식 패턴이 이메일 형식과 일치하는지 확인

---

## 📋 체크리스트

### Gmail Trigger 설정:
- [ ] Gmail Credential 생성/연결
- [ ] Poll Times: Every Minute
- [ ] Search: `subject:[네이버 예약]`
- [ ] Sender: `naverbooking_noreply@navercorp.com`

### Gmail Get 노드 설정 (전체 본문 필요 시):
- [ ] Gmail Get 노드 추가
- [ ] Operation: Get
- [ ] Message ID: `{{ $json.id }}`
- [ ] Format: Full
- [ ] Simple: No

### Extract from HTML 노드 설정 (선택사항):
- [ ] Extract from HTML 노드 추가 (필요한 경우만)
- [ ] Operation: Extract From HTML
- [ ] Input Binary Field: `{{ $json.htmlBody }}` 또는 `{{ $json.body }}`
- [ ] Gmail Get 노드 출력 확인하여 정확한 필드 경로 사용

### Code 노드 설정:
- [ ] Mode: Run Once for All Items
- [ ] 전체 코드 복사 및 붙여넣기
- [ ] Save 클릭

### HTTP Request 노드 설정:
- [ ] Method: POST
- [ ] URL: `https://ouscaravan-production.up.railway.app/api/admin/reservations`
- [ ] Send Headers: ON
- [ ] Header: `X-API-Key` = Railway API Key (Expression 모드 비활성화)
- [ ] Header: `Content-Type` = `application/json`
- [ ] Send Body: ON
- [ ] Body: JSON 형식으로 데이터 매핑

### Railway 설정:
- [ ] `N8N_API_KEY` 환경 변수 확인/생성
- [ ] Railway 로그에서 요청 확인

### 테스트:
- [ ] Gmail Trigger 테스트 실행
- [ ] Code 노드 출력 확인
- [ ] HTTP Request 노드 출력 확인
- [ ] Railway 로그에서 예약 생성 확인

### 워크플로우 활성화:
- [ ] 워크플로우 저장
- [ ] Active 토글 ON

---

## 📚 참고 문서

- [n8n Gmail 노드 문서](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.gmail/)
- [n8n Code 노드 문서](https://docs.n8n.io/code-examples/methods-variables-examples/)
- [n8n HTTP Request 노드 문서](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)
- [Gmail API 메시지 형식](https://developers.google.com/gmail/api/reference/rest/v1/users.messages)

---

**문서 버전**: 2.0  
**최종 업데이트**: 2026-01-07
