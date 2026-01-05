# n8n 워크플로우 단계별 설정 가이드 (현재 진행 중)

## ✅ 현재 상태

**워크플로우 URL**: https://ourcaravan.app.n8n.cloud/workflow/0nMXGSoqk6EBmHTc  
**Gmail 주소**: caiius960122@gmail.com  
**현재 단계**: Gmail Trigger 노드 설정 중

---

## 📍 현재 단계: Gmail Trigger 노드 설정

### 확인 사항

현재 Gmail Trigger 노드 설정 화면에서 다음을 확인하세요:

1. ✅ **Event**: `Message Received` (맞습니다!)
2. ⚠️ **Credential**: Gmail 계정 연결 필요
3. ⚠️ **Filters**: 아직 설정 안 됨 (추가 필요)

---

## 1단계: Gmail 계정 연결 (Credential 설정)

### 현재 화면에서:

1. **"Credential to connect with"** 섹션 확인
2. 드롭다운 옆의 **연필 아이콘 (✏️)** 클릭
3. 다음 중 하나 선택:
   - **기존 Credential이 있다면**: 선택
   - **새로 만들려면**: **"Create New Credential"** 또는 **"Add Credential"** 클릭

### 새 Credential 생성 시:

1. **Credential Name**: `Gmail - caiius960122` (또는 원하는 이름)
2. **OAuth2 API** 선택
3. **"Connect my account"** 또는 **"Sign in with Google"** 클릭
4. Google 계정 선택: **caiius960122@gmail.com**
5. 권한 승인:
   - ✅ Gmail 읽기 권한
   - ✅ n8n에 액세스 허용
6. **"Save"** 또는 **"Authorize"** 클릭

### ⚠️ 중요: Gmail API 활성화 필요

만약 인증이 실패하거나 "API not enabled" 오류가 나면:

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택 또는 생성
3. **API 및 서비스** → **라이브러리**
4. **Gmail API** 검색 → **사용 설정** 클릭
5. **OAuth 동의 화면** 설정 (외부 선택)
6. **사용자 인증 정보** → **OAuth 클라이언트 ID** 생성

**자세한 내용**: `N8N_WORKFLOW_SETUP_GUIDE.md`의 "1단계: Gmail API 활성화" 참고

---

## 2단계: Filters 추가 (예약 이메일만 감지)

### 현재 화면에서:

1. **"Filters"** 섹션 확인
2. **"Add Filter"** 버튼 클릭
3. 첫 번째 필터 추가:
   - **Property**: `From` 선택
   - **Operation**: `Contains` 선택
   - **Value**: `naver.com` 입력
4. **"Add Filter"** 버튼 다시 클릭하여 두 번째 필터 추가:
   - **Property**: `Subject` 선택
   - **Operation**: `Contains` 선택
   - **Value**: `예약 완료` 입력

### 필터 옵션:

**옵션 1: 엄격한 필터 (권장)**
- From: `naver.com`
- Subject: `예약 완료`

**옵션 2: 느슨한 필터 (테스트용)**
- From: `naver.com` (또는 비워두기)
- Subject: 비워두기

**옵션 3: 매우 엄격한 필터**
- From: `reservation@naver.com` (실제 네이버 예약 이메일 주소)
- Subject: `예약 완료`

### Poll Times 설정 (선택사항)

- **Mode**: `Every Minute` (기본값, 그대로 두면 됨)
- 또는 `Every 5 Minutes` 등으로 변경 가능

---

## 3단계: 테스트

### 현재 화면에서:

1. 우측 상단의 **"Fetch Test Event"** 버튼 클릭
   - 또는 우측 OUTPUT 패널의 **"Test this trigger"** 버튼 클릭
2. 결과 확인:
   - 이메일이 감지되면: 데이터 구조 확인
   - 이메일이 없으면: "No messages found" 메시지 (정상)

### 테스트 이메일 발송 (선택사항)

테스트를 위해 직접 이메일을 발송할 수 있습니다:

1. **caiius960122@gmail.com**으로 이메일 발송
2. 제목: `[네이버 예약] 예약이 완료되었습니다`
3. 본문:
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
4. 발송 후 **"Fetch Test Event"** 다시 클릭

---

