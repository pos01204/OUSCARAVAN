# 네이버 예약 확정/취소 트래킹 워크플로우 설정

## 📋 개요

네이버 예약 확정 및 취소 이메일을 모두 트래킹하여 자동으로 처리하는 워크플로우입니다.

**워크플로우 URL**: https://ourcaravan.app.n8n.cloud/workflow/0nMXGSoqk6EBmHTc  
**Gmail 주소**: caiius960122@gmail.com

---

## 1단계: Gmail Trigger 필터 설정 (업데이트)

### 현재 화면에서:

**Search 필드:**
```
subject:[네이버 예약]
```

**설명:**
- 제목에 "[네이버 예약]"이 포함된 모든 이메일 감지
- 예약 확정과 취소 모두 포함

**Sender 필드:**
```
naver.com
```

**또는 더 정확하게:**
```
N 예약
```

### 최종 필터 설정:

```
Filters:
  Search: subject:[네이버 예약]
  Sender: naver.com
```

---

## 2단계: IF 노드 설정 (예약 유형 구분)

### IF 노드 추가:

1. Gmail Trigger 노드 우측의 **"+" 버튼** 클릭
2. 검색: **"IF"**
3. **"IF"** 노드 선택

### IF 노드 설정 (예약 확정 확인):

**Condition**: `String`

**Value 1**: `{{ $json.subject }}`  
**Operation**: `Contains`  
**Value 2**: `확정`

**설명:**
- 제목에 "확정"이 포함되면 True (예약 확정)
- 제목에 "확정"이 없으면 False (예약 취소)

**Save** 클릭

---

## 3단계: Code 노드 추가 (이메일 파싱 - 업데이트)

### 예약 확정 처리 (IF True):

1. IF 노드의 **True** 출력에서 **"+" 버튼** 클릭
2. 검색: **"Code"**
3. **"Code"** 노드 선택

**Mode**: `Run Once for All Items`

**JavaScript Code** (네이버 예약 템플릿에 맞춘 버전):

```javascript
// 이메일 본문 가져오기
const emailBody = $input.all()[0].json.body || '';
const htmlBody = $input.all()[0].json.htmlBody || $input.all()[0].json.body || '';

// HTML 태그 제거
const textBody = htmlBody
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

// 이메일 유형 확인
const isConfirmed = $input.all()[0].json.subject.includes('확정');
const isCancelled = $input.all()[0].json.subject.includes('취소');

// 네이버 예약 템플릿에 맞춘 정규식 패턴
const patterns = {
  // 예약자명 (예: "이*국님", "김*서님")
  guestName: [
    /예약자명[:\s]*([^\n<]+님)/i,
    /예약자명[:\s]*([^\n<]+)/i
  ],
  
  // 예약번호 (예: "1122269060")
  reservationNumber: [
    /예약번호[:\s]*(\d+)/i,
    /예약번호[:\s]*([0-9]+)/i
  ],
  
  // 예약상품 (예: "4인실(기준2인, 1인추가2만원) 오션뷰카라반 예약")
  room: [
    /예약상품[:\s]*([^\n<]+)/i,
    /예약상품[:\s]*([^\n<]+예약)/i
  ],
  
  // 이용일시에서 시작일 추출 (예: "2026.01.04.(일)")
  checkin: [
    /이용일시[:\s]*(\d{4}\.\d{2}\.\d{2}\.[^\s~]+)/i,
    /이용일시[:\s]*(\d{4}[.\-]\d{2}[.\-]\d{2}[^\s~]+)/i
  ],
  
  // 이용일시에서 종료일 추출 (예: "2026.01.05.(월)")
  checkout: [
    /이용일시[:\s]*\d{4}\.\d{2}\.\d{2}\.[^\s~]+\s*~\s*(\d{4}\.\d{2}\.\d{2}\.[^\s~]+)/i,
    /이용일시[:\s]*\d{4}[.\-]\d{2}[.\-]\d{2}[^\s~]+\s*~\s*(\d{4}[.\-]\d{2}[.\-]\d{2}[^\s~]+)/i
  ],
  
  // 결제금액 (예: "180,000원")
  amount: [
    /결제금액[:\s]*([0-9,]+원)/i,
    /결제금액[:\s]*([0-9,]+)/i
  ],
  
  // 환불금액 (취소 시)
  refundAmount: [
    /환불금액[:\s]*([0-9,]+원)/i,
    /환불금액[:\s]*([0-9,]+)/i
  ],
  
  // 예약신청 일시
  reservationDate: [
    /예약신청\s*일시[:\s]*(\d{4}\.\d{2}\.\d{2}\.\s*\d{2}:\d{2}:\d{2})/i,
    /예약신청\s*일시[:\s]*(\d{4}[.\-]\d{2}[.\-]\d{2}[.\-]\s*\d{2}:\d{2}:\d{2})/i
  ],
  
  // 예약취소 일시 (취소 시)
  cancellationDate: [
    /예약취소\s*일시[:\s]*(\d{4}\.\d{2}\.\d{2}\.\s*\d{2}:\d{2}:\d{2})/i,
    /예약취소\s*일시[:\s]*(\d{4}[.\-]\d{2}[.\-]\d{2}[.\-]\s*\d{2}:\d{2}:\d{2})/i
  ]
};

// 정보 추출 함수
function extractInfo(patternList, source) {
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
  
  // "2026.01.04.(일)" 형식을 "2026-01-04"로 변환
  const match = dateStr.match(/(\d{4})[.\-](\d{2})[.\-](\d{2})/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  
  return null;
}

// 정보 추출
const guestName = extractInfo(patterns.guestName, textBody) || 
                  extractInfo(patterns.guestName, htmlBody) || '';
const reservationNumber = extractInfo(patterns.reservationNumber, textBody) || 
                          extractInfo(patterns.reservationNumber, htmlBody) || '';
const room = extractInfo(patterns.room, textBody) || 
            extractInfo(patterns.room, htmlBody) || '';
const checkinRaw = extractInfo(patterns.checkin, textBody) || 
                   extractInfo(patterns.checkin, htmlBody);
const checkoutRaw = extractInfo(patterns.checkout, textBody) || 
                    extractInfo(patterns.checkout, htmlBody);
const amount = extractInfo(patterns.amount, textBody) || 
               extractInfo(patterns.amount, htmlBody) || '';
const reservationDate = extractInfo(patterns.reservationDate, textBody) || 
                        extractInfo(patterns.reservationDate, htmlBody) || '';

const checkin = normalizeDate(checkinRaw);
const checkout = normalizeDate(checkoutRaw);

// 이메일 유형
const emailType = isConfirmed ? 'confirmed' : (isCancelled ? 'cancelled' : 'unknown');

// 결과 반환
return [{
  emailType: emailType,
  guestName: guestName,
  reservationNumber: reservationNumber,
  room: room,
  checkin: checkin,
  checkout: checkout,
  amount: amount,
  reservationDate: reservationDate,
  email: $input.all()[0].json.from || '',
  emailSubject: $input.all()[0].json.subject || '',
  emailDate: $input.all()[0].json.date || '',
  rawBody: textBody.substring(0, 1000)
}];
```

