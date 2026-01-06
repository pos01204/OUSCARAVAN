# n8n "Authorization failed" 에러 해결

## 🔍 문제

**증상:**
- Authentication을 `None`으로 설정했지만 "Authorization failed" 에러 발생
- `X-API-Key` 헤더를 설정했지만 인증 실패
- Value 필드 옆에 `fx` (Expression) 아이콘이 있음

**원인:**
1. **Expression 모드가 활성화되어 있음** - API Key가 문자열로 해석되지 않음
2. Railway API가 헤더를 제대로 읽지 못함
3. API Key 값이 잘못되었거나 불완전함

---

## ✅ 해결 방법

### 방법 1: Expression 모드 비활성화 (가장 중요)

**HTTP Request 노드 설정:**

1. **"HTTP Request"** 노드 클릭
2. **Header Parameters** 섹션으로 이동
3. **X-API-Key** 헤더의 **Value** 필드 확인
4. **Value 필드 옆의 `fx` 아이콘 클릭하여 비활성화**
   - Expression 모드가 활성화되어 있으면 API Key가 JavaScript 표현식으로 해석됨
   - 일반 텍스트 모드로 변경해야 함
5. **Value 필드에 Railway API Key 전체를 직접 입력**
   - Railway 대시보드 → OUSCARAVAN 서비스 → Variables → `N8N_API_KEY` 값 복사
   - 전체 값을 붙여넣기 (일부만 입력하지 않음)

**Expression 모드 확인:**
- `fx` 아이콘이 **주황색/활성화**되어 있으면 Expression 모드
- `fx` 아이콘이 **회색/비활성화**되어 있으면 일반 텍스트 모드

---

### 방법 2: Railway API Key 전체 값 확인

**Railway 대시보드에서 확인:**

1. **Railway 대시보드** → **OUSCARAVAN 서비스** → **Variables**
2. **`N8N_API_KEY`** 변수 클릭
3. **값 전체 복사** (일부만 복사하지 않음)
4. n8n HTTP Request 노드의 Header Value에 붙여넣기

**API Key가 없다면 생성:**

1. Railway 대시보드 → OUSCARAVAN 서비스 → Variables
2. **"Add Variable"** 클릭
3. **Name:** `N8N_API_KEY`
4. **Value:** 강력한 랜덤 문자열 생성
5. **"Save"** 클릭

