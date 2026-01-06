# n8n "Bad request - Validation failed" 에러 해결

## 🔍 문제

**증상:**
- Railway 로그에서 "API Key authentication successful" 확인
- 하지만 HTTP Request 노드에서 "Bad request - please check your parameters" 에러 발생
- "Validation failed" 메시지 표시

**원인:**
- API Key 인증은 성공했지만, 요청 본문(Body)의 유효성 검증 실패
- 필수 필드 누락 또는 형식 오류

---

## ✅ 해결 방법

### 1단계: HTTP Request Body 확인

**HTTP Request 노드 설정:**

1. **"HTTP Request"** 노드 클릭
2. **Body Content Type:** `JSON` 선택
3. **Specify Body:** `Using Fields Below` 선택
4. **Body 필드 확인:**

**올바른 Body 형식:**
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

**중요 사항:**
- 모든 필수 필드 포함: `reservationNumber`, `guestName`, `checkin`, `checkout`, `roomType`
- `email`은 선택적 (없으면 빈 문자열)
- `amount`는 선택적 (없으면 0)
- `amount`는 숫자 형식 (따옴표 없음)

---

### 2단계: URL 확인

**HTTP Request 노드 설정:**

1. **URL:** `https://ouscaravan-production.up.railway.app/api/admin/reservations`
   - ⚠️ **중요:** URL이 `/api/admin/r`로 잘려서 보이면 전체 URL 입력
   - 올바른 URL: `/api/admin/reservations` (끝에 `s` 포함)

---

### 3단계: Edit Fields 노드 확인

**Edit Fields 노드 설정:**

1. **"Edit Fields"** 노드 클릭
2. **Mode:** `JSON` 선택
3. **JSON 확인:**

**올바른 JSON 형식:**
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

**중요:**
- `apiKey` 필드 제거 (Body에 포함하지 않음)
- 모든 필드가 올바른 형식인지 확인
- `amount`는 숫자 형식 (따옴표 없음)

---

### 4단계: Railway 로그에서 상세 에러 확인

**Railway 대시보드 → OUSCARAVAN 서비스 → Logs:**

**확인할 내용:**
1. "Validation failed" 메시지 확인
2. 어떤 필드가 문제인지 확인
3. 필드 형식 오류 확인

**예상 로그:**
```
Validation failed: [
  'reservationNumber is required',
  'guestName is required',
  ...
]
```

또는

```
Missing required fields: {
  required: ['reservationNumber', 'guestName', 'checkin', 'checkout', 'roomType']
}
```

---

## 🔧 문제 해결

### 문제 1: 필수 필드 누락

**증상:**
- Railway 로그에서 "Missing required fields" 메시지

**해결:**
1. HTTP Request Body에 모든 필수 필드 포함 확인
2. 필수 필드: `reservationNumber`, `guestName`, `checkin`, `checkout`, `roomType`
3. Expression 문법 확인: `{{ $json.<field_name> }}`

---

### 문제 2: 필드 형식 오류

**증상:**
- Railway 로그에서 "Validation failed" 메시지
- 특정 필드 형식 오류

**해결:**
1. `amount`는 숫자 형식 (따옴표 없음): `{{ $json.amount || 0 }}`
2. 날짜 형식 확인: `YYYY-MM-DD` 형식 (예: `2026-01-22`)
3. 문자열 필드는 따옴표로 감싸기

---

### 문제 3: URL 오류

**증상:**
- URL이 잘려서 보임 (`/api/admin/r`)

**해결:**
1. 전체 URL 입력: `https://ouscaravan-production.up.railway.app/api/admin/reservations`
2. URL 끝에 `s` 포함 확인 (`reservations`)

---

### 문제 4: Body에 apiKey 포함

**증상:**
- Body에 `apiKey` 필드가 포함되어 있음

**해결:**
1. HTTP Request Body에서 `apiKey` 필드 제거
2. API Key는 Header에만 포함 (Credential에서 관리)

---

## 📋 체크리스트

### HTTP Request 노드 설정:

- [ ] URL: `https://ouscaravan-production.up.railway.app/api/admin/reservations` (전체 URL)
- [ ] Method: `POST`
- [ ] Authentication: `Generic Credential Type` → `Header Auth` → `Railway API Key`
- [ ] Send Headers: `ON` (활성화)
- [ ] Header Parameters: `X-API-Key` 자동 추가 확인
- [ ] Content-Type: `application/json` 추가
- [ ] Send Body: `ON` (활성화)
- [ ] Body Content Type: `JSON`
- [ ] Body에 모든 필수 필드 포함
- [ ] Body에서 `apiKey` 제거

### Body 필드 확인:

- [ ] `reservationNumber`: `"{{ $json.reservationNumber }}"`
- [ ] `guestName`: `"{{ $json.guestName }}"`
- [ ] `email`: `"{{ $json.email || '' }}"`
- [ ] `checkin`: `"{{ $json.checkin }}"`
- [ ] `checkout`: `"{{ $json.checkout }}"`
- [ ] `roomType`: `"{{ $json.roomType }}"`
- [ ] `amount`: `{{ $json.amount || 0 }}` (따옴표 없음)

### Edit Fields 노드 설정:

- [ ] JSON에서 `apiKey` 필드 제거
- [ ] 모든 필드가 올바른 형식인지 확인
- [ ] `amount`는 숫자 형식 (따옴표 없음)

---

## 🔍 Railway 유효성 검증 요구사항

**필수 필드:**
- `reservationNumber` (문자열, 1-50자)
- `guestName` (문자열, 1-100자)
- `checkin` (날짜, YYYY-MM-DD 형식)
- `checkout` (날짜, YYYY-MM-DD 형식)
- `roomType` (문자열, 1-100자)

**선택적 필드:**
- `email` (문자열, 이메일 형식 또는 빈 문자열)
- `amount` (숫자, 기본값 0)

---

## 🚀 최종 Body 형식

**HTTP Request 노드 Body:**

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

**중요:**
- `amount`는 숫자 형식 (따옴표 없음)
- `email`은 선택적 (없으면 빈 문자열)
- `apiKey`는 Body에 포함하지 않음

---

**문서 버전**: 1.0  
**최종 업데이트**: 2026-01-06
