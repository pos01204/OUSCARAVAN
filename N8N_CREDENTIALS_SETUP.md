# n8n Credentials를 사용한 API Key 인증 설정

## 🔍 문제

**증상:**
- HTTP Request 노드에서 "Authorization failed" 에러 발생
- Header Value가 잘려서 보임 (truncated)
- Authentication을 "None"으로 설정했지만 여전히 실패

**원인:**
- Header Value 필드에 API Key 전체가 입력되지 않음
- 또는 Expression 모드 문제

---

## ✅ 해결 방법: n8n Credentials 사용

### 방법 1: Header Auth Credential 생성 (권장)

**n8n Credentials 설정:**

1. **n8n 대시보드** → **"Credentials"** 메뉴 클릭
2. **"Add Credential"** 클릭
3. **"Header Auth"** 선택
4. **Credential 설정:**
   - **Name:** `Railway API Key` (Credential 이름, 공백 가능)
   - **Header Name:** `X-API-Key` (HTTP 헤더 이름, 공백 불가)
     - ⚠️ **중요:** 공백을 포함하지 않아야 함
     - ❌ 잘못된 값: `Railway API Key` (공백 포함)
     - ✅ 올바른 값: `X-API-Key` (하이픈 사용)
   - **Header Value:** Railway API Key 전체 값 입력
     - Railway 대시보드 → OUSCARAVAN 서비스 → Variables → `N8N_API_KEY` 값 복사
     - 전체 값을 붙여넣기 (일부만 입력하지 않음)
5. **"Save"** 클릭

**HTTP Request 노드 설정:**

1. **"HTTP Request"** 노드 클릭
2. **Method:** `POST`
3. **URL:** `https://ouscaravan-production.up.railway.app/api/admin/reservations`
4. **Authentication:** `Header Auth` 선택
5. **Credential:** 생성한 `Railway API Key` 선택
6. **Send Headers:** `ON` (활성화)
   - Credential에서 자동으로 `X-API-Key` 헤더 추가됨
7. **Header Parameters:**
   - Credential이 자동으로 추가하므로 수동으로 추가할 필요 없음
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

### 방법 2: Generic Credential Type 사용

**n8n Credentials 설정:**

1. **n8n 대시보드** → **"Credentials"** 메뉴 클릭
2. **"Add Credential"** 클릭
3. **"Generic Credential Type"** 선택
4. **Credential 설정:**
   - **Name:** `Railway API Key`
   - **Credential Data:**
     ```json
     {
       "apiKey": "YjMzYTBlYzEtM2RjOS00MDBkLTgxZjEtMjc3YzQyMTg1N2M0YzNjYThlZTYtMWI2MC00MDYzLTlmNzktMDgxN2IyODIxOGQ3"
     }
     ```
5. **"Save"** 클릭

**HTTP Request 노드 설정:**

1. **"HTTP Request"** 노드 클릭
2. **Authentication:** `Generic Credential Type` 선택
3. **Credential:** 생성한 `Railway API Key` 선택
4. **Send Headers:** `ON` (활성화)
5. **Header Parameters:**
   - **Name:** `X-API-Key`
   - **Value:** `{{ $credentials.Railway API Key.apiKey }}`
   - **"Add Parameter"** 클릭
   - **Name:** `Content-Type`
   - **Value:** `application/json`

---

### 방법 3: Set 노드 + Expression 사용 (현재 구조 유지)

**현재 워크플로우 구조 유지:**
```
Gmail Trigger → Code → Edit Fields (Set) → HTTP Request
```