## 4단계: 노드 저장 및 다음 노드 추가

### 현재 노드 저장:

1. 노드 설정 화면 하단의 **"Save"** 버튼 클릭
2. 또는 워크플로우 상단의 **"Save"** 버튼 클릭

### 다음 노드 추가:

1. Gmail Trigger 노드 우측의 **"+" 버튼** 클릭
2. 검색창에 **"IF"** 입력
3. **"IF"** 노드 선택

---

## 5단계: IF 노드 설정 (예약 완료 확인)

### IF 노드 Parameters 설정:

**Condition**: `String`

**Value 1**: `{{ $json.subject }}`  
**Operation**: `Contains`  
**Value 2**: `예약 완료`

**또는 여러 조건 (더 안전):**

**Mode**: `Combine`  
**Combine**: `Any`

**Conditions**:
- Condition 1: `{{ $json.subject }}` contains `예약 완료`
- Condition 2: `{{ $json.subject }}` contains `예약확인`
- Condition 3: `{{ $json.from }}` contains `naver.com`

**Save** 클릭

---

## 6단계: Code 노드 추가 (이메일 파싱)

1. IF 노드의 **True** 출력에서 **"+" 버튼** 클릭
2. 검색: **"Code"**
3. **"Code"** 노드 선택

### Code 노드 설정:

**Mode**: `Run Once for All Items`

**JavaScript Code** (아래 코드 전체 복사):

```javascript
// 이메일 본문 가져오기
const emailBody = $input.all()[0].json.body || '';
const htmlBody = $input.all()[0].json.htmlBody || $input.all()[0].json.body || '';

// HTML 태그 제거
const textBody = htmlBody
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

// 정규식으로 정보 추출
const patterns = {
  guestName: [
    /게스트명[:\s]*([^\n<]+)/i,
    /예약자[:\s]*([^\n<]+)/i,
    /이름[:\s]*([^\n<]+)/i,
    /성함[:\s]*([^\n<]+)/i,
    /Guest[:\s]*([^\n<]+)/i
  ],
  room: [
    /객실[:\s]*([^\n<]+)/i,
    /룸[:\s]*([^\n<]+)/i,
    /Room[:\s]*([^\n<]+)/i,
    /숙소[:\s]*([^\n<]+)/i
  ],
  checkin: [
    /체크인[:\s]*(\d{4}[-\/]\d{2}[-\/]\d{2})/i,
    /입실[:\s]*(\d{4}[-\/]\d{2}[-\/]\d{2})/i,
    /Check-in[:\s]*(\d{4}[-\/]\d{2}[-\/]\d{2})/i
  ],
  checkout: [
    /체크아웃[:\s]*(\d{4}[-\/]\d{2}[-\/]\d{2})/i,
    /퇴실[:\s]*(\d{4}[-\/]\d{2}[-\/]\d{2})/i,
    /Check-out[:\s]*(\d{4}[-\/]\d{2}[-\/]\d{2})/i
  ],
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
return [{
  guestName: guestName,
  room: room,
  checkin: checkin,
  checkout: checkout,
  phone: phone,
  email: $input.all()[0].json.from || '',
  emailSubject: $input.all()[0].json.subject || '',
  emailDate: $input.all()[0].json.date || '',
  rawBody: textBody.substring(0, 500)
}];
```

**Save** 클릭

---

## 7단계: Set 노드 추가

1. Code 노드 우측의 **"+" 버튼** 클릭
2. 검색: **"Set"**
3. **"Set"** 노드 선택

### Set 노드 설정:

**Keep Only Set Fields**: 체크 해제

**Values** (아래 표대로 추가):

| Name | Value |
|------|-------|
| `guest` | `{{ $json.guestName }}` |
| `room` | `{{ $json.room }}` |
| `checkin` | `{{ $json.checkin }}` |
| `checkout` | `{{ $json.checkout }}` |
| `phone` | `{{ $json.phone }}` |
| `email` | `{{ $json.email }}` |

**Save** 클릭

---

## 8단계: Function 노드 추가 (고유 링크 생성)

1. Set 노드 우측의 **"+" 버튼** 클릭
2. 검색: **"Function"**
3. **"Function"** 노드 선택

### Function 노드 설정:

**Function Code** (아래 코드 전체 복사):

