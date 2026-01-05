# 이메일 파싱 코드 수정 가이드

## 🔍 문제 진단

**증상:**
- 모든 필드가 비어있음 (guestName, reservationNumber, room, checkin, checkout, amount 모두 empty)
- `rawBody`도 비어있음
- `email`, `emailSubject`, `emailDate`도 비어있음

**원인:**
- Gmail Trigger의 출력에서 `body` 또는 `htmlBody`가 비어있음
- 실제 이메일 본문이 `snippet` 또는 `payload` 안에 있을 수 있음
- Gmail Trigger의 출력 구조가 예상과 다름

---

## 🔧 해결 방법

### 수정된 코드 (Gmail Trigger 출력 구조에 맞춤)

```javascript
// Gmail Trigger 출력에서 이메일 본문 가져오기
const input = $input.all()[0].json;

// 이메일 본문을 여러 경로에서 시도
let emailBody = '';
let htmlBody = '';
let textBody = '';

// 방법 1: 직접 body 필드
if (input.body) {
  emailBody = input.body;
  htmlBody = input.htmlBody || input.body;
}
// 방법 2: payload에서 가져오기
else if (input.payload) {
  // payload.body 또는 payload.textBody
  emailBody = input.payload.body || input.payload.textBody || '';
  htmlBody = input.payload.htmlBody || input.payload.body || input.payload.textBody || '';
}
// 방법 3: snippet 사용 (최후의 수단)
else if (input.snippet) {
  emailBody = input.snippet;
  htmlBody = input.snippet;
}

// HTML 태그 제거
if (htmlBody) {
  textBody = htmlBody
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
} else if (emailBody) {
  textBody = emailBody
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// snippet도 텍스트로 사용 (정보가 있을 수 있음)
const snippetText = input.snippet || '';

// 전체 텍스트 (본문 + snippet)
const fullText = (textBody || emailBody || snippetText)
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

// 네이버 예약 템플릿에 맞춘 정규식 패턴
const patterns = {
  // 예약자명 (예: "이*종님", "김*서님")
  guestName: [
    /예약자명[:\s]*([^\n<]+님)/i,
    /예약자명[:\s]*([^\n<]+)/i
  ],
  
  // 예약번호 (예: "1122689451")
  reservationNumber: [
    /예약번호[:\s]*(\d+)/i,
    /예약번호[:\s]*([0-9]+)/i
  ],
  
  // 예약상품 (예: "4인실(기준2인, 1인추가2만원) 오션뷰카라반 예약")
  room: [
    /예약상품[:\s]*([^\n<]+예약)/i,
    /예약상품[:\s]*([^\n<]+)/i
  ],
  
  // 이용일시에서 시작일 추출 (예: "2026.01.05.(일)")
  checkin: [
    /이용일시[:\s]*(\d{4}\.\d{2}\.\d{2}\.[^\s~]+)/i,
    /이용일시[:\s]*(\d{4}[.\-]\d{2}[.\-]\d{2}[^\s~]+)/i
  ],
  
  // 이용일시에서 종료일 추출 (예: "2026.01.06.(화)")
  checkout: [
    /이용일시[:\s]*\d{4}\.\d{2}\.\d{2}\.[^\s~]+\s*~\s*(\d{4}\.\d{2}\.\d{2}\.[^\s~]+)/i,
    /이용일시[:\s]*\d{4}[.\-]\d{2}[.\-]\d{2}[^\s~]+\s*~\s*(\d{4}[.\-]\d{2}[.\-]\d{2}[^\s~]+)/i
  ],
  
  // 결제금액 (예: "180,000원")
  amount: [
    /결제금액[:\s]*([0-9,]+원)/i,
    /결제금액[:\s]*([0-9,]+)/i
  ],
  
  // 예약신청 일시
  reservationDate: [
    /예약신청\s*일시[:\s]*(\d{4}\.\d{2}\.\d{2}\.\s*\d{2}:\d{2}:\d{2})/i,
    /예약신청\s*일시[:\s]*(\d{4}[.\-]\d{2}[.\-]\d{2}[.\-]\s*\d{2}:\d{2}:\d{2})/i
  ]
};

// 정보 추출 함수
function extractInfo(patternList, source) {
  if (!source) return null;
  
  for (const pattern of patternList) {
    const match = source.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}

// 날짜 형식 정규화 (YYYY-MM-DD)
function normalizeDate(dateStr) {
  if (!dateStr) return null;
  
  // "2026.01.05.(일)" 형식을 "2026-01-05"로 변환
  const match = dateStr.match(/(\d{4})[.\-](\d{2})[.\-](\d{2})/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  
  return null;
}

// 정보 추출 (fullText에서 시도)
const guestName = extractInfo(patterns.guestName, fullText) || '';
const reservationNumber = extractInfo(patterns.reservationNumber, fullText) || '';
const room = extractInfo(patterns.room, fullText) || '';
const checkinRaw = extractInfo(patterns.checkin, fullText);
const checkoutRaw = extractInfo(patterns.checkout, fullText);
const amount = extractInfo(patterns.amount, fullText) || '';
const reservationDate = extractInfo(patterns.reservationDate, fullText) || '';

const checkin = normalizeDate(checkinRaw);
const checkout = normalizeDate(checkoutRaw);

// 이메일 정보 추출 (대소문자 구분 없이)
const email = input.From || input.from || input.payload?.From || '';
const emailSubject = input.Subject || input.subject || input.payload?.Subject || '';
const emailDate = input.date || input.Date || input.payload?.date || '';

// 결과 반환
return [{
  emailType: 'confirmed',
  guestName: guestName,
  reservationNumber: reservationNumber,
  room: room,
  checkin: checkin,
  checkout: checkout,
  amount: amount,
  reservationDate: reservationDate,
  email: email,
  emailSubject: emailSubject,
  emailDate: emailDate,
  rawBody: fullText.substring(0, 1000),
  // 디버깅용
  debug: {
    hasBody: !!input.body,
    hasHtmlBody: !!input.htmlBody,
    hasSnippet: !!input.snippet,
    hasPayload: !!input.payload,
    snippetLength: (input.snippet || '').length,
    fullTextLength: fullText.length
  }
}];
```

