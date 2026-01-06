# n8n HTTP Request 헤더 인증 에러 해결

## 🔍 문제

**에러 메시지:**
```
Header name must be a valid HTTP token ["Railway API Key"]
```

**원인:**
- Authentication에서 "Header Auth" Credential을 사용하고 있음
- Credential의 Header Name이 "Railway API Key"로 설정되어 있음
- HTTP 헤더 이름은 공백을 포함할 수 없음

---

## ✅ 해결 방법

### 방법 1: Authentication을 None으로 변경 (권장)

**HTTP Request 노드 설정:**

1. **"HTTP Request"** 노드 클릭
2. **Authentication:** `None` 선택
3. **Send Headers:** `ON` (활성화)
4. **Specify Headers:** `Using Fields Below` 선택
5. **Header Parameters:**
   - **Name:** `X-API-Key`
   - **Value:** Railway API Key 직접 입력
     - Expression 모드 비활성화 (fx 아이콘 클릭)
     - Railway 대시보드 → OUSCARAVAN 서비스 → Variables → `N8N_API_KEY` 값 복사
     - 일반 텍스트로 직접 붙여넣기
   - **"Add Parameter"** 클릭
   - **Name:** `Content-Type`
   - **Value:** `application/json`

**이 방법이 가장 간단하고 확실합니다.**

---

### 방법 2: Header Auth Credential 수정

**n8n Credentials 수정:**

1. **n8n 대시보드** → **"Credentials"** 메뉴 클릭
2. **"Railway API Key"** Credential 클릭 (또는 편집)
3. **Header Name:** `X-API-Key`로 수정 (공백 제거)
   - ❌ 잘못된 값: `Railway API Key`
   - ✅ 올바른 값: `X-API-Key`
4. **Header Value:** Railway API Key 입력
5. **"Save"** 클릭

**HTTP Request 노드 설정:**

1. **Authentication:** `Header Auth` 선택
2. **Credential:** 수정한 `Railway API Key` 선택
3. 나머지 설정은 방법 1과 동일

---

### 방법 3: 새 Credential 생성

**n8n Credentials 설정:**

1. **n8n 대시보드** → **"Credentials"** 메뉴 클릭
2. **"Add Credential"** 클릭
3. **"Header Auth"** 선택
4. **Credential 설정:**
   - **Name:** `Railway API Key` (Credential 이름, 공백 가능)
   - **Header Name:** `X-API-Key` (HTTP 헤더 이름, 공백 불가)
   - **Header Value:** Railway에서 생성한 API Key 입력
5. **"Save"** 클릭

**HTTP Request 노드 설정:**

1. **Authentication:** `Header Auth` 선택
2. **Credential:** 새로 생성한 Credential 선택
3. 나머지 설정은 방법 1과 동일

---

## 🔧 HTTP 헤더 이름 규칙

**유효한 HTTP 헤더 이름:**
- ✅ `X-API-Key`
- ✅ `x-api-key`
- ✅ `Content-Type`
- ✅ `Authorization`

**유효하지 않은 HTTP 헤더 이름:**
- ❌ `Railway API Key` (공백 포함)
- ❌ `API Key` (공백 포함)
- ❌ `My Header` (공백 포함)

**규칙:**
- 공백(` `)을 포함할 수 없음
- 하이픈(`-`)은 사용 가능
- 언더스코어(`_`)는 사용 가능하지만 권장하지 않음

---

## 📋 단계별 설정 가이드

### 방법 1 사용 (가장 간단)

**1단계: Authentication 설정**

1. HTTP Request 노드 클릭
2. **Authentication:** `None` 선택
3. 기존 Header Auth 설정 제거

**2단계: 헤더 직접 설정**

1. **Send Headers:** `ON` (활성화)
2. **Specify Headers:** `Using Fields Below` 선택
3. **Header Parameters:**
   - **첫 번째 헤더:**
     - **Name:** `X-API-Key`
     - **Value:** Railway API Key 직접 입력
       - Expression 모드 비활성화 (fx 아이콘 클릭)
       - Railway 대시보드 → OUSCARAVAN 서비스 → Variables → `N8N_API_KEY` 값 복사
       - 일반 텍스트로 직접 붙여넣기
   - **"Add Parameter"** 클릭
   - **두 번째 헤더:**
     - **Name:** `Content-Type`
     - **Value:** `application/json`

**3단계: Body 설정**

1. **Send Body:** `ON` (활성화)
2. **Body Content Type:** `JSON` 선택
3. **Specify Body:** `Using Fields Below` 선택
4. **Body:**
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

## 🐛 문제 해결

### 문제: "Header name must be a valid HTTP token"

**원인:**
- Authentication에서 Header Auth Credential 사용
- Credential의 Header Name이 공백을 포함함

**해결:**
1. **Authentication을 `None`으로 변경** (가장 간단)
2. 또는 Credential의 Header Name을 `X-API-Key`로 수정

---

### 문제: Expression 모드에서 API Key가 문자열로 해석되지 않음

**원인:**
- Header Value 필드에 Expression 아이콘(`fx`)이 활성화됨

**해결:**
1. Header Value 필드 옆의 `fx` 아이콘 클릭
2. Expression 모드 비활성화
3. API Key를 일반 텍스트로 직접 입력

---

## 📋 체크리스트

### HTTP Request 노드 설정:

- [ ] Authentication: `None` 선택
- [ ] Send Headers: `ON` (활성화)
- [ ] Header Name: `X-API-Key` (공백 없음)
- [ ] Header Value: API Key 직접 입력 (Expression 모드 비활성화)
- [ ] Content-Type: `application/json`
- [ ] Send Body: `ON` (활성화)
- [ ] Body: JSON 형식으로 데이터 매핑

### 테스트:

- [ ] HTTP Request 노드 테스트 실행
- [ ] 에러 메시지 없음 확인
- [ ] 출력 결과 확인
- [ ] Railway 로그에서 요청 확인

---

**문서 버전**: 1.0  
**최종 업데이트**: 2026-01-06