**Save** 클릭

---

## 4단계: 예약 취소 처리 (IF False)

### 예약 취소 처리 노드 추가:

1. IF 노드의 **False** 출력에서 **"+" 버튼** 클릭
2. 검색: **"Code"**
3. **"Code"** 노드 선택

**Mode**: `Run Once for All Items`

**JavaScript Code** (취소 이메일 파싱):

```javascript
// 이메일 본문 가져오기
const emailBody = $input.all()[0].json.body || '';
const htmlBody = $input.all()[0].json.htmlBody || $input.all()[0].json.body || '';

// HTML 태그 제거
const textBody = htmlBody
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

// 취소 정보 추출 패턴
const patterns = {
  guestName: [
    /예약자명[:\s]*([^\n<]+님)/i,
    /예약자명[:\s]*([^\n<]+)/i
  ],
  reservationNumber: [
    /예약번호[:\s]*(\d+)/i
  ],
  cancellationDate: [
    /예약취소\s*일시[:\s]*(\d{4}\.\d{2}\.\d{2}\.\s*\d{2}:\d{2}:\d{2})/i
  ],
  refundAmount: [
    /환불금액[:\s]*([0-9,]+원)/i
  ]
};

function extractInfo(patternList, source) {
  for (const pattern of patternList) {
    const match = source.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}

const guestName = extractInfo(patterns.guestName, textBody) || '';
const reservationNumber = extractInfo(patterns.reservationNumber, textBody) || '';
const cancellationDate = extractInfo(patterns.cancellationDate, textBody) || '';
const refundAmount = extractInfo(patterns.refundAmount, textBody) || '';

return [{
  emailType: 'cancelled',
  guestName: guestName,
  reservationNumber: reservationNumber,
  cancellationDate: cancellationDate,
  refundAmount: refundAmount,
  email: $input.all()[0].json.from || '',
  emailSubject: $input.all()[0].json.subject || '',
  emailDate: $input.all()[0].json.date || ''
}];
```

**Save** 클릭

---

## 5단계: 예약 확정 처리 (카카오톡 발송)

### Set 노드 추가 (확정 처리):

1. 예약 확정 Code 노드 우측의 **"+" 버튼** 클릭
2. 검색: **"Set"**
3. **"Set"** 노드 선택

**Values**:

| Name | Value |
|------|-------|
| `guest` | `{{ $json.guestName }}` |
| `room` | `{{ $json.room }}` |
| `checkin` | `{{ $json.checkin }}` |
| `checkout` | `{{ $json.checkout }}` |
| `reservationNumber` | `{{ $json.reservationNumber }}` |
| `amount` | `{{ $json.amount }}` |
| `email` | `{{ $json.email }}` |

