# 상세 작업 트래커

## 📋 개요

이 문서는 OUSCARAVAN 예약 관리 시스템 구현을 위한 모든 작업을 단계별로 추적합니다.
각 작업은 체크박스로 표시되며, 완료 시 체크하여 진행 상황을 명확히 파악할 수 있습니다.

---

## 🎯 Phase 1: 기반 인프라 구축

### 1.1 GitHub 레포지토리 설정
- [ ] 기존 레포지토리 확인 (`https://github.com/pos01204/OUSCARAVAN`)
- [ ] 브랜치 전략 수립 (main, develop)
- [ ] .gitignore 확인 및 업데이트
- [ ] README.md 업데이트

### 1.2 프로젝트 구조 생성
- [x] `middleware.ts` 생성 (인증 체크)
- [x] `lib/api.ts` 생성 (Railway API 호출 함수)
- [x] `lib/auth.ts` 생성 (인증 유틸리티)
- [x] `types/index.ts` 생성 (TypeScript 타입 정의)
- [ ] `lib/constants.ts` 업데이트 (필요시)

### 1.3 UI 컴포넌트 준비
- [x] `components/ui/badge.tsx` 생성
- [x] `components/ui/label.tsx` 생성
- [ ] 필요한 추가 UI 컴포넌트 확인
- [ ] 컴포넌트 테스트

---

## 🔐 Phase 2: 인증 시스템

### 2.1 관리자 인증
- [x] `app/(auth)/login/page.tsx` 생성
- [x] `middleware.ts` 구현 (관리자 페이지 접근 제어)
- [x] `lib/auth.ts` 구현 (로그인, 로그아웃 함수)
- [x] 임시 관리자 로그인 정보 설정 (id: ouscaravan, pw: 123456789a)
- [x] 로그인 페이지 UI/UX 개선 (에러 메시지 표시)
- [x] 에러 처리 및 사용자 피드백 (인증 실패 시 에러 메시지)
- [ ] 세션 관리 (토큰 만료 처리) - 향후 Railway API 연동 시 구현

### 2.2 고객 인증 (토큰 기반)
- [ ] `app/guest/[token]/layout.tsx` 생성
- [ ] 토큰 검증 로직 구현
- [ ] 유효하지 않은 토큰 처리 (404 페이지)
- [ ] 토큰 만료 처리

---

## 👨‍💼 Phase 3: 관리자 페이지

### 3.1 관리자 레이아웃
- [x] `app/admin/layout.tsx` 생성
- [x] 네비게이션 메뉴 구현
- [x] 로그아웃 기능 구현
- [ ] 반응형 디자인 확인
- [ ] 접근성 (A11y) 확인

### 3.2 관리자 대시보드
- [x] `app/admin/page.tsx` 생성
- [ ] 통계 데이터 조회 (Railway API 연동)
  - [ ] 오늘 예약 수
  - [ ] 체크인 예정 수
  - [ ] 체크아웃 예정 수
  - [ ] 처리 대기 주문 수
- [ ] 최근 예약 목록 표시
- [ ] 실시간 업데이트 (선택사항)

### 3.3 예약 관리
- [x] `app/admin/reservations/page.tsx` 생성 (예약 목록)
- [x] `app/admin/reservations/[id]/page.tsx` 생성 (예약 상세)
  - [x] 예약 정보 표시
  - [x] 방 배정 기능
    - [x] 방 목록 조회 (Railway API)
    - [x] 방 선택 드롭다운
    - [x] 방 배정 저장 (Railway API)
  - [x] 전화번호 입력 기능
    - [x] 전화번호 입력 필드
    - [x] 전화번호 형식 검증 (한국 전화번호 형식)
    - [x] 전화번호 저장 (Railway API)
  - [x] 고유 토큰 생성 (없는 경우 자동 생성)
  - [x] 예약 상태 업데이트
  - [x] n8n Webhook 호출
    - [x] Webhook URL 환경 변수 설정 (`NEXT_PUBLIC_N8N_WEBHOOK_URL`)
    - [x] Webhook 호출 함수 구현
    - [x] 에러 처리 (Webhook 실패해도 저장은 성공으로 처리)
  - [x] 저장 완료 후 피드백 (Toast 알림 및 예약 목록으로 이동)
- [ ] 예약 목록 필터링
  - [ ] 상태별 필터 (대기, 배정 완료, 체크인, 체크아웃, 취소)
  - [ ] 날짜별 필터
  - [ ] 검색 기능
