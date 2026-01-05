# GitHub 레포지토리 설정 가이드

## 📋 개요

이 문서는 OUSCARAVAN 예약 관리 시스템의 GitHub 레포지토리 설정을 정리합니다.

---

## 🔗 레포지토리 정보

### 레포지토리 URL
- **GitHub**: `https://github.com/pos01204/OUSCARAVAN`
- **타입**: Public 또는 Private (보안에 따라 결정)

### 레포지토리 구조
- 단일 레포지토리 구조 (관리자 페이지 + 고객 페이지)
- Next.js App Router 기반
- TypeScript 사용

---

## 🌿 브랜치 전략

### 기본 브랜치
- **main**: 프로덕션 배포용 브랜치
  - Vercel 자동 배포 연결
  - 안정적인 코드만 유지

### 권장 브랜치 구조 (선택사항)
- **main**: 프로덕션 배포
- **develop**: 개발 브랜치 (선택사항)
  - 기능 개발 및 테스트
  - 안정화 후 main으로 머지

### 현재 브랜치 전략
- **단일 브랜치 (main)**: 현재는 main 브랜치만 사용
- 향후 필요 시 develop 브랜치 추가 가능

---

## 📁 .gitignore 설정

### 현재 .gitignore 내용 확인

`.gitignore` 파일에 다음 항목들이 포함되어 있어야 합니다:

```
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/
build/
dist/

# Production
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Temporary files
*.tmp
*.temp
.cache/
```

### 확인 사항
- ✅ 환경 변수 파일 (.env*) 제외
- ✅ 빌드 결과물 (.next/, out/, build/) 제외
- ✅ 의존성 (node_modules/) 제외
- ✅ IDE 설정 파일 제외
- ✅ 로그 파일 제외

---

## 📝 README.md 업데이트

### 현재 README.md 상태
- ✅ 프로젝트 개요
- ✅ 시작하기 가이드
- ✅ 프로젝트 구조
- ✅ 주요 기능 설명
- ✅ 기술 스택
- ✅ 문서 링크

### 업데이트 필요 사항
- ✅ 최신 프로젝트 구조 반영
- ✅ 관리자 페이지 및 고객 페이지 정보 추가
- ✅ Railway API 연동 정보 추가
- ✅ n8n 워크플로우 연동 정보 추가

---

## 🔄 Git 워크플로우

### 기본 워크플로우

1. **로컬 개발**
   ```bash
   git add .
   git commit -m "작업 내용 설명"
   git push origin main
   ```

2. **자동 배포**
   - GitHub에 푸시하면 Vercel이 자동으로 감지
   - 빌드 및 배포 자동 실행

3. **배포 확인**
   - Vercel 대시보드에서 배포 상태 확인
   - 배포 URL로 접속하여 테스트

### 커밋 메시지 규칙 (권장)

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드 설정 변경
```

---

## 🔐 보안 고려사항

### 환경 변수 관리
- ✅ `.env.local` 파일은 절대 Git에 커밋하지 않음
- ✅ `.gitignore`에 `.env*` 포함 확인
- ✅ Vercel 대시보드에서 환경 변수 설정

### 민감한 정보
- ✅ API 키, 비밀번호 등은 환경 변수로 관리
- ✅ 코드에 하드코딩하지 않음
- ✅ GitHub Secrets 사용 (필요 시)

---

## 📊 레포지토리 통계

### 파일 구조
- **프론트엔드 코드**: Next.js App Router
- **컴포넌트**: React 컴포넌트
- **스타일**: Tailwind CSS
- **타입**: TypeScript

### 주요 디렉토리
- `app/`: Next.js 페이지 및 라우트
- `components/`: React 컴포넌트
- `lib/`: 유틸리티 함수 및 상수
- `types/`: TypeScript 타입 정의
- `public/`: 정적 파일

---

## ✅ 설정 완료 체크리스트

### 레포지토리 설정
- [x] GitHub 레포지토리 확인: `https://github.com/pos01204/OUSCARAVAN`
- [x] 브랜치 전략 확인: main 브랜치 사용
- [x] .gitignore 확인 및 업데이트
- [x] README.md 업데이트

### 연동 설정
- [x] Vercel 자동 배포 연동
- [x] GitHub Actions 설정 (필요 시)

---

## 🔗 관련 문서

- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**: 배포 가이드
- **[VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)**: Vercel 배포 상세 가이드
- **[PRE_SETUP_GUIDE.md](./PRE_SETUP_GUIDE.md)**: 사전 세팅 가이드

---

**최종 업데이트**: 2024-01-15