**PowerShell에서 생성:**
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))
```

---

### 방법 3: Railway 로그 확인

**Railway 대시보드 → OUSCARAVAN 서비스 → Logs:**

**확인할 내용:**
1. "API Key check" 로그 메시지
2. `hasApiKey`: `true`인지 확인
3. `apiKeyLength`: API Key 길이 확인
4. `hasEnvKey`: `true`인지 확인
5. "API Key mismatch" 메시지 확인

**예상 로그:**
```
API Key check: {
  hasApiKey: true,
  apiKeyLength: 64,
  hasEnvKey: true,
  envKeyLength: 64,
  headers: ['x-api-key']
}
```

**문제가 있는 경우:**
```
API Key check: {
  hasApiKey: false,  // 헤더가 전송되지 않음
  ...
}
```

또는

```
API Key mismatch: {
  received: 'YjMzYTBIY...',  // 받은 API Key (일부)
  expected: 'YjMzYTBlY...'   // 예상된 API Key (일부)
}
```

---

### 방법 4: Set 노드 사용 (대안)

**워크플로우 구조:**
```
Gmail Trigger → Code (이메일 파싱) → Set (API Key 추가) → HTTP Request
```

**Set 노드 설정:**

1. **"Set"** 노드 추가 (Code 노드 다음)
2. **Values:**
```json
{
  "reservationNumber": "{{ $json.reservationNumber }}",
  "guestName": "{{ $json.guestName }}",
  "email": "{{ $json.email || '' }}",
  "checkin": "{{ $json.checkin }}",
  "checkout": "{{ $json.checkout }}",
  "roomType": "{{ $json.roomType }}",
  "amount": {{ $json.amount || 0 }},
  "apiKey": "YjMzYTBlYzEtM2RjOS00MDBkLTgxZjEtMjc3YzQyMTg1N2M0YzNjYThlZTYtMWI2MC00MDYzLTlmNzktMDgxN2IyODIxOGQ3"
}
```

**HTTP Request 노드 설정:**

1. **Header Parameters:**
   - **Name:** `X-API-Key`
   - **Value:** `{{ $json.apiKey }}` (Expression 모드 사용 가능)
2. 나머지 설정은 동일

---

## 🔧 단계별 해결 가이드

### 1단계: Expression 모드 비활성화

1. HTTP Request 노드 클릭
2. Header Parameters → X-API-Key → Value 필드 확인
3. **`fx` 아이콘 클릭하여 비활성화**
4. Value 필드에 API Key 전체 입력

### 2단계: API Key 값 확인

1. Railway 대시보드 → Variables → `N8N_API_KEY` 확인
2. 값 전체 복사
3. n8n에 붙여넣기

### 3단계: Railway 로그 확인

1. Railway 대시보드 → Logs 확인
2. "API Key check" 메시지 확인
3. 문제가 있으면 로그 내용 확인

### 4단계: 테스트

1. n8n에서 "Execute step" 클릭
2. 출력 결과 확인
3. Railway 로그에서 성공 메시지 확인

---

## 🐛 문제 해결

### 문제 1: Expression 모드가 활성화되어 있음

**증상:**
- Value 필드 옆에 `fx` 아이콘이 주황색/활성화 상태
- API Key가 문자열로 해석되지 않음

**해결:**
1. `fx` 아이콘 클릭하여 비활성화
2. API Key를 일반 텍스트로 직접 입력

---

### 문제 2: API Key 값이 불완전함

**증상:**
- API Key가 일부만 입력됨
- Railway 로그에서 "API Key mismatch" 메시지

**해결:**
1. Railway 대시보드에서 API Key 전체 복사
2. n8n에 전체 값 붙여넣기

---

### 문제 3: Railway API가 헤더를 읽지 못함

**증상:**
- Railway 로그에서 `hasApiKey: false`
- 헤더가 전송되지 않음

**해결:**
1. "Send Headers" 토글이 ON인지 확인
2. Header Name이 정확히 `X-API-Key`인지 확인
3. Railway 코드 배포 확인

---

### 문제 4: Railway 환경 변수가 설정되지 않음

**증상:**
- Railway 로그에서 `hasEnvKey: false`
- `N8N_API_KEY` 환경 변수가 없음

**해결:**
1. Railway 대시보드 → Variables 확인
2. `N8N_API_KEY` 변수가 있는지 확인
3. 없으면 생성

---

## 📋 체크리스트

### n8n HTTP Request 노드:

- [ ] Authentication: `None` 선택
- [ ] Send Headers: `ON` (활성화)
- [ ] Header Name: `X-API-Key` (정확히 일치)
- [ ] Header Value: Expression 모드 비활성화 (`fx` 아이콘 클릭)
- [ ] Header Value: API Key 전체 값 입력
- [ ] Content-Type: `application/json`

### Railway 설정:

- [ ] Railway 환경 변수 `N8N_API_KEY` 생성
- [ ] Railway 코드 배포 (API Key 인증 지원)
- [ ] Railway 로그에서 "API Key check" 확인

### 테스트:

- [ ] HTTP Request 노드 테스트 실행
- [ ] Railway 로그에서 성공 메시지 확인
- [ ] 출력 결과 확인

---

## 🔍 Railway 로그 확인 방법

**Railway 대시보드 → OUSCARAVAN 서비스 → Logs:**

**성공 시 예상 로그:**
```
API Key check: { hasApiKey: true, apiKeyLength: 64, ... }
API Key authentication successful
```

**실패 시 예상 로그:**
```
API Key check: { hasApiKey: false, ... }
또는
API Key mismatch: { received: '...', expected: '...' }
```

---

**문서 버전**: 1.0  
**최종 업데이트**: 2026-01-06
