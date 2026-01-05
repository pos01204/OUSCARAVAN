# SMS 자동 발송 가이드

## 📋 개요

비즈톡 알림톡 대신 **SMS(문자 메시지)**를 통한 자동 발송 방법입니다. SMS는 가입 조건이 덜 까다롭고 API 연동이 더 간단합니다.

---

## 🔍 알림톡 vs SMS 비교

### 알림톡 (비즈톡)
- ❌ 가입 조건 까다로움
- ❌ 템플릿 승인 필요 (1-2일)
- ❌ 비즈톡 서비스 신청 필요
- ✅ 카카오톡 앱에서 수신
- ✅ 링크 버튼 지원
- ✅ 비용: 건당 20-30원

### SMS (문자 메시지)
- ✅ 가입 조건 간단
- ✅ 템플릿 승인 불필요 (일반 SMS)
- ✅ 즉시 사용 가능
- ✅ 모든 휴대폰에서 수신
- ❌ 링크 버튼 없음 (URL만 포함)
- ✅ 비용: 건당 20-30원 (유사)

---

## 🎯 SMS 발송 서비스 옵션

### 옵션 1: 카카오 알림톡 SMS (권장)

**특징:**
- 카카오 계정으로 간편 가입
- API 연동 가능
- n8n과 직접 연동
- 비용: 건당 20-30원

**가입 조건:**
- 카카오 계정
- 사업자 정보 (이미 있음)
- 비교적 간단

