# n8n Generic Credential Type 권한 문제 해결

## 🔍 문제

**증상:**
- Generic Credential Type을 사용하여 Header Auth 설정
- HTTP Request 노드에서 "Authorization failed" 에러 발생
- Header Value가 잘려서 보임 (truncated)

**원인:**
1. Generic Credential Type의 Header Value가 전체 API Key가 아님
2. HTTP Request 노드의 Header Parameters에서 Credential이 제대로 적용되지 않음
3. Railway 환경 변수와 API Key 값이 일치하지 않음

---

## ✅ 해결 방법

### 1단계: Railway 로그 확인 (가장 중요)

**Railway 대시보드 → OUSCARAVAN 서비스 → Logs:**

**확인할 내용:**
1. "API Key check" 로그 메시지 확인
2. `hasApiKey`: `true`인지 확인
3. `apiKeyLength`: API Key 길이 확인
4. `hasEnvKey`: `true`인지 확인
5. "API Key mismatch" 메시지 확인

**예상 로그:**
```javascript
API Key check: {
  hasApiKey: true/false,
  apiKeyLength: 64,
  hasEnvKey: true/false,
  envKeyLength: 64,
  headers: ['x-api-key']
}
```

**문제 진단:**

**케이스 1: `hasApiKey: false`**
- 헤더가 전송되지 않음
- 해결: HTTP Request 노드의 Header Parameters 확인

**케이스 2: `hasEnvKey: false`**
- Railway 환경 변수가 설정되지 않음
- 해결: Railway Variables에서 `N8N_API_KEY` 생성

**케이스 3: "API Key mismatch"**
- API Key 값이 일치하지 않음
- 해결: Railway Variables와 n8n Credential의 API Key 값 확인

---

### 2단계: Generic Credential Type 수정

**n8n Credentials 설정:**

1. **n8n 대시보드** → **"Credentials"** 메뉴 클릭
2. **"Railway API Key"** Credential 클릭 (편집)
3. **Header Auth 설정 확인:**
   - **Header Name:** `X-API-Key` (공백 없음)
   - **Header Value:** Railway API Key 전체 값
     - ⚠️ **중요:** 전체 값을 붙여넣기 (일부만 입력하지 않음)
     - Railway 대시보드 → OUSCARAVAN 서비스 → Variables → `N8N_API_KEY` 값 복사
     - 전체 값을 붙여넣기
4. **"Save"** 클릭

**API Key 전체 값 확인:**
- Railway Variables에서 `N8N_API_KEY` 값 전체 복사
- Credential의 Header Value에 전체 붙여넣기
- 값이 잘려서 보이더라도 전체 값이 저장되어 있는지 확인

---

### 3단계: HTTP Request 노드 설정 확인

**HTTP Request 노드 설정:**

1. **"HTTP Request"** 노드 클릭
2. **Authentication:** `Generic Credential Type` 선택
3. **Generic Auth Type:** `Header Auth` 선택
4. **Header Auth:** `Railway API Key` 선택
5. **Send Headers:** `ON` (활성화)
6. **Specify Headers:** `Using Fields Below` 선택
7. **Header Parameters 확인:**
   - Credential이 자동으로 `X-API-Key` 헤더를 추가함
   - **중요:** Header Parameters에 `X-API-Key`가 자동으로 추가되어 있는지 확인
   - 수동으로 추가하지 않아도 됨 (중복 방지)
   - **Content-Type** 헤더만 추가:
     - **Name:** `Content-Type`
     - **Value:** `application/json`
8. **Send Body:** `ON` (활성화)
9. **Body Content Type:** `JSON` 선택
10. **Specify Body:** `Using Fields Below` 선택
11. **Body:**
```json
{
  "reservationNumber": "{{ $json.reservationNumber }}",
  "guestName": "{{ $json.guestName }}",
  "email": "{{ $json.email || '' }}",
  "checkin": "{{ $json.checkin }}",
  "checkout": "{{ $json.checkout }}",
  "roomType": "{{ $json.roomType }}",
  "amount": {{ $json.amount || 0 }}
}
```

**중요:** Body에 `apiKey` 필드가 없어야 합니다!

---

### 4단계: Edit Fields (Set) 노드 확인

**Edit Fields 노드 설정:**

1. **"Edit Fields"** 노드 클릭
2. **Mode:** `JSON` 선택
3. **JSON:**
```json
{
  "reservationNumber": "{{ $json.reservationNumber }}",
  "guestName": "{{ $json.guestName }}",
  "email": "{{ $json.email || '' }}",
  "checkin": "{{ $json.checkin }}",
  "checkout": "{{ $json.checkout }}",
  "roomType": "{{ $json.roomType }}",
  "amount": {{ $json.amount || 0 }}
}
```

