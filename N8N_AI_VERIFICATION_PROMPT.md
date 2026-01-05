# n8n AI 검증 프롬프트

## 🎯 사용 방법

n8n 워크플로우 편집 화면에서 **Chat (Beta)** 또는 **AI Assistant** 기능을 사용하여 아래 프롬프트를 입력하세요.

---

## 📋 검증 프롬프트 (전체 버전)

```
다음 n8n 워크플로우를 검증하고 문제점을 찾아주세요:

**워크플로우 목적:**
네이버 예약 완료 이메일을 자동으로 감지하여, 예약 확정 시 게스트에게 카카오톡 메시지로 고유 링크를 발송하고, 예약 취소 시 취소 정보를 처리합니다.

**워크플로우 구조:**

1. **Gmail Trigger 노드**
   - Event: Message Received
   - Poll Times: Every Minute
   - Filters:
     * Search: subject:[네이버 예약]
     * Sender: naverbooking_noreply@navercorp.com

2. **IF 노드**
   - Condition: {{ $json.subject }} contains "확정"
   - True 출력: 예약 확정 처리
   - False 출력: 예약 취소 처리

3. **예약 확정 처리 (True 경로):**
   - **Code 노드 (파싱)**
     * Mode: Run Once for All Items
     * JavaScript로 이메일 본문에서 다음 정보 추출:
       - 예약자명 (guestName)
       - 예약번호 (reservationNumber)
       - 객실 (room)
       - 체크인 날짜 (checkin)
       - 체크아웃 날짜 (checkout)
       - 결제금액 (amount)
     * 반환: emailType: 'confirmed' 포함한 객체 배열
   
   - **Edit Fields 노드**
     * Mode: Manual Mapping
     * 필드 매핑:
       - guest → {{ $json.guestName }}
       - room → {{ $json.room }}
       - checkin → {{ $json.checkin }}
       - checkout → {{ $json.checkout }}
       - reservationNumber → {{ $json.reservationNumber }}
       - amount → {{ $json.amount }}
       - email → {{ $json.email }}
   
   - **Code 노드 (링크 생성)**
     * Mode: Run Once for Each Item
     * JavaScript로 고유 토큰 생성 및 링크 생성
     * baseUrl: {{ $env.WEB_APP_URL }} 또는 'https://ouscaravan.com'
     * 반환: token, link, createdAt 추가
   
   - **HTTP Request 노드 (카카오톡 발송)**
     * Method: POST
     * URL: https://kapi.kakao.com/v2/api/talk/memo/default/send
     * Authentication: Generic Credential Type → Header Auth
     * Header Name: Authorization
     * Header Value: Bearer {{ $env.KAKAO_ACCESS_TOKEN }}
     * Send Headers: ON
     * Headers: Content-Type: application/x-www-form-urlencoded
     * Send Body: ON
     * Body Content Type: Form-Urlencoded
     * Body Parameter:
       - Name: template_object
       - Value: {"object_type":"text","text":"{{ $json.guest }}님, OUSCARAVAN 예약이 완료되었습니다!\n\n예약번호: {{ $json.reservationNumber }}\n📅 체크인: {{ $json.checkin }}\n📅 체크아웃: {{ $json.checkout }}\n🏠 객실: {{ $json.room }}\n💰 결제금액: {{ $json.amount }}\n\n아래 링크를 클릭하여 컨시어지 서비스를 이용하세요:\n{{ $json.link }}","link":{"web_url":"{{ $json.link }}","mobile_web_url":"{{ $json.link }}"},"button_title":"컨시어지 서비스 이용하기"}

4. **예약 취소 처리 (False 경로):**
   - **Code 노드 (취소 파싱)**
     * Mode: Run Once for All Items
     * JavaScript로 취소 이메일에서 다음 정보 추출:
       - 예약자명 (guestName)
       - 예약번호 (reservationNumber)
       - 취소일시 (cancellationDate)
       - 환불금액 (refundAmount)
     * 반환: emailType: 'cancelled' 포함한 객체 배열
   
   - **Edit Fields 노드**
     * Mode: Manual Mapping
     * 필드 매핑:
       - guest → {{ $json.guestName }}
       - reservationNumber → {{ $json.reservationNumber }}
       - cancellationDate → {{ $json.cancellationDate }}
       - refundAmount → {{ $json.refundAmount }}
       - email → {{ $json.email }}

**검증 요청 사항:**

1. **노드 설정 검증:**
   - 각 노드의 Mode 설정이 올바른지 확인
   - 필터 조건이 올바른지 확인
   - IF 노드의 조건식이 올바른지 확인

2. **데이터 흐름 검증:**
   - Gmail Trigger → IF 노드로 데이터가 올바르게 전달되는지
   - IF 노드의 True/False 분기가 올바른지
   - 각 Code 노드의 입력/출력 데이터 형식이 올바른지
   - Edit Fields 노드의 매핑이 올바른지

3. **Expression 문법 검증:**
   - {{ $json.필드명 }} 형식이 올바른지
   - {{ $env.VARIABLE_NAME }} 환경 변수 참조가 올바른지
   - 중첩된 객체 접근이 올바른지

4. **JavaScript 코드 검증:**
   - Code 노드의 JavaScript 코드 문법이 올바른지
   - 정규식 패턴이 올바른지
   - 날짜 형식 변환이 올바른지
   - 에러 처리가 있는지

5. **HTTP Request 검증:**
   - 카카오톡 API 엔드포인트가 올바른지
   - Authentication 설정이 올바른지
   - Headers 설정이 올바른지
   - Body 형식이 올바른지 (Form-Urlencoded)
   - template_object의 JSON 문자열 형식이 올바른지
   - Expression이 올바르게 치환되는지

6. **에러 처리:**
   - 각 노드에서 에러가 발생할 수 있는 경우
   - 에러 핸들링이 필요한 부분
   - 예외 상황 대응

7. **성능 및 최적화:**
   - 불필요한 노드가 있는지
   - 데이터 처리 효율성
   - 워크플로우 실행 시간

**특히 다음 사항을 중점적으로 확인해주세요:**
- HTTP Request 노드의 Body 설정이 올바른지 (Form-Urlencoded 형식)
- template_object의 JSON 문자열이 올바르게 이스케이프되었는지
- 환경 변수 참조가 올바른지
- Code 노드의 데이터 반환 형식이 다음 노드와 호환되는지

**문제가 발견되면:**
- 구체적인 문제점 설명
- 수정 방법 제시
- 대안 제안

감사합니다!
```

