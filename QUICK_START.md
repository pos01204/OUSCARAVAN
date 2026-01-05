# 빠른 시작 가이드

## 📋 시작하기 전에

이 가이드는 OUSCARAVAN 예약 관리 시스템을 빠르게 시작하기 위한 단계별 안내입니다.

---

## 🚀 1단계: 사전 세팅

### 필수 사전 작업

**모든 플랫폼에서 필요한 사전 세팅을 완료해야 합니다.**

1. **[PRE_SETUP_GUIDE.md](./PRE_SETUP_GUIDE.md) 참고**
   - Vercel 환경 변수 설정
   - Railway 프로젝트 생성 및 데이터베이스 설정
   - n8n 환경 변수 설정
   - SolAPI 계정 및 템플릿 설정

**예상 소요 시간**: 1-2시간

---

## 📝 2단계: 작업 추적

### 작업 관리

1. **[DETAILED_TASK_TRACKER.md](./DETAILED_TASK_TRACKER.md) 열기**
   - 각 작업의 체크박스를 확인하며 진행
   - 완료된 작업은 체크하여 진행 상황 추적

**권장 작업 순서**:
1. Phase 1: 기반 인프라 구축
2. Phase 2: 인증 시스템
3. Phase 3: 관리자 페이지
4. Phase 4: 고객 페이지
5. Phase 6: Railway 백엔드 연동
6. Phase 7: n8n 워크플로우 연동

---

## 🔧 3단계: 개발 환경 설정

### 로컬 개발 환경

```bash
# 1. 레포지토리 클론
git clone https://github.com/pos01204/OUSCARAVAN.git
cd OUSCARAVAN

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 열어 필요한 환경 변수 설정

# 4. 개발 서버 실행
npm run dev
```

### 환경 변수 예시 (`.env.local`)

```env
# Railway 백엔드 API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# 관리자 인증
NEXTAUTH_SECRET=your-local-secret-key
NEXTAUTH_URL=http://localhost:3000

# 웹 앱 URL
NEXT_PUBLIC_WEB_APP_URL=http://localhost:3000
```

---

## 📊 4단계: 진행 상황 확인

### 현재 진행률

**전체 진행률**: [DETAILED_TASK_TRACKER.md](./DETAILED_TASK_TRACKER.md)에서 확인

**주요 완료 항목**:
- ✅ 기반 구조 (middleware, API 함수, 인증)
- ✅ 관리자 로그인 페이지
- ✅ 관리자 레이아웃 및 대시보드
- ✅ 예약 목록 페이지

**다음 작업**:
- [ ] 예약 상세 페이지 (방 배정, 전화번호 입력)
- [ ] 고객 페이지 구조 생성
- [ ] Railway 백엔드 API 구현

---

## 🎯 5단계: 다음 작업 선택

### 우선순위별 작업

**높은 우선순위**:
1. 예약 상세 페이지 구현 (`app/admin/reservations/[id]/page.tsx`)
2. Railway 백엔드 API 구현
3. 고객 페이지 구조 생성

**중간 우선순위**:
4. 기존 기능 마이그레이션 (home, guide, market, help)
5. n8n 워크플로우 연동

**낮은 우선순위**:
6. UI/UX 개선
7. 성능 최적화
8. 문서화

---

## 📚 참고 문서

### 작업 관리
- [DETAILED_TASK_TRACKER.md](./DETAILED_TASK_TRACKER.md) - 상세 작업 트래커
- [MIGRATION_PLAN.md](./MIGRATION_PLAN.md) - 마이그레이션 계획
- [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) - 구현 현황

### 사전 세팅
- [PRE_SETUP_GUIDE.md](./PRE_SETUP_GUIDE.md) - 사전 세팅 가이드
- [REVISED_PROJECT_PLAN.md](./REVISED_PROJECT_PLAN.md) - 프로젝트 기획서

### 배포
- [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) - Vercel 배포 가이드
- [DEPLOYMENT_ARCHITECTURE.md](./DEPLOYMENT_ARCHITECTURE.md) - 배포 아키텍처

---

## 🆘 문제 해결

### 자주 발생하는 문제

1. **빌드 오류**
   - `npm run build` 실행하여 오류 확인
   - TypeScript 오류 확인
   - 의존성 문제 확인

2. **환경 변수 오류**
   - `.env.local` 파일 확인
   - Vercel 환경 변수 확인
   - Railway 환경 변수 확인

3. **API 연결 오류**
   - Railway API 서버 상태 확인
   - API URL 확인
   - 인증 토큰 확인

---

## ✅ 체크리스트

시작하기 전 확인사항:
- [ ] [PRE_SETUP_GUIDE.md](./PRE_SETUP_GUIDE.md)의 모든 사전 세팅 완료
- [ ] 로컬 개발 환경 설정 완료
- [ ] [DETAILED_TASK_TRACKER.md](./DETAILED_TASK_TRACKER.md) 열기
- [ ] 첫 번째 작업 선택 및 시작

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
