# n8n Code 노드 - HTML 노드 출력 처리 가이드

## 🔍 문제점

**HTML 노드 출력:**
```json
[
  {
    "예약번호": "1125503377 네이버 페이\n[...]",
    "예약자명": "제*길님",
    "이용일시": "2026.01.08.(목)~2026.01.09.(금) (1박 2일)",
    "결제금액": "4인실(기준2인, 1인추가2만원) 오션뷰카라반 예약(1) 150,000원 + [알림,저장이벤트] 오로라2개(1) 0원 = 150,000원",
    "상품명": "4인실(기준2인, 1인추가2만원) 오션뷰카라반 예약"
  }
]
```

**Code 노드 출력 (모든 필드가 비어있음):**
```json
{
  "reservationNumber": "",
  "guestName": "",
  "email": "",
  "checkin": "",
  "checkout": "",
  "roomType": "",
  "amount": 0
}
```

**원인:**
- HTML 노드의 출력은 이미 구조화된 JSON 형태
- Code 노드는 `textBody`에서 정규식으로 파싱하려고 함
- HTML 노드 출력을 사용하지 않고 있음

---

## ✅ 해결 방법: Code 노드 수정

HTML 노드의 출력을 직접 사용하도록 Code 노드를 수정합니다.

### 수정된 Code 노드 코드

```javascript
// HTML 노드에서 전달된 데이터 가져오기
// HTML 노드 출력이 배열인 경우 첫 번째 요소 사용
let htmlOutput = $input.item.json;
if (Array.isArray(htmlOutput) && htmlOutput.length > 0) {
  htmlOutput = htmlOutput[0];
}
const allInputs = $input.all();

// HTML 노드의 출력이 있는 경우 직접 사용
let reservationNumber = '';
let guestName = '';
let checkin = '';
let checkout = '';
let roomType = '';
let amount = 0;
let options = [];

// HTML 노드 출력에서 데이터 추출
if (htmlOutput['예약번호']) {
  // 예약번호에서 숫자만 추출 (이미지 URL 등 제거)
  const reservationNumberMatch = htmlOutput['예약번호'].match(/(\d+)/);
  reservationNumber = reservationNumberMatch ? reservationNumberMatch[1] : '';
}

if (htmlOutput['예약자명']) {
  // "님" 제거
  guestName = htmlOutput['예약자명'].replace(/님\s*$/, '').trim();
}

if (htmlOutput['이용일시']) {
  // "2026.01.08.(목)~2026.01.09.(금) (1박 2일)" 형식 파싱
  const dateMatch = htmlOutput['이용일시'].match(/(\d{4})\.(\d{2})\.(\d{2})\./);
  if (dateMatch) {
    checkin = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
  }
  
  // 체크아웃 날짜 추출
  const checkoutMatch = htmlOutput['이용일시'].match(/~(\d{4})\.(\d{2})\.(\d{2})\./);
  if (checkoutMatch) {
    checkout = `${checkoutMatch[1]}-${checkoutMatch[2]}-${checkoutMatch[3]}`;
  }
}

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
      optionPrice: 0, // 옵션 가격은 별도로 추출 필요
      category: tags.join(',')
    });
  }
}

// 이메일 주소 추출 (HTML 노드 출력에는 없으므로 이전 노드에서 가져오기)
let email = '';
// Gmail Trigger 또는 Gmail Get 노드에서 이메일 주소 가져오기 시도
const previousData = $input.all();
if (previousData && previousData.length > 0) {
  const gmailData = previousData[0].json;
  
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

---

## 🔄 HTML 노드 출력과 기존 파싱 로직 통합 버전

HTML 노드 출력이 있으면 사용하고, 없으면 기존 파싱 로직을 사용하는 통합 버전:

```javascript
// HTML 노드 또는 Gmail 데이터 가져오기
const inputData = $input.item.json;
const allInputs = $input.all();

// HTML 노드 출력 확인
const hasHtmlOutput = inputData['예약번호'] || inputData['예약자명'] || inputData['이용일시'];

let reservationNumber = '';
let guestName = '';
let email = '';
let checkin = '';
let checkout = '';
let roomType = '';
let amount = 0;
let options = [];