**중요:** Edit Fields 노드의 JSON에서 `apiKey` 필드를 제거하세요!
- Edit Fields 노드는 예약 정보만 전달
- API Key는 Credential에서 관리

---

## 🔧 문제 해결

### 문제 1: Header Value가 잘려서 보임

**증상:**
- HTTP Request 노드의 Header Value에 API Key 일부만 표시됨
- 전체 값이 전송되지 않음

**해결:**
1. Generic Credential Type의 Header Value 확인
2. Railway Variables에서 전체 API Key 복사
3. Credential의 Header Value에 전체 붙여넣기
4. Credential 저장 후 HTTP Request 노드에서 다시 선택

---

### 문제 2: Credential이 Header에 적용되지 않음

**증상:**
- Generic Credential Type을 선택했지만 Header가 추가되지 않음

**해결:**
1. HTTP Request 노드의 Authentication 설정 확인
2. Generic Auth Type: `Header Auth` 선택
3. Header Auth: `Railway API Key` 선택
4. Send Headers: `ON` 확인
5. Header Parameters에서 `X-API-Key`가 자동으로 추가되었는지 확인

---

### 문제 3: API Key 값이 일치하지 않음

**증상:**
- Railway 로그에서 "API Key mismatch" 메시지

**해결:**
1. Railway Variables에서 `N8N_API_KEY` 값 확인
2. n8n Credential의 Header Value와 비교
3. 값이 정확히 일치하는지 확인
4. 공백이나 줄바꿈이 포함되지 않았는지 확인

---

## 📋 체크리스트

### Railway 설정:

- [ ] Railway 환경 변수 `N8N_API_KEY` 생성
- [ ] Railway 환경 변수 값 전체 복사
- [ ] Railway 로그에서 "API Key check" 확인

### n8n Credential 설정:

- [ ] Generic Credential Type 생성: `Railway API Key`
- [ ] Header Name: `X-API-Key` (공백 없음)
- [ ] Header Value: Railway API Key 전체 값
- [ ] Credential 저장

### HTTP Request 노드 설정:

- [ ] Authentication: `Generic Credential Type` 선택
- [ ] Generic Auth Type: `Header Auth` 선택
- [ ] Header Auth: `Railway API Key` 선택
- [ ] Send Headers: `ON` (활성화)
- [ ] Header Parameters에 `X-API-Key` 자동 추가 확인
- [ ] Content-Type: `application/json` 추가
- [ ] Body에 예약 정보만 포함 (apiKey 제외)

### Edit Fields 노드 설정:

- [ ] JSON에서 `apiKey` 필드 제거
- [ ] 예약 정보만 포함

---

## 🔍 Railway 로그 분석

**성공 시 예상 로그:**
```
API Key check: {
  hasApiKey: true,
  apiKeyLength: 64,
  hasEnvKey: true,
  envKeyLength: 64,
  headers: ['x-api-key']
}
API Key authentication successful
```

**실패 시 예상 로그:**

**케이스 1: 헤더 없음**
```
API Key check: {
  hasApiKey: false,  // 문제!
  apiKeyLength: 0,
  hasEnvKey: true,
  envKeyLength: 64,
  headers: []
}
```

**케이스 2: 환경 변수 없음**
```
API Key check: {
  hasApiKey: true,
  apiKeyLength: 64,
  hasEnvKey: false,  // 문제!
  envKeyLength: 0,
  headers: ['x-api-key']
}
```

**케이스 3: API Key 불일치**
```
API Key check: {
  hasApiKey: true,
  apiKeyLength: 64,
  hasEnvKey: true,
  envKeyLength: 64,
  headers: ['x-api-key']
}
API Key mismatch: {
  received: 'YjMzYTBIY...',
  expected: 'YjMzYTBlY...'
}
```

---

## 🚀 빠른 해결 단계

1. **Railway 로그 확인**
   - Railway 대시보드 → Logs
   - "API Key check" 메시지 확인
   - 문제 진단

2. **Generic Credential Type 수정**
   - Credential 편집
   - Header Value에 Railway API Key 전체 값 붙여넣기
   - 저장

3. **HTTP Request 노드 재설정**
   - Authentication: `Generic Credential Type` 선택
   - Generic Auth Type: `Header Auth` 선택
   - Header Auth: `Railway API Key` 선택
   - Header Parameters 확인

4. **Edit Fields 노드 수정**
   - JSON에서 `apiKey` 필드 제거

5. **테스트**
   - HTTP Request 노드 실행
   - Railway 로그 확인

---

**문서 버전**: 1.0  
**최종 업데이트**: 2026-01-06
