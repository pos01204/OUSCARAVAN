# n8n 워크플로우 진단 및 검증 가이드

## 📊 현재 워크플로우 상태 진단

### ✅ 올바르게 설정된 부분

#### 1. Gmail Trigger 노드
- ✅ **Event**: "Message Received" (올바름)
- ✅ **Filters**:
  - **Search**: `subject:[네이버 예약]` (올바름)
  - **Sender**: `naverbooking_noreply@navercorp.com` (올바름)
- ✅ **Poll Times**: "Every Minute" (기본값, 적절함)
- ✅ **Credential**: "Gmail account" 연결됨

#### 2. IF 노드
- ✅ **Condition**: `{{ $json.subject }}` contains `확정` (올바름)
- ✅ 두 개의 출력: true (확정), false (취소)

#### 3. 예약 확정 처리 (True 경로)
- ✅ **Code 노드 (파싱)**: 
  - Mode: "Run Once for All Items" (올바름)
  - JavaScript 코드로 이메일 파싱 구현됨
- ✅ **Edit Fields 노드**: 
  - Mode: "Manual Mapping" (올바름)
  - 필드 매핑 완료:
    - guest → {{ $json.guestName }}
    - room → {{ $json.room }}
    - checkin → {{ $json.checkin }}
    - checkout → {{ $json.checkout }}
    - reservationNumber → {{ $json.reservationNumber }}
    - amount → {{ $json.amount }}
    - email → {{ $json.email }}
- ✅ **Code 노드 (링크 생성)**: 
  - Mode: "Run Once for Each Item" (올바름)
  - 고유 링크 생성 로직 구현됨
- ✅ **HTTP Request 노드**: 
  - Method: POST
  - URL: `https://kapi.kakao.com/v2/api/talk/memo/default/send`
  - Authentication: Header Auth 설정됨
  - Headers: Content-Type 설정됨

#### 4. 예약 취소 처리 (False 경로)
- ✅ **Code 노드 (취소 파싱)**: 
  - Mode: "Run Once for All Items" (올바름)
  - 취소 정보 추출 로직 구현됨
- ✅ **Edit Fields 노드**: 
  - 취소 데이터 매핑 완료:
    - guest → {{ $json.guestName }}
    - reservationNumber → {{ $json.reservationNumber }}
    - cancellationDate → {{ $json.cancellationDate }}
    - refundAmount → {{ $json.refundAmount }}
    - email → {{ $json.email }}

---

## ⚠️ 확인이 필요한 부분

### 1. HTTP Request 노드 (카카오톡 발송)

#### 확인 사항:
- ⚠️ **Authentication**: "Header Auth account" 설정 확인 필요
  - Header Name: `Authorization`
  - Header Value: `Bearer {{ $env.KAKAO_ACCESS_TOKEN }}`
- ⚠️ **Send Body**: 활성화 여부 확인 필요
- ⚠️ **Body Content Type**: `Form-Urlencoded` 설정 확인 필요
- ⚠️ **Body Parameters**: `template_object` 파라미터 확인 필요

#### 현재 화면 기준:
- URL이 `http://example.com/index.html`로 표시됨 (잘못된 설정 가능성)
- 실제 URL이 `https://kapi.kakao.com/v2/api/talk/memo/default/send`인지 확인 필요

### 2. 환경 변수 설정

#### 확인 필요:
- ⚠️ `KAKAO_ACCESS_TOKEN` 환경 변수 설정 여부
- ⚠️ `WEB_APP_URL` 환경 변수 설정 여부

### 3. 예약 취소 처리

#### 확인 필요:
- ⚠️ 취소 처리 후 관리자 알림 노드 추가 여부 (선택사항)

---

## 🔍 n8n AI 검증 프롬프트

다음 프롬프트를 n8n AI에 입력하여 워크플로우를 검증하세요:

```
다음 n8n 워크플로우를 검증해주세요:

워크플로우 구조:
1. Gmail Trigger 노드
   - Event: Message Received
   - Filters: 
     * Search: subject:[네이버 예약]
     * Sender: naverbooking_noreply@navercorp.com
   - Poll Times: Every Minute

2. IF 노드
   - Condition: {{ $json.subject }} contains "확정"
   - True 출력: 예약 확정 처리
   - False 출력: 예약 취소 처리

3. 예약 확정 처리 (True 경로):
   - Code 노드 (파싱): Mode "Run Once for All Items"
     * 네이버 예약 이메일에서 게스트 정보 추출
     * 예약자명, 예약번호, 객실, 체크인/체크아웃 날짜, 결제금액 추출
   - Edit Fields 노드: Mode "Manual Mapping"
     * guest, room, checkin, checkout, reservationNumber, amount, email 매핑
   - Code 노드 (링크 생성): Mode "Run Once for Each Item"
     * 고유 토큰 생성 및 웹 앱 링크 생성
   - HTTP Request 노드
     * Method: POST
     * URL: https://kapi.kakao.com/v2/api/talk/memo/default/send
     * Authentication: Header Auth (Bearer {{ $env.KAKAO_ACCESS_TOKEN }})
     * Headers: Content-Type: application/x-www-form-urlencoded
     * Body: Form-Urlencoded, template_object 파라미터

4. 예약 취소 처리 (False 경로):
   - Code 노드 (취소 파싱): Mode "Run Once for All Items"
     * 취소 정보 추출 (예약자명, 예약번호, 취소일시, 환불금액)
   - Edit Fields 노드: Mode "Manual Mapping"
     * guest, reservationNumber, cancellationDate, refundAmount, email 매핑

검증 요청 사항:
1. 각 노드의 설정이 올바른지 확인
2. 데이터 흐름이 정상적으로 연결되어 있는지 확인
3. Expression 문법이 올바른지 확인 ({{ $json.필드명 }})
4. HTTP Request 노드의 카카오톡 API 호출 형식이 올바른지 확인
5. 에러 처리나 예외 상황에 대한 대응이 있는지 확인
6. 환경 변수 사용이 올바른지 확인 ({{ $env.VARIABLE_NAME }})
7. 전체 워크플로우의 로직이 올바른지 확인

특히 다음 사항을 중점적으로 확인해주세요:
- Gmail Trigger에서 받은 데이터가 IF 노드로 올바르게 전달되는지
- IF 노드의 조건이 예약 확정/취소를 올바르게 구분하는지
- Code 노드의 JavaScript 코드가 올바르게 작성되었는지
- Edit Fields 노드의 매핑이 올바른지
- HTTP Request 노드의 카카오톡 API 호출이 올바른 형식인지
- 환경 변수 참조가 올바른지

문제가 발견되면 구체적인 수정 방법을 제시해주세요.
```

