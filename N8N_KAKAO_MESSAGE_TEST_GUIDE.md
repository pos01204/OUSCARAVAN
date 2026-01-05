# n8n 카카오톡 메시지 발송 테스트 가이드

## 📋 현재 상태 확인

### ✅ 완료된 설정
- 카카오톡 메시지 기능 승인 완료
- n8n 환경 변수 설정 완료
  - `KAKAO_REST_API_KEY`
  - `KAKAO_ACCESS_TOKEN`
  - `KAKAO_REFRESH_TOKEN` (선택)
  - `WEB_APP_URL`

### 🎯 목표
- 카카오톡 친구 목록 조회 테스트
- 카카오톡 메시지 발송 테스트
- 전체 플로우 테스트 (Gmail → n8n → 카카오톡)

---

## 1단계: 카카오톡 친구 목록 조회 테스트

### 목적
카카오톡 친구 목록을 조회하여 메시지를 발송할 친구를 확인합니다.

### n8n 워크플로우 설정

#### 1-1. 새 워크플로우 생성 (테스트용)

1. n8n에서 **"Workflows"** → **"Add workflow"** 클릭
2. 워크플로우 이름: `카카오톡 친구 목록 조회 테스트`

#### 1-2. HTTP Request 노드 추가

1. **"+" 버튼** 클릭 → **"HTTP Request"** 노드 추가
2. 노드 이름: `친구 목록 조회`

#### 1-3. HTTP Request 노드 설정

**Method:**
```
GET
```

**URL:**
```
https://kapi.kakao.com/v1/api/talk/friends
```

**Authentication:**
- Type: `Generic Credential Type`
- 또는 **"Header Auth"** 선택

**Headers:**
- **Name**: `Authorization`
- **Value**: `Bearer {{ $env.KAKAO_ACCESS_TOKEN }}`

**또는 Header Auth 사용 시:**
- **Header Name**: `Authorization`
- **Header Value**: `Bearer {{ $env.KAKAO_ACCESS_TOKEN }}`

#### 1-4. 실행 및 결과 확인

1. **"Execute Workflow"** 클릭
2. 결과 확인:
   ```json
   {
     "elements": [
       {
         "id": "123456789",
         "uuid": "UUID",
         "profile_nickname": "홍길동",
         "profile_thumbnail_image": "https://...",
         "favorite": false,
         "allowed_msg": true
       }
     ],
     "total_count": 1,
     "before_url": null,
     "after_url": null
   }
   ```

**성공 시:**
- `elements` 배열에 친구 목록이 표시됩니다
- `allowed_msg: true`인 친구에게만 메시지 발송 가능

**실패 시:**
- `401 Unauthorized`: Access Token이 만료되었거나 잘못됨
- `403 Forbidden`: 친구 목록 조회 권한 없음

---

## 2단계: 카카오톡 메시지 발송 테스트

### 목적
단일 친구에게 카카오톡 메시지를 발송하여 기능을 테스트합니다.

### n8n 워크플로우 설정

#### 2-1. HTTP Request 노드 추가

1. 1단계의 **"친구 목록 조회"** 노드 다음에 **"HTTP Request"** 노드 추가
2. 노드 이름: `카카오톡 메시지 발송`

#### 2-2. HTTP Request 노드 설정

**Method:**
```
POST
```

**URL:**
```
https://kapi.kakao.com/v1/api/talk/friends/message/default/send
```

**Authentication:**
- Type: `Header Auth`

**Headers:**
- **Header Name**: `Authorization`
- **Header Value**: `Bearer {{ $env.KAKAO_ACCESS_TOKEN }}`
- **Header Name**: `Content-Type`
- **Header Value**: `application/x-www-form-urlencoded`

**Body:**
- **Body Content Type**: `Form-Data` 또는 `Form-Urlencoded`

**Form Data:**
- **receiver_uuids**: `{{ $json.elements[0].uuid }}` (친구 목록 조회 결과의 첫 번째 친구 UUID)
- **template_object**: 아래 JSON을 문자열로 변환하여 입력

**template_object JSON:**
```json
{
  "object_type": "text",
  "text": "테스트 메시지입니다.\n\nOUSCARAVAN 컨시어지 서비스를 테스트 중입니다.",
  "link": {
    "web_url": "{{ $env.WEB_APP_URL }}/home?guest=테스트&room=A1",
    "mobile_web_url": "{{ $env.WEB_APP_URL }}/home?guest=테스트&room=A1"
  },
  "button_title": "컨시어지 서비스 이용하기"
}
```

