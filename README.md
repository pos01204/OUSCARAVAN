# OUSCARAVAN 예약 관리 시스템

OUSCARAVAN을 위한 예약 관리 및 고객 서비스 웹 애플리케이션입니다.

## 📋 프로젝트 개요

이 프로젝트는 OUSCARAVAN의 예약 관리와 고객 서비스를 위한 통합 웹 애플리케이션입니다.

### 주요 기능
- **관리자 페이지**: 예약 관리, 방 관리, 주문 관리
- **고객 페이지**: 예약 정보 확인, 주문, 체크인/체크아웃, 안내
- **자동화**: n8n 워크플로우를 통한 알림톡 발송 및 예약 처리

## 🚀 시작하기

### 필수 요구사항

- Node.js 18+ 
- npm 또는 yarn

### 설치

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 📁 프로젝트 구조

```
ouscaravan/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 그룹
│   │   └── login/         # 관리자 로그인
│   ├── admin/             # 관리자 페이지
│   │   ├── page.tsx       # 대시보드
│   │   ├── reservations/  # 예약 관리
│   │   ├── rooms/         # 방 관리
│   │   └── orders/        # 주문 관리
│   ├── guest/             # 고객 페이지
│   │   └── [token]/       # 토큰 기반 고객 페이지
│   │       ├── page.tsx   # 홈
│   │       ├── guide/     # 안내
│   │       ├── order/     # 주문
│   │       ├── checkinout/# 체크인/체크아웃
│   │       └── help/      # 도움말
│   └── api/               # API 라우트
│       └── n8n/           # n8n 웹훅 프록시
├── components/
│   ├── ui/                # Shadcn UI 컴포넌트
│   ├── admin/             # 관리자 컴포넌트
│   ├── guest/             # 고객 컴포넌트
│   └── shared/            # 공통 컴포넌트
├── lib/
│   ├── api.ts             # Railway API 호출 함수
│   ├── auth.ts            # 인증 유틸리티
│   ├── constants.ts       # 정적 데이터
│   └── utils.ts           # 유틸리티 함수
├── types/
│   └── index.ts           # TypeScript 타입 정의
└── public/                # 정적 파일
```

## 🎨 주요 기능

### 관리자 페이지
- **대시보드**: 통계 데이터 및 최근 예약 목록
- **예약 관리**: 예약 목록, 상세 정보, 방 배정, 전화번호 입력
- **방 관리**: 방 추가/수정/삭제, 상태 관리
- **주문 관리**: 주문 목록, 상태 업데이트, 상세 정보

### 고객 페이지
- **홈**: 환영 메시지, WiFi 정보, 체크인/체크아웃 시간, 일몰 시간
- **안내**: 검색 및 카테고리 필터, 가이드, BBQ 단계별 가이드
- **주문**: 디지털 쿠폰, 메뉴 캐러셀, 불멍/바베큐 주문
- **체크인/체크아웃**: 체크인/체크아웃 기능, 체크리스트
- **도움말**: 응급 연락처, 안전 정보, FAQ

## 🔧 기술 스택

### 프론트엔드
- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Shadcn UI** (UI 컴포넌트)
- **Lucide React** (아이콘)

### 백엔드 연동
- **Railway** (백엔드 API 서버)
- **PostgreSQL** (데이터베이스)

### 자동화
- **n8n** (워크플로우 자동화)
- **SolAPI** (알림톡 발송)

### 배포
- **Vercel** (프론트엔드 배포)
- **Railway** (백엔드 배포)

## 📱 사용 방법

### 관리자 페이지

1. **로그인**: `/login`에서 관리자 로그인
   - 임시 계정: `id: ouscaravan`, `pw: 123456789a`
2. **대시보드**: 통계 및 최근 예약 확인
3. **예약 관리**: 예약 목록 조회, 방 배정, 전화번호 입력
4. **방 관리**: 방 추가/수정/삭제
5. **주문 관리**: 주문 목록 조회, 상태 업데이트

### 고객 페이지

1. **접근**: 알림톡 링크를 통해 `/guest/[token]` 접근
2. **홈**: 예약 정보 확인, WiFi 정보, 체크인/체크아웃 시간
3. **안내**: 가이드 정보 확인
4. **주문**: 메뉴 주문
5. **체크인/체크아웃**: 체크인/체크아웃 처리

### 데이터 수정

모든 정적 데이터는 `lib/constants.ts` 파일에서 수정할 수 있습니다.

## 🚧 향후 개발

- [x] 관리자 페이지 구현
- [x] 고객 페이지 구현
- [x] Railway API 연동 (스펙 문서 작성 완료)
- [x] n8n 웹훅 연동 (기본 구조 완료)
- [ ] Railway 백엔드 API 구현
- [ ] n8n 워크플로우 완전 연동
- [ ] 실시간 주문 상태 업데이트
- [ ] 다국어 지원

## 📚 문서

### 🎯 작업 관리
- **[DETAILED_TASK_TRACKER.md](./DETAILED_TASK_TRACKER.md)**: 상세 작업 트래커 (체크리스트 형식)
- **[MIGRATION_PLAN.md](./MIGRATION_PLAN.md)**: 프로젝트 마이그레이션 계획
- **[IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)**: 구현 현황

### ⚙️ 사전 세팅
- **[PRE_SETUP_GUIDE.md](./PRE_SETUP_GUIDE.md)**: Vercel, Railway, n8n 사전 세팅 가이드
- **[REVISED_PROJECT_PLAN.md](./REVISED_PROJECT_PLAN.md)**: 개정된 프로젝트 기획서
- **[DEPLOYMENT_ARCHITECTURE.md](./DEPLOYMENT_ARCHITECTURE.md)**: 배포 아키텍처 가이드
- **[VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)**: Vercel 배포 상세 가이드
- **[PROJECT_STRUCTURE_DETAILED.md](./PROJECT_STRUCTURE_DETAILED.md)**: 프로젝트 구조 상세 가이드

### 🤖 자동화 가이드
- **[N8N_AUTOMATION_GUIDE.md](./N8N_AUTOMATION_GUIDE.md)**: n8n 자동화 설정 가이드
- **[EMAIL_TO_KAKAO_WORKFLOW.md](./EMAIL_TO_KAKAO_WORKFLOW.md)**: 이메일 트래킹 → 카카오톡 발송 워크플로우
- **[N8N_WORKFLOW_TEST_GUIDE.md](./N8N_WORKFLOW_TEST_GUIDE.md)**: n8n 워크플로우 테스트 가이드
- **[QUICK_START_N8N.md](./QUICK_START_N8N.md)**: n8n 빠른 시작 가이드

### 📦 배포 가이드
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**: 배포 가이드
- **[POST_DEPLOYMENT_TASKS.md](./POST_DEPLOYMENT_TASKS.md)**: 배포 후 작업 가이드

## 📄 라이선스

이 프로젝트는 OUSCARAVAN 전용입니다.
