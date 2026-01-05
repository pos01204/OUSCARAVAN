# 네이버톡톡 SMS에서 전화번호 추출 가이드

## 📋 개요

네이버톡톡으로 오는 SMS에 전화번호가 포함되어 있다는 점을 활용하여, 특정 번호로 받은 SMS에서 전화번호를 추출하는 방법입니다.

**장점:**
- ✅ 이메일보다 즉시 확인 가능
- ✅ 전화번호가 포함되어 있음
- ✅ 네이버 예약 관리 페이지 API 호출 불필요
- ✅ 더 간단한 구현

---

## 🔍 방법 1: Gmail로 오는 SMS 알림 이메일 감지

네이버톡톡 SMS가 Gmail로 알림 이메일로 전송되는 경우, 이를 감지하여 전화번호를 추출합니다.

### 1-1. Gmail Trigger 설정

**Gmail Trigger 노드 추가:**

1. **Gmail Trigger 노드** 추가
2. **Event**: `Message Received`
3. **Filters**:
   - **From**: `talktalk@naver.com` 또는 네이버톡톡 발신 번호
   - **Subject**: `[네이버톡톡]` 또는 SMS 관련 키워드
   - **Search**: `from:talktalk@naver.com subject:SMS`

### 1-2. SMS 내용 파싱

**Code 노드 추가:**

```javascript
// Gmail로 온 SMS 알림 이메일에서 전화번호 추출
const input = $input.all()[0].json;

// 이메일 본문 가져오기
const emailBody = input.body || input.htmlBody || input.snippet || '';

// HTML 태그 제거
const textBody = emailBody
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

// SMS 내용에서 전화번호 추출 패턴
const phonePatterns = [
  // "전화번호: 010-1234-5678" 형식
  /전화번호[:\s]*([0-9-()\s]+)/i,
  // "연락처: 010-1234-5678" 형식
  /연락처[:\s]*([0-9-()\s]+)/i,
  // "휴대폰: 010-1234-5678" 형식
  /휴대폰[:\s]*([0-9-()\s]+)/i,
  // "010-1234-5678" 형식 (직접)
  /010-?[0-9]{4}-?[0-9]{4}/,
  // "01[0-9]-[0-9]{3,4}-[0-9]{4}" 형식
  /01[0-9]-?[0-9]{3,4}-?[0-9]{4}/
];

let phone = '';
for (const pattern of phonePatterns) {
  const match = textBody.match(pattern);
  if (match) {
    phone = (match[1] || match[0]).replace(/[-\s()]/g, '').trim();
    if (phone.length >= 10 && phone.length <= 11) {
      break;
    }
  }
}

// 예약번호 추출 (SMS 내용에서)
const reservationPatterns = [
  /예약번호[:\s]*(\d+)/i,
  /예약[:\s]*번호[:\s]*(\d+)/i,
  /예약[:\s]*(\d{10,})/i
];

let reservationNumber = '';
for (const pattern of reservationPatterns) {
  const match = textBody.match(pattern);
  if (match) {
    reservationNumber = match[1] || match[0];
    break;
  }
}

// 게스트 이름 추출 (선택사항)
const guestNamePatterns = [
  /예약자[:\s]*([^\n<]+님)/i,
  /예약자[:\s]*([^\n<]+)/i,
  /([^\n<]+님)[\s]*예약/i
];

let guestName = '';
for (const pattern of guestNamePatterns) {
  const match = textBody.match(pattern);
  if (match) {
    guestName = (match[1] || match[0]).trim();
    break;
  }
}

return [{
  phone: phone,
  reservationNumber: reservationNumber,
  guestName: guestName,
  smsContent: textBody.substring(0, 500),
  emailSubject: input.Subject || input.subject || '',
  emailFrom: input.From || input.from || ''
}];
```

---

## 🔍 방법 2: SMS 수신 서비스 API 활용

SMS 수신 서비스를 사용하여 특정 번호로 오는 SMS를 받고, API로 조회합니다.