**중요:** `template_object`는 JSON 문자열로 변환해야 합니다. n8n에서는 다음과 같이 설정:

**Option 1: Code 노드 사용 (권장)**

1. **"친구 목록 조회"** 노드와 **"카카오톡 메시지 발송"** 노드 사이에 **"Code"** 노드 추가
2. 노드 이름: `메시지 템플릿 생성`
3. **Mode**: `Run Once for All Items`
4. **Language**: `JavaScript`
5. **Code**:
```javascript
const friend = $input.all()[0].json.elements[0]; // 첫 번째 친구 선택
const webAppUrl = $env.WEB_APP_URL;

const templateObject = {
  object_type: "text",
  text: `테스트 메시지입니다.\n\nOUSCARAVAN 컨시어지 서비스를 테스트 중입니다.`,
  link: {
    web_url: `${webAppUrl}/home?guest=테스트&room=A1`,
    mobile_web_url: `${webAppUrl}/home?guest=테스트&room=A1`
  },
  button_title: "컨시어지 서비스 이용하기"
};

return {
  json: {
    receiver_uuid: friend.uuid,
    receiver_nickname: friend.profile_nickname,
    template_object: JSON.stringify(templateObject)
  }
};
```

6. **"카카오톡 메시지 발송"** 노드의 **Body** 설정:
   - **Body Content Type**: `Form-Urlencoded`
   - **receiver_uuids**: `{{ $json.receiver_uuid }}`
   - **template_object**: `{{ $json.template_object }}`

**Option 2: 직접 입력 (간단한 테스트용)**

**Body Content Type**: `Form-Urlencoded`

**Form Fields:**
- **receiver_uuids**: `친구의_UUID_여기에_입력`
- **template_object**: 
```json
{"object_type":"text","text":"테스트 메시지입니다.","link":{"web_url":"https://ouscaravan.vercel.app/home?guest=테스트&room=A1","mobile_web_url":"https://ouscaravan.vercel.app/home?guest=테스트&room=A1"},"button_title":"컨시어지 서비스 이용하기"}
```

#### 2-3. 실행 및 결과 확인

1. **"Execute Workflow"** 클릭
2. 결과 확인:
   ```json
   {
     "successful_receiver_uuids": ["UUID"],
     "failure_info": []
   }
   ```

**성공 시:**
- `successful_receiver_uuids`에 친구 UUID가 표시됩니다
- 카카오톡 앱에서 메시지 수신 확인

**실패 시:**
- `failure_info`에 오류 정보가 표시됩니다
- 일반적인 오류:
  - `401 Unauthorized`: Access Token 만료
  - `403 Forbidden`: 메시지 발송 권한 없음
  - `400 Bad Request`: 요청 형식 오류

---

## 3단계: 실제 예약 시나리오 테스트

### 목적
네이버 예약 완료 이메일을 시뮬레이션하여 전체 플로우를 테스트합니다.

### n8n 워크플로우 설정

#### 3-1. 기존 워크플로우 확인

기존에 설정한 **"네이버 예약 → 카카오톡 발송"** 워크플로우를 확인합니다.

**워크플로우 구조:**
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
HTTP Request (카카오톡 메시지 발송)
```

#### 3-2. HTTP Request 노드 확인 및 수정

**현재 설정 확인:**
1. **HTTP Request** 노드 클릭
2. **URL** 확인: `https://kapi.kakao.com/v1/api/talk/friends/message/default/send`
3. **Method** 확인: `POST`
4. **Headers** 확인:
   - `Authorization`: `Bearer {{ $env.KAKAO_ACCESS_TOKEN }}`
   - `Content-Type`: `application/x-www-form-urlencoded`

**Body 설정 확인:**

**Option A: Code 노드에서 template_object 생성 (권장)**

이전 노드에서 `template_object`를 JSON 문자열로 생성하도록 수정:

**Code 노드 (고유 링크 생성) 수정:**
```javascript
// 이전 코드에 추가
const templateObject = {
  object_type: "text",
  text: `${guestName}님, OUSCARAVAN 예약이 완료되었습니다!\n\n예약번호: ${reservationNumber}\n체크인: ${checkinDate}\n체크아웃: ${checkoutDate}\n객실: ${roomType}\n결제금액: ${amount}원\n\n아래 링크를 클릭하여 컨시어지 서비스를 이용하세요.`,
  link: {
    web_url: uniqueLink,
    mobile_web_url: uniqueLink
  },
  button_title: "컨시어지 서비스 이용하기"
};

return {
  json: {
    ...previousData,
    template_object: JSON.stringify(templateObject),
    receiver_uuid: friendUuid // 친구 목록에서 조회한 UUID
  }
};
```