```javascript
// 고유 토큰 생성
const data = `${$input.item.json.guest}-${$input.item.json.room}-${Date.now()}-${Math.random()}`;
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
  token: token
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

---

## 9단계: HTTP Request 노드 추가 (카카오톡 발송)

1. Function 노드 우측의 **"+" 버튼** 클릭
2. 검색: **"HTTP Request"**
3. **"HTTP Request"** 노드 선택

### HTTP Request 노드 설정:

**Method**: `POST`  
**URL**: `https://kapi.kakao.com/v2/api/talk/memo/default/send`

#### Authentication:

**Authentication**: `Generic Credential Type`  
**Generic Auth Type**: `Header Auth`

**Header Name**: `Authorization`  
**Header Value**: `Bearer {{ $env.KAKAO_ACCESS_TOKEN }}`

#### Headers:

**Send Headers**: 체크

| Name | Value |
|------|-------|
| `Content-Type` | `application/x-www-form-urlencoded` |

#### Body:

**Send Body**: 체크  
**Body Content Type**: `Form-Urlencoded`

**Body Parameters**:

| Name | Value |
|------|-------|
| `template_object` | `{"object_type":"text","text":"{{ $json.guest }}님, OUSCARAVAN 예약이 완료되었습니다!\n\n📅 체크인: {{ $json.checkin }}\n📅 체크아웃: {{ $json.checkout }}\n🏠 객실: {{ $json.room }}\n\n아래 링크를 클릭하여 컨시어지 서비스를 이용하세요:\n{{ $json.link }}","link":{"web_url":"{{ $json.link }}","mobile_web_url":"{{ $json.link }}"},"button_title":"컨시어지 서비스 이용하기"}` |

**Save** 클릭

---

## 10단계: 환경 변수 설정

1. n8n 상단 메뉴 → **Settings** (⚙️ 아이콘)
2. **Environment Variables** 클릭
3. 다음 변수 추가:

| Name | Value |
|------|-------|
| `KAKAO_ACCESS_TOKEN` | 카카오 Access Token (필수) |
| `WEB_APP_URL` | `https://ouscaravan.com` (또는 실제 배포 URL) |

**참고**: 카카오톡 API 설정이 필요합니다. [KAKAO_API_SETUP.md](./KAKAO_API_SETUP.md) 참고

---

## 11단계: 워크플로우 저장 및 활성화

1. 상단 **"Save"** 버튼 클릭
2. 우측 상단의 **토글 스위치** 클릭하여 활성화
3. **"Active"** 상태 확인

---

## 📋 전체 워크플로우 구조

```
[Gmail Trigger] 
  → [IF - 예약 완료 확인]
  → [Code - 이메일 파싱]
  → [Set - 데이터 정리]
  → [Function - 고유 링크 생성]
  → [HTTP Request - 카카오톡 발송]
```

---

## ✅ 체크리스트

### 현재 단계 (Gmail Trigger):
- [ ] Event: `Message Received` 확인
- [ ] Gmail 계정 Credential 연결
- [ ] Filters 추가 (From: naver.com, Subject: 예약 완료)
- [ ] "Fetch Test Event"로 테스트
- [ ] 노드 저장

### 다음 단계:
- [ ] IF 노드 추가 및 설정
- [ ] Code 노드 추가 및 설정
- [ ] Set 노드 추가 및 설정
- [ ] Function 노드 추가 및 설정
- [ ] HTTP Request 노드 추가 및 설정
- [ ] 환경 변수 설정
- [ ] 워크플로우 활성화

---

## 🆘 문제 해결

### Gmail 인증 실패 시:

1. **"API not enabled" 오류**:
   - Google Cloud Console에서 Gmail API 활성화 필요
   - [N8N_WORKFLOW_SETUP_GUIDE.md](./N8N_WORKFLOW_SETUP_GUIDE.md)의 "1단계" 참고

2. **"Access denied" 오류**:
   - OAuth 동의 화면에서 테스트 사용자 추가 필요
   - `caiius960122@gmail.com`을 테스트 사용자로 추가

3. **"No messages found"**:
   - 정상입니다 (아직 예약 이메일이 없을 때)
   - 테스트 이메일을 발송한 후 다시 시도

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
