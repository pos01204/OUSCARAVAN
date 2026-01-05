# n8n 비즈톡 알림톡 워크플로우 설정 가이드

## 📋 개요

네이버 예약 완료 시 **비즈톡(BizTalk) API**를 통해 알림톡을 자동으로 발송하는 n8n 워크플로우 설정 가이드입니다.

**중요:** 카카오톡 알림톡은 제휴사를 통하거나 **비즈톡**을 통해 API로 발송할 수 있습니다. 자동화를 위해서는 비즈톡 연동이 필요합니다.

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
Code (전화번호 포맷 변환) ← 새로 추가
  ↓
HTTP Request (알림톡 발송) ← 수정
```

---

## 1단계: 전화번호 포맷 변환 노드 추가

### 1-1. Code 노드 추가

1. **"고유 링크 생성"** 노드와 **"HTTP Request"** 노드 사이에 **"Code"** 노드 추가
2. 노드 이름: `전화번호 포맷 변환`

### 1-2. Code 노드 설정

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

## 2단계: HTTP Request 노드 수정 (알림톡 발송)

### 2-1. HTTP Request 노드 설정

**Method**: `POST`

**URL**: `https://kapi.kakao.com/v1/alimtalk/send`

### 2-2. Authentication 설정

**Authentication**: `Generic Credential Type`  
**Generic Auth Type**: `Header Auth`

**Header Name**: `Authorization`  
**Header Value**: `Bearer {{ $env.KAKAO_ACCESS_TOKEN }}`

### 2-3. Headers 설정

**Send Headers**: 체크

| Name | Value |
|------|-------|
| `Content-Type` | `application/json` |

### 2-4. Body 설정

**Send Body**: 체크  
**Body Content Type**: `JSON`

**Body (JSON)**:
```json
{
  "receiver_uuids": ["{{ $json.phone }}"],
  "template_code": "{{ $env.ALIMTALK_TEMPLATE_CODE }}",
  "template_args": {
    "#{guest_name}": "{{ $json.guest }}",
    "#{reservation_number}": "{{ $json.reservationNumber }}",
    "#{checkin_date}": "{{ $json.checkin }}",
    "#{checkout_date}": "{{ $json.checkout }}",
    "#{room_type}": "{{ $json.room }}",
    "#{amount}": "{{ $json.amount }}",
    "#{service_link}": "{{ $json.link }}"
  }
}
```

**중요:**
- `receiver_uuids`: 전화번호 배열 (하이픈 제거된 형식)
- `template_code`: 환경 변수에서 가져오기
- `template_args`: 템플릿 변수 매핑 (템플릿에 정의된 변수명과 정확히 일치해야 함)

**Save** 클릭

---

## 3단계: 환경 변수 추가

### 3-1. n8n 환경 변수 설정

1. n8n 상단 메뉴 → **Settings** (⚙️ 아이콘)
2. **Environment Variables** 클릭
3. 다음 변수 추가:

| Name | Value | 설명 |
|------|-------|------|
| `ALIMTALK_TEMPLATE_CODE` | 템플릿 코드 | 카카오 비즈니스에서 승인받은 템플릿 코드 |
| `KAKAO_ACCESS_TOKEN` | Access Token | 기존 유지 |
| `KAKAO_REST_API_KEY` | REST API Key | 기존 유지 |
| `WEB_APP_URL` | 웹 앱 URL | 기존 유지 |

### 3-2. 템플릿 코드 확인 방법

1. 카카오 비즈니스 콘솔 → **"알림톡"** → **"템플릿 관리"**
2. 승인된 템플릿 클릭
3. **"템플릿 코드"** 복사
4. n8n 환경 변수에 입력

---

## 4단계: 이메일 파싱 노드 수정 (전화번호 추출)

### 4-1. Code 노드 (이메일 파싱) 확인

전화번호를 추출하는 로직이 있는지 확인:

