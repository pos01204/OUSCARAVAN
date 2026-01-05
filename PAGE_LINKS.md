# 페이지 링크 가이드

## 🔗 배포된 페이지 링크

### Vercel 배포 URL
**메인 도메인**: `https://ouscaravan.vercel.app`

---

## 👨‍💼 관리자 페이지

### 관리자 로그인
**URL**: `https://ouscaravan.vercel.app/login`

**접근 방법**:
1. 위 URL로 접속
2. 관리자 계정으로 로그인
3. 로그인 후 자동으로 관리자 대시보드로 이동

### 관리자 대시보드
**URL**: `https://ouscaravan.vercel.app/admin`

**기능**:
- 오늘 예약 수, 체크인/체크아웃 예정 수, 주문 수 통계
- 최근 예약 목록

### 예약 관리
**URL**: `https://ouscaravan.vercel.app/admin/reservations`

**기능**:
- 예약 목록 조회
- 예약 상세 보기 및 방 배정
- 전화번호 입력 및 알림톡 발송

**예약 상세 페이지**:
- URL: `https://ouscaravan.vercel.app/admin/reservations/[id]`
- 방 배정 및 전화번호 입력
- n8n Webhook 호출 (알림톡 발송)

### 방 관리
**URL**: `https://ouscaravan.vercel.app/admin/rooms`

**기능**:
- 방 목록 조회
- 방 추가/수정/삭제
- 방 상태 관리 (사용 가능, 사용 중, 점검 중)

### 주문 관리
**URL**: `https://ouscaravan.vercel.app/admin/orders`

**기능**:
- 주문 목록 조회
- 주문 상세 정보 확인
- 주문 상태 업데이트 (대기 → 준비 중 → 배송 중 → 완료)

---

## 👤 고객 페이지

### 고객 홈 페이지
**URL**: `https://ouscaravan.vercel.app/guest/[token]`

**접근 방법**:
1. 관리자 페이지에서 예약 상세 페이지로 이동
2. 방 배정 및 전화번호 입력 후 저장
3. 저장 시 n8n Webhook이 호출되어 알림톡 발송
4. 알림톡에 포함된 링크를 클릭하여 접근

**예시 URL**:
```
https://ouscaravan.vercel.app/guest/abc123def456...
```

**기능**:
- 환영 메시지
- WiFi 정보 (비밀번호 복사, QR 코드)
- 체크인/체크아웃 시간 표시
- 일몰 시간 위젯
- 체크인/체크아웃 버튼
- 주문 내역

### 고객 안내 페이지
**URL**: `https://ouscaravan.vercel.app/guest/[token]/guide`

**기능**:
- 이용 안내서
- 검색 및 카테고리 필터
- 바베큐 사용법 가이드

### 고객 주문 페이지
**URL**: `https://ouscaravan.vercel.app/guest/[token]/order`

**기능**:
- 디지털 쿠폰
- 메뉴 캐러셀
- 불멍/바베큐 주문 폼

### 고객 체크인/체크아웃 페이지
**URL**: `https://ouscaravan.vercel.app/guest/[token]/checkinout`

**기능**:
- 체크인 처리
- 체크아웃 체크리스트
- 상태 확인

### 고객 도움말 페이지
**URL**: `https://ouscaravan.vercel.app/guest/[token]/help`

**기능**:
- 자주 묻는 질문
- 응급 연락처
- 안전 정보

---

## ⚠️ 주의사항

### Railway 백엔드 미구현 상태
현재 Railway 백엔드 API가 구현되지 않아 실제 데이터 조회는 불가능합니다.

**영향을 받는 기능**:
- 관리자 페이지의 예약 목록 조회
- 관리자 페이지의 방 목록 조회
- 관리자 페이지의 주문 목록 조회
- 고객 페이지의 예약 정보 조회

**해결 방법**:
- Railway 백엔드 API 구현 후 정상 작동
- 현재는 UI 구조만 완성된 상태

---

## 🧪 테스트 방법

### 관리자 페이지 테스트
1. `https://ouscaravan.vercel.app/login` 접속
2. 관리자 계정으로 로그인 (Railway 백엔드 구현 후 가능)
3. 관리자 대시보드 확인
4. 예약 관리, 방 관리, 주문 관리 페이지 확인

### 고객 페이지 테스트
1. 관리자 페이지에서 예약 상세 페이지로 이동
2. 방 배정 및 전화번호 입력 후 저장
3. 알림톡 발송 (n8n Webhook 호출)
4. 알림톡의 링크를 클릭하여 고객 페이지 접근

**임시 테스트용 토큰**:
- Railway 백엔드 구현 전에는 테스트 토큰이 필요합니다.
- 예: `https://ouscaravan.vercel.app/guest/test-token-123`

---

## 📱 모바일 접근

모든 페이지는 모바일 반응형으로 구현되어 있습니다.

**모바일에서 접근**:
- 동일한 URL 사용
- 하단 네비게이션 (모바일 전용)
- 터치 최적화 UI

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
