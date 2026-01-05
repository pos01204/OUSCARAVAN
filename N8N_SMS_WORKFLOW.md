# n8n SMS 자동 발송 워크플로우 설정 가이드

## 📋 개요

네이버 예약 완료 시 **SMS(문자 메시지)**를 자동으로 발송하는 n8n 워크플로우 설정 가이드입니다.

**장점:**
- ✅ 가입 조건 간단
- ✅ 즉시 사용 가능
- ✅ 템플릿 승인 불필요
- ✅ 모든 휴대폰에서 수신

---

## 현재 워크플로우 구조

```
Gmail Trigger
  ↓
IF (예약 확정/취소 구분)
  ↓
Code (이메일 파싱)
  ↓
Set (데이터 정리)
  ↓
Code (고유 링크 생성)
  ↓
Code (전화번호 포맷 변환) ← 추가
  ↓
HTTP Request (SMS 발송) ← 수정
```

---

## 1단계: SMS 발송 서비스 선택 및 신청

### 옵션 1: 카카오 알림톡 SMS (권장)

1. [카카오 알림톡](https://alimtalk.kakao.com/) 접속
2. SMS 서비스 신청
3. API Key 발급

### 옵션 2: 네이버 클라우드 플랫폼 SMS

1. [네이버 클라우드 플랫폼](https://www.ncloud.com/) 접속
2. SMS 서비스 신청
3. API 인증 정보 발급

---

## 2단계: 전화번호 포맷 변환 노드 추가

### 2-1. Code 노드 추가

1. **"고유 링크 생성"** 노드와 **"HTTP Request"** 노드 사이에 **"Code"** 노드 추가
2. 노드 이름: `전화번호 포맷 변환`

### 2-2. Code 노드 설정

**Mode**: `Run Once for All Items`

**Language**: `JavaScript`

**Code**:
```javascript
// 전화번호에서 하이픈 제거 및 포맷 정리
let phone = $input.item.json.phone || '';

// 하이픈, 공백, 괄호 제거
phone = phone.replace(/[-\s()]/g, '');

// 국제번호 제거 (010으로 시작하는 경우)
if (phone.startsWith('010')) {
  phone = phone.substring(0, 11); // 01012345678 형식
} else if (phone.startsWith('82')) {
  // 82로 시작하는 경우 (국제번호)
  phone = '0' + phone.substring(2);
  if (phone.length > 11) {
    phone = phone.substring(0, 11);
  }
}

// 전화번호 유효성 검사
if (!phone || phone.length < 10) {
  throw new Error(`유효하지 않은 전화번호: ${phone}`);
}

return {
  ...$input.item.json,
  phone: phone,
  phone_formatted: phone
};
```

**Save** 클릭

---

## 3단계: HTTP Request 노드 설정 (SMS 발송)

### 옵션 A: 카카오 알림톡 SMS API

**Method**: `POST`

**URL**: `https://kapi.kakao.com/v1/api/talk/memo/send`

**Authentication:**
- Type: `Header Auth`
- Header Name: `Authorization`
- Header Value: `Bearer {{ $env.KAKAO_ACCESS_TOKEN }}`

**Headers:**
- `Content-Type`: `application/json`

**Body (JSON):**
```json
{
  "receiver_uuids": ["{{ $json.phone }}"],
  "template_object": {
    "object_type": "text",
    "text": "{{ $json.guest }}님, OUSCARAVAN 예약이 완료되었습니다!\n\n예약번호: {{ $json.reservationNumber }}\n체크인: {{ $json.checkin }} 15:00\n체크아웃: {{ $json.checkout }} 11:00\n객실: {{ $json.room }}\n결제금액: {{ $json.amount }}원\n\n컨시어지 서비스: {{ $json.link }}\n\n💡 OUSCARAVAN 카카오톡 채널 친구 추가 시 특별 혜택을 받으세요!"
  }
}
```

### 옵션 B: 네이버 클라우드 플랫폼 SMS API

**Method**: `POST`

**URL**: `https://sens.apigw.ntruss.com/sms/v2/services/{{ $env.NCP_SERVICE_ID }}/messages`

**Authentication:**
- Type: `Header Auth`
- Header Name: `X-NCP-auth-key`
- Header Value: `{{ $env.NCP_ACCESS_KEY_ID }}`
- Header Name: `X-NCP-auth-signature`
- Header Value: (서명 생성 필요)

**Headers:**
- `Content-Type`: `application/json`

**Body (JSON):**
```json
{
  "type": "SMS",
  "contentType": "COMM",
  "countryCode": "82",
  "from": "{{ $env.SMS_SENDER_NUMBER }}",
  "content": "{{ $json.guest }}님, OUSCARAVAN 예약이 완료되었습니다!\n\n예약번호: {{ $json.reservationNumber }}\n체크인: {{ $json.checkin }}\n체크아웃: {{ $json.checkout }}\n객실: {{ $json.room }}\n\n컨시어지 서비스: {{ $json.link }}",
  "messages": [
    {
      "to": "{{ $json.phone }}"
    }
  ]
}
```

### 옵션 C: 일반 SMS API (간단한 방식)

**Code 노드에서 메시지 생성 후 HTTP Request:**

**Code 노드 (SMS 메시지 생성):**
```javascript
const guest = $input.item.json.guest;
const reservationNumber = $input.item.json.reservationNumber;
const checkin = $input.item.json.checkin;
const checkout = $input.item.json.checkout;
const room = $input.item.json.room;
const amount = $input.item.json.amount;
const link = $input.item.json.link;

const message = `${guest}님, OUSCARAVAN 예약이 완료되었습니다!

예약번호: ${reservationNumber}
체크인: ${checkin} 15:00
체크아웃: ${checkout} 11:00
객실: ${room}
결제금액: ${amount}원

컨시어지 서비스: ${link}

💡 OUSCARAVAN 카카오톡 채널 친구 추가 시 특별 혜택을 받으세요!`;

return {
  ...$input.item.json,
  sms_message: message
};
```

**HTTP Request 노드:**
- 선택한 SMS 서비스 API에 맞게 설정
- 메시지 내용: `{{ $json.sms_message }}`

---

## 4단계: 환경 변수 설정

### 카카오 알림톡 SMS 사용 시

| Name | Value | 설명 |
|------|-------|------|
| `KAKAO_ACCESS_TOKEN` | Access Token | 카카오 Access Token |
| `WEB_APP_URL` | 웹 앱 URL | 기존 유지 |

### 네이버 클라우드 플랫폼 SMS 사용 시

| Name | Value | 설명 |
|------|-------|------|
| `NCP_SERVICE_ID` | Service ID | 네이버 클라우드 플랫폼 서비스 ID |
| `NCP_ACCESS_KEY_ID` | Access Key ID | 네이버 클라우드 플랫폼 Access Key |
| `NCP_SECRET_KEY` | Secret Key | 네이버 클라우드 플랫폼 Secret Key |
| `SMS_SENDER_NUMBER` | 발신번호 | 등록된 발신번호 |
| `WEB_APP_URL` | 웹 앱 URL | 기존 유지 |

---

## 5단계: SMS 메시지 템플릿

### 기본 템플릿

```
#{guest_name}님, OUSCARAVAN 예약이 완료되었습니다!

예약번호: #{reservation_number}
체크인: #{checkin_date} 15:00
체크아웃: #{checkout_date} 11:00
객실: #{room_type}
결제금액: #{amount}원

컨시어지 서비스: #{service_link}

💡 OUSCARAVAN 카카오톡 채널 친구 추가 시:
✓ 체크인/체크아웃 안내 메시지 수신
✓ 특별 혜택 및 프로모션 알림
✓ 빠른 고객 지원

카카오톡에서 "OUSCARAVAN" 검색 후 친구 추가해주세요!
```

### 간단한 버전 (문자 수 제한 고려)

```
#{guest_name}님, OUSCARAVAN 예약 완료!

예약번호: #{reservation_number}
체크인: #{checkin_date} 15:00
체크아웃: #{checkout_date} 11:00
객실: #{room_type}

컨시어지: #{service_link}

카카오톡에서 "OUSCARAVAN" 검색 후 친구 추가하시면 특별 혜택을 받으실 수 있습니다!
```

---

## 6단계: 테스트

### 6-1. 단일 테스트

1. **"전화번호 포맷 변환"** 노드에서 **"Execute Node"** 클릭
2. 전화번호 포맷 확인
3. **"HTTP Request"** 노드에서 **"Execute Node"** 클릭
4. SMS 발송 확인

### 6-2. 전체 플로우 테스트

1. 테스트용 네이버 예약 완료 이메일 발송
2. n8n 워크플로우 자동 실행 확인
3. 각 노드 실행 결과 확인
4. SMS 수신 확인

---

## 📋 체크리스트

### SMS 서비스 신청
- [ ] SMS 발송 서비스 선택
- [ ] 서비스 신청 완료
- [ ] API Key 또는 인증 정보 발급

### n8n 설정
- [ ] 환경 변수 추가
- [ ] 전화번호 포맷 변환 노드 추가
- [ ] HTTP Request 노드 설정 (SMS API)
- [ ] 테스트 실행

### 테스트
- [ ] 전화번호 포맷 변환 테스트
- [ ] SMS 발송 테스트
- [ ] 전체 플로우 테스트

---

## 🆘 문제 해결

### 문제 1: "401 Unauthorized" 오류

**원인:** API 인증 정보 오류

**해결:**
1. API Key 또는 Access Token 확인
2. 환경 변수 설정 확인
3. 서비스 계정 권한 확인

### 문제 2: "400 Bad Request" 오류

**원인:**
- 전화번호 형식 오류
- 메시지 내용 오류
- 필수 파라미터 누락

**해결:**
1. 전화번호 포맷 확인 (하이픈 제거, 11자리)
2. 메시지 내용 확인
3. 필수 파라미터 포함 확인

### 문제 3: SMS가 발송되지 않음

**원인:**
- 발신번호 미등록
- 잔액 부족
- 서비스 미승인

**해결:**
1. 발신번호 등록 확인
2. 잔액 확인
3. 서비스 승인 상태 확인

---

## 💡 SMS 발송 서비스별 상세 가이드

### 카카오 알림톡 SMS

**장점:**
- 카카오 계정으로 간편 가입
- API 연동 간단
- n8n과 직접 연동

**신청 방법:**
1. [카카오 알림톡](https://alimtalk.kakao.com/) 접속
2. SMS 서비스 신청
3. API Key 발급

### 네이버 클라우드 플랫폼 SMS

**장점:**
- 안정적인 서비스
- 다양한 기능
- 상세한 통계

**신청 방법:**
1. [네이버 클라우드 플랫폼](https://www.ncloud.com/) 접속
2. SMS 서비스 신청
3. API 인증 정보 발급

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
