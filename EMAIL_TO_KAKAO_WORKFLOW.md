# 이메일 트래킹 → 카카오톡 발송 워크플로우 가이드

## 📋 목차

1. [개요](#1-개요)
2. [사전 준비](#2-사전-준비)
3. [이메일 트리거 설정](#3-이메일-트리거-설정)
4. [워크플로우 구성](#4-워크플로우-구성)
5. [노드별 상세 설정](#5-노드별-상세-설정)
6. [테스트 방법](#6-테스트-방법)
7. [문제 해결](#7-문제-해결)
8. [보안 고려사항](#8-보안-고려사항)

---

## 1. 개요

### 1.1 워크플로우 목적

네이버 예약 완료 시 발송되는 이메일을 자동으로 감지하고, 게스트에게 카카오톡 메시지로 고유 링크를 발송하여 컨시어지 서비스에 자동 접속할 수 있도록 합니다.

### 1.2 전체 프로세스

```
[네이버 예약 완료]
  ↓
[예약 완료 이메일 발송]
  ↓
[n8n 이메일 트리거 감지]
  ↓
[이메일 본문 파싱]
  ↓
[게스트 정보 추출]
  ↓
[고유 링크 생성]
  ↓
[카카오톡 메시지 발송]
  ↓
[데이터베이스 저장]
  ↓
[게스트가 링크 클릭]
  ↓
[웹 앱 자동 접속]
```

### 1.3 필요한 사전 작업

- [ ] n8n 설치 및 설정 완료
- [ ] 카카오톡 API 설정 완료 ([KAKAO_API_SETUP.md](./KAKAO_API_SETUP.md) 참고)
- [ ] 이메일 계정 준비 (Gmail, Outlook 등)
- [ ] 데이터베이스 설정 (선택사항)

---

## 2. 사전 준비

### 2.1 카카오톡 API 설정

카카오톡 메시지 발송을 위해 카카오 개발자 콘솔에서 API를 설정해야 합니다.

**자세한 내용은 [KAKAO_API_SETUP.md](./KAKAO_API_SETUP.md) 문서를 참고하세요.**

**필수 항목:**
- REST API 키 발급
- 카카오 로그인 활성화
- 메시지 API 활성화 (친구톡 또는 알림톡)
- Access Token 발급

### 2.2 n8n 환경 변수 설정

n8n 환경 변수에 다음을 추가:

1. **Settings** → **Environment Variables**
2. 변수 추가:

```
KAKAO_REST_API_KEY=your_rest_api_key
KAKAO_ACCESS_TOKEN=your_access_token
KAKAO_REFRESH_TOKEN=your_refresh_token
```

### 2.3 이메일 계정 준비

#### Gmail 사용 시:
- Gmail 계정
- Google Cloud Console에서 Gmail API 활성화
- OAuth 2.0 클라이언트 ID 생성

#### Outlook 사용 시:
- Microsoft 계정
- Azure AD 앱 등록 (선택사항)

#### IMAP 사용 시:
- 이메일 주소 및 비밀번호
- IMAP 서버 정보

---

## 3. 이메일 트리거 설정

### 3.1 Gmail Trigger (권장)

#### 장점:
- 실시간 감지
- 안정적인 API
- 필터링 옵션 다양

#### 설정 방법:

1. **n8n 워크플로우 생성**
2. **Gmail Trigger** 노드 추가
3. **Credential 설정**:
   - **OAuth2** 선택
   - Google 계정으로 인증
   - 권한 승인

4. **Parameters 설정**:
   ```json
   {
     "triggerOn": "message",
     "options": {
       "filters": {
         "from": "reservation@naver.com",
         "subject": "예약 완료"
       }
     }
   }
   ```

5. **Gmail API 활성화**:
   - [Google Cloud Console](https://console.cloud.google.com/) 접속
   - 프로젝트 생성 또는 선택
   - **API 및 서비스** → **라이브러리**
   - **Gmail API** 검색 및 활성화
   - **사용자 인증 정보** → **OAuth 클라이언트 ID** 생성
   - **OAuth 동의 화면** 설정

#### Gmail API 활성화 상세:

1. **OAuth 동의 화면 설정**:
   - 사용자 유형: 외부
   - 앱 이름: OUSCARAVAN Automation
   - 사용자 지원 이메일: 입력
   - 개발자 연락처: 입력
   - 범위 추가: `https://www.googleapis.com/auth/gmail.readonly`

2. **OAuth 클라이언트 ID 생성**:
   - 애플리케이션 유형: 웹 애플리케이션
   - 이름: n8n Gmail Integration
   - 승인된 리디렉션 URI: n8n에서 제공하는 URI

### 3.2 Outlook Trigger

#### 설정 방법:

1. **Microsoft Outlook Trigger** 노드 추가
2. **Credential 설정**:
   - Microsoft 계정으로 인증
   - 권한 승인

3. **Parameters 설정**:
   ```json
   {
     "triggerOn": "messageCreated",
     "folder": "Inbox",
     "options": {
       "filters": {
         "from": "reservation@naver.com",
         "subject": "예약 완료"
       }
     }
   }
   ```

### 3.3 IMAP Email Trigger (범용)

#### 설정 방법:

1. **IMAP Email Trigger** 노드 추가
2. **Credential 설정**:
   - **Host**: `imap.gmail.com` (Gmail) 또는 `outlook.office365.com` (Outlook)
   - **Port**: `993`
   - **User**: 이메일 주소
   - **Password**: 앱 비밀번호 (2단계 인증 시)

3. **Parameters 설정**:
   ```json
   {
     "mailbox": "INBOX",
     "options": {
       "checkInterval": 60
     }
   }
   ```

**Gmail 앱 비밀번호 생성:**
1. Google 계정 → 보안
2. 2단계 인증 활성화
3. 앱 비밀번호 생성
4. 생성된 비밀번호 사용

---

## 4. 워크플로우 구성

### 4.1 전체 노드 구조

```
[이메일 트리거]
  ↓
[IF - 예약 완료 확인]
  ↓
[Code - 이메일 파싱]
  ↓
[Set - 데이터 정리]
  ↓
[Function - 고유 링크 생성]
  ↓
[HTTP Request - 카카오톡 발송]
  ↓
[PostgreSQL - 데이터 저장] (선택사항)
  ↓
[Error Handler - 에러 처리]
```

### 4.2 워크플로우 생성 순서

1. **이메일 트리거 노드** 추가 및 설정
2. **IF 노드** 추가 (예약 완료 이메일 확인)
3. **Code 노드** 추가 (이메일 파싱)
4. **Set 노드** 추가 (데이터 정리)
5. **Function 노드** 추가 (고유 링크 생성)
6. **HTTP Request 노드** 추가 (카카오톡 발송)
7. **PostgreSQL 노드** 추가 (데이터 저장, 선택사항)
8. **Error Handler** 설정

---

## 5. 노드별 상세 설정

### 5.1 노드 1: 이메일 트리거

**노드 타입**: Gmail Trigger / Outlook Trigger / IMAP Email Trigger

**설정 완료 후 테스트:**
- **Execute Node** 클릭하여 테스트
- 이메일이 감지되는지 확인
- 출력 데이터 구조 확인

### 5.2 노드 2: IF - 예약 완료 확인

**노드 타입**: IF

**Condition 설정:**
```javascript
{{ $json.subject.includes('예약 완료') || 
   $json.subject.includes('예약확인') || 
   $json.subject.includes('예약이 완료') ||
   $json.from.includes('naver.com') }}
```

**또는 정규식 사용:**
```javascript
{{ /예약.*완료|예약.*확인/i.test($json.subject) }}
```

### 5.3 노드 3: Code - 이메일 파싱

**노드 타입**: Code

**JavaScript 코드:**

```javascript
// 이메일 본문 가져오기
const emailBody = $input.item.json.body || '';
const htmlBody = $input.item.json.htmlBody || $input.item.json.body || '';

// HTML 태그 제거 (간단한 방법)
const textBody = htmlBody
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

// 정규식으로 정보 추출
const patterns = {
  // 게스트 이름 추출
  guestName: [
    /게스트명[:\s]*([^\n<]+)/i,
    /예약자[:\s]*([^\n<]+)/i,
    /이름[:\s]*([^\n<]+)/i,
    /성함[:\s]*([^\n<]+)/i,
    /Guest[:\s]*([^\n<]+)/i
  ],
  
  // 객실 번호 추출
  room: [
    /객실[:\s]*([^\n<]+)/i,
    /룸[:\s]*([^\n<]+)/i,
    /Room[:\s]*([^\n<]+)/i,
    /숙소[:\s]*([^\n<]+)/i
  ],
  
  // 체크인 날짜 추출
  checkin: [
    /체크인[:\s]*(\d{4}[-\/]\d{2}[-\/]\d{2})/i,
    /입실[:\s]*(\d{4}[-\/]\d{2}[-\/]\d{2})/i,
    /Check-in[:\s]*(\d{4}[-\/]\d{2}[-\/]\d{2})/i
  ],
  
  // 체크아웃 날짜 추출
  checkout: [
    /체크아웃[:\s]*(\d{4}[-\/]\d{2}[-\/]\d{2})/i,
    /퇴실[:\s]*(\d{4}[-\/]\d{2}[-\/]\d{2})/i,
    /Check-out[:\s]*(\d{4}[-\/]\d{2}[-\/]\d{2})/i
  ],
  
  // 전화번호 추출
  phone: [
    /전화번호[:\s]*([0-9-]+)/i,
    /연락처[:\s]*([0-9-]+)/i,
    /휴대폰[:\s]*([0-9-]+)/i,
    /Phone[:\s]*([0-9-]+)/i,
    /Tel[:\s]*([0-9-]+)/i
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
  
  // YYYY-MM-DD 또는 YYYY/MM/DD 형식으로 변환
  const normalized = dateStr.replace(/\//g, '-');
  const match = normalized.match(/(\d{4})-(\d{2})-(\d{2})/);
  
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  
  return null;
}

// 전화번호 정규화 (하이픈 제거)
function normalizePhone(phoneStr) {
  if (!phoneStr) return null;
  return phoneStr.replace(/-/g, '');
}

// 정보 추출
const guestName = extractInfo(patterns.guestName, textBody) || 
                  extractInfo(patterns.guestName, htmlBody) || '';
const room = extractInfo(patterns.room, textBody) || 
            extractInfo(patterns.room, htmlBody) || '';
const checkinRaw = extractInfo(patterns.checkin, textBody) || 
                   extractInfo(patterns.checkin, htmlBody);
const checkoutRaw = extractInfo(patterns.checkout, textBody) || 
                    extractInfo(patterns.checkout, htmlBody);
const phoneRaw = extractInfo(patterns.phone, textBody) || 
                 extractInfo(patterns.phone, htmlBody);

const checkin = normalizeDate(checkinRaw);
const checkout = normalizeDate(checkoutRaw);
const phone = normalizePhone(phoneRaw);

// 결과 반환
return {
  guestName: guestName,
  room: room,
  checkin: checkin,
  checkout: checkout,
  phone: phone,
  email: $input.item.json.from || '',
  emailSubject: $input.item.json.subject || '',
  emailDate: $input.item.json.date || '',
  rawBody: textBody.substring(0, 500) // 디버깅용 (처음 500자)
};
```

### 5.4 노드 4: Set - 데이터 정리

**노드 타입**: Set

**Values 설정:**

```json
{
  "guest": "{{ $json.guestName }}",
  "room": "{{ $json.room }}",
  "checkin": "{{ $json.checkin }}",
  "checkout": "{{ $json.checkout }}",
  "phone": "{{ $json.phone }}",
  "email": "{{ $json.email }}",
  "emailSubject": "{{ $json.emailSubject }}",
  "emailDate": "{{ $json.emailDate }}"
}
```

### 5.5 노드 5: Function - 고유 링크 생성

**노드 타입**: Function

**JavaScript 코드:**

```javascript
// 고유 토큰 생성 (예측 불가능한 토큰)
const crypto = require('crypto');

const data = `${$json.guest}-${$json.room}-${Date.now()}-${Math.random()}`;
const token = crypto
  .createHash('sha256')
  .update(data)
  .digest('base64')
  .replace(/[+/=]/g, '')
  .substring(0, 32);

// 기본 URL (환경 변수에서 가져오거나 하드코딩)
const baseUrl = $env.WEB_APP_URL || 'https://ouscaravan.com';

// 고유 링크 생성
const params = new URLSearchParams({
  guest: $json.guest,
  room: $json.room,
  checkin: $json.checkin || '',
  checkout: $json.checkout || '',
  token: token
});

const link = `${baseUrl}/home?${params.toString()}`;

return {
  ...$json,
  token: token,
  link: link,
  createdAt: new Date().toISOString()
};
```

**또는 간단한 버전 (crypto 없이):**

```javascript
// 간단한 토큰 생성
const token = Buffer.from(`${$json.guest}-${$json.room}-${Date.now()}`)
  .toString('base64')
  .replace(/[+/=]/g, '')
  .substring(0, 24);

const baseUrl = 'https://ouscaravan.com';
const link = `${baseUrl}/home?guest=${encodeURIComponent($json.guest)}&room=${encodeURIComponent($json.room)}&checkin=${$json.checkin || ''}&checkout=${$json.checkout || ''}&token=${token}`;

return {
  ...$json,
  token: token,
  link: link
};
```

### 5.6 노드 6: HTTP Request - 카카오톡 발송

**노드 타입**: HTTP Request

#### 옵션 A: 친구톡 발송 (1:1 메시지)

**Method**: POST  
**URL**: `https://kapi.kakao.com/v2/api/talk/memo/default/send`

**Authentication**: Generic Credential Type
- **Type**: Header Auth
- **Name**: `Authorization`
- **Value**: `Bearer {{ $env.KAKAO_ACCESS_TOKEN }}`

**Headers**:
```json
{
  "Content-Type": "application/x-www-form-urlencoded"
}
```

**Body (Send Body)**: Yes  
**Body Content Type**: Form-Data

**Body Parameters**:
```
template_object: {
  "object_type": "text",
  "text": "{{ $json.guest }}님, OUSCARAVAN 예약이 완료되었습니다!\n\n📅 체크인: {{ $json.checkin }}\n📅 체크아웃: {{ $json.checkout }}\n🏠 객실: {{ $json.room }}\n\n아래 링크를 클릭하여 컨시어지 서비스를 이용하세요:\n{{ $json.link }}",
  "link": {
    "web_url": "{{ $json.link }}",
    "mobile_web_url": "{{ $json.link }}"
  },
  "button_title": "컨시어지 서비스 이용하기"
}
```

**또는 URL Encoded 형식:**

**Body Content Type**: Form-Urlencoded

**Body**:
```
template_object={"object_type":"text","text":"{{ $json.guest }}님, OUSCARAVAN 예약이 완료되었습니다!\n\n📅 체크인: {{ $json.checkin }}\n📅 체크아웃: {{ $json.checkout }}\n🏠 객실: {{ $json.room }}\n\n아래 링크를 클릭하여 컨시어지 서비스를 이용하세요:\n{{ $json.link }}","link":{"web_url":"{{ $json.link }}","mobile_web_url":"{{ $json.link }}"},"button_title":"컨시어지 서비스 이용하기"}
```

#### 옵션 B: 알림톡 발송 (비즈니스용)

**Method**: POST  
**URL**: `https://kapi.kakao.com/v1/alimtalk/send`

**Authentication**: Header Auth
- **Name**: `Authorization`
- **Value**: `Bearer {{ $env.KAKAO_ACCESS_TOKEN }}`

**Headers**:
```json
{
  "Content-Type": "application/json"
}
```

**Body (Send Body)**: Yes  
**Body Content Type**: JSON

**Body**:
```json
{
  "receiver_uuids": ["{{ $json.phone }}"],
  "template_code": "YOUR_TEMPLATE_CODE",
  "template_args": {
    "#{guest}": "{{ $json.guest }}",
    "#{room}": "{{ $json.room }}",
    "#{checkin}": "{{ $json.checkin }}",
    "#{checkout}": "{{ $json.checkout }}",
    "#{link}": "{{ $json.link }}"
  }
}
```

**참고**: 알림톡은 템플릿을 사전에 등록해야 하며, 템플릿 코드를 사용합니다.

### 5.7 노드 7: PostgreSQL - 데이터 저장 (선택사항)

**노드 타입**: PostgreSQL

**Operation**: Insert

**Table**: `reservations`

**Columns**:
```json
{
  "guest_name": "{{ $json.guest }}",
  "room": "{{ $json.room }}",
  "checkin_date": "{{ $json.checkin }}",
  "checkout_date": "{{ $json.checkout }}",
  "phone": "{{ $json.phone }}",
  "email": "{{ $json.email }}",
  "token": "{{ $json.token }}",
  "link": "{{ $json.link }}",
  "kakao_sent": true,
  "kakao_sent_at": "{{ $now }}",
  "created_at": "{{ $now }}"
}
```

**데이터베이스 테이블 스키마:**

```sql
CREATE TABLE reservations (
  id SERIAL PRIMARY KEY,
  guest_name VARCHAR(255) NOT NULL,
  room VARCHAR(100) NOT NULL,
  checkin_date DATE,
  checkout_date DATE,
  phone VARCHAR(20),
  email VARCHAR(255),
  token VARCHAR(255) UNIQUE NOT NULL,
  link TEXT NOT NULL,
  kakao_sent BOOLEAN DEFAULT false,
  kakao_sent_at TIMESTAMP,
  email_subject TEXT,
  email_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reservations_token ON reservations(token);
CREATE INDEX idx_reservations_guest ON reservations(guest_name);
CREATE INDEX idx_reservations_room ON reservations(room);
```

### 5.8 에러 처리

**Error Trigger** 노드 추가:

1. **Error Trigger** 노드 추가
2. **Error Workflow** 설정:
   - 관리자에게 알림 발송
   - 에러 로그 기록
   - 재시도 로직 (선택사항)

---

## 6. 테스트 방법

### 6.1 단계별 테스트

#### 1단계: 이메일 트리거 테스트

1. **테스트 이메일 발송**
   - 네이버 예약과 유사한 형식의 이메일 발송
   - 제목에 "예약 완료" 포함
   - 본문에 게스트 정보 포함

2. **워크플로우 실행 확인**
   - n8n에서 워크플로우 실행 확인
   - 이메일이 감지되는지 확인

#### 2단계: 데이터 파싱 테스트

1. **Code 노드 출력 확인**
   - 게스트 이름 추출 확인
   - 객실 번호 추출 확인
   - 날짜 추출 확인
   - 전화번호 추출 확인

2. **파싱 실패 시**
   - 이메일 본문 형식 확인
   - 정규식 패턴 수정
   - 로그 확인

#### 3단계: 카카오톡 발송 테스트

1. **Access Token 확인**
   - 환경 변수에 올바른 토큰 설정
   - 토큰 유효성 확인

2. **테스트 발송**
   - Function 노드에서 생성된 링크 확인
   - HTTP Request 노드 실행
   - 응답 코드 확인 (200 OK)

3. **실제 수신 확인**
   - 카카오톡에서 메시지 수신 확인
   - 링크 클릭하여 웹 앱 접속 확인
   - 자동 로그인 확인

### 6.2 테스트 이메일 예시

**제목**: `[네이버 예약] 예약이 완료되었습니다`

**본문**:
```
안녕하세요.

예약이 완료되었습니다.

게스트명: 홍길동
객실: Airstream1
체크인: 2024-01-15
체크아웃: 2024-01-17
전화번호: 010-1234-5678

감사합니다.
```

### 6.3 디버깅 팁

1. **각 노드의 출력 확인**
   - 노드 실행 후 출력 데이터 확인
   - 예상과 다른 데이터인지 확인

2. **로그 확인**
   - n8n 실행 로그 확인
   - 에러 메시지 확인

3. **테스트 모드 사용**
   - 워크플로우를 테스트 모드로 실행
   - 실제 발송 없이 데이터 흐름 확인

---

## 7. 문제 해결

### 7.1 이메일이 감지되지 않음

**원인 및 해결:**

1. **Gmail API 권한 문제**
   - OAuth 동의 화면 설정 확인
   - 권한 범위 확인 (`gmail.readonly`)

2. **필터 조건 문제**
   - 필터 조건이 너무 엄격한지 확인
   - 대소문자 구분 확인
   - 공백 문자 확인

3. **이메일 형식 문제**
   - 발신자 이메일 주소 정확성 확인
   - 제목 키워드 확인

**해결 방법:**
- 필터 조건 완화
- 로그 확인
- 테스트 이메일 발송

### 7.2 데이터 추출 실패

**원인 및 해결:**

1. **이메일 본문 형식 변경**
   - 네이버 예약 이메일 형식이 변경되었을 수 있음
   - 실제 이메일 본문 확인
   - 정규식 패턴 수정

2. **HTML 태그 문제**
   - HTML 본문에서 텍스트 추출 실패
   - HTML 파싱 로직 개선

**해결 방법:**
```javascript
// 더 강력한 HTML 파싱
const cheerio = require('cheerio'); // n8n에서 사용 가능한 경우
const $ = cheerio.load(htmlBody);
const textBody = $('body').text();
```

### 7.3 카카오톡 발송 실패

**원인 및 해결:**

1. **Access Token 만료**
   - 토큰 유효성 확인
   - Refresh Token으로 갱신

2. **API 키 권한 문제**
   - 카카오 개발자 콘솔에서 권한 확인
   - 메시지 API 활성화 확인

3. **메시지 형식 오류**
   - 템플릿 형식 확인
   - 특수 문자 이스케이프 확인

4. **수신자 정보 오류**
   - 전화번호 형식 확인 (하이픈 제거)
   - 친구 추가 여부 확인 (친구톡의 경우)

**해결 방법:**
- HTTP Request 노드의 응답 확인
- 카카오 API 에러 코드 확인
- 로그 확인

### 7.4 일반적인 에러 코드

**카카오톡 API 에러:**

- `401 Unauthorized`: Access Token 만료 또는 무효
- `403 Forbidden`: API 권한 없음
- `400 Bad Request`: 요청 형식 오류
- `404 Not Found`: 잘못된 엔드포인트

---

## 8. 보안 고려사항

### 8.1 민감 정보 보호

1. **Access Token**
   - 환경 변수에만 저장
   - Git에 커밋하지 않음
   - 정기적으로 갱신

2. **게스트 정보**
   - 데이터베이스 암호화 저장 (선택사항)
   - 접근 권한 제한

3. **고유 토큰**
   - 예측 불가능한 토큰 생성
   - 충분한 길이 (최소 24자)
   - 유효 기간 설정 (선택사항)

### 8.2 에러 처리

1. **에러 로깅**
   - 모든 에러를 로그에 기록
   - 민감 정보는 마스킹

2. **재시도 로직**
   - 일시적 실패 시 재시도
   - 최대 재시도 횟수 제한

3. **알림 설정**
   - 중요한 에러 발생 시 관리자 알림
   - 이메일 또는 카카오톡으로 알림

### 8.3 데이터 검증

1. **입력 데이터 검증**
   - 이메일 형식 검증
   - 날짜 형식 검증
   - 전화번호 형식 검증

2. **출력 데이터 검증**
   - 링크 유효성 확인
   - 토큰 형식 확인

---

## 9. 최적화 및 개선

### 9.1 성능 최적화

1. **이메일 필터링 강화**
   - 불필요한 이메일 처리 방지
   - 라벨 또는 폴더 활용

2. **배치 처리**
   - 여러 예약을 한 번에 처리 (선택사항)

### 9.2 기능 개선

1. **다중 예약 플랫폼 지원**
   - 에어비앤비, 부킹닷컴 등
   - 이메일 형식별 파싱 로직

2. **예약 변경/취소 처리**
   - 예약 변경 이메일 감지
   - 예약 취소 이메일 감지
   - 게스트에게 알림 발송

3. **템플릿 관리**
   - 메시지 템플릿 다양화
   - 시즌별 템플릿

---

## 10. 체크리스트

### 설정 완료 체크리스트

- [ ] n8n 설치 및 설정 완료
- [ ] 카카오톡 API 설정 완료
- [ ] 이메일 계정 준비 및 API 활성화
- [ ] n8n 환경 변수 설정
- [ ] 워크플로우 생성
- [ ] 각 노드 설정 완료
- [ ] 테스트 이메일로 검증
- [ ] 실제 예약 이메일로 테스트
- [ ] 카카오톡 메시지 수신 확인
- [ ] 웹 앱 링크 접속 확인
- [ ] 데이터베이스 저장 확인 (선택사항)
- [ ] 에러 처리 설정

---

## 11. 참고 자료

### 공식 문서
- [n8n Gmail 노드 문서](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.gmail/)
- [n8n HTTP Request 노드](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)
- [카카오 메시지 API](https://developers.kakao.com/docs/latest/ko/message/rest-api)
- [Gmail API 문서](https://developers.google.com/gmail/api)

### 관련 문서
- [KAKAO_API_SETUP.md](./KAKAO_API_SETUP.md) - 카카오톡 API 설정
- [N8N_AUTOMATION_GUIDE.md](./N8N_AUTOMATION_GUIDE.md) - n8n 자동화 가이드

---

## 12. 예시 워크플로우 JSON

n8n에서 워크플로우를 JSON으로 내보낼 수 있습니다. 아래는 참고용 구조입니다:

```json
{
  "name": "네이버 예약 → 카카오톡 발송",
  "nodes": [
    {
      "name": "Gmail Trigger",
      "type": "n8n-nodes-base.gmailTrigger",
      "typeVersion": 1,
      "position": [250, 300],
      "parameters": {
        "triggerOn": "message",
        "filters": {
          "from": "reservation@naver.com"
        }
      }
    },
    {
      "name": "Parse Email",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [450, 300],
      "parameters": {
        "jsCode": "// 이메일 파싱 코드"
      }
    },
    {
      "name": "Generate Link",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [650, 300],
      "parameters": {
        "functionCode": "// 링크 생성 코드"
      }
    },
    {
      "name": "Send KakaoTalk",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [850, 300],
      "parameters": {
        "method": "POST",
        "url": "https://kapi.kakao.com/v2/api/talk/memo/default/send",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "Bearer {{ $env.KAKAO_ACCESS_TOKEN }}"
            }
          ]
        }
      }
    }
  ],
  "connections": {
    "Gmail Trigger": {
      "main": [[{"node": "Parse Email", "type": "main", "index": 0}]]
    },
    "Parse Email": {
      "main": [[{"node": "Generate Link", "type": "main", "index": 0}]]
    },
    "Generate Link": {
      "main": [[{"node": "Send KakaoTalk", "type": "main", "index": 0}]]
    }
  }
}
```

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15  
**작성자**: Development Team