- [ ] 예약 목록 정렬
- [ ] 페이지네이션 (필요시)

### 3.4 방 관리
- [x] `app/admin/rooms/page.tsx` 생성
- [x] 방 목록 조회 (Railway API)
- [x] 방 추가 기능
- [x] 방 수정 기능
- [x] 방 삭제 기능
- [x] 방 상태 관리 (사용 가능, 사용 중, 점검 중)

### 3.5 주문 관리
- [x] `app/admin/orders/page.tsx` 생성
- [x] 주문 목록 조회 (Railway API)
- [x] 주문 상태 업데이트
- [x] 주문 상세 정보 표시 (다이얼로그)
- [x] 주문 상태별 Badge 표시
- [x] 다음 단계로 진행 버튼
- [ ] 주문 필터링 (상태별, 날짜별) - 향후 구현

---

## 👤 Phase 4: 고객 페이지

### 4.1 고객 레이아웃
- [x] `app/guest/[token]/layout.tsx` 생성
- [x] 하단 네비게이션 (GuestBottomNav 컴포넌트)
- [x] 예약 정보 표시 (Header 아래)
- [x] 토큰 검증 및 404 처리
- [x] 반응형 디자인

### 4.2 고객 홈 페이지
- [x] `app/guest/[token]/page.tsx` 생성
- [x] `components/guest/GuestHomeContent.tsx` 생성
- [x] 기존 `app/home/page.tsx` 기능 마이그레이션
  - [x] 환영 메시지 (게스트 이름)
  - [x] WiFi 카드 (비밀번호 복사, QR 코드)
  - [x] 체크인/체크아웃 시간 표시
  - [x] 일몰 시간 위젯
  - [x] 자동 체크인/체크아웃
- [x] Railway API에서 예약 정보 조회
- [x] 예약 정보 표시 (방 번호, 체크인/체크아웃 날짜)
- [x] 주문 내역 표시 (기존 컴포넌트 재사용)
- [x] 체크아웃 알림 (기존 컴포넌트 재사용)

### 4.3 안내 페이지
- [x] `app/guest/[token]/guide/page.tsx` 생성
- [x] `components/guest/GuestGuideContent.tsx` 생성
- [x] 기존 `app/guide/page.tsx` 기능 마이그레이션
  - [x] 검색 기능
  - [x] 카테고리 필터
  - [x] 아코디언 스타일 가이드
  - [x] BBQ 단계별 캐러셀 가이드
- [x] 토큰 검증

### 4.4 주문 페이지
- [x] `app/guest/[token]/order/page.tsx` 생성
- [x] `components/guest/GuestOrderContent.tsx` 생성
- [x] 기존 `app/market/page.tsx` 기능 마이그레이션
  - [x] 디지털 쿠폰 (3D 플립 애니메이션)
  - [x] 메뉴 캐러셀
  - [x] 불멍/바베큐 주문 폼
- [x] 주문 제출 기능
  - [x] 주문 데이터 검증
  - [x] n8n Webhook 호출 (기존 OrderForm 사용)
  - [x] 주문 완료 피드백
- [x] 카페 정보 표시
- [x] 토큰 검증

### 4.5 체크인/체크아웃 페이지
- [x] `app/guest/[token]/checkinout/page.tsx` 생성
- [x] `components/guest/GuestCheckInOutContent.tsx` 생성
- [x] 체크인 기능
  - [x] 체크인 버튼
  - [x] Railway API로 체크인 상태 업데이트 (향후 구현)
  - [x] 체크인 완료 피드백
- [x] 체크아웃 기능
  - [x] 체크아웃 체크리스트 (가스 밸브 잠금, 쓰레기 정리)
  - [x] 체크아웃 버튼
  - [x] Railway API로 체크아웃 상태 업데이트 (향후 구현)
  - [x] 체크아웃 완료 피드백
- [x] 체크인/체크아웃 상태 표시
- [x] 예약 정보 표시

### 4.6 도움말 페이지
- [x] `app/guest/[token]/help/page.tsx` 생성
- [x] `components/guest/GuestHelpContent.tsx` 생성
- [x] 기존 `app/help/page.tsx` 기능 마이그레이션
  - [x] 응급 연락처
  - [x] 안전 정보
  - [x] FAQ
- [x] 토큰 검증

---