if (hasHtmlOutput) {
  // HTML 노드 출력 사용
  console.log('Using HTML node output');
  
  // 예약번호 추출
  if (inputData['예약번호']) {
    const reservationNumberMatch = inputData['예약번호'].match(/(\d+)/);
    reservationNumber = reservationNumberMatch ? reservationNumberMatch[1] : '';
  }
  
  // 예약자명 추출
  if (htmlData['예약자명']) {
    guestName = htmlData['예약자명'].replace(/님\s*$/, '').trim();
  }
  
  // 이용일시에서 체크인/체크아웃 추출
  if (htmlData['이용일시']) {
    const dateMatch = htmlData['이용일시'].match(/(\d{4})\.(\d{2})\.(\d{2})\./);
    if (dateMatch) {
      checkin = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
    }
    
    const checkoutMatch = htmlData['이용일시'].match(/~(\d{4})\.(\d{2})\.(\d{2})\./);
    if (checkoutMatch) {
      checkout = `${checkoutMatch[1]}-${checkoutMatch[2]}-${checkoutMatch[3]}`;
    }
  }
  
  // 상품명 추출
  if (htmlData['상품명']) {
    roomType = htmlData['상품명'].trim();
  }
  
  // 결제금액에서 총액 추출
  if (htmlData['결제금액']) {
    const totalMatch = htmlData['결제금액'].match(/=\s*(\d{1,3}(?:,\d{3})*)\s*원/i);
    if (totalMatch) {
      amount = parseInt(totalMatch[1].replace(/,/g, '')) || 0;
    }
    
    // 옵션 추출
    const optionPattern = /\[([^\]]+)\]\s*([^\n\r]+?)(?:\s*\d+원|$)/g;
    let optionMatch;
    while ((optionMatch = optionPattern.exec(htmlData['결제금액'])) !== null) {
      const tags = optionMatch[1].split(',').map(tag => tag.trim());
      const optionName = optionMatch[2].trim();
      options.push({
        optionName: optionName,
        optionPrice: 0,
        category: tags.join(',')
      });
    }
  }
  
  // 이메일 주소는 이전 노드에서 가져오기
  if (allInputs && allInputs.length > 0) {
    const gmailData = allInputs[0].json;
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
  }
} else {
  // 기존 파싱 로직 사용 (Gmail Trigger/Gmail Get 직접 연결 시)
  console.log('Using email body parsing');
  
  const emailData = inputData;
  
  // 전체 이메일 본문 가져오기
  let emailBody = '';
  
  if (emailData.payload) {
    emailBody = extractBodyFromPayload(emailData.payload);
  }
  
  if (!emailBody && emailData.snippet) {
    emailBody = emailData.snippet;
  }
  
  if (!emailBody && emailData.body) {
    emailBody = emailData.body;
  }
  
  const textBody = emailBody
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // 기존 파싱 로직
  const reservationNumberMatch = textBody.match(/예약번호[:\s]*(\d+)/i);
  reservationNumber = reservationNumberMatch ? reservationNumberMatch[1] : '';
  
  const guestNameMatch = textBody.match(/예약자명[:\s]*([^\n\r]+?)(?:\s*예약신청|$)/i);
  guestName = guestNameMatch ? guestNameMatch[1].trim().replace(/\s+/g, ' ') : '';
  
  const emailMatch = textBody.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
  email = emailMatch ? emailMatch[1] : '';
  
  const checkinMatch = textBody.match(/이용일시[:\s]*(\d{4})\.(\d{2})\.(\d{2})\./i);
  if (checkinMatch) {
    checkin = `${checkinMatch[1]}-${checkinMatch[2]}-${checkinMatch[3]}`;
  }
  
  const checkoutMatch = textBody.match(/~(\d{4})\.(\d{2})\.(\d{2})\./i);
  if (checkoutMatch) {
    checkout = `${checkoutMatch[1]}-${checkoutMatch[2]}-${checkoutMatch[3]}`;
  }
  
  const roomTypeMatch = textBody.match(/예약상품[:\s]*([^\n\r]+?)(?:\s*이용일시|$)/i);
  roomType = roomTypeMatch ? roomTypeMatch[1].trim() : '';
  
  const totalMatch = textBody.match(/=\s*(\d{1,3}(?:,\d{3})*)\s*원/i);
  if (totalMatch) {
    amount = parseInt(totalMatch[1].replace(/,/g, '')) || 0;
  }
  
  const optionPattern = /\[([^\]]+)\]\s*([^\n\r]+?)(?:\s*\d+원|$)/g;
  let optionMatch;
  while ((optionMatch = optionPattern.exec(textBody)) !== null) {
    const tags = optionMatch[1].split(',').map(tag => tag.trim());
    const optionName = optionMatch[2].trim();
    options.push({
      optionName: optionName,
      optionPrice: 0,
      category: tags.join(',')
    });
  }
}

