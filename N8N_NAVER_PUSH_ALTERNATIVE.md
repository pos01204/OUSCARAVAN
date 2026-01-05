# 네이버 푸시 메시지 대안: 전화번호 조회 방법

## 📋 문제 상황

**현황:**
- 네이버톡톡 푸시 메시지로 예약 확정 알림 수신
- 푸시 메시지에는 전화번호가 포함되어 있음
- 하지만 푸시 메시지는 앱 내 알림이므로 Gmail 연동 불가
- 별도 이메일 알림도 발송되지 않음

**목표:**
- 예약 확정 시 전화번호를 조회하여 알림톡 발송

---

## 🔍 해결 방법

### 방법 1: 네이버 예약 관리 페이지 API 직접 호출 (권장)

예약 확정 이메일에서 예약번호를 추출한 후, 네이버 예약 관리 페이지 API로 전화번호를 조회합니다.

#### 1-1. 브라우저에서 API 확인

**단계:**

1. **브라우저 개발자 도구 열기** (F12)
2. **Network 탭** 선택
3. **XHR 또는 Fetch 필터** 선택
4. **네이버 예약 관리 페이지 접속**
   - https://partner.booking.naver.com/
   - 로그인
5. **예약 상세 정보 열기**
   - 예약 목록에서 예약 클릭
   - 예약 상세 정보 팝업 열기
6. **Network 탭에서 API 요청 확인**
   - 예약 상세 정보를 불러오는 API 요청 찾기
   - **Request URL** 확인
   - **Request Method** 확인 (GET/POST)
   - **Request Headers** 확인 (Cookie, Authorization 등)
   - **Response** 확인 (JSON 구조, 전화번호 필드)

**예상 API 엔드포인트:**
```
GET /api/v1/reservations/{reservationNumber}
또는
GET /api/v1/bookings/{bookingId}
또는
POST /api/v1/reservations/search
```

#### 1-2. n8n HTTP Request 노드 설정

**워크플로우 구조:**

```
[Gmail Trigger: 예약 확정 이메일]
  ↓
[Code: 이메일 파싱]
  ↓
[HTTP Request: 네이버 예약 관리 페이지 API]
  ↓
[Code: 전화번호 추출]
  ↓
[Set: 데이터 정리]
  ↓
[Code: 고유 링크 생성]
  ↓
[Code: 전화번호 포맷 변환]
  ↓
[SolAPI: 알림톡 발송]
```

**HTTP Request 노드 설정:**

1. **Code 노드 (이메일 파싱)** 다음에 **HTTP Request 노드** 추가

2. **HTTP Request 노드 설정:**

**Method**: 확인한 메서드 (GET 또는 POST)

**URL**: 
```
https://partner.booking.naver.com/api/v1/reservations/{{ $json.reservationNumber }}
```

또는 POST인 경우:

```
https://partner.booking.naver.com/api/v1/reservations/search
```

**Authentication**: 
- **Type**: `Header Auth`
- **Name**: `Cookie`
- **Value**: 네이버 로그인 쿠키
  ```
  NID_AUT=...; NID_SES=...; (실제 쿠키 값)
  ```

**Headers**:
```
Content-Type: application/json
Referer: https://partner.booking.naver.com/
X-Requested-With: XMLHttpRequest
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
```

**Body** (POST인 경우):
```json
{
  "reservationNumber": "{{ $json.reservationNumber }}"
}
```

**Response Format**: `JSON`

3. **전화번호 추출 Code 노드 추가**

HTTP Request 노드 다음에 **Code 노드** 추가:

```javascript
// HTTP Request 응답에서 전화번호 추출
const response = $input.item.json;

// 전화번호 필드 찾기 (여러 가능한 필드명 시도)
let phone = '';

// 여러 가능한 필드명 시도
const phoneFields = [
  'phone',
  'phoneNumber',
  'tel',
  'telephone',
  'mobile',
  'contact',
  'reservator.phone',
  'customer.phone',
  'guest.phone',
  'user.phone'
];

for (const field of phoneFields) {
  const keys = field.split('.');
  let value = response;
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined || value === null) break;
  }
  if (value && typeof value === 'string' && value.length >= 10) {
    phone = value;
    break;
  }
}

// 이전 데이터와 병합
const previousData = $('이메일 파싱').first().json;

return {
  ...previousData,
  phone: phone
};
```

