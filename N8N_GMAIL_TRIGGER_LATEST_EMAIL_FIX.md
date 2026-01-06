# n8n Gmail Trigger 최신 이메일 가져오기 수정

## 🔍 문제

**증상:**
- Gmail Trigger가 최신 이메일이 아닌 이전 이메일을 가져옴
- 실제 Gmail 최신 이메일: 예약번호 `1123757117` (2026.01.19-20)
- Trigger에서 파싱된 이메일: 예약번호 `1123900400` (2026.01.22-23)

**원인:**
- Gmail Trigger가 이전에 처리한 이메일을 다시 가져옴
- 또는 필터 설정이 너무 넓어서 여러 이메일 중 하나를 선택
- Gmail API의 이메일 순서 문제

---

## ✅ 해결 방법

### 방법 1: Gmail Trigger 필터 개선

**Gmail Trigger 설정:**

1. **"Gmail Trigger"** 노드 클릭
2. **Filters** 섹션 확인
3. **Search 필터 개선:**

**현재 설정:**
```
subject:[네이버 예약]
```

**개선된 설정 (최신 이메일 우선):**
```
subject:[네이버 예약] newer_than:1d
```

또는

```
subject:[네이버 예약] after:2026/1/5
```

**설명:**
- `newer_than:1d`: 최근 1일 이내 이메일만
- `after:2026/1/5`: 특정 날짜 이후 이메일만

---

### 방법 2: Gmail Trigger 설정 확인

**Gmail Trigger 설정:**

1. **"Gmail Trigger"** 노드 클릭
2. **Poll Times:**
   - **Mode:** `Every Minute` (현재 설정 유지)
3. **Event:** `Message Received` (현재 설정 유지)
4. **Simplify:** `ON` (현재 설정 유지)
5. **Filters:**
   - **Search:** `subject:[네이버 예약] newer_than:1d`
   - **Sender:** `naverbooking_noreply@navercorp.com`

---

### 방법 3: Code 노드에서 날짜 필터링 추가

**Code 노드 수정:**

1. **"Code"** 노드 클릭
2. **Mode:** `Run Once for All Items`
3. **Code에 날짜 필터링 추가:**

```javascript
// Gmail Trigger에서 이메일 데이터 가져오기
const emailData = $input.item.json;
const snippet = emailData.snippet || '';
const subject = emailData.Subject || '';
const internalDate = emailData.internalDate || '';

// 최신 이메일 확인 (24시간 이내)
const emailDate = new Date(parseInt(internalDate));
const now = new Date();
const hoursDiff = (now - emailDate) / (1000 * 60 * 60);

// 24시간 이내 이메일만 처리
if (hoursDiff > 24) {
  console.log('Email is older than 24 hours, skipping:', {
    emailDate: emailDate.toISOString(),
    hoursDiff: hoursDiff.toFixed(2)
  });
  return null; // 이전 이메일은 처리하지 않음
}

// 이메일 본문에서 예약 정보 추출
const emailBody = snippet || emailData.body || '';
const subject = emailData.Subject || '';

// 예약 번호 추출
const reservationNumberMatch = emailBody.match(/예약번호[:\s]*(\d+)/i);
const reservationNumber = reservationNumberMatch ? reservationNumberMatch[1] : '';

// 예약자명 추출
const guestNameMatch = emailBody.match(/예약자명[:\s]*([^\n\r]+?)(?:\s*예약신청|$)/i);
const guestName = guestNameMatch ? guestNameMatch[1].trim().replace(/\s+/g, ' ') : '';

// 이메일 주소 추출
const emailMatch = emailBody.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
let email = emailMatch ? emailMatch[1] : '';

// 체크인 날짜 추출
const checkinMatch = emailBody.match(/이용일시[:\s]*(\d{4})\.(\d{2})\.(\d{2})\./i);
let checkin = '';
if (checkinMatch) {
  checkin = `${checkinMatch[1]}-${checkinMatch[2]}-${checkinMatch[3]}`;
}

// 체크아웃 날짜 추출
const checkoutMatch = emailBody.match(/~(\d{4})\.(\d{2})\.(\d{2})\./i);
let checkout = '';
if (checkoutMatch) {
  checkout = `${checkoutMatch[1]}-${checkoutMatch[2]}-${checkoutMatch[3]}`;
}

// 객실 타입 추출
const roomTypeMatch = emailBody.match(/예약상품[:\s]*([^\n\r]+?)(?:\s*이용일시|$)/i);
const roomType = roomTypeMatch ? roomTypeMatch[1].trim() : '';

// 금액 추출
const amountMatch = emailBody.match(/(?:결제금액|금액|결제상태)[:\s]*([0-9,]+)/i);
let amount = 0;
if (amountMatch) {
  amount = parseInt(amountMatch[1].replace(/,/g, '')) || 0;
}

// 최신 이메일 확인 로그
console.log('Processing email:', {
  reservationNumber,
  emailDate: emailDate.toISOString(),
  hoursDiff: hoursDiff.toFixed(2),
  isRecent: hoursDiff <= 24
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

### 방법 4: Gmail Trigger 재설정

**Gmail Trigger 재설정:**

1. **"Gmail Trigger"** 노드 삭제
2. **새로운 "Gmail Trigger"** 노드 추가
3. **Gmail 인증 다시 설정**
4. **필터 설정:**
   - **Search:** `subject:[네이버 예약] newer_than:1d`
   - **Sender:** `naverbooking_noreply@navercorp.com`
5. **"Fetch Test Event"** 버튼 클릭하여 최신 이메일 확인

---

## 🔧 Gmail Search 필터 옵션

**최신 이메일 우선 필터:**

1. **최근 1일 이내:**
   ```
   subject:[네이버 예약] newer_than:1d
   ```

2. **최근 7일 이내:**
   ```
   subject:[네이버 예약] newer_than:7d
   ```

3. **특정 날짜 이후:**
   ```
   subject:[네이버 예약] after:2026/1/5
   ```

4. **오늘 받은 이메일:**
   ```
   subject:[네이버 예약] newer_than:1d
   ```

---

## 📋 체크리스트

### Gmail Trigger 설정:

- [ ] Search 필터에 `newer_than:1d` 추가
- [ ] Sender 필터 확인
- [ ] "Fetch Test Event"로 최신 이메일 확인
- [ ] Poll Times 설정 확인

### Code 노드 수정:

- [ ] 날짜 필터링 추가 (24시간 이내)
- [ ] 이메일 날짜 확인 로그 추가
- [ ] 이전 이메일은 처리하지 않도록 설정

### 테스트:

- [ ] "Fetch Test Event"로 최신 이메일 확인
- [ ] Code 노드에서 날짜 필터링 확인
- [ ] Railway 로그에서 최신 예약 확인

---

## 🚀 빠른 해결 단계

1. **Gmail Trigger 필터 수정**
   - Search: `subject:[네이버 예약] newer_than:1d`

2. **"Fetch Test Event" 클릭**
   - 최신 이메일이 가져와지는지 확인

3. **Code 노드에 날짜 필터링 추가**
   - 24시간 이내 이메일만 처리

4. **테스트**
   - 새로운 예약 이메일로 테스트
   - 최신 이메일이 처리되는지 확인

---

**문서 버전**: 1.0  
**최종 업데이트**: 2026-01-06
