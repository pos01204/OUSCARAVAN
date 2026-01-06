# n8n Set 노드 및 HTTP Request Body 수정 가이드

## 🔍 문제

**증상:**
- Set 노드를 추가했지만 오류 발생
- HTTP Request 노드의 Body에 `apiKey` 필드가 포함되어 있음
- `roomType`과 `amount` 필드 옆에 빨간색 느낌표 표시
- "Problem executing workflow" 에러 발생

**원인:**
1. **API Key가 Body에 포함되어 있음** - API Key는 Header에 있어야 함
2. JSON 문법 오류 가능성 (`roomType`, `amount` 필드)
3. Railway API는 Body에 `apiKey` 필드를 요구하지 않음

---

## ✅ 해결 방법

### 1단계: HTTP Request Body에서 `apiKey` 제거

**HTTP Request 노드 설정:**

1. **"HTTP Request"** 노드 클릭
2. **Body Content Type:** `JSON` 선택
3. **Specify Body:** `Using Fields Below` 선택
4. **Body 필드에서 `apiKey` 제거:**

**수정 전 (잘못된 코드):**
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

**수정 후 (올바른 코드):**
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

**중요:** `apiKey` 필드를 완전히 제거하세요!

---

### 2단계: HTTP Request Header에 `X-API-Key` 추가

**HTTP Request 노드 설정:**

1. **"HTTP Request"** 노드 클릭
2. **Send Headers:** `ON` (활성화)
3. **Specify Headers:** `Using Fields Below` 선택
4. **Header Parameters:**
   - **첫 번째 헤더:**
     - **Name:** `X-API-Key`
     - **Value:** `{{ $json.apiKey }}` (Set 노드에서 전달받은 값)
       - 또는 Railway API Key 직접 입력
   - **"Add Parameter"** 클릭
   - **두 번째 헤더:**
     - **Name:** `Content-Type`
     - **Value:** `application/json`

---

### 3단계: Set 노드 설정 확인

**Set 노드 설정:**

1. **"Set"** 노드 클릭 (Code 노드 다음)
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

**주의사항:**
- Set 노드에는 `apiKey` 포함 가능 (다음 노드로 전달하기 위해)
- HTTP Request Body에는 `apiKey` 포함하지 않음
- HTTP Request Header에서 `{{ $json.apiKey }}` 사용

---

## 📋 올바른 워크플로우 구조

```
Gmail Trigger → Code (이메일 파싱) → Set (API Key 추가) → HTTP Request
```

**각 노드의 역할:**

1. **Code 노드:** 이메일에서 예약 정보 추출
2. **Set 노드:** API Key 추가 (다음 노드로 전달)
3. **HTTP Request 노드:**
   - **Header:** `X-API-Key` = `{{ $json.apiKey }}`
   - **Body:** 예약 정보만 포함 (API Key 제외)

---

## 🔧 JSON 문법 오류 수정

**빨간색 느낌표가 있는 필드 확인:**

### `roomType` 필드:
```json
"roomType": "{{ $json.roomType }}"
```
- 올바른 형식입니다
- 빨간색 느낌표가 있다면 Expression 문법 확인

### `amount` 필드:
```json
"amount": {{ $json.amount || 0 }}
```
- 올바른 형식입니다
- 숫자 값이므로 따옴표 없음
- 빨간색 느낌표가 있다면 Expression 문법 확인

**JSON 문법 확인:**
- 모든 문자열 값은 따옴표로 감싸기
- 숫자 값은 따옴표 없음
- 마지막 필드 뒤에 쉼표 없음
- 모든 중괄호와 대괄호 닫기

---

## 🐛 문제 해결

### 문제 1: API Key가 Body에 포함되어 있음

**증상:**
- HTTP Request Body에 `apiKey` 필드가 있음
- Railway API가 "Authorization failed" 에러 반환

**해결:**
1. HTTP Request Body에서 `apiKey` 필드 제거
2. HTTP Request Header에 `X-API-Key` 추가
3. Header Value: `{{ $json.apiKey }}` (Set 노드에서 전달받은 값)

---

### 문제 2: JSON 문법 오류

**증상:**
- `roomType` 또는 `amount` 필드 옆에 빨간색 느낌표
- "Problem executing workflow" 에러

**해결:**
1. JSON 문법 확인 (쉼표, 따옴표, 중괄호)
2. Expression 문법 확인 (`{{ }}` 형식)
3. 필드 이름과 값 확인

---

### 문제 3: Set 노드에서 API Key 전달 안 됨

**증상:**
- HTTP Request Header에서 `{{ $json.apiKey }}`가 비어있음

**해결:**
1. Set 노드에서 `apiKey` 필드 확인
2. HTTP Request 노드에서 `{{ $json.apiKey }}` 확인
3. Set 노드 실행 후 출력 확인

---

## 📋 체크리스트

### Set 노드 설정:

- [ ] Set 노드에 예약 정보 필드 포함
- [ ] Set 노드에 `apiKey` 필드 포함
- [ ] Set 노드 실행 테스트

### HTTP Request 노드 설정:

- [ ] **Body에서 `apiKey` 제거** (중요!)
- [ ] Body에 예약 정보만 포함
- [ ] Header에 `X-API-Key` 추가
- [ ] Header Value: `{{ $json.apiKey }}`
- [ ] Content-Type: `application/json`

### 테스트:

- [ ] Set 노드 실행 테스트
- [ ] HTTP Request 노드 실행 테스트
- [ ] Railway 로그에서 성공 메시지 확인

---

## 🔍 최종 설정 예시

### Set 노드 (Code 노드 다음):

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

### HTTP Request 노드:

**Headers:**
- **Name:** `X-API-Key`
- **Value:** `{{ $json.apiKey }}`

**Body:**
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

**문서 버전**: 1.0  
**최종 업데이트**: 2026-01-06
