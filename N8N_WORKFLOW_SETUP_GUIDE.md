# n8n 워크플로우 설정 단계별 가이드

## 🎯 목표

네이버 예약 완료 이메일을 자동으로 감지하고, 게스트에게 카카오톡 메시지로 고유 링크를 발송하는 워크플로우를 설정합니다.

**워크플로우 URL**: https://ourcaravan.app.n8n.cloud/workflow/0nMXGSoqk6EBmHTc  
**Gmail 주소**: caiius960122@gmail.com

---

## 📋 사전 준비 체크리스트

### 필수 항목
- [ ] n8n 계정 로그인 완료
- [ ] 카카오톡 API 설정 완료 (REST API 키, Access Token)
- [ ] Gmail 계정 준비 (caiius960122@gmail.com)
- [ ] Google Cloud Console에서 Gmail API 활성화

### 선택 항목
- [ ] 데이터베이스 설정 (PostgreSQL 등)
- [ ] 웹 앱 URL 확인 (https://ouscaravan.com)

---

## 1단계: Gmail API 활성화 (필수)

### 1.1 Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. **프로젝트 선택** 또는 **새 프로젝트 생성**
   - 프로젝트 이름: `OUSCARAVAN Automation`

3. **API 및 서비스** → **라이브러리** 클릭
4. **Gmail API** 검색
5. **Gmail API** 클릭 → **사용 설정** 클릭

### 1.2 OAuth 동의 화면 설정

1. **API 및 서비스** → **OAuth 동의 화면** 클릭
2. **외부** 선택 → **만들기** 클릭
3. **앱 정보** 입력:
   - 앱 이름: `OUSCARAVAN Automation`
   - 사용자 지원 이메일: `caiius960122@gmail.com`
   - 개발자 연락처 정보: 이메일 주소 입력
4. **저장 후 계속** 클릭

5. **범위** 설정:
   - **범위 추가 또는 삭제** 클릭
   - `https://www.googleapis.com/auth/gmail.readonly` 검색 및 추가
   - **저장 후 계속** 클릭

6. **테스트 사용자** 추가:
   - `caiius960122@gmail.com` 추가
   - **저장 후 계속** 클릭

7. **요약** 확인 후 **대시보드로 돌아가기**

### 1.3 OAuth 클라이언트 ID 생성

1. **사용자 인증 정보** → **사용자 인증 정보 만들기** → **OAuth 클라이언트 ID**
2. **애플리케이션 유형**: 웹 애플리케이션
3. **이름**: `n8n Gmail Integration`
4. **승인된 리디렉션 URI**: 
   - n8n에서 제공하는 리디렉션 URI를 여기에 추가
   - (n8n Gmail 노드 설정 시 제공됨)
5. **만들기** 클릭
6. **클라이언트 ID**와 **클라이언트 보안 비밀번호** 복사 (나중에 사용)

---

## 2단계: n8n 워크플로우 접속 및 기본 설정

### 2.1 워크플로우 접속

1. 브라우저에서 다음 URL 접속:
   ```
   https://ourcaravan.app.n8n.cloud/workflow/0nMXGSoqk6EBmHTc
   ```

2. **n8n 계정으로 로그인** (필요한 경우)

3. 워크플로우 편집 화면 확인

### 2.2 워크플로우 이름 설정

1. 상단의 워크플로우 이름 클릭
2. 이름 변경: `네이버 예약 → 카카오톡 발송`
3. **저장** 클릭

---

## 3단계: Gmail Trigger 노드 추가

### 3.1 노드 추가

1. 워크플로우 편집 화면에서 **"+" 버튼** 클릭
2. 검색창에 **"Gmail"** 입력
3. **"Gmail Trigger"** 선택

### 3.2 Credential 설정

1. **Credential** 드롭다운에서 **"Create New Credential"** 선택
2. **Credential Name**: `Gmail - caiius960122`
3. **OAuth2 API** 선택
4. **Connect my account** 클릭
5. Google 계정 선택 화면에서 **caiius960122@gmail.com** 선택
6. 권한 승인:
   - Gmail 읽기 권한 승인
   - n8n에 액세스 허용
7. **Save** 클릭

### 3.3 Parameters 설정

**Trigger On**: `Message`  
**Options** → **Filters**:
- **From**: `naver.com` (또는 `reservation@naver.com` - 실제 네이버 예약 이메일 주소)
- **Subject**: `예약 완료` (또는 비워두기)

### 3.4 테스트

1. 노드 우측 상단의 **"Execute Node"** 클릭
2. 이메일이 감지되는지 확인
3. 출력 데이터 구조 확인

---

## 4단계: IF 노드 추가 (예약 완료 확인)

### 4.1 노드 추가

1. Gmail Trigger 노드 우측의 **"+" 버튼** 클릭
2. 검색창에 **"IF"** 입력
3. **"IF"** 노드 선택

### 4.2 Condition 설정

**Condition**: `String`

**Value 1**: `{{ $json.subject }}`  
**Operation**: `Contains`  
**Value 2**: `예약 완료`

**또는 여러 조건:**

**Mode**: `Combine`  
**Combine**: `Any`

**Conditions**:
- Condition 1: `{{ $json.subject }}` contains `예약 완료`
- Condition 2: `{{ $json.subject }}` contains `예약확인`
- Condition 3: `{{ $json.from }}` contains `naver.com`

---

## 5단계: Code 노드 추가 (이메일 파싱)

### 5.1 노드 추가

1. IF 노드의 **True** 출력에서 **"+" 버튼** 클릭
2. 검색창에 **"Code"** 입력
3. **"Code"** 노드 선택

### 5.2 JavaScript 코드 입력

**Mode**: `Run Once for All Items`

**JavaScript Code**:

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

### 5.3 테스트

1. **Execute Node** 클릭
2. 추출된 데이터 확인:
   - `guestName`: 게스트 이름
   - `room`: 객실 번호
   - `checkin`: 체크인 날짜
   - `checkout`: 체크아웃 날짜
   - `phone`: 전화번호

---

## 6단계: Set 노드 추가 (데이터 정리)

### 6.1 노드 추가

1. Code 노드 우측의 **"+" 버튼** 클릭
2. 검색창에 **"Set"** 입력
3. **"Set"** 노드 선택

### 6.2 Values 설정

**Keep Only Set Fields**: 체크 해제

**Values**:

| Name | Value |
|------|-------|
| `guest` | `{{ $json.guestName }}` |
| `room` | `{{ $json.room }}` |
| `checkin` | `{{ $json.checkin }}` |
| `checkout` | `{{ $json.checkout }}` |
| `phone` | `{{ $json.phone }}` |
| `email` | `{{ $json.email }}` |

---

## 7단계: Function 노드 추가 (고유 링크 생성)

### 7.1 노드 추가

1. Set 노드 우측의 **"+" 버튼** 클릭
2. 검색창에 **"Function"** 입력
3. **"Function"** 노드 선택

### 7.2 JavaScript 코드 입력

**Function Code**:

```javascript
// 고유 토큰 생성
const data = `${$input.item.json.guest}-${$input.item.json.room}-${Date.now()}-${Math.random()}`;
const token = Buffer.from(data).toString('base64')
  .replace(/[+/=]/g, '')
  .substring(0, 32);

// 기본 URL (환경 변수에서 가져오거나 하드코딩)
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

---

## 8단계: HTTP Request 노드 추가 (카카오톡 발송)

### 8.1 노드 추가

1. Function 노드 우측의 **"+" 버튼** 클릭
2. 검색창에 **"HTTP Request"** 입력
3. **"HTTP Request"** 노드 선택

### 8.2 n8n 환경 변수 설정

1. n8n 상단 메뉴 → **Settings** → **Environment Variables**
2. 다음 변수 추가:

| Name | Value |
|------|-------|
| `KAKAO_ACCESS_TOKEN` | 카카오 Access Token |
| `WEB_APP_URL` | `https://ouscaravan.com` (또는 실제 URL) |

### 8.3 HTTP Request 설정

**Method**: `POST`  
**URL**: `https://kapi.kakao.com/v2/api/talk/memo/default/send`

**Authentication**: `Generic Credential Type`  
**Generic Auth Type**: `Header Auth`

**Header Name**: `Authorization`  
**Header Value**: `Bearer {{ $env.KAKAO_ACCESS_TOKEN }}`

**Send Headers**: 체크  
**Headers**:

| Name | Value |
|------|-------|
| `Content-Type` | `application/x-www-form-urlencoded` |

**Send Body**: 체크  
**Body Content Type**: `Form-Urlencoded`

**Body Parameters**:

| Name | Value |
|------|-------|
| `template_object` | `{"object_type":"text","text":"{{ $json.guest }}님, OUSCARAVAN 예약이 완료되었습니다!\n\n📅 체크인: {{ $json.checkin }}\n📅 체크아웃: {{ $json.checkout }}\n🏠 객실: {{ $json.room }}\n\n아래 링크를 클릭하여 컨시어지 서비스를 이용하세요:\n{{ $json.link }}","link":{"web_url":"{{ $json.link }}","mobile_web_url":"{{ $json.link }}"},"button_title":"컨시어지 서비스 이용하기"}` |

**참고**: `template_object` 값은 JSON 문자열이어야 하며, 따옴표를 이스케이프해야 합니다.

### 8.4 카카오톡 API 설정 확인

카카오톡 API가 아직 설정되지 않았다면 [KAKAO_API_SETUP.md](./KAKAO_API_SETUP.md) 문서를 참고하여 설정하세요.

---

## 9단계: 워크플로우 활성화

### 9.1 저장

1. 상단 **"Save"** 버튼 클릭
2. 워크플로우 저장 확인

### 9.2 활성화

1. 우측 상단의 **토글 스위치** 클릭하여 활성화
2. **"Active"** 상태 확인

---

## 10단계: 테스트

### 10.1 테스트 이메일 발송

1. **caiius960122@gmail.com**으로 테스트 이메일 발송
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

### 10.2 워크플로우 실행 확인

1. n8n 대시보드에서 **"Executions"** 확인
2. 워크플로우가 자동으로 실행되었는지 확인
3. 각 노드의 실행 결과 확인

### 10.3 카카오톡 메시지 확인

1. 카카오톡에서 메시지 수신 확인
2. 링크 클릭하여 웹 앱 접속 확인
3. 자동 로그인 확인

---

## 11단계: 문제 해결

### 11.1 이메일이 감지되지 않음

**확인 사항:**
- Gmail Trigger 노드가 활성화되어 있는지
- 필터 조건이 올바른지
- Gmail API 권한이 올바르게 설정되었는지

**해결 방법:**
- 필터 조건 완화 (From 필터 제거)
- Gmail Trigger 노드 재인증

### 11.2 데이터 추출 실패

**확인 사항:**
- 이메일 본문 형식 확인
- Code 노드의 출력 데이터 확인

**해결 방법:**
- 실제 네이버 예약 이메일 본문 확인
- 정규식 패턴 수정

### 11.3 카카오톡 발송 실패

**확인 사항:**
- Access Token 유효성
- HTTP Request 노드의 응답 확인

**해결 방법:**
- Access Token 갱신
- 카카오 API 에러 코드 확인

---

## 12단계: 추가 개선 (선택사항)

### 12.1 데이터베이스 저장

PostgreSQL 노드를 추가하여 예약 정보를 저장할 수 있습니다.

### 12.2 에러 처리

Error Trigger 노드를 추가하여 에러 발생 시 관리자에게 알림을 보낼 수 있습니다.

### 12.3 중복 방지

이미 처리된 이메일을 다시 처리하지 않도록 중복 체크 로직을 추가할 수 있습니다.

---

## ✅ 완료 체크리스트

- [ ] Gmail API 활성화 완료
- [ ] OAuth 클라이언트 ID 생성 완료
- [ ] n8n 워크플로우 접속 완료
- [ ] Gmail Trigger 노드 설정 완료
- [ ] IF 노드 설정 완료
- [ ] Code 노드 설정 완료
- [ ] Set 노드 설정 완료
- [ ] Function 노드 설정 완료
- [ ] HTTP Request 노드 설정 완료
- [ ] 카카오톡 API 환경 변수 설정 완료
- [ ] 워크플로우 활성화 완료
- [ ] 테스트 이메일 발송 및 확인 완료
- [ ] 카카오톡 메시지 수신 확인 완료

---

## 📞 지원

문제가 발생하거나 도움이 필요한 경우:

1. n8n 실행 로그 확인
2. 각 노드의 출력 데이터 확인
3. [EMAIL_TO_KAKAO_WORKFLOW.md](./EMAIL_TO_KAKAO_WORKFLOW.md) 문서 참고

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