## 🔄 Phase 5: 기존 라우트 처리

### 5.1 기존 라우트 리다이렉트 또는 유지
- [x] `app/page.tsx` 업데이트 (루트 페이지 → 관리자 로그인 페이지로 리다이렉트)
- [x] `app/home/page.tsx` 처리 (관리자 로그인 페이지로 리다이렉트)
- [x] `app/guide/page.tsx` 처리 (관리자 로그인 페이지로 리다이렉트)
- [x] `app/market/page.tsx` 처리 (관리자 로그인 페이지로 리다이렉트)
- [x] `app/help/page.tsx` 처리 (관리자 로그인 페이지로 리다이렉트)

### 5.2 하위 호환성
- [x] 기존 라우트 리다이렉트 구현
- [x] 모든 기존 라우트를 관리자 로그인 페이지로 리다이렉트
- [ ] URL 파라미터로 접근 시 토큰 기반으로 변환 (향후 구현 - Railway API 연동 후)
- [ ] 기존 링크 동작 확인 (테스트 필요)
- [ ] 마이그레이션 안내 메시지 (선택사항)

---

## 🔌 Phase 6: Railway 백엔드 연동

### 6.1 API 엔드포인트 스펙 문서 작성
- [x] `RAILWAY_API_SPEC.md` 생성
- [x] 데이터베이스 스키마 정의
  - [x] reservations 테이블
  - [x] orders 테이블
  - [x] check_in_out_logs 테이블
  - [x] rooms 테이블
- [x] API 엔드포인트 스펙 정의
  - [x] 관리자 인증 API (`POST /api/auth/login`)
  - [x] 예약 관리 API (`GET`, `POST`, `PATCH`, `DELETE /api/admin/reservations`)
  - [x] 고객 정보 API (`GET /api/guest/:token`)
  - [x] 주문 API (`GET`, `POST /api/guest/:token/orders`, `GET`, `PATCH /api/admin/orders`)
  - [x] 체크인/체크아웃 API (`POST /api/guest/:token/checkin`, `POST /api/guest/:token/checkout`)
  - [x] 방 관리 API (`GET`, `POST`, `PATCH`, `DELETE /api/admin/rooms`)
  - [x] 통계 API (`GET /api/admin/stats`)
- [x] 보안 고려사항 문서화
- [x] 에러 응답 형식 정의

### 6.2 API 호출 함수 구현
- [x] `lib/api.ts` 기본 구조 생성
- [x] `adminApi` 함수 개선
  - [x] 타임아웃 처리 추가 (기본 10초)
  - [x] 에러 처리 개선 (상세한 에러 메시지)
  - [x] 네트워크 오류 처리
- [x] `guestApi` 함수 개선
  - [x] 타임아웃 처리 추가 (기본 10초)
  - [x] 에러 처리 개선 (상세한 에러 메시지)
  - [x] 네트워크 오류 처리
- [ ] `adminApi` 함수 테스트 (Railway API 연동 후)
- [ ] `guestApi` 함수 테스트 (Railway API 연동 후)
- [ ] 재시도 로직 (선택사항)

### 6.3 데이터 타입 정의
- [x] `types/index.ts` 생성
  - [x] Reservation 타입
  - [x] Order 타입
  - [x] OrderItem 타입
  - [x] Room 타입
  - [x] AdminStats 타입
  - [ ] API 응답 타입 (향후 추가)
  - [ ] 에러 타입 (향후 추가)

---

## 🤖 Phase 7: n8n 워크플로우 연동

### 7.1 예약 확정 이메일 처리 워크플로우
- [ ] Gmail Trigger 설정 확인
- [ ] 이메일 파싱 Code Node 확인
- [ ] IF Node (확정/취소 구분) 확인
- [ ] Railway API 호출 HTTP Request Node 확인
- [ ] 에러 처리 및 로깅

### 7.2 알림톡 발송 워크플로우
- [ ] Webhook Trigger 설정
- [ ] 고유 링크 생성 Code Node
- [ ] 전화번호 포맷팅 Code Node
- [ ] SolAPI AlimTalk 발송 Node
- [ ] 발송 결과 로깅
- [ ] 에러 처리

### 7.3 워크플로우 테스트
- [ ] 예약 확정 이메일 처리 테스트
- [ ] 알림톡 발송 테스트
- [ ] 전체 플로우 통합 테스트

---

