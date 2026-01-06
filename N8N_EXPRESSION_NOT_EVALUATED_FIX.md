# n8n Expression이 평가되지 않는 문제 해결

## 🔍 문제

**증상:**
- Railway 로그에서 "Validation failed" 에러 발생
- 에러 상세:
  - "email is invalid"
  - "checkin must be a valid date (YYYY-MM-DD)"
  - "checkout must be a valid date (YYYY-MM-DD)"
- 요청 Body에 Expression이 문자열로 전송됨:
  - `"email": "{{ $json.email || '' }}"` (문자열로 전송)
  - `"checkin": "{{ $json.checkin }}"` (문자열로 전송)
  - `"checkout": "{{ $json.checkout }}"` (문자열로 전송)

**원인:**
- HTTP Request 노드의 Body 설정이 "JSON" 모드로 직접 입력되어 있음
- Expression이 평가되지 않고 문자열로 전송됨

---

## ✅ 해결 방법

### 방법 1: Body Parameters 사용 (권장)

**HTTP Request 노드 설정:**

1. **"HTTP Request"** 노드 클릭
2. **Send Body:** `ON` (활성화)
3. **Body Content Type:** `JSON` 선택
4. **Specify Body:** `Using Fields Below` 선택
5. **Body Parameters 추가:**
   - **"Add Parameter"** 클릭
   - 각 필드를 개별적으로 추가:

**Body Parameters 설정:**

1. **첫 번째 필드:**
   - **Name:** `reservationNumber`
   - **Value:** `{{ $json.reservationNumber }}`
2. **"Add Parameter"** 클릭
3. **두 번째 필드:**
   - **Name:** `guestName`
   - **Value:** `{{ $json.guestName }}`
4. **"Add Parameter"** 클릭
5. **세 번째 필드:**
   - **Name:** `email`
   - **Value:** `{{ $json.email || '' }}`
6. **"Add Parameter"** 클릭
7. **네 번째 필드:**
   - **Name:** `checkin`
   - **Value:** `{{ $json.checkin }}`
8. **"Add Parameter"** 클릭
9. **다섯 번째 필드:**
   - **Name:** `checkout`
   - **Value:** `{{ $json.checkout }}`
10. **"Add Parameter"** 클릭
11. **여섯 번째 필드:**
    - **Name:** `roomType`
    - **Value:** `{{ $json.roomType }}`
12. **"Add Parameter"** 클릭
13. **일곱 번째 필드:**
    - **Name:** `amount`
    - **Value:** `{{ $json.amount || 0 }}`

**중요:**
- 각 필드를 개별적으로 추가해야 Expression이 평가됨
- "Using Fields Below" 모드 사용
- JSON 문자열로 직접 입력하지 않음

---

### 방법 2: Code 노드에서 Body 생성

**워크플로우 구조:**
```
Gmail Trigger → Code (이메일 파싱) → Code (Body 생성) → HTTP Request
```

**Code 노드 (Body 생성) 추가:**

1. **"Code"** 노드 추가 (이메일 파싱 Code 노드 다음)
2. **Mode:** `Run Once for All Items`
3. **Code:**
```javascript
// 이전 노드에서 예약 정보 가져오기
const reservationData = $input.item.json;

// HTTP Request Body 생성
const body = {
  reservationNumber: reservationData.reservationNumber,
  guestName: reservationData.guestName,
  email: reservationData.email || '',
  checkin: reservationData.checkin,
  checkout: reservationData.checkout,
  roomType: reservationData.roomType,
  amount: reservationData.amount || 0
};

// Body 반환
return {
  json: body
};
```

**HTTP Request 노드 설정:**

1. **Send Body:** `ON` (활성화)
2. **Body Content Type:** `JSON` 선택
3. **Specify Body:** `Using Fields Below` 선택
4. **Body Parameters:**
   - **Name:** `reservationNumber`
   - **Value:** `{{ $json.reservationNumber }}`
   - (나머지 필드도 동일하게 추가)

---

### 방법 3: Set 노드 사용