**HTTP Request 노드 Body 설정:**
- **Body Content Type**: `Form-Urlencoded`
- **receiver_uuids**: `{{ $json.receiver_uuid }}`
- **template_object**: `{{ $json.template_object }}`

**Option B: 직접 입력 (간단한 테스트용)**

**Body Content Type**: `Form-Urlencoded`

**Form Fields:**
- **receiver_uuids**: `{{ $json.friend_uuid }}`
- **template_object**: `{{ $json.message_template }}`

#### 3-3. 친구 UUID 조회 추가

**문제:** 실제 예약 시 게스트의 카카오톡 친구 UUID를 어떻게 찾을까요?

**해결 방법:**

**방법 1: 친구 목록에서 이름으로 검색 (권장)**

**Code 노드 (친구 UUID 조회) 추가:**
```javascript
// Gmail Trigger와 IF 노드 사이에 추가
const guestName = $json.guestName; // 이메일에서 파싱한 게스트 이름
const accessToken = $env.KAKAO_ACCESS_TOKEN;

// 친구 목록 조회 API 호출
const friendsResponse = await fetch('https://kapi.kakao.com/v1/api/talk/friends', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const friendsData = await friendsResponse.json();

// 게스트 이름과 일치하는 친구 찾기 (부분 일치)
const matchedFriend = friendsData.elements.find(friend => 
  friend.profile_nickname.includes(guestName) || 
  guestName.includes(friend.profile_nickname)
);

if (!matchedFriend) {
  throw new Error(`친구 목록에서 "${guestName}"을 찾을 수 없습니다.`);
}

return {
  json: {
    ...$input.all()[0].json,
    friend_uuid: matchedFriend.uuid,
    friend_nickname: matchedFriend.profile_nickname
  }
};
```

**방법 2: 예약 시 전화번호로 친구 찾기**

예약 이메일에 전화번호가 포함되어 있다면, 전화번호로 친구를 찾을 수 있습니다 (전화번호 API 사용 필요).

**방법 3: 수동 매핑 테이블 사용**

게스트 이름과 친구 UUID를 매핑하는 테이블을 만들어 사용합니다.

#### 3-4. 테스트 실행

**테스트 방법 1: 실제 이메일 발송**

1. 테스트용 네이버 예약 완료 이메일을 자신의 Gmail로 발송
2. n8n 워크플로우가 자동으로 트리거되는지 확인
3. 각 노드의 실행 결과 확인
4. 카카오톡 메시지 수신 확인

**테스트 방법 2: 수동 실행**

1. **Gmail Trigger** 노드를 **"Manual Trigger"**로 변경 (테스트용)
2. **Manual Trigger** 노드에서 테스트 데이터 입력:
   ```json
   {
     "subject": "[네이버 예약] 예약이 확정되었습니다.",
     "from": "reservation@naver.com",
     "body": "예약 완료 이메일 내용..."
   }
   ```
3. **"Execute Workflow"** 클릭
4. 각 노드의 실행 결과 확인

---

## 4단계: Access Token 갱신 (만료 시)

### Access Token 만료 확인

**테스트 방법:**
1. **HTTP Request** 노드로 다음 API 호출:
   - **URL**: `https://kapi.kakao.com/v1/user/access_token_info`
   - **Method**: `GET`
   - **Headers**: `Authorization: Bearer {{ $env.KAKAO_ACCESS_TOKEN }}`

**응답 확인:**
- `200 OK`: 토큰 유효 ✅
- `401 Unauthorized`: 토큰 만료 ❌

### Access Token 갱신

**방법 1: Refresh Token 사용 (권장)**

**HTTP Request** 노드 추가:
- **Method**: `POST`
- **URL**: `https://kauth.kakao.com/oauth/token`
- **Body Content Type**: `Form-Urlencoded`
- **Form Fields**:
  - **grant_type**: `refresh_token`
  - **client_id**: `{{ $env.KAKAO_REST_API_KEY }}`
  - **refresh_token**: `{{ $env.KAKAO_REFRESH_TOKEN }}`