### 2-1. SMS 수신 서비스 선택

**옵션:**
- **SolAPI SMS 수신 서비스**
- **네이버 클라우드 플랫폼 SMS**
- **기타 SMS 수신 서비스**

### 2-2. SolAPI SMS 수신 서비스 사용

**SolAPI 콘솔에서:**

1. **SMS 수신 서비스 활성화**
2. **수신 전용 번호 발급**
3. **수신 SMS 조회 API 사용**

**n8n HTTP Request 노드 설정:**

1. **HTTP Request 노드 추가**
2. **Method**: `GET`
3. **URL**: 
```
https://api.solapi.com/messages/v4/list
```
4. **Authentication**: 
   - **Type**: `Header Auth`
   - **Name**: `Authorization`
   - **Value**: `HMAC-SHA256 ...` (SolAPI 인증)
5. **Query Parameters**:
   - `limit`: `10`
   - `startKey`: (선택사항)

### 2-3. 수신 SMS에서 전화번호 추출

**Code 노드 추가:**

```javascript
// SolAPI 수신 SMS에서 전화번호 추출
const messages = $input.item.json.data || [];

// 최신 SMS 찾기
const latestSMS = messages[0];

if (!latestSMS) {
  return [];
}

// SMS 내용
const smsContent = latestSMS.text || latestSMS.message || '';

// 전화번호 추출 패턴
const phonePatterns = [
  /전화번호[:\s]*([0-9-()\s]+)/i,
  /연락처[:\s]*([0-9-()\s]+)/i,
  /010-?[0-9]{4}-?[0-9]{4}/,
  /01[0-9]-?[0-9]{3,4}-?[0-9]{4}/
];

let phone = '';
for (const pattern of phonePatterns) {
  const match = smsContent.match(pattern);
  if (match) {
    phone = (match[1] || match[0]).replace(/[-\s()]/g, '').trim();
    if (phone.length >= 10 && phone.length <= 11) {
      break;
    }
  }
}

// 예약번호 추출
const reservationPatterns = [
  /예약번호[:\s]*(\d+)/i,
  /예약[:\s]*(\d{10,})/i
];

let reservationNumber = '';
for (const pattern of reservationPatterns) {
  const match = smsContent.match(pattern);
  if (match) {
    reservationNumber = match[1] || match[0];
    break;
  }
}

return [{
  phone: phone,
  reservationNumber: reservationNumber,
  smsContent: smsContent,
  smsFrom: latestSMS.from || '',
  smsDate: latestSMS.dateCreated || ''
}];
```

---

## 🔍 방법 3: n8n Schedule Trigger로 주기적 SMS 조회

주기적으로 SMS 수신 서비스 API를 호출하여 새로운 SMS를 확인합니다.

### 3-1. Schedule Trigger 설정

1. **Schedule Trigger 노드 추가**
2. **Trigger Times**: `Every 1 minute` (또는 원하는 주기)
3. **Timezone**: `Asia/Seoul`

### 3-2. HTTP Request로 SMS 조회

**Schedule Trigger 다음에 HTTP Request 노드 추가:**

**Method**: `GET`

**URL**: 
```
https://api.solapi.com/messages/v4/list
```

**Authentication**: SolAPI 인증

**Query Parameters**:
- `limit`: `10`
- `startDate`: `{{ $now.minus({minutes: 5}).toISO() }}` (최근 5분)

### 3-3. IF 노드로 필터링

**HTTP Request 다음에 IF 노드 추가:**

**조건:**
- **Value 1**: `{{ $json.from }}`
- **Operation**: `Contains`
- **Value 2**: `네이버톡톡` 또는 특정 번호

### 3-4. 전화번호 추출

위의 Code 노드 사용

---

## 🔍 방법 4: Gmail로 오는 SMS 알림 이메일 활용 (권장)

가장 간단하고 실용적인 방법입니다.

### 4-1. Gmail Trigger 설정