---

## 📋 수동 검증 체크리스트

### Gmail Trigger 노드
- [ ] Credential 연결 확인
- [ ] 필터 조건 확인
- [ ] "Fetch Test Event"로 테스트

### IF 노드
- [ ] 조건식 확인: `{{ $json.subject }}` contains `확정`
- [ ] True/False 출력 확인

### Code 노드 (확정 파싱)
- [ ] Mode: "Run Once for All Items"
- [ ] JavaScript 코드 문법 확인
- [ ] 이메일 본문에서 정보 추출 로직 확인

### Edit Fields 노드 (확정)
- [ ] 모든 필드 매핑 확인
- [ ] Expression 문법 확인

### Code 노드 (링크 생성)
- [ ] Mode: "Run Once for Each Item"
- [ ] 토큰 생성 로직 확인
- [ ] 링크 생성 로직 확인
- [ ] 환경 변수 사용 확인: `$env.WEB_APP_URL`

### HTTP Request 노드 (카카오톡 발송)
- [ ] Method: POST
- [ ] URL: `https://kapi.kakao.com/v2/api/talk/memo/default/send`
- [ ] Authentication: Header Auth
- [ ] Header Value: `Bearer {{ $env.KAKAO_ACCESS_TOKEN }}`
- [ ] Send Headers: ON
- [ ] Content-Type: `application/x-www-form-urlencoded`
- [ ] Send Body: ON
- [ ] Body Content Type: `Form-Urlencoded`
- [ ] Body Parameter: `template_object` (JSON 문자열)

### Code 노드 (취소 파싱)
- [ ] Mode: "Run Once for All Items"
- [ ] 취소 정보 추출 로직 확인

### Edit Fields 노드 (취소)
- [ ] 취소 관련 필드 매핑 확인

---

## 🧪 테스트 방법

### 1. 단계별 테스트

#### Gmail Trigger 테스트:
1. Gmail Trigger 노드 선택
2. "Fetch Test Event" 클릭
3. 이메일이 감지되는지 확인

#### IF 노드 테스트:
1. IF 노드 선택
2. "Execute step" 클릭
3. True/False 분기 확인

#### Code 노드 테스트:
1. 각 Code 노드 선택
2. "Execute step" 클릭
3. 출력 데이터 확인

#### HTTP Request 노드 테스트:
1. HTTP Request 노드 선택
2. "Execute step" 클릭
3. 응답 코드 확인 (200 OK 또는 에러)

### 2. 전체 워크플로우 테스트

1. 워크플로우 상단의 "Execute workflow" 버튼 클릭
2. 각 노드의 실행 결과 확인
3. 에러 발생 시 로그 확인

---

## 🔧 발견된 문제 및 수정 사항

### 문제 1: HTTP Request 노드 URL 확인 필요

**현재 상태**: URL이 `http://example.com/index.html`로 표시됨

**수정 방법**:
1. HTTP Request 노드 열기
2. URL 필드 확인
3. 올바른 URL로 수정: `https://kapi.kakao.com/v2/api/talk/memo/default/send`

### 문제 2: Body 설정 확인 필요

**확인 사항**:
- Send Body가 활성화되어 있는지
- Body Content Type이 `Form-Urlencoded`인지
- `template_object` 파라미터가 올바르게 설정되어 있는지

---

## 📝 n8n AI 검증 요청 (간단 버전)

```
다음 n8n 워크플로우를 검증해주세요:

[Gmail Trigger] → [IF] → [확정: Code → Edit Fields → Code → HTTP Request]
                          [취소: Code → Edit Fields]

목적: 네이버 예약 이메일을 감지하여 예약 확정 시 카카오톡 메시지 발송

검증 요청:
1. 각 노드 설정이 올바른지
2. 데이터 흐름이 정상인지
3. Expression 문법이 올바른지
4. HTTP Request의 카카오톡 API 호출 형식이 올바른지
5. 에러 처리가 필요한지

문제 발견 시 구체적인 수정 방법을 제시해주세요.
```

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