**Edit Fields (Set) 노드 설정:**

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
  "amount": {{ $json.amount || 0 }},
  "apiKey": "YjMzYTBlYzEtM2RjOS00MDBkLTgxZjEtMjc3YzQyMTg1N2M0YzNjYThlZTYtMWI2MC00MDYzLTlmNzktMDgxN2IyODIxOGQ3"
}
```

**HTTP Request 노드 설정:**

1. **"HTTP Request"** 노드 클릭
2. **Authentication:** `None` 선택
3. **Send Headers:** `ON` (활성화)
4. **Specify Headers:** `Using Fields Below` 선택
5. **Header Parameters:**
   - **Name:** `X-API-Key`
   - **Value:** `{{ $json.apiKey }}` (Expression 모드 사용)
     - ⚠️ **중요:** Expression 모드로 설정 (fx 아이콘 활성화)
     - Edit Fields 노드에서 전달받은 `apiKey` 값 사용
   - **"Add Parameter"** 클릭
   - **Name:** `Content-Type`
   - **Value:** `application/json`
6. **Send Body:** `ON` (활성화)
7. **Body Content Type:** `JSON` 선택
8. **Specify Body:** `Using Fields Below` 선택
9. **Body:**
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

## 🔧 Expression 모드 활성화 방법

**HTTP Request 노드 Header Value 설정:**

1. **Header Parameters** → **X-API-Key** → **Value** 필드 클릭
2. **Value 필드 옆의 `fx` 아이콘 클릭하여 활성화** (주황색으로 변경)
3. **Value 필드에 입력:** `{{ $json.apiKey }}`
4. Expression 모드가 활성화되면 자동으로 Edit Fields 노드의 `apiKey` 값을 사용

**Expression 모드 확인:**
- `fx` 아이콘이 **주황색/활성화**되어 있으면 Expression 모드
- `fx` 아이콘이 **회색/비활성화**되어 있으면 일반 텍스트 모드

---

## 🐛 문제 해결

### 문제 1: Header Value가 잘려서 보임

**증상:**
- Header Value 필드에 API Key 일부만 표시됨
- 전체 값이 입력되지 않음

**해결:**
1. **방법 1:** n8n Credentials 사용 (권장)
   - Credential에 전체 API Key 저장
   - HTTP Request 노드에서 Credential 선택
2. **방법 2:** Expression 모드 사용
   - Edit Fields 노드에서 `apiKey` 추가
   - HTTP Request Header Value: `{{ $json.apiKey }}` (Expression 모드)

---

### 문제 2: "Header name must be a valid HTTP token" 에러

**증상:**
- Header Auth Credential 사용 시 에러 발생

**원인:**
- Credential의 Header Name이 공백을 포함함

**해결:**
1. Credential 편집
2. **Header Name:** `X-API-Key`로 수정 (공백 제거)
3. **Save** 클릭

---

### 문제 3: Expression 모드에서 값이 전달되지 않음

**증상:**
- `{{ $json.apiKey }}`가 비어있음

**해결:**
1. Edit Fields 노드에서 `apiKey` 필드 확인
2. Edit Fields 노드 실행 테스트
3. HTTP Request 노드의 INPUT에서 `apiKey` 값 확인
4. Expression 문법 확인: `{{ $json.apiKey }}`

---

## 📋 체크리스트

### n8n Credentials 설정 (방법 1):

- [ ] Credential 생성: `Railway API Key`
- [ ] Header Name: `X-API-Key` (공백 없음)
- [ ] Header Value: Railway API Key 전체 값
- [ ] HTTP Request 노드에서 Credential 선택

### Edit Fields + Expression 설정 (방법 3):

- [ ] Edit Fields 노드에 `apiKey` 필드 포함
- [ ] HTTP Request Header Value: `{{ $json.apiKey }}` (Expression 모드)
- [ ] HTTP Request Body에서 `apiKey` 제거

### 테스트:

- [ ] Edit Fields 노드 실행 테스트
- [ ] HTTP Request 노드 실행 테스트
- [ ] Railway 로그에서 성공 메시지 확인

---

## 🔍 최종 권장 설정

**방법 1: n8n Credentials 사용 (가장 안전)**

1. **n8n Credentials 생성:**
   - Name: `Railway API Key`
   - Header Name: `X-API-Key`
   - Header Value: Railway API Key 전체 값

2. **HTTP Request 노드 설정:**
   - Authentication: `Header Auth`
   - Credential: `Railway API Key` 선택
   - Body: 예약 정보만 포함 (API Key 제외)

**장점:**
- API Key가 Credential에 안전하게 저장됨
- 워크플로우에 API Key가 노출되지 않음
- 재사용 가능

---

**방법 3: Expression 모드 사용 (현재 구조 유지)**

1. **Edit Fields 노드:**
   - `apiKey` 필드 포함

2. **HTTP Request 노드:**
   - Header Value: `{{ $json.apiKey }}` (Expression 모드)
   - Body: 예약 정보만 포함 (API Key 제외)

**장점:**
- 현재 워크플로우 구조 유지
- Set 노드에서 API Key 관리 가능

---

**문서 버전**: 1.0  
**최종 업데이트**: 2026-01-06