**Gmail Trigger 노드 추가:**

1. **Event**: `Message Received`
2. **Filters**:
   - **From**: `talktalk@naver.com` 또는 네이버톡톡 발신 번호
   - **Subject**: `[네이버톡톡]` 또는 SMS 관련 키워드
   - **Search**: 
     ```
     from:talktalk@naver.com subject:[네이버톡톡]
     ```

### 4-2. SMS 내용 파싱 Code 노드

**Code 노드 추가:**

```javascript
// 네이버톡톡 SMS 알림 이메일에서 정보 추출
const input = $input.all()[0].json;

// 이메일 본문 가져오기
const emailBody = input.body || input.htmlBody || input.snippet || '';

// HTML 태그 제거
const textBody = emailBody
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

// 전화번호 추출 패턴
const phonePatterns = [
  /전화번호[:\s]*([0-9-()\s]+)/i,
  /연락처[:\s]*([0-9-()\s]+)/i,
  /휴대폰[:\s]*([0-9-()\s]+)/i,
  /010-?[0-9]{4}-?[0-9]{4}/,
  /01[0-9]-?[0-9]{3,4}-?[0-9]{4}/
];

let phone = '';
for (const pattern of phonePatterns) {
  const match = textBody.match(pattern);
  if (match) {
    phone = (match[1] || match[0]).replace(/[-\s()]/g, '').trim();
    if (phone.length >= 10 && phone.length <= 11) {
      break;
    }
  }
}

// 예약번호 추출
const reservationPatterns = [
  /예약번호[:\s]*(\d+)/i,
  /예약[:\s]*번호[:\s]*(\d+)/i,
  /예약[:\s]*(\d{10,})/i
];

let reservationNumber = '';
for (const pattern of reservationPatterns) {
  const match = textBody.match(pattern);
  if (match) {
    reservationNumber = match[1] || match[0];
    break;
  }
}

// 게스트 이름 추출
const guestNamePatterns = [
  /예약자[:\s]*([^\n<]+님)/i,
  /예약자[:\s]*([^\n<]+)/i
];

let guestName = '';
for (const pattern of guestNamePatterns) {
  const match = textBody.match(pattern);
  if (match) {
    guestName = (match[1] || match[0]).trim();
    break;
  }
}

// 체크인/체크아웃 날짜 추출
const datePatterns = {
  checkin: [
    /체크인[:\s]*(\d{4}[.\-]\d{2}[.\-]\d{2})/i,
    /이용일시[:\s]*(\d{4}[.\-]\d{2}[.\-]\d{2})/i
  ],
  checkout: [
    /체크아웃[:\s]*(\d{4}[.\-]\d{2}[.\-]\d{2})/i,
    /이용일시[:\s]*\d{4}[.\-]\d{2}[.\-]\d{2}[^\s~]+\s*~\s*(\d{4}[.\-]\d{2}[.\-]\d{2})/i
  ]
};

function extractDate(patternList, source) {
  for (const pattern of patternList) {
    const match = source.match(pattern);
    if (match && match[1]) {
      return match[1].replace(/\./g, '-');
    }
  }
  return null;
}

const checkin = extractDate(datePatterns.checkin, textBody);
const checkout = extractDate(datePatterns.checkout, textBody);

return [{
  phone: phone,
  reservationNumber: reservationNumber,
  guestName: guestName,
  checkin: checkin,
  checkout: checkout,
  smsContent: textBody.substring(0, 1000),
  emailSubject: input.Subject || input.subject || '',
  emailFrom: input.From || input.from || '',
  emailDate: input.date || input.Date || ''
}];
```

### 4-3. 예약 확정 이메일과 매칭

**IF 노드 추가:**

예약번호로 예약 확정 이메일과 매칭:

1. **예약 확정 이메일 데이터** (이전 워크플로우에서)
2. **SMS 데이터** (현재 워크플로우에서)
3. **예약번호로 매칭**

