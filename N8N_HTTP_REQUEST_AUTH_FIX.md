# n8n HTTP Request 인증 설정 가이드

## 🔍 문제

**증상 1: "Authorization failed" 에러**
- HTTP Request 노드에서 "Authorization failed" 에러 발생
- `X-API-Key` 헤더를 설정했지만 인증 실패

**증상 2: "Header name must be a valid HTTP token" 에러**
- HTTP Request 노드에서 "Header name must be a valid HTTP token ["Railway API Key"]" 에러 발생
- Authentication에서 Header Auth Credential 사용 시 발생

**원인:**
- n8n HTTP Request 노드에서 헤더가 제대로 전송되지 않음
- 또는 Railway API가 헤더를 제대로 읽지 못함
- Header Auth Credential의 Header Name이 공백을 포함함 (HTTP 헤더 이름 규칙 위반)

---

## ✅ 해결 방법

### 방법 1: HTTP Request 노드에서 헤더 직접 설정 (권장)

**⚠️ 중요: Authentication을 `None`으로 설정**

**HTTP Request 노드 설정:**

1. **"HTTP Request"** 노드 클릭
2. **Method:** `POST`
3. **URL:** `https://ouscaravan-production.up.railway.app/api/admin/reservations`
4. **Authentication:** `None` 선택
   - ⚠️ **중요:** "Header Auth" 또는 "Generic Credential Type"을 사용하지 마세요
   - Header Auth Credential의 Header Name이 공백을 포함하면 "Header name must be a valid HTTP token" 에러 발생
5. **Send Headers:** `ON` (활성화)
6. **Specify Headers:** `Using Fields Below`
7. **Header Parameters:**
   - **Name:** `X-API-Key` (공백 없음, 하이픈 사용)
   - **Value:** Railway API Key 직접 입력
     - **중요:** Expression 모드가 아닌 일반 텍스트로 입력
     - Expression 아이콘(`fx`)이 있으면 클릭하여 비활성화
     - Railway 대시보드 → OUSCARAVAN 서비스 → Variables → `N8N_API_KEY` 값 복사
   - **"Add Parameter"** 클릭
   - **Name:** `Content-Type`
   - **Value:** `application/json`
8. **Send Body:** `ON` (활성화)
9. **Body Content Type:** `JSON`
10. **Specify Body:** `Using Fields Below`
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

**주의사항:**
- API Key Value 필드에 Expression 아이콘(`fx`)이 있으면 클릭하여 비활성화
- Expression 모드에서는 API Key가 문자열로 해석되지 않을 수 있음
- 일반 텍스트 모드로 직접 입력

---

### 방법 2: n8n Credentials 사용 (더 안전)

**n8n Credentials 설정:**

1. **n8n 대시보드** → **"Credentials"** 메뉴 클릭
2. **"Add Credential"** 클릭
3. **"Header Auth"** 선택
4. **Credential 설정:**
   - **Name:** `Railway API Key`
   - **Header Name:** `X-API-Key`
   - **Header Value:** Railway에서 생성한 API Key 입력
5. **"Save"** 클릭

**HTTP Request 노드에서 사용:**

1. **"HTTP Request"** 노드 클릭
2. **Authentication:** `Header Auth` 선택
3. **Credential:** 생성한 `Railway API Key` 선택
4. 나머지 설정은 방법 1과 동일

---

### 방법 3: Set 노드에서 API Key 추가

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
  "apiKey": "your-railway-api-key-here"
}
```

**HTTP Request 노드 설정:**

1. **Headers:**
   - **Name:** `X-API-Key`
   - **Value:** `{{ $json.apiKey }}` (Expression 모드 사용)

---

## 🔧 Railway API Key 확인

**Railway 대시보드 → OUSCARAVAN 서비스 → Variables:**

1. `N8N_API_KEY` 변수 확인
2. 값 복사
3. n8n HTTP Request 노드의 Header Value에 붙여넣기

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

## 🐛 문제 해결

### 문제 1: "Authorization failed" 에러

**원인:**
- API Key가 헤더에 제대로 전송되지 않음
- Expression 모드에서 API Key가 문자열로 해석되지 않음

**해결:**
1. Header Value 필드에서 Expression 아이콘(`fx`) 클릭하여 비활성화
2. API Key를 일반 텍스트로 직접 입력
3. 또는 n8n Credentials 사용

---

### 문제 2: 헤더가 전송되지 않음

**원인:**
- "Send Headers" 토글이 OFF 상태
- 헤더 이름이 잘못됨

**해결:**
1. "Send Headers" 토글을 ON으로 설정
2. 헤더 이름 확인: `X-API-Key` (대소문자 구분)
3. Railway 코드에서 헤더 이름 확인

---

### 문제 3: Railway API가 헤더를 읽지 못함

**원인:**
- Railway 코드에서 헤더 이름이 다름
- 헤더가 소문자로 변환됨

**해결:**
1. Railway 코드 확인: `req.headers['x-api-key']` 또는 `req.headers['X-API-Key']`
2. n8n에서 헤더 이름을 소문자로 시도: `x-api-key`

---

## 📋 체크리스트

### Railway 설정:

- [ ] Railway 환경 변수 `N8N_API_KEY` 생성
- [ ] Railway 코드 배포 (API Key 인증 지원)
- [ ] Railway 로그에서 헤더 확인

### n8n HTTP Request 노드 설정:

- [ ] Method: `POST`
- [ ] URL: `https://ouscaravan-production.up.railway.app/api/admin/reservations`
- [ ] Authentication: `None` (또는 Header Auth Credential 사용)
- [ ] Send Headers: `ON`
- [ ] Header Name: `X-API-Key`
- [ ] Header Value: API Key 직접 입력 (Expression 모드 비활성화)
- [ ] Content-Type: `application/json`
- [ ] Send Body: `ON`
- [ ] Body: JSON 형식으로 데이터 매핑

### 테스트:

- [ ] HTTP Request 노드 테스트 실행
- [ ] 출력 결과 확인
- [ ] Railway 로그에서 요청 확인
- [ ] 예약 데이터가 PostgreSQL에 저장되는지 확인

---

## 🔍 Railway API 헤더 확인

Railway 코드에서 헤더를 읽는 방법:

```typescript
// railway-backend/src/routes/admin.routes.ts
const apiKey = req.headers['x-api-key'] || req.headers['X-API-Key'];
```

**n8n에서 헤더 이름:**
- `X-API-Key` (권장)
- 또는 `x-api-key` (소문자)

---

**문서 버전**: 1.0  
**최종 업데이트**: 2026-01-06
