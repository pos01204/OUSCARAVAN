# n8n 워크플로우 빠른 설정 가이드

## 🎯 현재 상황

**워크플로우 URL**: https://ourcaravan.app.n8n.cloud/workflow/0nMXGSoqk6EBmHTc  
**Gmail 주소**: caiius960122@gmail.com  
**상태**: n8n에 로그인 완료

---

## ⚡ 빠른 시작 (5분)

### 1단계: 워크플로우 이름 변경

1. 워크플로우 상단의 **"AI Agent workflow"** 클릭
2. 이름을 **"네이버 예약 → 카카오톡 발송"**으로 변경
3. **Enter** 키 또는 다른 곳 클릭하여 저장

### 2단계: Gmail Trigger 노드 추가

1. 워크플로우 편집 화면에서 **빈 공간 클릭** 또는 **"+" 버튼** 클릭
2. 검색창에 **"Gmail Trigger"** 입력
3. **"Gmail Trigger"** 선택

#### Credential 설정:

1. **Credential** 드롭다운에서 **"Create New Credential"** 선택
2. **Credential Name**: `Gmail - caiius960122`
3. **OAuth2 API** 선택
4. **"Connect my account"** 클릭
5. Google 계정 선택: **caiius960122@gmail.com**
6. 권한 승인:
   - ✅ Gmail 읽기 권한
   - ✅ n8n에 액세스 허용
7. **"Save"** 클릭

#### Parameters 설정:

**Trigger On**: `Message`

**Options** → **Filters**:
- **From**: `naver.com` (또는 비워두기 - 모든 이메일)
- **Subject**: 비워두기 (또는 `예약 완료`)

**Save** 클릭

### 3단계: IF 노드 추가

1. Gmail Trigger 노드 우측의 **"+" 버튼** 클릭
2. 검색: **"IF"**
3. **"IF"** 노드 선택

**Condition 설정:**

**Value 1**: `{{ $json.subject }}`  
**Operation**: `Contains`  
**Value 2**: `예약 완료`

**Save** 클릭

### 4단계: Code 노드 추가 (이메일 파싱)

1. IF 노드의 **True** 출력에서 **"+" 버튼** 클릭
2. 검색: **"Code"**
3. **"Code"** 노드 선택

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

### 5단계: Set 노드 추가

1. Code 노드 우측의 **"+" 버튼** 클릭
2. 검색: **"Set"**
3. **"Set"** 노드 선택

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

### 6단계: Function 노드 추가 (고유 링크 생성)

1. Set 노드 우측의 **"+" 버튼** 클릭
2. 검색: **"Function"**
3. **"Function"** 노드 선택

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

### 7단계: HTTP Request 노드 추가 (카카오톡 발송)

1. Function 노드 우측의 **"+" 버튼** 클릭
2. 검색: **"HTTP Request"**
3. **"HTTP Request"** 노드 선택

#### 기본 설정:

**Method**: `POST`  
**URL**: `https://kapi.kakao.com/v2/api/talk/memo/default/send`

#### Authentication 설정:

**Authentication**: `Generic Credential Type`  
**Generic Auth Type**: `Header Auth`

**Header Name**: `Authorization`  
**Header Value**: `Bearer {{ $env.KAKAO_ACCESS_TOKEN }}`

#### Headers 설정:

**Send Headers**: 체크

| Name | Value |
|------|-------|
| `Content-Type` | `application/x-www-form-urlencoded` |

#### Body 설정:

**Send Body**: 체크  
**Body Content Type**: `Form-Urlencoded`

**Body Parameters**:

| Name | Value |
|------|-------|
| `template_object` | `{"object_type":"text","text":"{{ $json.guest }}님, OUSCARAVAN 예약이 완료되었습니다!\n\n📅 체크인: {{ $json.checkin }}\n📅 체크아웃: {{ $json.checkout }}\n🏠 객실: {{ $json.room }}\n\n아래 링크를 클릭하여 컨시어지 서비스를 이용하세요:\n{{ $json.link }}","link":{"web_url":"{{ $json.link }}","mobile_web_url":"{{ $json.link }}"},"button_title":"컨시어지 서비스 이용하기"}` |

**중요**: `template_object` 값은 JSON 문자열이어야 하며, 따옴표를 이스케이프해야 합니다.

**Save** 클릭

### 8단계: 환경 변수 설정

1. n8n 상단 메뉴 → **Settings** (⚙️ 아이콘)
2. **Environment Variables** 클릭
3. 다음 변수 추가:

| Name | Value |
|------|-------|
| `KAKAO_ACCESS_TOKEN` | 카카오 Access Token (카카오톡 API 설정 필요) |
| `WEB_APP_URL` | `https://ouscaravan.com` (또는 실제 배포 URL) |

**참고**: 카카오톡 API가 아직 설정되지 않았다면 [KAKAO_API_SETUP.md](./KAKAO_API_SETUP.md) 참고

### 9단계: 워크플로우 저장 및 활성화

1. 상단 **"Save"** 버튼 클릭
2. 우측 상단의 **토글 스위치** 클릭하여 활성화
3. **"Active"** 상태 확인

---

## 🧪 테스트

### 테스트 이메일 발송

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

### 실행 확인

1. n8n 대시보드 → **Executions** 확인
2. 워크플로우가 자동 실행되었는지 확인
3. 각 노드의 실행 결과 확인

---

## ⚠️ 중요 사항

### Gmail API 활성화 필요

Gmail Trigger를 사용하려면 **Google Cloud Console**에서 Gmail API를 활성화해야 합니다.

**자세한 내용**: [N8N_WORKFLOW_SETUP_GUIDE.md](./N8N_WORKFLOW_SETUP_GUIDE.md)의 "1단계: Gmail API 활성화" 참고

### 카카오톡 API 설정 필요

카카오톡 메시지를 발송하려면 카카오톡 API를 설정해야 합니다.

**자세한 내용**: [KAKAO_API_SETUP.md](./KAKAO_API_SETUP.md) 참고

---

## 📋 체크리스트

- [ ] 워크플로우 이름 변경
- [ ] Gmail Trigger 노드 추가 및 인증
- [ ] IF 노드 추가
- [ ] Code 노드 추가 (이메일 파싱)
- [ ] Set 노드 추가
- [ ] Function 노드 추가 (링크 생성)
- [ ] HTTP Request 노드 추가 (카카오톡 발송)
- [ ] 환경 변수 설정
- [ ] 워크플로우 저장 및 활성화
- [ ] 테스트 이메일 발송 및 확인

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