---

### 방법 2: 네이버 예약 관리 페이지 HTML 파싱

API가 없거나 접근이 어려운 경우, HTML을 가져와서 파싱합니다.

#### 2-1. HTTP Request로 HTML 가져오기

**HTTP Request 노드 설정:**

**Method**: `GET`

**URL**: 
```
https://partner.booking.naver.com/bizes/{bizId}/booking-list-view/bookings/{{ $json.reservationNumber }}
```

**Authentication**: Cookie

**Response Format**: `String` (HTML)

#### 2-2. Code 노드로 HTML 파싱

```javascript
// HTML에서 전화번호 추출
const html = $input.item.json.data || '';

// 정규식으로 전화번호 찾기
const phonePatterns = [
  /전화번호[:\s]*([0-9-()\s]+)/i,
  /010-?[0-9]{4}-?[0-9]{4}/,
  /<[^>]*data-phone[^>]*>([^<]+)<\/[^>]*>/i,
  /<[^>]*class="[^"]*phone[^"]*"[^>]*>([^<]+)<\/[^>]*>/i
];

let phone = '';
for (const pattern of phonePatterns) {
  const match = html.match(pattern);
  if (match) {
    phone = (match[1] || match[0]).replace(/[-\s()]/g, '').trim();
    if (phone.length >= 10 && phone.length <= 11) {
      break;
    }
  }
}

// 이전 데이터와 병합
const previousData = $('이메일 파싱').first().json;

return {
  ...previousData,
  phone: phone
};
```

---

### 방법 3: Puppeteer/Playwright로 웹 스크래핑

브라우저 자동화를 사용하여 네이버 예약 관리 페이지에 접속하고 전화번호를 추출합니다.

#### 3-1. n8n Puppeteer 노드 사용

**주의:** n8n에 Puppeteer 노드가 설치되어 있어야 합니다.

1. **Code 노드 (이메일 파싱)** 다음에 **Puppeteer** 노드 추가

2. **Puppeteer 노드 설정:**

**Operation**: `Navigate`

**URL**: 
```
https://partner.booking.naver.com/bizes/{bizId}/booking-list-view/bookings/{{ $json.reservationNumber }}
```

**Wait For**: `Networkidle0`

3. **전화번호 추출 Code 노드 추가:**

```javascript
// Puppeteer 페이지에서 전화번호 추출
const page = $input.item.json.page;

// 페이지에서 전화번호 요소 찾기
const phone = await page.evaluate(() => {
  // 전화번호가 있는 요소 선택자 찾기
  const phoneElement = document.querySelector('.phone-number') 
    || document.querySelector('[data-phone]')
    || document.querySelector('input[type="tel"]')
    || document.querySelector('.reservator-phone')
    || document.querySelector('td:contains("전화번호") + td');
  
  return phoneElement ? phoneElement.textContent || phoneElement.value : '';
});

// 이전 데이터와 병합
const previousData = $('이메일 파싱').first().json;

return {
  ...previousData,
  phone: phone
};
```

**단점:**
- 복잡한 설정 필요
- 로그인 자동화 필요
- 느린 처리 속도
- 네이버 정책 위반 가능성

---

## 🎯 권장 방법: API 직접 호출

### 단계별 구현

#### 1단계: 브라우저에서 API 확인

1. **브라우저 개발자 도구 열기** (F12)
2. **Network 탭** 선택
3. **네이버 예약 관리 페이지 접속**
4. **예약 상세 정보 열기**
5. **API 요청 확인**

**확인해야 할 정보:**
- **Request URL**: API 엔드포인트
- **Request Method**: GET 또는 POST
- **Request Headers**: Cookie, Authorization 등
- **Response**: JSON 구조, 전화번호 필드명

#### 2단계: n8n HTTP Request 노드 설정

**확인한 정보를 바탕으로 설정:**

**Method**: 확인한 메서드

**URL**: 확인한 엔드포인트
```
{{ 확인한_엔드포인트 }}/{{ $json.reservationNumber }}
```

