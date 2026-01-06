# 변경 이력 (Changelog)

이 문서는 OUSCARAVAN 예약 관리 시스템의 주요 변경 사항을 기록합니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 따릅니다.

---

## [0.1.3] - 2024-01-15

### 수정됨 (Fixed)
- `tsconfig.json` - `railway-backend` 디렉토리를 빌드에서 제외
- `next.config.js` - webpack 설정 추가
- Railway 백엔드 빌드 오류 해결

### 추가됨 (Added)
- `RAILWAY_ENV_SETUP.md` - Railway 환경 변수 설정 가이드

---

## [0.1.2] - 2024-01-15

### 추가됨 (Added)
- Railway 백엔드 프로젝트 구조 생성
  - `railway-backend/` 디렉토리 및 기본 파일 구조
  - Express 앱 기본 구조
  - 데이터베이스 연결 설정
  - JWT 인증 시스템 기본 구조
  - 라우트 구조 (임시 구현)
- 데이터베이스 마이그레이션 스크립트
  - `railway-backend/migrations/001_initial_schema.sql`
- Railway 백엔드 구현 가이드
  - `RAILWAY_BACKEND_SETUP.md` 문서 생성

### 변경됨 (Changed)
- `DETAILED_TASK_TRACKER.md` - Railway 백엔드 구현 섹션 추가

---

## [0.1.1] - 2024-01-15

### 수정됨 (Fixed)
- `app/admin/reservations/ReservationFiltersClient.tsx` - `sanitizeInput` import 누락 수정
- `app/admin/orders/OrderFiltersClient.tsx` - `sanitizeInput` import 누락 수정
- `app/admin/rooms/page.tsx` - `formData.description` 필드 제거 (Room 타입에 없는 필드)

### 변경됨 (Changed)
- 빌드 오류 수정 완료 (`BUILD_FIXES.md` 업데이트)

---

## [0.1.0] - 2024-01-15

### 추가됨 (Added)

#### Phase 1: 기반 인프라 구축
- `middleware.ts` - 관리자 페이지 인증 체크 미들웨어
- `lib/api.ts` - Railway API 호출 함수 (타임아웃, 에러 처리 포함)
- `lib/auth.ts` - 인증 유틸리티 (로그인, 로그아웃)
- `types/index.ts` - TypeScript 타입 정의 통합
- `lib/constants.ts` - 상수 정의 (API 설정, n8n 설정 포함)
- UI 컴포넌트: Badge, Label, Select, Skeleton

#### Phase 2: 인증 시스템
- `app/(auth)/login/page.tsx` - 관리자 로그인 페이지
- 임시 관리자 로그인 정보 설정 (id: ouscaravan, pw: 123456789a)
- 에러 처리 및 사용자 피드백

#### Phase 3: 관리자 페이지
- `app/admin/layout.tsx` - 관리자 레이아웃 (반응형 네비게이션)
- `app/admin/page.tsx` - 관리자 대시보드 (통계, 최근 예약)
- `app/admin/reservations/page.tsx` - 예약 목록 (필터링 기능)
- `app/admin/reservations/[id]/page.tsx` - 예약 상세 (방 배정, 전화번호 입력)
- `app/admin/rooms/page.tsx` - 방 관리 (추가/수정/삭제)
- `app/admin/orders/page.tsx` - 주문 관리 (상태 업데이트, 필터링)
- `components/admin/AdminMobileNav.tsx` - 모바일 햄버거 메뉴

#### Phase 4: 고객 페이지
- `app/guest/[token]/layout.tsx` - 고객 레이아웃 (토큰 검증)
- `app/guest/[token]/page.tsx` - 고객 홈 페이지
- `app/guest/[token]/guide/page.tsx` - 안내 페이지
- `app/guest/[token]/order/page.tsx` - 주문 페이지
- `app/guest/[token]/checkinout/page.tsx` - 체크인/체크아웃 페이지
- `app/guest/[token]/help/page.tsx` - 도움말 페이지
- `components/guest/GuestHomeContent.tsx` - 고객 홈 콘텐츠
- `components/guest/GuestGuideContent.tsx` - 안내 콘텐츠
- `components/guest/GuestOrderContent.tsx` - 주문 콘텐츠
- `components/guest/GuestCheckInOutContent.tsx` - 체크인/체크아웃 콘텐츠
- `components/guest/GuestHelpContent.tsx` - 도움말 콘텐츠
- `components/guest/GuestBottomNav.tsx` - 하단 네비게이션

