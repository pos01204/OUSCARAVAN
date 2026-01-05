# 카카오톡 API 설정 단계별 가이드

## 🎯 목표

n8n에서 카카오톡 메시지를 자동으로 발송하기 위한 카카오톡 API 설정입니다.

---

## 📋 사전 준비

- [ ] 카카오 계정 (카카오톡 사용 계정)
- [ ] 사업자 정보 (비즈니스 채널 사용 시)
- [ ] n8n 환경 변수 설정 권한

---

## 1단계: 카카오 개발자 계정 생성

### 1.1 카카오 개발자 콘솔 접속

1. 브라우저에서 [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 카카오 계정으로 로그인
   - 카카오톡 계정과 동일한 계정 사용 권장

### 1.2 애플리케이션 등록

1. **내 애플리케이션** 메뉴 클릭
2. **애플리케이션 추가하기** 버튼 클릭
3. 필수 정보 입력:
   - **앱 이름**: `OUSCARAVAN Concierge` (또는 원하는 이름)
   - **사업자명**: `OUSCARAVAN` (또는 실제 사업자명)
   - **사업자 등록번호**: (해당 시 입력)
4. **저장** 클릭

### 1.3 앱 키 확인

1. 생성된 애플리케이션 클릭
2. **앱 키** 섹션 확인
3. **REST API 키** 복사하여 안전한 곳에 보관
   - 나중에 n8n 환경 변수에 사용

---

## 2단계: 플랫폼 설정

### 2.1 Web 플랫폼 등록

1. **앱 설정** → **플랫폼** 메뉴 클릭
2. **Web 플랫폼 등록** 클릭
3. **사이트 도메인** 입력:
   ```
   https://ouscaravan.com
   ```
   (또는 실제 배포된 도메인)
4. **저장** 클릭

### 2.2 Redirect URI 설정

1. **Redirect URI** 섹션에서 **URI 추가** 클릭
2. 다음 URI 추가:
   ```
   https://ouscaravan.com/auth/kakao/callback
   ```
   (개발/테스트용으로 필요 시)
3. **저장** 클릭

---

## 3단계: 카카오 로그인 활성화

### 3.1 카카오 로그인 활성화

1. **제품 설정** → **카카오 로그인** 메뉴 클릭
2. **활성화 설정** 토글을 **ON**으로 변경
3. **Redirect URI** 추가:
   - `https://ouscaravan.com/auth/kakao/callback`
   - `http://localhost:3000/auth/kakao/callback` (개발용, 선택사항)
4. **저장** 클릭

### 3.2 동의항목 설정

1. **동의항목** 탭 클릭
2. 필요한 동의항목 활성화:
   - **전화번호**: 선택 (카카오톡 메시지 발송에 필요)
   - **카카오톡 메시지 전송**: 선택 (필수)
3. **저장** 클릭

---

## 4단계: 메시지 API 활성화

### 옵션 A: 친구톡 사용 (1:1 메시지, 무료)

#### 4.1 친구톡 활성화

1. **제품 설정** → **메시지** 메뉴 클릭
2. **친구톡** 섹션에서 **활성화 설정** 토글을 **ON**으로 변경
3. **저장** 클릭

#### 4.2 친구톡 제한사항

- ⚠️ 사용자가 **친구 추가** 필요
- ⚠️ **일일 발송 한도** 존재
- ⚠️ **스팸 필터** 적용 가능

### 옵션 B: 알림톡 사용 (비즈니스용, 유료, 권장)

#### 4.1 카카오 비즈니스 채널 생성

1. [카카오 비즈니스](https://business.kakao.com/) 접속
2. 카카오 계정으로 로그인
3. **비즈니스 채널** → **채널 만들기** 클릭
4. 채널 정보 입력:
   - 채널 이름: `OUSCARAVAN`
   - 채널 유형: 선택
   - 사업자 정보 입력
5. **생성** 클릭

#### 4.2 알림톡 서비스 신청

1. **알림톡** 메뉴 클릭
2. **서비스 신청** 클릭
3. 서비스 약관 동의
4. 신청 완료 (승인 대기)

#### 4.3 템플릿 등록

1. **템플릿 관리** → **템플릿 만들기** 클릭
2. 템플릿 정보 입력:
   - **템플릿 이름**: `예약 완료 알림`
   - **메시지 내용**: 
     ```
     {{guest}}님, OUSCARAVAN 예약이 완료되었습니다!

     예약번호: {{reservationNumber}}
     체크인: {{checkin}}
     체크아웃: {{checkout}}
     객실: {{room}}
     결제금액: {{amount}}

     아래 링크를 클릭하여 컨시어지 서비스를 이용하세요:
     {{link}}
     ```
   - **버튼**: "컨시어지 서비스 이용하기" (링크: {{link}})
3. **등록** 클릭
4. **승인 대기** (카카오에서 승인 후 템플릿 코드 발급)

---

## 5단계: Access Token 발급

### 5.1 수동 발급 (테스트용)

#### 방법 1: 카카오 개발자 콘솔에서 발급

1. **제품 설정** → **카카오 로그인** → **도메인** 확인
2. 다음 URL로 접속 (브라우저에서):
   ```
   https://kauth.kakao.com/oauth/authorize?client_id=YOUR_REST_API_KEY&redirect_uri=YOUR_REDIRECT_URI&response_type=code
   ```
   - `YOUR_REST_API_KEY`: 1단계에서 복사한 REST API 키
   - `YOUR_REDIRECT_URI`: 설정한 Redirect URI
3. 카카오 계정으로 로그인 및 권한 승인
4. 리디렉션된 URL에서 **code** 파라미터 복사
5. 다음 명령어로 Access Token 발급 (또는 Postman 사용):
   ```bash
   curl -X POST https://kauth.kakao.com/oauth/token \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "grant_type=authorization_code" \
     -d "client_id=YOUR_REST_API_KEY" \
     -d "redirect_uri=YOUR_REDIRECT_URI" \
     -d "code=RECEIVED_CODE"
   ```
6. 응답에서 **access_token**과 **refresh_token** 복사

#### 방법 2: 카카오 개발자 도구 사용

1. [카카오 개발자 도구](https://developers.kakao.com/tool) 접속
2. **REST API 테스트** 메뉴 선택
3. **토큰 발급** 클릭
4. 권한 승인 후 토큰 복사

### 5.2 자동 갱신 설정 (프로덕션용)

Access Token은 만료되므로 Refresh Token으로 자동 갱신하는 워크플로우를 만드는 것을 권장합니다.

**n8n에서 별도 워크플로우 생성:**
1. Schedule Trigger 노드 추가 (매일 실행)
2. HTTP Request 노드로 토큰 갱신
3. 환경 변수 업데이트

---

## 6단계: n8n 환경 변수 설정

### 6.1 환경 변수 추가

1. n8n 상단 메뉴 → **Settings** (⚙️ 아이콘) 클릭
2. **Environment Variables** 메뉴 클릭
3. **+ Add Variable** 버튼 클릭
4. 다음 변수들 추가:

| Name | Value | 설명 |
|------|-------|------|
| `KAKAO_REST_API_KEY` | `YOUR_REST_API_KEY` | 카카오 REST API 키 (1단계에서 복사) |
| `KAKAO_ACCESS_TOKEN` | `YOUR_ACCESS_TOKEN` | Access Token (5단계에서 발급) |
| `KAKAO_REFRESH_TOKEN` | `YOUR_REFRESH_TOKEN` | Refresh Token (5단계에서 발급, 선택사항) |
| `WEB_APP_URL` | `https://ouscaravan.com` | 웹 앱 URL |

### 6.2 환경 변수 확인

- 모든 변수가 올바르게 설정되었는지 확인
- **Save** 클릭

---

## 7단계: 테스트

### 7.1 Access Token 유효성 확인

**n8n에서 HTTP Request 노드로 테스트:**

1. 새 워크플로우 생성 (테스트용)
2. HTTP Request 노드 추가
3. 설정:
   - **Method**: `GET`
   - **URL**: `https://kapi.kakao.com/v1/user/access_token_info`
   - **Authentication**: Header Auth
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer {{ $env.KAKAO_ACCESS_TOKEN }}`
4. **Execute step** 클릭
5. 응답 확인:
   - `200 OK`: 토큰 유효 ✅
   - `401 Unauthorized`: 토큰 만료 또는 무효 ❌

### 7.2 메시지 발송 테스트

**n8n 워크플로우에서 테스트:**

1. 기존 워크플로우 열기
2. HTTP Request 노드 (카카오톡 발송) 선택
3. **Execute step** 클릭
4. 응답 확인:
   - `200 OK`: 메시지 발송 성공 ✅
   - `400 Bad Request`: 요청 형식 오류
   - `401 Unauthorized`: 토큰 문제
   - `403 Forbidden`: 권한 문제

### 7.3 실제 수신 확인

1. 테스트 전화번호로 메시지 발송
2. 카카오톡에서 메시지 수신 확인
3. 링크 클릭하여 웹 앱 접속 확인

---

## 8단계: 문제 해결

### 8.1 Access Token 만료

**증상**: `401 Unauthorized` 오류

**해결 방법:**
1. Refresh Token으로 새 Access Token 발급
2. n8n 환경 변수 업데이트
3. 또는 수동으로 새 토큰 발급

### 8.2 메시지 발송 실패

**증상**: `400 Bad Request` 또는 `403 Forbidden`

**해결 방법:**
1. 친구톡 사용 시: 사용자가 친구 추가했는지 확인
2. 알림톡 사용 시: 템플릿 승인 여부 확인
3. API 권한 확인

### 8.3 권한 오류

**증상**: `403 Forbidden`

**해결 방법:**
1. 카카오 개발자 콘솔에서 메시지 API 활성화 확인
2. 동의항목 설정 확인
3. 앱 상태 확인 (정상 상태인지)

---

## 📋 체크리스트

### 카카오 개발자 콘솔
- [ ] 카카오 개발자 계정 생성
- [ ] 애플리케이션 등록
- [ ] REST API 키 복사
- [ ] Web 플랫폼 등록
- [ ] Redirect URI 설정
- [ ] 카카오 로그인 활성화
- [ ] 동의항목 설정
- [ ] 메시지 API 활성화 (친구톡 또는 알림톡)

### 카카오 비즈니스 (알림톡 사용 시)
- [ ] 비즈니스 채널 생성
- [ ] 알림톡 서비스 신청
- [ ] 템플릿 등록 및 승인

### Access Token
- [ ] Access Token 발급
- [ ] Refresh Token 발급
- [ ] 토큰 유효성 확인

### n8n 설정
- [ ] 환경 변수 추가
  - [ ] KAKAO_REST_API_KEY
  - [ ] KAKAO_ACCESS_TOKEN
  - [ ] KAKAO_REFRESH_TOKEN (선택사항)
  - [ ] WEB_APP_URL
- [ ] HTTP Request 노드 설정 확인
- [ ] 테스트 실행

---

## 🎯 다음 단계

카카오톡 API 설정이 완료되면:

1. **워크플로우 활성화**
   - n8n 워크플로우 우측 상단 토글 스위치 ON

2. **실제 테스트**
   - 네이버 예약 이메일 발송
   - 워크플로우 자동 실행 확인
   - 카카오톡 메시지 수신 확인

3. **모니터링**
   - n8n Executions에서 실행 로그 확인
   - 에러 발생 시 로그 확인

---

## 📚 참고 자료

- [카카오 개발자 문서](https://developers.kakao.com/docs)
- [카카오 메시지 API 가이드](https://developers.kakao.com/docs/latest/ko/message/rest-api)
- [카카오 비즈니스](https://business.kakao.com/)
- [KAKAO_API_SETUP.md](./KAKAO_API_SETUP.md) - 상세 가이드

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