**Authentication**: 
- **Type**: `Header Auth`
- **Name**: `Cookie`
- **Value**: 확인한 쿠키 값

**Headers**: 확인한 헤더들

#### 3단계: 전화번호 추출 및 알림톡 발송

1. **전화번호 추출 Code 노드 추가**
2. **전화번호 포맷 변환 Code 노드 추가**
3. **SolAPI 노드로 알림톡 발송**

---

## 📋 최종 워크플로우 구조

```
[Gmail Trigger: 예약 확정 이메일]
  ↓
[IF: 예약 확정/취소 구분]
  ↓ (True: 확정)
[Code: 이메일 파싱]
  ↓
[HTTP Request: 네이버 예약 관리 페이지 API]
  ↓
[Code: 전화번호 추출]
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
      [에러 로깅 또는 수동 처리 알림]
```

---

## 🔐 인증 정보 관리

### Cookie 가져오기

1. **브라우저에서 네이버 예약 관리 페이지 접속**
2. **F12 → Application 탭 → Cookies**
3. **필요한 쿠키 복사:**
   - `NID_AUT`
   - `NID_SES`
   - 기타 인증 관련 쿠키

### n8n 환경 변수에 저장

1. **n8n Settings → Environment Variables**
2. **변수 추가:**
   - `NAVER_BOOKING_COOKIE`: 쿠키 값

3. **HTTP Request 노드에서 사용:**
   ```
   Cookie: {{ $env.NAVER_BOOKING_COOKIE }}
   ```

### Cookie 자동 갱신 (고급)

Cookie가 만료되면 자동으로 갱신하는 로직 추가:

1. **HTTP Request 실행**
2. **401 Unauthorized 응답 확인**
3. **로그인 페이지로 리다이렉트**
4. **로그인 자동화** (Puppeteer 사용)
5. **새로운 Cookie 저장**
6. **다시 API 호출**

---

## 🧪 테스트 방법

### 1단계: API 엔드포인트 확인

1. 브라우저 개발자 도구에서 API 요청 확인
2. API 엔드포인트, 메서드, 헤더 확인
3. 응답 데이터 구조 확인

### 2단계: n8n HTTP Request 노드 테스트

1. HTTP Request 노드에서 **"Execute Node"** 클릭
2. 응답 데이터 확인
3. 전화번호 필드 확인

### 3단계: 전체 플로우 테스트

1. 실제 예약 확정 이메일 발송
2. 전체 워크플로우 실행
3. 전화번호 조회 및 알림톡 발송 확인

---

## 🆘 문제 해결

### 문제 1: 401 Unauthorized 오류

**원인:** Cookie 만료 또는 인증 실패

**해결:**
1. Cookie 재확인
2. 네이버 예약 관리 페이지에 다시 로그인
3. 새로운 Cookie 가져오기
4. 환경 변수 업데이트

### 문제 2: API 엔드포인트를 찾을 수 없음

**원인:** 네이버 예약 관리 페이지가 SPA로 구현되어 API 호출이 숨겨져 있음

**해결:**
1. Network 탭에서 모든 요청 확인
2. XHR, Fetch, JS 필터 모두 확인
3. 예약 상세 정보를 열 때 발생하는 모든 요청 확인
4. HTML 파싱 방법으로 대체

### 문제 3: 전화번호 필드를 찾을 수 없음

**원인:** 응답 데이터 구조가 예상과 다름

**해결:**
1. HTTP Request 응답 전체 확인
2. JSON 구조 분석
3. 전화번호가 있는 필드 찾기
4. Code 노드 수정

---

## 💡 추가 고려사항

### Cookie 자동 갱신

Cookie가 만료되면 자동으로 갱신하는 로직을 추가하는 것을 권장합니다.

### 에러 처리

전화번호를 찾을 수 없는 경우:
- 에러 로깅
- 관리자에게 알림
- 수동 처리 요청

### 성능 최적화

- API 호출 캐싱
- 배치 처리
- 재시도 로직

---

## 📚 참고 자료

- [네이버 예약 관리 페이지](https://partner.booking.naver.com/)
- [SolAPI 공식 문서](https://solapi.com/)
- [n8n HTTP Request 노드 문서](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