#### Phase 5: 기존 라우트 처리
- 기존 라우트 리다이렉트 (`/home`, `/guide`, `/market`, `/help` → `/login`)

#### Phase 6: Railway 백엔드 연동
- `RAILWAY_API_SPEC.md` - Railway 백엔드 API 스펙 문서
- API 호출 함수 개선 (타임아웃, 에러 처리)

#### Phase 8: UI/UX 개선
- 반응형 디자인 구현 (모바일, 태블릿, 데스크톱)
- 접근성 개선 (ARIA 레이블, 시맨틱 HTML)
- 이미지 최적화 (next/image 사용)
- `DESIGN_SYSTEM_AUDIT.md` - 디자인 시스템 감사 보고서
- `RESPONSIVE_ACCESSIBILITY_AUDIT.md` - 반응형 디자인 및 접근성 감사 보고서

#### Phase 11: 문서화
- `ADMIN_USER_GUIDE.md` - 관리자 사용 가이드
- `TROUBLESHOOTING_GUIDE.md` - 트러블슈팅 가이드
- `UI_COMPONENTS_INVENTORY.md` - UI 컴포넌트 인벤토리
- `GITHUB_REPOSITORY_SETUP.md` - GitHub 레포지토리 설정 가이드
- `CHANGELOG.md` - 변경 이력 (이 문서)

#### API 라우트
- `app/api/n8n/checkin/route.ts` - 체크인 n8n 웹훅 프록시
- `app/api/n8n/checkout/route.ts` - 체크아웃 n8n 웹훅 프록시
- `app/api/n8n/order/route.ts` - 주문 n8n 웹훅 프록시

### 변경됨 (Changed)

#### 보안 개선
- Next.js 버전 업그레이드: `14.2.5` → `14.2.35` (보안 취약점 수정)

#### 코드 개선
- `lib/api.ts` - constants 사용하도록 리팩토링
- `lib/constants.ts` - API 설정 및 n8n 설정 상수 추가
- `app/error.tsx` - 홈 링크 수정 (`/home` → `/login`)
- `app/not-found.tsx` - 홈 링크 수정 (`/home` → `/login`)
- `components/guest/GuestGuideContent.tsx` - 이미지 최적화 (img → next/image)

#### 문서 개선
- `README.md` - 프로젝트 개요 및 구조 업데이트
- `.gitignore` - 환경 변수 파일 제외 개선

### 수정됨 (Fixed)

#### 빌드 오류 수정
- TypeScript 타입 오류 수정 (reservation null 체크)
- React Hook 경고 수정 (useEffect 의존성)
- BBQCarousel prop 오류 수정 (onClose 추가)
- CAFE_INFO.hours 렌더링 오류 수정
- Checkbox 컴포넌트 import 오류 수정
- 중복 코드 제거 (app/admin/reservations/page.tsx)

#### 순환 의존성 해결
- API 라우트에서 lib/api.ts 순환 의존성 제거
- n8n 웹훅 호출을 직접 처리하도록 수정

---

## 향후 계획

### [0.2.0] - 예정
- Railway 백엔드 API 구현
- n8n 워크플로우 완전 연동
- 세션 관리 (토큰 만료 처리)
- 실시간 주문 상태 업데이트

### [0.3.0] - 예정
- 다국어 지원
- 고객 사용 가이드
- 성능 모니터링
- 에러 로깅 설정

---

**형식 참고**:
- `Added`: 새로운 기능 추가
- `Changed`: 기존 기능 변경
- `Deprecated`: 곧 제거될 기능
- `Removed`: 제거된 기능
- `Fixed`: 버그 수정
- `Security`: 보안 관련 수정

---

**최종 업데이트**: 2024-01-15