// payload에서 본문 추출하는 함수 (기존 파싱 로직용)
function extractBodyFromPayload(payload) {
  let body = '';
  
  if (payload.body && payload.body.data) {
    try {
      body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    } catch (e) {
      console.log('Failed to decode body.data:', e);
    }
  }
  
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body && part.body.data) {
        try {
          const decoded = Buffer.from(part.body.data, 'base64').toString('utf-8');
          body += decoded + '\n';
        } catch (e) {
          console.log('Failed to decode text/plain part:', e);
        }
      }
      else if (part.mimeType === 'text/html' && part.body && part.body.data) {
        try {
          const htmlBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
          const textFromHtml = htmlBody.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
          body += textFromHtml + '\n';
        } catch (e) {
          console.log('Failed to decode HTML part:', e);
        }
      }
      else if (part.parts) {
        body += extractBodyFromPayload(part);
      }
    }
  }
  
  return body;
}

// 디버깅을 위한 로그
console.log('Parsed reservation data:', {
  reservationNumber,
  guestName,
  email: email || '(not found)',
  checkin,
  checkout,
  roomType,
  amount: amount || 0,
  optionsCount: options.length,
  source: hasHtmlOutput ? 'HTML node' : 'Email body parsing'
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

---

## 📋 적용 방법

### 1단계: Code 노드 열기

1. n8n 워크플로우에서 **Code 노드** 클릭
2. **Mode**: `Run Once for All Items` 확인

### 2단계: 코드 교체

1. 기존 코드 전체 선택 및 삭제
2. 위의 **수정된 코드 (HTML 노드 출력 처리)** 복사하여 붙여넣기
3. **"Save"** 클릭

### 3단계: 테스트

1. **"Execute Workflow"** 클릭
2. Code 노드 출력 확인:
   - `reservationNumber`: 예약번호가 추출되었는지 확인
   - `guestName`: 예약자명이 추출되었는지 확인
   - `checkin`, `checkout`: 날짜가 올바르게 추출되었는지 확인
   - `amount`: 금액이 올바르게 추출되었는지 확인

---

## 🔧 주요 변경 사항

### 1. HTML 노드 출력 직접 사용

**이전:**
```javascript
const emailData = $input.item.json;
const textBody = emailBody.replace(/<[^>]*>/g, ' ').trim();
const reservationNumberMatch = textBody.match(/예약번호[:\s]*(\d+)/i);
```

**수정:**
```javascript
const htmlOutput = $input.item.json;
if (htmlOutput['예약번호']) {
  const reservationNumberMatch = htmlOutput['예약번호'].match(/(\d+)/);
  reservationNumber = reservationNumberMatch ? reservationNumberMatch[1] : '';
}
```

### 2. 예약번호 추출 개선

**HTML 노드 출력:**
```
"예약번호": "1125503377 네이버 페이\n[...]"
```

**추출 로직:**
- 숫자만 추출 (이미지 URL 등 제거)
- 정규식: `/(\d+)/`

### 3. 예약자명 추출 개선

**HTML 노드 출력:**
```
"예약자명": "제*길님"
```

**추출 로직:**
- "님" 제거
- `.replace(/님\s*$/, '')`

### 4. 이용일시에서 체크인/체크아웃 추출

**HTML 노드 출력:**
```
"이용일시": "2026.01.08.(목)~2026.01.09.(금) (1박 2일)"
```

**추출 로직:**
- 체크인: 첫 번째 날짜 패턴 추출
- 체크아웃: `~` 다음 날짜 패턴 추출

---

## 📚 참고

- HTML 노드의 출력 구조는 CSS Selector 설정에 따라 달라질 수 있습니다
- HTML 노드에서 추출하지 못한 데이터는 기존 파싱 로직으로 fallback 가능
- 통합 버전 코드를 사용하면 두 가지 방식 모두 지원

---

**문서 버전**: 1.0  
**최종 업데이트**: 2026-01-07