**워크플로우 구조:**
```
Gmail Trigger → Code (이메일 파싱) → Set (Body 생성) → HTTP Request
```

**Set 노드 설정:**

1. **"Set"** 노드 추가 (Code 노드 다음)
2. **Mode:** `Manual` 또는 `Keep Only Set Fields`
3. **Values:**
   - **Name:** `reservationNumber`
   - **Value:** `{{ $json.reservationNumber }}`
   - **"Add Value"** 클릭
   - **Name:** `guestName`
   - **Value:** `{{ $json.guestName }}`
   - (나머지 필드도 동일하게 추가)

**HTTP Request 노드 설정:**

1. **Send Body:** `ON` (활성화)
2. **Body Content Type:** `JSON` 선택
3. **Specify Body:** `Using Fields Below` 선택
4. **Body Parameters:**
   - Set 노드에서 전달받은 필드들을 매핑

---

## 🔧 문제 해결

### 문제 1: Expression이 문자열로 전송됨

**증상:**
- Body에 `"{{ $json.checkin }}"`이 문자열로 전송됨
- Railway에서 날짜 형식 오류 발생

**해결:**
1. Body 설정을 "Using Fields Below"로 변경
2. 각 필드를 개별적으로 추가
3. JSON 문자열로 직접 입력하지 않음

---

### 문제 2: email이 빈 문자열일 때 "invalid" 에러

**증상:**
- `"email": "{{ $json.email || '' }}"`가 문자열로 전송됨
- Railway에서 "email is invalid" 에러 발생

**해결:**
1. Expression이 평가되도록 "Using Fields Below" 모드 사용
2. 또는 Code 노드에서 빈 문자열 처리:
   ```javascript
   email: reservationData.email || ''
   ```

---

### 문제 3: 날짜 형식 오류

**증상:**
- `"checkin": "{{ $json.checkin }}"`이 문자열로 전송됨
- Railway에서 "checkin must be a valid date (YYYY-MM-DD)" 에러 발생

**해결:**
1. Expression이 평가되도록 "Using Fields Below" 모드 사용
2. Code 노드에서 날짜 형식 확인:
   ```javascript
   checkin: reservationData.checkin, // "2026-01-22" 형식
   ```

---

## 📋 체크리스트

### HTTP Request 노드 Body 설정:

- [ ] Send Body: `ON` (활성화)
- [ ] Body Content Type: `JSON` 선택
- [ ] Specify Body: `Using Fields Below` 선택 (중요!)
- [ ] Body Parameters에 각 필드 개별 추가
- [ ] JSON 문자열로 직접 입력하지 않음

### Body Parameters 필드:

- [ ] `reservationNumber`: `{{ $json.reservationNumber }}`
- [ ] `guestName`: `{{ $json.guestName }}`
- [ ] `email`: `{{ $json.email || '' }}`
- [ ] `checkin`: `{{ $json.checkin }}`
- [ ] `checkout`: `{{ $json.checkout }}`
- [ ] `roomType`: `{{ $json.roomType }}`
- [ ] `amount`: `{{ $json.amount || 0 }}`

### 테스트:

- [ ] HTTP Request 노드 실행
- [ ] 요청 Body에서 Expression이 평가되었는지 확인
- [ ] Railway 로그에서 성공 메시지 확인

---

## 🚀 최종 설정 예시

### HTTP Request 노드 Body 설정:

**Specify Body:** `Using Fields Below` 선택

**Body Parameters:**

| Name | Value |
|------|-------|
| `reservationNumber` | `{{ $json.reservationNumber }}` |
| `guestName` | `{{ $json.guestName }}` |
| `email` | `{{ $json.email || '' }}` |
| `checkin` | `{{ $json.checkin }}` |
| `checkout` | `{{ $json.checkout }}` |
| `roomType` | `{{ $json.roomType }}` |
| `amount` | `{{ $json.amount || 0 }}` |

**중요:**
- 각 필드를 개별적으로 추가
- "Add Parameter" 버튼을 사용하여 추가
- JSON 문자열로 직접 입력하지 않음

---

**문서 버전**: 1.0  
**최종 업데이트**: 2026-01-06
