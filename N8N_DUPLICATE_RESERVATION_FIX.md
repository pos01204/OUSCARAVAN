# n8n "Reservation number already exists" 에러 해결

## 🔍 문제

**증상:**
- Expression이 제대로 평가되고 있음 (값들이 실제 값으로 표시됨)
- 인증 성공 (API Key 인증 통과)
- 유효성 검증 통과
- 하지만 "Reservation number already exists" 에러 발생

**원인:**
- 동일한 예약 번호(`1123900400`)로 이미 예약이 생성되어 있음
- Railway API는 중복 예약 번호를 허용하지 않음

---

## ✅ 해결 방법

### 방법 1: 새로운 예약으로 테스트

**새로운 예약 번호로 테스트:**

1. **Gmail Trigger**에서 새로운 예약 이메일 확인
2. 새로운 예약 번호로 워크플로우 실행
3. 또는 테스트용 예약 번호 사용

---

### 방법 2: Railway 데이터베이스에서 중복 확인

**Railway PostgreSQL 데이터베이스 확인:**

1. **Railway 대시보드** → **OUSCARAVAN 서비스** → **PostgreSQL** 클릭
2. **Query** 실행:
```sql
SELECT * FROM reservations 
WHERE reservation_number = '1123900400';
```

3. 이미 존재하는 경우:
   - 예약 정보 확인
   - 새로운 예약 번호로 테스트
   - 또는 기존 예약 삭제 (테스트용)

---

### 방법 3: 중복 예약 번호 처리 로직 추가

**Railway API 수정 (선택사항):**

현재 Railway API는 중복 예약 번호를 허용하지 않습니다. 만약 중복 예약을 업데이트하도록 변경하려면:

1. **Railway 코드 수정:**
   - 중복 예약 번호가 있으면 업데이트
   - 또는 중복 허용

2. **또는 n8n 워크플로우에서 중복 확인:**
   - 예약 생성 전에 기존 예약 확인
   - 존재하면 업데이트, 없으면 생성

---

## 🎉 성공 확인

**현재 상태:**
- ✅ API Key 인증 성공
- ✅ 유효성 검증 통과
- ✅ Expression 평가 성공
- ✅ 요청이 Railway API에 도달
- ⚠️ 중복 예약 번호 에러 (정상 동작)

**이것은 정상적인 동작입니다!**

Railway API가 중복 예약 번호를 방지하고 있습니다. 새로운 예약 번호로 테스트하면 성공할 것입니다.

---

## 📋 체크리스트

### 현재 상태 확인:

- [x] API Key 인증 성공
- [x] 유효성 검증 통과
- [x] Expression 평가 성공
- [x] 요청이 Railway API에 도달
- [ ] 새로운 예약 번호로 테스트

### 다음 단계:

- [ ] 새로운 예약 이메일로 테스트
- [ ] 또는 Railway 데이터베이스에서 중복 확인
- [ ] 새로운 예약 번호로 워크플로우 실행

---

## 🔍 Railway 로그 확인

**Railway 대시보드 → OUSCARAVAN 서비스 → Logs:**

**예상 로그:**
```
API Key check: { hasApiKey: true, ... }
API Key authentication successful
Validation passed
Create reservation error: { code: '23505', ... }
Reservation number already exists
```

**에러 코드 `23505`:**
- PostgreSQL 중복 키 에러
- 예약 번호가 이미 존재함

---

## 🚀 테스트 방법

### 1. 새로운 예약 이메일로 테스트

1. **Gmail**에서 새로운 예약 확정 이메일 확인
2. **n8n 워크플로우** 실행
3. 새로운 예약 번호로 예약 생성 확인

---

### 2. Railway 데이터베이스 확인

**Railway PostgreSQL Query:**

```sql
-- 모든 예약 확인
SELECT reservation_number, guest_name, checkin, checkout, status 
FROM reservations 
ORDER BY created_at DESC 
LIMIT 10;

-- 특정 예약 번호 확인
SELECT * FROM reservations 
WHERE reservation_number = '1123900400';
```

---

### 3. 테스트용 예약 삭제 (개발 환경에서만)

**Railway PostgreSQL Query:**

```sql
-- 테스트용 예약 삭제 (주의: 실제 데이터 삭제)
DELETE FROM reservations 
WHERE reservation_number = '1123900400';
```

**⚠️ 주의:** 실제 운영 환경에서는 삭제하지 마세요!

---

## ✅ 성공 메시지 확인

**새로운 예약 번호로 성공 시:**

Railway 로그:
```
API Key authentication successful
Validation passed
Reservation created successfully
```

n8n HTTP Request 노드 출력:
```json
{
  "id": "...",
  "reservationNumber": "1123900401",
  "guestName": "새로운 예약자",
  "email": "...",
  "checkin": "2026-01-22",
  "checkout": "2026-01-23",
  "roomType": "...",
  "amount": 0,
  "status": "pending",
  ...
}
```

---

## 📋 최종 확인

### 현재 워크플로우 상태:

- ✅ Gmail Trigger: 정상 작동
- ✅ Code 노드: 이메일 파싱 성공
- ✅ Set 노드: 데이터 전달 성공
- ✅ HTTP Request 노드: 인증 및 유효성 검증 통과
- ✅ Expression 평가: 정상 작동
- ⚠️ 중복 예약 번호: 새로운 예약 번호로 테스트 필요

---

**문서 버전**: 1.0  
**최종 업데이트**: 2026-01-06
