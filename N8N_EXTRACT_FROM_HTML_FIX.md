# n8n HTML 노드 (Extract HTML Content) 설정 가이드

## 🔍 문제점

**에러 메시지:**
```
No property named "data" exists!
```

**원인:**
- HTML 노드의 JSON Property가 `data`로 설정되어 있음
- Gmail Trigger의 출력에는 `data` 필드가 없음
- Gmail Trigger는 `snippet`, `payload`, `id`, `threadId` 등의 필드만 제공
- HTML 본문은 `payload` 안에 Base64로 인코딩되어 있거나, Gmail Get 노드가 필요함

---

## ✅ 해결 방법

### 방법 1: Gmail Get 노드 추가 (권장)

**워크플로우 구조:**
```
Gmail Trigger → Gmail Get → Extract from HTML → Code
```

#### 1단계: Gmail Get 노드 추가

1. Gmail Trigger 노드 우측의 **"+" 버튼** 클릭
2. 검색: **"Gmail"**
3. **"Gmail"** 노드 선택

#### 2단계: Gmail Get 노드 설정

**Operation:**
- **"Get"** 선택

**Message ID:**
- `{{ $json.id }}` (Gmail Trigger에서 전달된 이메일 ID)

**Format:**
- **"Full"** 선택 (전체 이메일 본문 가져오기)

**Simple:**
- **"No"** 선택 (전체 데이터 구조 유지)

**Save** 클릭

#### 3단계: Gmail Get 노드 출력 확인

1. Gmail Get 노드 클릭
2. **"Test step"** 또는 **"Execute step"** 클릭
3. **OUTPUT** 패널에서 실제 필드 이름 확인:
   - `body` (text/plain)
   - `htmlBody` (text/html)
   - `payload.body.data` (Base64 인코딩된 데이터)

#### 4단계: HTML 노드 설정 (Extract HTML Content)

**Operation:**
- **"Extract HTML Content"** 선택

**Source Data:**
- **"JSON"** 선택

**JSON Property:**
- Gmail Get 노드의 출력을 확인하여 HTML 본문이 있는 필드 경로 입력
- **중요:** `data`가 아니라 실제 필드 이름 사용!
- 예시:
  - `htmlBody` (HTML 본문이 직접 있는 경우)
  - `body` (텍스트 본문이 있는 경우)
  - `payload.body.data` (Base64 인코딩된 데이터인 경우, 디코딩 필요)

**Gmail Get 노드 출력 확인 방법:**
1. Gmail Get 노드 클릭
2. **"Test step"** 또는 **"Execute step"** 클릭
3. **OUTPUT** 패널에서 실제 필드 이름 확인
4. HTML 본문이 있는 필드 경로를 JSON Property에 입력

**주의:**
- Base64 인코딩된 데이터 (`payload.body.data`)는 HTML 노드에서 직접 사용 불가
- Code 노드에서 디코딩 후 사용 필요
- Gmail Trigger의 `snippet`은 HTML이 아니라 텍스트입니다

---

### 방법 2: Gmail Trigger에서 직접 사용 (제한적)

**Gmail Trigger의 `snippet` 사용:**
- HTML 노드의 JSON Property: `snippet`
- **주의:** `snippet`은 HTML이 아니라 텍스트입니다
- HTML 파싱이 필요한 경우 Gmail Get 노드 필수

### 방법 3: HTML 노드 제거 (가장 권장)

**Extract from HTML 노드는 복잡하고 제한적입니다:**
- Gmail Get 노드의 출력 구조에 따라 필드 경로가 달라질 수 있음
- Base64 인코딩된 데이터는 직접 처리 불가
- Code 노드에서 직접 파싱하는 것이 더 유연하고 안정적

**워크플로우 구조:**
```
Gmail Trigger → Gmail Get → Code (HTML 파싱) → HTTP Request
```

#### Code 노드에서 HTML 직접 파싱

Code 노드의 `extractBodyFromPayload` 함수가 이미 HTML을 처리합니다:

```javascript
// text/html 부분도 사용 (HTML 태그 제거 후)
else if (part.mimeType === 'text/html' && part.body && part.body.data) {
  try {
    const htmlBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
    // HTML 태그 제거
    const textFromHtml = htmlBody.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    body += textFromHtml + '\n';
  } catch (e) {
    console.log('Failed to decode HTML part:', e);
  }
}
```

**장점:**
- Extract from HTML 노드 불필요
- 더 유연한 파싱 가능
- Base64 디코딩 자동 처리
- 에러 처리 용이

---

## 📋 단계별 체크리스트

### Gmail Get 노드 추가 (필수):
- [ ] Gmail Trigger 다음에 Gmail Get 노드 추가
- [ ] Operation: Get
- [ ] Message ID: `{{ $json.id }}`
- [ ] Format: Full
- [ ] Simple: No
- [ ] Gmail Get 노드 출력 확인

### HTML 노드 설정 (선택사항):
- [ ] HTML 노드 추가
- [ ] Operation: Extract HTML Content
- [ ] Source Data: JSON
- [ ] JSON Property: Gmail Get 노드 출력 확인 후 정확한 필드 경로 입력 (예: `htmlBody`, `body`)
- [ ] **중요:** `data`가 아니라 실제 필드 이름 사용!
- [ ] Test step 실행하여 에러 없는지 확인

### 또는 HTML 노드 제거 (권장):
- [ ] Extract from HTML 노드 제거
- [ ] Gmail Get → Code 노드 직접 연결
- [ ] Code 노드에서 HTML 파싱 코드 확인

---

## 🔧 문제 해결

### 문제 1: "No property named "data" exists!" 에러

**원인:**
- HTML 노드의 JSON Property가 `data`로 설정되어 있음
- Gmail Trigger의 출력에는 `data` 필드가 없음

**해결:**
1. Gmail Trigger의 출력 확인:
   - `snippet` (텍스트, HTML 아님)
   - `payload` (Base64 인코딩된 데이터)
2. HTML 노드의 JSON Property 수정:
   - Gmail Trigger 직접 연결 시: `snippet` (제한적, 텍스트만)
   - Gmail Get 노드 사용 시: Gmail Get 노드 출력 확인 후 정확한 필드 경로 사용 (예: `htmlBody`)
3. **또는 Gmail Get 노드 추가 후 사용** (권장)

### 문제 2: JSON Property 경로를 모르는 경우

**해결:**
1. Gmail Get 노드 클릭 (또는 Gmail Trigger 클릭)
2. "Test step" 실행
3. OUTPUT 패널에서 실제 필드 이름 확인
4. HTML 노드의 JSON Property에 정확한 필드 이름 입력
   - 예: `htmlBody`, `body`, `snippet` 등
   - **주의:** `data`가 아니라 실제 필드 이름 사용!

### 문제 3: Base64 데이터 처리

**원인:**
- Gmail API는 본문을 Base64로 인코딩하여 전송
- Extract from HTML은 Base64를 직접 처리하지 못함

**해결:**
- Extract from HTML 노드 제거
- Code 노드에서 Base64 디코딩 후 HTML 파싱

---

## 📚 참고

- [n8n Gmail 노드 문서](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.gmail/)
- [n8n Extract from File 노드 문서](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.extractfromfile/)
- [Gmail API 메시지 형식](https://developers.google.com/gmail/api/reference/rest/v1/users.messages)

---

**문서 버전**: 1.0  
**최종 업데이트**: 2026-01-07