**응답:**
```json
{
  "access_token": "새로운_액세스_토큰",
  "refresh_token": "새로운_리프레시_토큰",
  "token_type": "bearer",
  "expires_in": 21599
}
```

**방법 2: 수동 재발급**

[카카오 개발자 도구](https://developers.kakao.com/tool)에서 수동으로 토큰을 재발급받아 n8n 환경 변수를 업데이트합니다.

---

## 5단계: 전체 플로우 통합 테스트

### 테스트 시나리오

#### 시나리오 1: 예약 완료 → 카카오톡 발송

1. **준비:**
   - 테스트용 네이버 예약 완료 이메일 준비
   - 카카오톡 친구 추가 확인

2. **실행:**
   - 테스트 이메일을 Gmail로 발송
   - n8n 워크플로우 자동 실행 확인

3. **확인:**
   - 이메일 파싱 정확성
   - 고유 링크 생성 정확성
   - 카카오톡 메시지 발송 성공
   - 웹 앱 링크 클릭 시 정상 동작

#### 시나리오 2: 체크인 당일 안내

1. **준비:**
   - 체크인 당일 게스트 목록 확인
   - 스케줄러 또는 Cron 트리거 설정 (선택사항)

2. **실행:**
   - 체크인 안내 메시지 발송

3. **확인:**
   - 메시지 내용 정확성
   - 웹 앱 링크 정상 동작

#### 시나리오 3: 체크아웃 당일 안내

1. **준비:**
   - 체크아웃 당일 게스트 목록 확인

2. **실행:**
   - 체크아웃 안내 메시지 발송

3. **확인:**
   - 메시지 내용 정확성
   - 자동 체크아웃 링크 정상 동작

---

## 6단계: 오류 처리 및 로깅

### 오류 처리 노드 추가

**IF 노드 추가 (오류 확인):**
- **Condition**: `{{ $json.successful_receiver_uuids.length === 0 }}`
- **True**: 오류 처리 노드로 이동
- **False**: 성공 처리 노드로 이동

### 로깅

**Code 노드 추가 (로깅):**
```javascript
const logData = {
  timestamp: new Date().toISOString(),
  guest_name: $json.guestName,
  reservation_number: $json.reservationNumber,
  message_sent: $json.successful_receiver_uuids.length > 0,
  error: $json.failure_info
};

console.log('카카오톡 메시지 발송 로그:', JSON.stringify(logData, null, 2));

return { json: logData };
```

---

## 📋 체크리스트

### 기본 테스트
- [ ] 카카오톡 친구 목록 조회 성공
- [ ] 카카오톡 메시지 발송 성공
- [ ] 메시지 수신 확인
- [ ] 웹 앱 링크 클릭 시 정상 동작

### 통합 테스트
- [ ] Gmail Trigger 정상 동작
- [ ] 이메일 파싱 정확성
- [ ] 고유 링크 생성 정확성
- [ ] 전체 플로우 정상 동작

### 오류 처리
- [ ] Access Token 만료 시 갱신
- [ ] 친구 목록에 없는 경우 처리
- [ ] 메시지 발송 실패 시 재시도 또는 알림

---

## 🆘 문제 해결

### 문제 1: "401 Unauthorized" 오류

**원인:** Access Token 만료 또는 잘못됨

**해결:**
1. Access Token 유효성 확인
2. Refresh Token으로 갱신
3. 환경 변수 업데이트

### 문제 2: "403 Forbidden" 오류

**원인:** 메시지 발송 권한 없음

**해결:**
1. 카카오 개발자 콘솔에서 권한 확인
2. 추가 기능 신청 상태 확인
3. 동의항목 설정 확인

### 문제 3: 친구 목록에 게스트가 없음

**원인:** 게스트가 카카오톡 친구로 추가되지 않음

**해결:**
1. 게스트에게 친구 추가 요청
2. 또는 알림톡 사용 (비즈니스 채널 필요)

### 문제 4: 메시지가 발송되지 않음

**원인:** 요청 형식 오류 또는 친구 UUID 오류

**해결:**
1. HTTP Request 노드의 Body 형식 확인
2. template_object JSON 형식 확인
3. receiver_uuids 형식 확인 (배열이 아닌 쉼표로 구분된 문자열)

---

## 🎯 다음 단계

테스트 완료 후:
1. 프로덕션 환경으로 전환
2. 실제 예약 이메일 모니터링 시작
3. 스케줄러 설정 (체크인/체크아웃 당일 안내)
4. 모니터링 및 로깅 시스템 구축

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