## 🎨 Phase 8: UI/UX 개선

### 8.1 디자인 시스템
- [ ] 색상 테마 확인
- [ ] 타이포그래피 확인
- [ ] 간격 및 레이아웃 확인
- [ ] 아이콘 일관성 확인

### 8.2 반응형 디자인
- [ ] 모바일 레이아웃 확인
- [ ] 태블릿 레이아웃 확인
- [ ] 데스크톱 레이아웃 확인

### 8.3 접근성 (A11y)
- [ ] 키보드 네비게이션
- [ ] 스크린 리더 지원
- [ ] ARIA 레이블 확인
- [ ] 색상 대비 확인

### 8.4 성능 최적화
- [ ] 이미지 최적화
- [ ] 코드 스플리팅
- [ ] 로딩 상태 표시
- [ ] 에러 바운더리

---

## 🧪 Phase 9: 테스트

### 9.1 기능 테스트
- [ ] 관리자 로그인/로그아웃
- [ ] 예약 목록 조회
- [ ] 예약 상세 조회
- [ ] 방 배정
- [ ] 전화번호 입력
- [ ] 알림톡 발송 트리거
- [ ] 고객 페이지 접근 (토큰 기반)
- [ ] 고객 페이지 기능 (홈, 안내, 주문, 체크인/체크아웃, 도움말)
- [ ] 주문 제출
- [ ] 체크인/체크아웃

### 9.2 통합 테스트
- [ ] 전체 플로우 테스트 (예약 확정 → 관리자 배정 → 알림톡 발송 → 고객 페이지 접근)
- [ ] 에러 시나리오 테스트
- [ ] 엣지 케이스 테스트

### 9.3 사용자 테스트
- [ ] 관리자 사용성 테스트
- [ ] 고객 사용성 테스트
- [ ] 피드백 수집 및 개선

---

## 🚀 Phase 10: 배포

### 10.1 Vercel 배포
- [ ] 환경 변수 설정
- [ ] 빌드 테스트
- [ ] 프로덕션 배포
- [ ] 도메인 설정 (선택사항)
- [ ] 배포 후 기능 확인

### 10.2 Railway 배포
- [ ] 프로젝트 생성
- [ ] 데이터베이스 설정
- [ ] 환경 변수 설정
- [ ] API 서버 배포
- [ ] 배포 후 API 테스트

### 10.3 n8n 설정
- [ ] 환경 변수 확인
- [ ] 워크플로우 활성화
- [ ] 워크플로우 테스트

---

## 📚 Phase 11: 문서화

### 11.1 사용자 문서
- [ ] 관리자 사용 가이드
- [ ] 고객 사용 가이드 (선택사항)

### 11.2 기술 문서
- [ ] API 문서
- [ ] 배포 가이드
- [ ] 트러블슈팅 가이드

### 11.3 프로젝트 문서
- [ ] README.md 업데이트
- [ ] CHANGELOG.md 생성
- [ ] 라이선스 정보

---

## 🔧 Phase 12: 유지보수 및 개선

### 12.1 모니터링
- [ ] 에러 로깅 설정
- [ ] 성능 모니터링
- [ ] 사용자 행동 분석 (선택사항)

### 12.2 백업
- [ ] 데이터베이스 백업 설정
- [ ] 백업 복구 테스트

### 12.3 보안
- [ ] 보안 취약점 점검
- [ ] API 인증 강화
- [ ] 데이터 암호화 확인

---

## 📊 진행률 추적

**전체 진행률**: 0% (완료된 작업 / 전체 작업)

**Phase별 진행률**:
- Phase 1: 기반 인프라 구축 - 80% (8/10)
- Phase 2: 인증 시스템 - 75% (3/4)
- Phase 3: 관리자 페이지 - 60% (6/10)
- Phase 4: 고객 페이지 - 100% (6/6)
- Phase 5: 기존 라우트 처리 - 75% (1.5/2)
- Phase 6: Railway 백엔드 연동 - 40% (4/10)
- Phase 7: n8n 워크플로우 연동 - 0% (0/3)
- Phase 8: UI/UX 개선 - 0% (0/4)
- Phase 9: 테스트 - 0% (0/3)
- Phase 10: 배포 - 0% (0/3)
- Phase 11: 문서화 - 0% (0/3)
- Phase 12: 유지보수 및 개선 - 0% (0/3)

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15  
**다음 리뷰**: 매주 금요일
