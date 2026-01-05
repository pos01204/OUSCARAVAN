# 카카오톡 API 설정 가이드

## 🎯 목표

n8n에서 카카오톡 메시지를 자동으로 발송하기 위한 API 설정 방법입니다.

## 📋 단계별 설정

### 1단계: 카카오 개발자 계정 생성

1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 카카오 계정으로 로그인
3. **내 애플리케이션** → **애플리케이션 추가하기**

### 2단계: 애플리케이션 등록

#### 필수 정보 입력:
- **앱 이름**: OUSCARAVAN Concierge
- **사업자명**: OUSCARAVAN
- **사업자 등록번호**: (해당 시)

#### 앱 키 확인:
- **REST API 키**: 복사하여 보관 (환경 변수에 사용)

### 3단계: 플랫폼 설정

#### Web 플랫폼 등록:
1. **앱 설정** → **플랫폼** → **Web 플랫폼 등록**
2. **사이트 도메인**: `https://ouscaravan.com`
3. **Redirect URI**: `https://ouscaravan.com/auth/kakao/callback`

### 4단계: 카카오 로그인 활성화

1. **제품 설정** → **카카오 로그인** → **활성화**
2. **Redirect URI** 추가:
   - `https://ouscaravan.com/auth/kakao/callback`
   - `http://localhost:3000/auth/kakao/callback` (개발용)

### 5단계: 메시지 API 활성화

#### 친구톡 (1:1 메시지) 사용:

1. **제품 설정** → **메시지** → **친구톡** → **활성화**
2. **동의항목** 설정:
   - **전화번호**: 필수
   - **카카오톡 메시지 전송**: 필수

#### 알림톡 사용 (비즈니스용, 권장):

1. [카카오 비즈니스](https://business.kakao.com/) 접속
2. **비즈니스 채널** 생성
3. **알림톡** 서비스 신청
4. **템플릿** 등록 및 승인 대기

### 6단계: Access Token 발급

#### 방법 1: 수동 발급 (테스트용)

1. **내 애플리케이션** → **제품 설정** → **카카오 로그인**
2. **Redirect URI**로 접속하여 인증
3. **인증 코드** 받기
4. **토큰 발급** API 호출

#### 방법 2: 자동 발급 (프로덕션용)

**n8n Function 노드 사용:**

```javascript
// Refresh Token으로 Access Token 갱신
const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: $env.KAKAO_REST_API_KEY,
    refresh_token: $env.KAKAO_REFRESH_TOKEN
  })
});

const tokenData = await tokenResponse.json();

return {
  access_token: tokenData.access_token,
  expires_in: tokenData.expires_in
};
```

### 7단계: n8n 환경 변수 설정

**n8n 환경 변수에 추가:**

1. **Settings** → **Environment Variables**
2. 다음 변수 추가:

```
KAKAO_REST_API_KEY=your_rest_api_key_here
KAKAO_ACCESS_TOKEN=your_access_token_here
KAKAO_REFRESH_TOKEN=your_refresh_token_here
```

---

## 📱 메시지 발송 방법

### 친구톡 발송 (1:1 메시지)

**HTTP Request 노드 설정:**

- **Method**: POST
- **URL**: `https://kapi.kakao.com/v2/api/talk/memo/default/send`
- **Headers**:
  ```
  Authorization: Bearer {{ $env.KAKAO_ACCESS_TOKEN }}
  Content-Type: application/x-www-form-urlencoded
  ```
- **Body** (URL Encoded):
  ```
  template_object={
    "object_type": "text",
    "text": "{{ $json.guest }}님, 예약이 완료되었습니다!\n\n객실: {{ $json.room }}\n체크인: {{ $json.checkin }}\n체크아웃: {{ $json.checkout }}\n\n아래 링크를 클릭하세요:\n{{ $json.link }}",
    "link": {
      "web_url": "{{ $json.link }}",
      "mobile_web_url": "{{ $json.link }}"
    },
    "button_title": "컨시어지 서비스 이용하기"
  }
  ```

### 알림톡 발송 (비즈니스용)

**HTTP Request 노드 설정:**

- **Method**: POST
- **URL**: `https://kapi.kakao.com/v1/alimtalk/send`
- **Headers**:
  ```
  Authorization: Bearer {{ $env.KAKAO_ACCESS_TOKEN }}
  Content-Type: application/json
  ```
- **Body** (JSON):
  ```json
  {
    "receiver_uuids": ["{{ $json.phone }}"],
    "template_code": "YOUR_TEMPLATE_CODE",
    "template_args": {
      "#{guest}": "{{ $json.guest }}",
      "#{room}": "{{ $json.room }}",
      "#{checkin}": "{{ $json.checkin }}",
      "#{checkout}": "{{ $json.checkout }}",
      "#{link}": "{{ $json.link }}"
    }
  }
  ```

---

## 🔄 Access Token 자동 갱신 워크플로우

### 토큰 갱신 워크플로우 생성

1. **Schedule Trigger** 노드 추가 (매일 실행)
2. **Function** 노드로 토큰 갱신
3. **Set** 노드로 환경 변수 업데이트 (또는 데이터베이스 저장)

**Function 노드 코드:**

```javascript
// Refresh Token으로 새 Access Token 발급
const response = await fetch('https://kauth.kakao.com/oauth/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: $env.KAKAO_REST_API_KEY,
    refresh_token: $env.KAKAO_REFRESH_TOKEN
  })
});

const data = await response.json();

if (data.access_token) {
  // 환경 변수 업데이트 또는 데이터베이스 저장
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token || $env.KAKAO_REFRESH_TOKEN,
    expires_in: data.expires_in
  };
} else {
  throw new Error('Token refresh failed');
}
```

---

## 🧪 테스트 방법

### 1. Access Token 테스트

**HTTP Request 노드:**

- **Method**: GET
- **URL**: `https://kapi.kakao.com/v1/user/access_token_info`
- **Headers**: `Authorization: Bearer {{ $env.KAKAO_ACCESS_TOKEN }}`

**응답 확인:**
- `200 OK`: 토큰 유효
- `401 Unauthorized`: 토큰 만료 또는 무효

### 2. 메시지 발송 테스트

1. **테스트 전화번호**로 메시지 발송
2. **카카오톡**에서 메시지 수신 확인
3. **링크 클릭**하여 웹 앱 접속 확인

---

## ⚠️ 주의사항

### 1. 친구톡 제한사항

- 사용자가 **친구 추가** 필요
- **일일 발송 한도** 존재
- **스팸 필터** 적용 가능

### 2. 알림톡 제한사항

- **템플릿 사전 승인** 필요
- **비즈니스 채널** 등록 필요
- **유료 서비스** (건당 과금)

### 3. 보안

- **Access Token** 절대 공개하지 않기
- **환경 변수**에만 저장
- **Git에 커밋하지 않기**
- **정기적으로 토큰 갱신**

---

## 📚 참고 자료

- [카카오 개발자 문서](https://developers.kakao.com/docs)
- [카카오 메시지 API 가이드](https://developers.kakao.com/docs/latest/ko/message/rest-api)
- [카카오 비즈니스](https://business.kakao.com/)
- [n8n HTTP Request 노드](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
