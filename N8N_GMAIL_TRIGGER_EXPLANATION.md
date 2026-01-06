# n8n Gmail Trigger 동작 방식 설명

## 🔍 Gmail Trigger가 하나만 출력하는 이유

**정상 동작입니다!**

**n8n Gmail Trigger의 동작 방식:**
- Gmail Trigger는 **폴링(Polling) 방식**으로 작동합니다
- 설정한 **Poll Times** (예: "Every Minute")마다 Gmail을 확인합니다
- 각 폴링 주기마다 **새로운 이메일을 하나씩** 처리합니다
- 이미 처리한 이메일은 다시 처리하지 않습니다

**예시:**
- 08:00:00 - 첫 번째 예약 이메일 처리 (1개)
- 08:01:00 - 두 번째 예약 이메일 처리 (1개)
- 08:02:00 - 새로운 이메일 없음 (0개)

---

## ✅ Gmail Trigger 설정 확인

**현재 설정:**
- **Poll Times:** `Every Minute` (1분마다 확인)
- **Event:** `Message Received` (새 메시지 수신)
- **Filters:**
  - **Search:** `subject:[네이버 예약]`
  - **Sender:** `naverbooking_noreply@navercorp.com`

**이 설정은 올바릅니다!**

---

## 🔧 여러 이메일을 한 번에 처리하려면

**방법 1: Poll Times 조정**

1. **Poll Times:** `Every 5 minutes` 또는 `Every 10 minutes`로 변경
2. 더 긴 간격으로 확인하면 여러 이메일이 쌓일 수 있음
3. 하지만 n8n은 여전히 하나씩 처리합니다

**방법 2: Code 노드에서 배치 처리**

1. **Code 노드**에서 여러 이메일을 한 번에 처리
2. 하지만 Gmail Trigger는 여전히 하나씩 전달합니다

**권장 사항:**
- **현재 설정 유지** (Every Minute)
- 각 예약을 개별적으로 처리하는 것이 더 안전합니다
- 중복 처리 방지
- 에러 발생 시 개별 처리 가능

---

## 📋 Gmail Trigger 동작 확인

**정상 동작 확인:**
- ✅ Gmail Trigger가 이메일을 감지함
- ✅ Code 노드로 데이터 전달
- ✅ HTTP Request 노드로 Railway API 호출
- ✅ 예약 생성 시도

**문제가 있는 경우:**
- ❌ Gmail Trigger가 이메일을 감지하지 않음
- ❌ 필터가 너무 엄격함
- ❌ Gmail 인증 문제

---

**문서 버전**: 1.0  
**최종 업데이트**: 2026-01-06