**Code 노드 추가 (데이터 병합):**

```javascript
// 예약 확정 이메일 데이터와 SMS 데이터 병합
const emailData = $('이메일 파싱').first().json;
const smsData = $input.item.json;

// 예약번호로 매칭 확인
if (emailData.reservationNumber === smsData.reservationNumber) {
  return {
    ...emailData,
    phone: smsData.phone, // SMS에서 추출한 전화번호 사용
    guestName: emailData.guestName || smsData.guestName,
    checkin: emailData.checkin || smsData.checkin,
    checkout: emailData.checkout || smsData.checkout
  };
}

// 매칭 실패 시 SMS 데이터만 반환
return smsData;
```

---

## 📋 최종 워크플로우 구조

### 옵션 A: SMS 우선 사용

```
[Gmail Trigger: 네이버톡톡 SMS 알림]
  ↓
[Code: SMS 내용 파싱 및 전화번호 추출]
  ↓
[IF: 전화번호 확인]
  ├─ True (전화번호 있음)
  │   ↓
  │   [Set: 데이터 정리]
  │   ↓
  │   [Code: 고유 링크 생성]
  │   ↓
  │   [Code: 전화번호 포맷 변환]
  │   ↓
  │   [SolAPI: 알림톡 발송]
  │
  └─ False (전화번호 없음)
      ↓
      [에러 로깅]
```

### 옵션 B: 이메일 + SMS 병합

```
[Gmail Trigger: 예약 확정 이메일]
  ↓
[Code: 이메일 파싱]
  ↓
[Gmail Trigger: 네이버톡톡 SMS 알림] (병렬)
  ↓
[Code: SMS 내용 파싱]
  ↓
[Code: 예약번호로 데이터 병합]
  ↓
[Set: 데이터 정리]
  ↓
[Code: 고유 링크 생성]
  ↓
[Code: 전화번호 포맷 변환]
  ↓
[SolAPI: 알림톡 발송]
```

---

## 🧪 테스트 방법

### 1단계: Gmail Trigger 테스트

1. 네이버톡톡 SMS 수신
2. Gmail로 SMS 알림 이메일 확인
3. Gmail Trigger가 감지하는지 확인

### 2단계: SMS 파싱 테스트

1. Code 노드에서 **"Execute Node"** 클릭
2. 전화번호 추출 확인
3. 예약번호 추출 확인

### 3단계: 전체 플로우 테스트

1. 실제 네이버톡톡 SMS 수신
2. 전체 워크플로우 실행
3. 전화번호 추출 및 알림톡 발송 확인

---

## 🆘 문제 해결

### 문제 1: Gmail로 SMS 알림 이메일이 오지 않음

**원인:** 네이버톡톡 설정에서 이메일 알림이 비활성화됨

**해결:**
1. 네이버톡톡 설정 확인
2. 이메일 알림 활성화
3. 또는 SMS 수신 서비스 API 사용

### 문제 2: 전화번호 추출 실패

**원인:** SMS 내용 형식이 예상과 다름

**해결:**
1. 실제 SMS 내용 확인
2. 정규식 패턴 수정
3. 다양한 형식 지원

### 문제 3: 예약번호 매칭 실패

**원인:** 예약 확정 이메일과 SMS의 예약번호 형식이 다름

**해결:**
1. 예약번호 형식 통일
2. 정규식으로 숫자만 추출
3. 매칭 로직 개선

---

## 💡 추가 고려사항

### SMS 알림 이메일 필터링

특정 번호로 오는 SMS만 처리:

**Gmail Trigger 필터:**
```
from:talktalk@naver.com subject:[네이버톡톡] "예약"
```

### 중복 처리 방지

같은 SMS를 여러 번 처리하지 않도록:

1. **IF 노드 추가**: 이미 처리된 SMS인지 확인
2. **데이터베이스 저장**: 처리된 SMS ID 저장
3. **중복 체크**: 새 SMS인지 확인

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