**신청 방법:**
1. [카카오 알림톡](https://alimtalk.kakao.com/) 접속
2. SMS 서비스 신청
3. API Key 발급

### 옵션 2: 네이버 클라우드 플랫폼 SMS

**특징:**
- 네이버 클라우드 플랫폼 계정 필요
- API 연동 가능
- 안정적인 서비스

**신청 방법:**
1. [네이버 클라우드 플랫폼](https://www.ncloud.com/) 접속
2. SMS 서비스 신청
3. API 인증 정보 발급

### 옵션 3: AWS SNS (Simple Notification Service)

**특징:**
- AWS 계정 필요
- 글로벌 서비스
- 한국 리전 지원

**신청 방법:**
1. AWS 계정 생성
2. SNS 서비스 활성화
3. 한국 리전에서 SMS 발송 설정

### 옵션 4: 엔젤리너스 (국내 SMS 서비스)

**특징:**
- 국내 전용 SMS 서비스
- API 연동 가능
- 안정적인 서비스

**신청 방법:**
1. [엔젤리너스](https://www.angelinus.com/) 접속
2. 서비스 신청
3. API Key 발급

---

## 💡 권장 솔루션: 카카오 알림톡 SMS

### 이유

1. **가입 조건 간단**
   - 카카오 계정으로 간편 가입
   - 사업자 정보만 있으면 가능

2. **API 연동 용이**
   - REST API 제공
   - n8n과 직접 연동 가능

3. **비용 유사**
   - 알림톡과 비슷한 비용
   - 건당 20-30원

4. **즉시 사용 가능**
   - 템플릿 승인 불필요
   - 가입 후 바로 사용

---

## 📋 카카오 알림톡 SMS 설정 가이드

### 1단계: 카카오 알림톡 SMS 서비스 신청

1. [카카오 알림톡](https://alimtalk.kakao.com/) 접속
2. 카카오 계정으로 로그인
3. **"SMS 서비스 신청"** 또는 **"서비스 시작하기"** 클릭
4. 사업자 정보 입력:
   - 회사명: `오우스카라반`
   - 사업자 등록번호: `887-08-01964`
5. 서비스 약관 동의
6. 신청 완료

### 2단계: API Key 발급

1. 카카오 알림톡 콘솔 → **"API 설정"**
2. **"API Key 발급"** 클릭
3. API Key 복사 및 보관

### 3단계: n8n 워크플로우 설정

**HTTP Request 노드 설정:**

**Method**: `POST`

**URL**: `https://kapi.kakao.com/v1/api/talk/memo/send`

**Headers:**
- `Authorization`: `Bearer {{ $env.KAKAO_ACCESS_TOKEN }}`
- `Content-Type`: `application/json`

**Body (JSON):**
```json
{
  "receiver_uuids": ["{{ $json.phone }}"],
  "template_object": {
    "object_type": "text",
    "text": "{{ $json.guest }}님, OUSCARAVAN 예약이 완료되었습니다!\n\n예약번호: {{ $json.reservationNumber }}\n체크인: {{ $json.checkin }}\n체크아웃: {{ $json.checkout }}\n객실: {{ $json.room }}\n결제금액: {{ $json.amount }}원\n\n컨시어지 서비스: {{ $json.link }}",
    "link": {
      "web_url": "{{ $json.link }}",
      "mobile_web_url": "{{ $json.link }}"
    },
    "button_title": "컨시어지 서비스 이용하기"
  }
}
```

**또는 일반 SMS API 사용:**

**URL**: `https://kapi.kakao.com/v1/api/talk/memo/send`

**Body (JSON):**
```json
{
  "receiver_uuids": ["{{ $json.phone }}"],
  "template_object": {
    "object_type": "text",
    "text": "{{ $json.guest }}님, OUSCARAVAN 예약이 완료되었습니다!\n\n예약번호: {{ $json.reservationNumber }}\n체크인: {{ $json.checkin }}\n체크아웃: {{ $json.checkout }}\n객실: {{ $json.room }}\n결제금액: {{ $json.amount }}원\n\n컨시어지 서비스: {{ $json.link }}"
  }
}
```

---

## 🔄 SMS 발송 워크플로우

### 워크플로우 구조

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
Code (전화번호 포맷 변환)
  ↓
HTTP Request (SMS 발송)
```

### SMS 메시지 예시

```
홍길동님, OUSCARAVAN 예약이 완료되었습니다!

예약번호: 1122269060
체크인: 2026-01-15 15:00
체크아웃: 2026-01-17 11:00
객실: Airstream1
결제금액: 180,000원

컨시어지 서비스: https://ouscaravan.vercel.app/home?guest=홍길동&room=A1&token=xxx
```

---

## 📊 SMS vs 알림톡 비교표

| 항목 | SMS | 알림톡 (비즈톡) |
|------|-----|----------------|
| **가입 조건** | 간단 ✅ | 까다로움 ❌ |
| **템플릿 승인** | 불필요 ✅ | 필요 (1-2일) ❌ |
| **즉시 사용** | 가능 ✅ | 승인 대기 필요 ❌ |
| **API 연동** | 간단 ✅ | 복잡 ❌ |
| **링크 버튼** | 없음 (URL만) ❌ | 있음 ✅ |
| **수신 앱** | 모든 휴대폰 ✅ | 카카오톡만 ❌ |
| **비용** | 건당 20-30원 | 건당 20-30원 |
| **자동화** | 가능 ✅ | 가능 ✅ |

---

## 🎯 최종 권장사항

### SMS 발송 선택 시

**장점:**
- ✅ 가입 조건 간단
- ✅ 즉시 사용 가능
- ✅ 모든 휴대폰에서 수신
- ✅ API 연동 간단

**단점:**
- ❌ 링크 버튼 없음 (URL만 포함)
- ❌ 카카오톡 앱에서 수신 안 됨

### 알림톡 발송 선택 시

**장점:**
- ✅ 링크 버튼 지원
- ✅ 카카오톡 앱에서 수신
- ✅ 더 나은 사용자 경험

**단점:**
- ❌ 가입 조건 까다로움
- ❌ 템플릿 승인 필요
- ❌ 승인 대기 시간

---

## 💡 하이브리드 전략

### SMS + 카카오톡 채널 친구 추가 유도

**전략:**
1. **SMS로 예약 완료 안내** (즉시 발송)
2. **SMS에 카카오톡 채널 친구 추가 유도** 포함
3. **친구 추가 완료 후 친구톡 마케팅** 활용

**SMS 메시지 예시:**
```
홍길동님, OUSCARAVAN 예약이 완료되었습니다!

예약번호: 1122269060
체크인: 2026-01-15 15:00
체크아웃: 2026-01-17 11:00
객실: Airstream1

컨시어지 서비스: https://ouscaravan.vercel.app/home?guest=홍길동&room=A1

💡 OUSCARAVAN 카카오톡 채널 친구 추가 시:
✓ 체크인/체크아웃 안내 메시지 수신
✓ 특별 혜택 및 프로모션 알림
✓ 빠른 고객 지원

카카오톡에서 "OUSCARAVAN" 검색 후 친구 추가해주세요!
```

---

## 📋 SMS 발송 서비스별 설정 가이드

### 카카오 알림톡 SMS

**API 엔드포인트:**
```
POST https://kapi.kakao.com/v1/api/talk/memo/send
```

**인증:**
- Access Token 사용
- 또는 API Key 사용

### 네이버 클라우드 플랫폼 SMS

**API 엔드포인트:**
```
POST https://sens.apigw.ntruss.com/sms/v2/services/{serviceId}/messages
```

**인증:**
- Access Key ID
- Secret Access Key

### AWS SNS

**API 엔드포인트:**
```
POST https://sns.ap-northeast-2.amazonaws.com/
```

**인증:**
- AWS Access Key ID
- AWS Secret Access Key

---

## 🎯 최종 추천

### 즉시 사용 가능한 솔루션: SMS 발송

**이유:**
1. 가입 조건 간단
2. 즉시 사용 가능
3. API 연동 간단
4. 모든 휴대폰에서 수신

**다음 단계:**
1. 카카오 알림톡 SMS 서비스 신청
2. API Key 발급
3. n8n 워크플로우 수정
4. 테스트 실행

### 향후 개선: 알림톡 전환

SMS로 시작하여, 나중에 비즈톡 알림톡 조건을 만족하면 전환:
1. SMS로 즉시 자동화 구축
2. 비즈톡 알림톡 조건 준비
3. 알림톡 전환 시 더 나은 UX 제공

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