```javascript
// 기존 코드에 전화번호 추출 로직 추가
const phonePatterns = [
  /전화번호[:\s]*([0-9-()\s]+)/i,
  /연락처[:\s]*([0-9-()\s]+)/i,
  /휴대폰[:\s]*([0-9-()\s]+)/i,
  /010-?[0-9]{4}-?[0-9]{4}/,
  /01[0-9]-?[0-9]{3,4}-?[0-9]{4}/
];

let phone = '';
for (const pattern of phonePatterns) {
  const match = textBody.match(pattern);
  if (match) {
    phone = match[1] || match[0];
    break;
  }
}

// 전화번호 정리
phone = phone.replace(/[-\s()]/g, '').trim();

return {
  ...previousData,
  phone: phone
};
```

---

## 5단계: 오류 처리 노드 추가

### 5-1. IF 노드 추가 (오류 확인)

**HTTP Request** 노드 다음에 **IF** 노드 추가:

**Condition**: `{{ $json.successful_receiver_uuids && $json.successful_receiver_uuids.length > 0 }}`

**True**: 성공 처리
**False**: 오류 처리

### 5-2. 오류 처리 노드

**Code 노드 추가 (오류 로깅)**:
```javascript
const errorData = {
  timestamp: new Date().toISOString(),
  guest: $json.guest,
  phone: $json.phone,
  error: $json.failure_info || '알림톡 발송 실패',
  reservation_number: $json.reservationNumber
};

console.error('알림톡 발송 실패:', JSON.stringify(errorData, null, 2));

// 이메일로 관리자에게 알림 (선택사항)
// 또는 다른 알림 시스템으로 전송

return { json: errorData };
```

---

## 6단계: 테스트

### 6-1. 단일 테스트

1. **"전화번호 포맷 변환"** 노드에서 **"Execute Node"** 클릭
2. 전화번호 포맷 확인
3. **"HTTP Request"** 노드에서 **"Execute Node"** 클릭
4. 알림톡 발송 확인

### 6-2. 전체 플로우 테스트

1. 테스트용 네이버 예약 완료 이메일 발송
2. n8n 워크플로우 자동 실행 확인
3. 각 노드 실행 결과 확인
4. 알림톡 수신 확인

---

## 7단계: 채널 친구 추가 유도 (선택사항)

### 7-1. 별도 친구 추가 유도 메시지

예약 완료 후 1-2시간 후 친구 추가 유도 메시지 발송:

**워크플로우 구조:**
```
알림톡 발송 성공
  ↓
Wait 노드 (1-2시간 대기)
  ↓
HTTP Request (친구 추가 유도 알림톡)
```

**Wait 노드 설정:**
- **Resume**: `After Time Interval`
- **Amount**: `2`
- **Unit**: `hours`

**친구 추가 유도 템플릿:**
- 템플릿 코드: `{{ $env.ALIMTALK_FRIEND_INVITE_TEMPLATE_CODE }}`
- 메시지 내용: 친구 추가 혜택 안내
- 버튼: 채널 추가 버튼

---

## 📋 최종 체크리스트

### n8n 워크플로우
- [ ] 전화번호 포맷 변환 노드 추가
- [ ] HTTP Request 노드 수정 (알림톡 API)
- [ ] 환경 변수 추가 (ALIMTALK_TEMPLATE_CODE)
- [ ] 이메일 파싱 노드에 전화번호 추출 로직 추가
- [ ] 오류 처리 노드 추가

### 테스트
- [ ] 전화번호 포맷 변환 테스트
- [ ] 알림톡 발송 테스트
- [ ] 전체 플로우 테스트
- [ ] 오류 처리 테스트

---

## 🆘 문제 해결

### 문제 1: "400 Bad Request" 오류

**원인:**
- 템플릿 변수명 불일치
- 전화번호 형식 오류
- 필수 변수 누락

**해결:**
1. 템플릿 변수명 확인 (정확히 일치해야 함)
2. 전화번호 포맷 확인 (하이픈 제거, 11자리)
3. 모든 필수 변수 포함 확인

### 문제 2: "401 Unauthorized" 오류

**원인:** Access Token 만료 또는 잘못됨

**해결:**
1. Access Token 유효성 확인
2. Refresh Token으로 갱신
3. 환경 변수 업데이트

### 문제 3: "403 Forbidden" 오류

**원인:** 알림톡 권한 없음

**해결:**
1. 카카오 비즈니스 채널 확인
2. 알림톡 서비스 승인 확인
3. 앱과 채널 연결 확인

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
