# n8n HTTP Request 노드 완전 설정 가이드

## 🔍 문제: "Authorization failed" 에러

**증상:**
- HTTP Request 노드에서 "Authorization failed" 에러 발생
- `X-API-Key` 헤더를 설정했지만 인증 실패

**원인:**
- n8n에서 헤더가 Expression 모드로 설정되어 문자열로 해석되지 않음
- 또는 Railway API가 헤더를 제대로 읽지 못함

---

## ✅ 해결 방법

### 방법 1: HTTP Request 노드 헤더 설정 (권장)

**단계별 설정:**

#### 1단계: 기본 설정

1. **"HTTP Request"** 노드 클릭
2. **Method:** `POST` 선택
3. **URL:** `https://ouscaravan-production.up.railway.app/api/admin/reservations`
4. **Authentication:** `None` (그대로 유지)

#### 2단계: 헤더 설정

1. **"Send Headers"** 토글: `ON` (활성화)
2. **"Specify Headers"** 드롭다운: `Using Fields Below` 선택
3. **Header Parameters:**
   - **첫 번째 헤더:**
     - **Name:** `X-API-Key`
     - **Value:** Railway API Key 직접 입력
       - **중요:** Expression 아이콘(`fx`)이 있으면 클릭하여 비활성화
       - Expression 모드가 활성화되어 있으면 API Key가 문자열로 해석되지 않음
       - Railway 대시보드 → OUSCARAVAN 서비스 → Variables → `N8N_API_KEY` 값 복사
       - 일반 텍스트 모드로 직접 붙여넣기
   - **"Add Parameter"** 클릭
   - **두 번째 헤더:**
     - **Name:** `Content-Type`
     - **Value:** `application/json`

**Expression 모드 확인:**
- Value 필드 옆에 `fx` 아이콘이 있으면 Expression 모드
- Expression 모드를 비활성화하려면 `fx` 아이콘 클릭
- 일반 텍스트 모드에서는 `fx` 아이콘이 없음

#### 3단계: Body 설정

1. **"Send Body"** 토글: `ON` (활성화)
2. **"Body Content Type"** 드롭다운: `JSON` 선택
3. **"Specify Body"** 드롭다운: `Using Fields Below` 선택
4. **Body 필드에 입력:**
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

## 🔧 Railway API Key 확인

**Railway 대시보드 → OUSCARAVAN 서비스 → Variables:**

1. `N8N_API_KEY` 변수 확인
2. 값 복사 (전체 복사)
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

### 문제 1: Expression 모드에서 API Key가 문자열로 해석되지 않음

**증상:**
- Header Value 필드에 `fx` 아이콘이 있음
- API Key가 Expression으로 해석됨

**해결:**
1. Header Value 필드 옆의 `fx` 아이콘 클릭
2. Expression 모드 비활성화
3. API Key를 일반 텍스트로 직접 입력

---

### 문제 2: 헤더가 전송되지 않음

**증상:**
- "Send Headers" 토글이 OFF 상태

**해결:**
1. "Send Headers" 토글을 ON으로 설정
2. "Specify Headers" 드롭다운을 `Using Fields Below`로 설정
3. Header Parameters에 헤더 추가

---

### 문제 3: Railway API가 헤더를 읽지 못함

**원인:**
- Express는 헤더 이름을 소문자로 변환
- `X-API-Key` → `x-api-key`

**해결:**
- Railway 코드에서 `x-api-key`로 확인하도록 이미 수정됨
- n8n에서 `X-API-Key`로 보내면 자동으로 `x-api-key`로 변환됨

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

## 🔍 Railway 로그 확인

**Railway 대시보드 → OUSCARAVAN 서비스 → Logs:**

**성공 시 예상 로그:**
```
API Key check: { hasApiKey: true, ... }
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