**Save** 클릭

### Function 노드 추가 (고유 링크 생성):

1. Set 노드 우측의 **"+" 버튼** 클릭
2. 검색: **"Function"**
3. **"Function"** 노드 선택

**Function Code**:

```javascript
// 고유 토큰 생성
const data = `${$input.item.json.guest}-${$input.item.json.reservationNumber}-${Date.now()}-${Math.random()}`;
const token = Buffer.from(data).toString('base64')
  .replace(/[+/=]/g, '')
  .substring(0, 32);

// 기본 URL
const baseUrl = $env.WEB_APP_URL || 'https://ouscaravan.com';

// 고유 링크 생성
const params = new URLSearchParams({
  guest: $input.item.json.guest || '',
  room: $input.item.json.room || '',
  checkin: $input.item.json.checkin || '',
  checkout: $input.item.json.checkout || '',
  token: token,
  reservationNumber: $input.item.json.reservationNumber || ''
});

const link = `${baseUrl}/home?${params.toString()}`;

return {
  ...$input.item.json,
  token: token,
  link: link,
  createdAt: new Date().toISOString()
};
```

**Save** 클릭

### HTTP Request 노드 추가 (카카오톡 발송):

1. Function 노드 우측의 **"+" 버튼** 클릭
2. 검색: **"HTTP Request"**
3. **"HTTP Request"** 노드 선택

**Method**: `POST`  
**URL**: `https://kapi.kakao.com/v2/api/talk/memo/default/send`

**Authentication**: `Generic Credential Type` → `Header Auth`  
**Header Name**: `Authorization`  
**Header Value**: `Bearer {{ $env.KAKAO_ACCESS_TOKEN }}`

**Headers**:
| Name | Value |
|------|-------|
| `Content-Type` | `application/x-www-form-urlencoded` |

**Body** (Form-Urlencoded):
| Name | Value |
|------|-------|
| `template_object` | `{"object_type":"text","text":"{{ $json.guest }}님, OUSCARAVAN 예약이 완료되었습니다!\n\n예약번호: {{ $json.reservationNumber }}\n📅 체크인: {{ $json.checkin }}\n📅 체크아웃: {{ $json.checkout }}\n🏠 객실: {{ $json.room }}\n💰 결제금액: {{ $json.amount }}\n\n아래 링크를 클릭하여 컨시어지 서비스를 이용하세요:\n{{ $json.link }}","link":{"web_url":"{{ $json.link }}","mobile_web_url":"{{ $json.link }}"},"button_title":"컨시어지 서비스 이용하기"}` |

**Save** 클릭

---

## 6단계: 예약 취소 처리 (관리자 알림)

### Set 노드 추가 (취소 처리):

1. 예약 취소 Code 노드 우측의 **"+" 버튼** 클릭
2. 검색: **"Set"**
3. **"Set"** 노드 선택

**Values**:

| Name | Value |
|------|-------|
| `guest` | `{{ $json.guestName }}` |
| `reservationNumber` | `{{ $json.reservationNumber }}` |
| `cancellationDate` | `{{ $json.cancellationDate }}` |
| `refundAmount` | `{{ $json.refundAmount }}` |

**Save** 클릭

### 관리자 알림 (선택사항):

1. Set 노드 우측의 **"+" 버튼** 클릭
2. 검색: **"HTTP Request"** 또는 **"Email"**
3. 관리자에게 취소 알림 발송

---

## 📋 전체 워크플로우 구조

```
[Gmail Trigger]
  ↓
[IF - 확정/취소 구분]
  ├─ True (확정)
  │   ↓
  │   [Code - 확정 이메일 파싱]
  │   ↓
  │   [Set - 데이터 정리]
  │   ↓
  │   [Function - 고유 링크 생성]
  │   ↓
  │   [HTTP Request - 카카오톡 발송]
  │
  └─ False (취소)
      ↓
      [Code - 취소 이메일 파싱]
      ↓
      [Set - 취소 데이터 정리]
      ↓
      [관리자 알림] (선택사항)
```

---

## ✅ 체크리스트

- [ ] Gmail Trigger 필터 설정
  - [ ] Search: `subject:[네이버 예약]`
  - [ ] Sender: `naver.com`
- [ ] IF 노드 추가 (확정/취소 구분)
- [ ] 예약 확정 처리:
  - [ ] Code 노드 (확정 이메일 파싱)
  - [ ] Set 노드
  - [ ] Function 노드 (링크 생성)
  - [ ] HTTP Request 노드 (카카오톡 발송)
- [ ] 예약 취소 처리:
  - [ ] Code 노드 (취소 이메일 파싱)
  - [ ] Set 노드
  - [ ] 관리자 알림 (선택사항)
- [ ] 환경 변수 설정
- [ ] 워크플로우 저장 및 활성화

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