---

## 📋 검증 프롬프트 (간단 버전)

```
다음 n8n 워크플로우를 검증해주세요:

[Gmail Trigger] → [IF: subject contains "확정"]
  ├─ True: [Code 파싱] → [Edit Fields] → [Code 링크생성] → [HTTP Request 카카오톡]
  └─ False: [Code 취소파싱] → [Edit Fields]

목적: 네이버 예약 이메일 감지 → 확정 시 카카오톡 발송

검증 요청:
1. 각 노드 설정이 올바른지
2. 데이터 흐름이 정상인지
3. Expression 문법이 올바른지
4. HTTP Request의 카카오톡 API 호출 형식이 올바른지
5. Code 노드의 JavaScript 코드가 올바른지

문제 발견 시 구체적인 수정 방법을 제시해주세요.
```

---

## 📋 검증 프롬프트 (문제 해결 중심)

```
다음 n8n 워크플로우에서 문제를 찾아주세요:

**현재 상태:**
- Gmail Trigger: 네이버 예약 이메일 감지 (subject:[네이버 예약], sender: naverbooking_noreply@navercorp.com)
- IF 노드: subject contains "확정"으로 분기
- 확정 경로: Code(파싱) → Edit Fields → Code(링크생성) → HTTP Request(카카오톡)
- 취소 경로: Code(취소파싱) → Edit Fields

**확인하고 싶은 사항:**
1. HTTP Request 노드의 Body 설정이 올바른지 (Form-Urlencoded, template_object)
2. 환경 변수 참조가 올바른지 ({{ $env.KAKAO_ACCESS_TOKEN }}, {{ $env.WEB_APP_URL }})
3. Code 노드의 데이터 반환 형식이 다음 노드와 호환되는지
4. Edit Fields 노드의 매핑이 올바른지
5. 전체 워크플로우에서 데이터 손실이나 변환 오류가 없는지

**특히 HTTP Request 노드:**
- URL: https://kapi.kakao.com/v2/api/talk/memo/default/send
- Method: POST
- Authentication: Header Auth (Bearer {{ $env.KAKAO_ACCESS_TOKEN }})
- Body: Form-Urlencoded
- Parameter: template_object (JSON 문자열)

이 설정이 올바른지 확인하고, 문제가 있으면 수정 방법을 알려주세요.
```

---

## 💡 n8n AI 사용 팁

### 1. Chat (Beta) 기능 사용

1. n8n 왼쪽 사이드바에서 **"Chat (Beta)"** 클릭
2. 위 프롬프트 중 하나를 복사하여 붙여넣기
3. Enter 키로 전송
4. AI의 응답 확인

### 2. 워크플로우 컨텍스트 제공

n8n AI는 현재 열려있는 워크플로우를 자동으로 인식할 수 있습니다. 따라서:
- 워크플로우를 열어둔 상태에서 Chat 사용
- 특정 노드를 선택한 상태에서 질문하면 해당 노드에 대한 답변을 받을 수 있음

### 3. 구체적인 질문

더 구체적인 질문을 하면 더 정확한 답변을 받을 수 있습니다:
- "HTTP Request 노드의 Body 설정이 올바른지 확인해주세요"
- "Code 노드의 JavaScript 코드에서 에러가 발생할 수 있는 부분을 찾아주세요"
- "Edit Fields 노드의 매핑이 올바른지 확인해주세요"

---

## 🔍 수동 검증 체크리스트

n8n AI 검증 전에 다음을 확인하세요:

### 필수 확인 사항
- [ ] 모든 노드가 연결되어 있는지
- [ ] 각 노드의 설정이 완료되었는지
- [ ] Expression 문법이 올바른지
- [ ] 환경 변수가 설정되었는지 (또는 설정 예정인지)

### 테스트 가능한 항목
- [ ] Gmail Trigger: "Fetch Test Event"로 테스트
- [ ] IF 노드: "Execute step"으로 테스트
- [ ] Code 노드: 각각 "Execute step"으로 테스트
- [ ] HTTP Request: "Execute step"으로 테스트 (토큰이 있을 때)

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