---

## 🎯 더 간단한 버전 (snippet 우선 사용)

스크린샷을 보면 `snippet`에 정보가 있으므로, snippet을 우선 사용:

```javascript
// Gmail Trigger 출력에서 이메일 본문 가져오기
const input = $input.all()[0].json;

// snippet 우선 사용 (Gmail Trigger에서 제공)
let textBody = input.snippet || '';

// body나 htmlBody가 있으면 사용
if (input.body || input.htmlBody) {
  const htmlBody = input.htmlBody || input.body || '';
  textBody = htmlBody
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// 전체 텍스트 정리
const fullText = textBody
  .replace(/\s+/g, ' ')
  .trim();

// 네이버 예약 템플릿에 맞춘 정규식 패턴
const patterns = {
  guestName: [
    /예약자명[:\s]*([^\n<]+님)/i,
    /예약자명[:\s]*([^\n<]+)/i
  ],
  reservationNumber: [
    /예약번호[:\s]*(\d+)/i
  ],
  room: [
    /예약상품[:\s]*([^\n<]+예약)/i,
    /예약상품[:\s]*([^\n<]+)/i
  ],
  checkin: [
    /이용일시[:\s]*(\d{4}\.\d{2}\.\d{2}\.[^\s~]+)/i
  ],
  checkout: [
    /이용일시[:\s]*\d{4}\.\d{2}\.\d{2}\.[^\s~]+\s*~\s*(\d{4}\.\d{2}\.\d{2}\.[^\s~]+)/i
  ],
  amount: [
    /결제금액[:\s]*([0-9,]+원)/i,
    /결제금액[:\s]*([0-9,]+)/i
  ]
};

function extractInfo(patternList, source) {
  if (!source) return null;
  for (const pattern of patternList) {
    const match = source.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}

function normalizeDate(dateStr) {
  if (!dateStr) return null;
  const match = dateStr.match(/(\d{4})[.\-](\d{2})[.\-](\d{2})/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return null;
}

// 정보 추출
const guestName = extractInfo(patterns.guestName, fullText) || '';
const reservationNumber = extractInfo(patterns.reservationNumber, fullText) || '';
const room = extractInfo(patterns.room, fullText) || '';
const checkinRaw = extractInfo(patterns.checkin, fullText);
const checkoutRaw = extractInfo(patterns.checkout, fullText);
const amount = extractInfo(patterns.amount, fullText) || '';

const checkin = normalizeDate(checkinRaw);
const checkout = normalizeDate(checkoutRaw);

// 이메일 정보 (대소문자 구분 없이)
const email = input.From || input.from || '';
const emailSubject = input.Subject || input.subject || '';
const emailDate = input.date || input.Date || '';

return [{
  emailType: 'confirmed',
  guestName: guestName,
  reservationNumber: reservationNumber,
  room: room,
  checkin: checkin,
  checkout: checkout,
  amount: amount,
  email: email,
  emailSubject: emailSubject,
  emailDate: emailDate,
  rawBody: fullText.substring(0, 1000)
}];
```

---

## 🔍 디버깅: 데이터 구조 확인

먼저 실제 데이터 구조를 확인하는 Code 노드를 만들어보세요:

```javascript
// 디버깅: Gmail Trigger 출력 구조 확인
const input = $input.all()[0].json;

return [{
  json: {
    // 원본 데이터
    hasBody: !!input.body,
    hasHtmlBody: !!input.htmlBody,
    hasSnippet: !!input.snippet,
    hasPayload: !!input.payload,
    
    // 각 필드의 실제 값 (일부만)
    body: (input.body || '').substring(0, 200),
    htmlBody: (input.htmlBody || '').substring(0, 200),
    snippet: input.snippet || '',
    
    // payload 구조
    payload: input.payload ? {
      hasBody: !!input.payload.body,
      hasTextBody: !!input.payload.textBody,
      hasHtmlBody: !!input.payload.htmlBody,
      body: (input.payload.body || '').substring(0, 200),
      textBody: (input.payload.textBody || '').substring(0, 200),
      htmlBody: (input.payload.htmlBody || '').substring(0, 200)
    } : null,
    
    // 이메일 헤더
    From: input.From,
    Subject: input.Subject,
    To: input.To
  }
}];
```

이 코드를 실행하여 실제 데이터 구조를 확인한 후, 확인된 경로를 사용하세요.

---

## 📋 체크리스트

### 코드 수정
- [ ] 위의 수정된 코드로 교체
- [ ] snippet 우선 사용하도록 수정
- [ ] "Execute Node"로 테스트
- [ ] OUTPUT에서 필드들이 채워져 있는지 확인

### 디버깅
- [ ] 디버깅 코드로 데이터 구조 확인
- [ ] 실제 이메일 본문 경로 확인
- [ ] 확인된 경로를 코드에 반영

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
