# 사전 세팅 가이드

## 📋 개요

이 문서는 OUSCARAVAN 예약 관리 시스템을 구축하기 전에 필요한 사전 세팅 작업을 안내합니다.
Vercel, Railway, n8n 등 각 플랫폼에서 필요한 설정을 단계별로 설명합니다.

---

## 🚀 Vercel 사전 세팅

### 1. Vercel 계정 생성 및 프로젝트 확인

#### 1.1 Vercel 계정 확인
- [ ] [Vercel](https://vercel.com/) 접속 및 로그인
- [ ] 기존 프로젝트 확인: `https://vercel.com/pos01204s-projects/ouscaravan`

#### 1.2 GitHub 연동 확인
- [ ] GitHub 레포지토리 연동 확인: `https://github.com/pos01204/OUSCARAVAN`
- [ ] 자동 배포 설정 확인
- [ ] 브랜치 설정 확인 (main 브랜치 자동 배포)

### 2. 환경 변수 설정

**Vercel 대시보드 → Project Settings → Environment Variables**

#### 2.1 필수 환경 변수

```env
# Railway 백엔드 API URL
NEXT_PUBLIC_API_URL=https://ouscaravan-api.railway.app

# 관리자 인증
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://ouscaravan.vercel.app

# 웹 앱 URL
NEXT_PUBLIC_WEB_APP_URL=https://ouscaravan.vercel.app
```

**설정 체크리스트:**
- [ ] `NEXT_PUBLIC_API_URL` 설정 (Railway API URL)
- [ ] `NEXTAUTH_SECRET` 생성 및 설정
  - 생성 방법: `openssl rand -base64 32` 또는 온라인 생성기 사용
- [ ] `NEXTAUTH_URL` 설정 (Vercel 배포 URL)
- [ ] `NEXT_PUBLIC_WEB_APP_URL` 설정 (Vercel 배포 URL)

#### 2.2 선택적 환경 변수

```env
# n8n Webhook URL (관리자 페이지에서 알림톡 발송 트리거용)
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/reservation-assigned

# Railway API 키 (필요시)
RAILWAY_API_KEY=your-railway-api-key
```

**설정 체크리스트:**
- [ ] `NEXT_PUBLIC_N8N_WEBHOOK_URL` 설정 (n8n Webhook URL)
- [ ] `RAILWAY_API_KEY` 설정 (필요시)

#### 2.3 환경별 설정

**Production (프로덕션):**
- [ ] 모든 환경 변수 Production에 설정

**Preview (프리뷰):**
- [ ] Preview 환경에도 동일한 환경 변수 설정 (또는 테스트용 값)

**Development (로컬):**
- [ ] `.env.local` 파일 생성
- [ ] 로컬 개발용 환경 변수 설정

### 3. 빌드 설정 확인

**Vercel 대시보드 → Project Settings → General**

- [ ] Framework Preset: Next.js
- [ ] Root Directory: `./` (기본값)
- [ ] Build Command: `npm run build` (자동 감지)
- [ ] Output Directory: `.next` (자동 감지)
- [ ] Install Command: `npm install` (자동 감지)

### 4. 도메인 설정 (선택사항)

- [ ] 커스텀 도메인 추가 (예: `ouscaravan.com`)
- [ ] DNS 설정 확인
- [ ] SSL 인증서 자동 발급 확인

---

## 🚂 Railway 사전 세팅

### 1. Railway 계정 생성 및 프로젝트 생성

#### 1.1 Railway 계정 생성
- [ ] [Railway](https://railway.app/) 접속 및 로그인
- [ ] GitHub 연동 (선택사항, 권장)

#### 1.2 프로젝트 생성
- [ ] 새 프로젝트 생성: `ouscaravan-backend`
- [ ] 프로젝트 설명 추가

### 2. 데이터베이스 설정

#### 2.1 PostgreSQL 데이터베이스 생성
- [ ] Railway 대시보드에서 "New" → "Database" → "Add PostgreSQL" 클릭
- [ ] 데이터베이스 이름 설정: `ouscaravan-db`
- [ ] 데이터베이스 생성 완료 확인

#### 2.2 데이터베이스 연결 정보 확인
- [ ] `DATABASE_URL` 환경 변수 자동 생성 확인
- [ ] 연결 정보 복사 및 안전하게 보관

**연결 정보 예시:**
```
postgresql://postgres:password@host.railway.app:5432/railway
```

### 3. API 서버 설정

#### 3.1 서비스 생성
- [ ] Railway 대시보드에서 "New" → "GitHub Repo" 클릭
- [ ] 백엔드 레포지토리 선택 (또는 새로 생성)
- [ ] 서비스 이름 설정: `ouscaravan-api`

#### 3.2 빌드 설정
- [ ] Root Directory 설정 (필요시)
- [ ] Build Command 설정: `npm run build` (또는 `npm install`)
- [ ] Start Command 설정: `npm start` (또는 `node server.js`)

### 4. 환경 변수 설정

**Railway 대시보드 → Service → Variables**

#### 4.1 필수 환경 변수

```env
# 데이터베이스 연결 (자동 생성됨)
DATABASE_URL=postgresql://postgres:password@host.railway.app:5432/railway

# Node.js 환경
NODE_ENV=production
PORT=3000

# 관리자 API 키
ADMIN_API_KEY=your-admin-api-key-here

# n8n Webhook URL
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/reservation-assigned
```

**설정 체크리스트:**
- [ ] `DATABASE_URL` 확인 (자동 생성됨)
- [ ] `NODE_ENV` 설정: `production`
- [ ] `PORT` 설정: `3000` (또는 Railway가 자동 할당)
- [ ] `ADMIN_API_KEY` 생성 및 설정
  - 생성 방법: `openssl rand -base64 32` 또는 온라인 생성기 사용
- [ ] `N8N_WEBHOOK_URL` 설정 (n8n Webhook URL)

#### 4.2 선택적 환경 변수

```env
# CORS 설정
CORS_ORIGIN=https://ouscaravan.vercel.app

# 로깅
LOG_LEVEL=info

# 세션 설정
SESSION_SECRET=your-session-secret-here
```

**설정 체크리스트:**
- [ ] `CORS_ORIGIN` 설정 (Vercel 배포 URL)
- [ ] `LOG_LEVEL` 설정 (선택사항)
- [ ] `SESSION_SECRET` 설정 (선택사항)

### 5. 데이터베이스 스키마 생성

#### 5.1 마이그레이션 스크립트 준비
- [ ] 데이터베이스 스키마 SQL 파일 준비
- [ ] 마이그레이션 스크립트 작성

#### 5.2 스키마 적용
- [ ] Railway PostgreSQL에 직접 연결하여 스키마 적용
- [ ] 또는 마이그레이션 스크립트 실행

**필요한 테이블:**
- [ ] `reservations` 테이블
- [ ] `orders` 테이블
- [ ] `rooms` 테이블
- [ ] `check_in_out_logs` 테이블

### 6. API 서버 배포 확인

- [ ] API 서버 배포 완료 확인
- [ ] API 엔드포인트 접근 테스트
- [ ] Health check 엔드포인트 확인

---

## 🤖 n8n 사전 세팅

### 1. n8n 계정 확인

#### 1.1 n8n Cloud 계정 확인
- [ ] [n8n Cloud](https://n8n.io/cloud/) 접속 및 로그인
- [ ] 기존 워크플로우 확인: `https://ourcaravan.app.n8n.cloud/workflow/0nMXGSoqk6EBmHTc`

### 2. 환경 변수 설정

**n8n 대시보드 → Settings → Environment Variables**

#### 2.1 필수 환경 변수

```env
# Railway 백엔드 API
RAILWAY_API_URL=https://ouscaravan-api.railway.app
RAILWAY_API_KEY=your-railway-api-key

# SolAPI (알림톡 발송)
SOLAPI_API_KEY=your-solapi-api-key
SOLAPI_API_SECRET=your-solapi-api-secret
SOLAPI_ALIMTALK_TEMPLATE_ID=your-template-id

# 웹 앱 URL
WEB_APP_URL=https://ouscaravan.vercel.app
```

**설정 체크리스트:**
- [ ] `RAILWAY_API_URL` 설정 (Railway API URL)
- [ ] `RAILWAY_API_KEY` 설정 (Railway API 키)
- [ ] `SOLAPI_API_KEY` 설정 (SolAPI API 키)
- [ ] `SOLAPI_API_SECRET` 설정 (SolAPI API 시크릿)
- [ ] `SOLAPI_ALIMTALK_TEMPLATE_ID` 설정 (SolAPI 알림톡 템플릿 ID)
- [ ] `WEB_APP_URL` 설정 (Vercel 배포 URL)

### 3. Gmail Trigger 설정 확인

#### 3.1 Gmail 연결 확인
- [ ] Gmail 계정 연결 확인: `caiius960122@gmail.com`
- [ ] Gmail API 권한 확인
- [ ] Gmail Trigger 활성화 확인

#### 3.2 Gmail Trigger 필터 설정
- [ ] 필터 조건 확인:
  - From: `naverbooking_noreply@navercorp.com`
  - Subject: `확정` 또는 `취소` 포함
- [ ] 트리거 동작 확인

### 4. 워크플로우 1: 예약 확정 이메일 처리

#### 4.1 워크플로우 구조 확인
- [ ] Gmail Trigger 노드 확인
- [ ] IF 노드 확인 (확정/취소 구분)
- [ ] Code 노드 확인 (이메일 파싱)
- [ ] HTTP Request 노드 확인 (Railway API 호출)

#### 4.2 HTTP Request 노드 설정
- [ ] Method: `POST`
- [ ] URL: `{{ $env.RAILWAY_API_URL }}/api/admin/reservations`
- [ ] Headers:
  ```
  Authorization: Bearer {{ $env.RAILWAY_API_KEY }}
  Content-Type: application/json
  ```
- [ ] Body: 예약 정보 JSON

### 5. 워크플로우 2: 알림톡 발송

#### 5.1 Webhook Trigger 설정
- [ ] Webhook URL 생성
- [ ] Webhook URL 복사 및 안전하게 보관
- [ ] Webhook URL을 Vercel 환경 변수에 추가: `NEXT_PUBLIC_N8N_WEBHOOK_URL`

#### 5.2 워크플로우 구조 확인
- [ ] Webhook Trigger 노드 확인
- [ ] Code 노드 확인 (고유 링크 생성)
- [ ] Code 노드 확인 (전화번호 포맷팅)
- [ ] SolAPI 노드 확인 (알림톡 발송)

#### 5.3 SolAPI 노드 설정
- [ ] SolAPI 연결 확인
- [ ] 알림톡 템플릿 ID 확인
- [ ] 템플릿 변수 설정 확인
- [ ] 발송 결과 로깅 확인

### 6. 워크플로우 테스트

#### 6.1 예약 확정 이메일 처리 테스트
- [ ] 테스트 이메일 발송
- [ ] Gmail Trigger 동작 확인
- [ ] 이메일 파싱 결과 확인
- [ ] Railway API 호출 확인
- [ ] 데이터베이스 저장 확인

#### 6.2 알림톡 발송 테스트
- [ ] Webhook 수동 호출 테스트
- [ ] 고유 링크 생성 확인
- [ ] 전화번호 포맷팅 확인
- [ ] SolAPI 알림톡 발송 확인
- [ ] 실제 알림톡 수신 확인

---

## 📦 SolAPI 사전 세팅

### 1. SolAPI 계정 생성

- [ ] [SolAPI](https://solapi.com/) 접속 및 회원가입
- [ ] 계정 인증 완료

### 2. 알림톡 템플릿 등록

#### 2.1 템플릿 작성
- [ ] 알림톡 템플릿 작성
- [ ] 템플릿 내용:
  ```
  안녕하세요, {{guestName}}님!
  
  오우스카라반 예약이 확정되었습니다.
  
  예약 정보:
  - 체크인: {{checkin}}
  - 체크아웃: {{checkout}}
  - 배정된 방: {{assignedRoom}}
  
  예약 정보 확인하기 버튼
  ```

#### 2.2 템플릿 승인
- [ ] 템플릿 제출
- [ ] 카카오 비즈니스 채널 승인 대기
- [ ] 템플릿 승인 완료 확인

#### 2.3 템플릿 ID 확인
- [ ] 승인된 템플릿 ID 복사
- [ ] n8n 환경 변수에 추가: `SOLAPI_ALIMTALK_TEMPLATE_ID`

### 3. API 키 발급

- [ ] SolAPI 대시보드 → API 키 관리
- [ ] API 키 생성
- [ ] API 키 복사 및 안전하게 보관
- [ ] n8n 환경 변수에 추가:
  - `SOLAPI_API_KEY`
  - `SOLAPI_API_SECRET`

---

## ✅ 사전 세팅 체크리스트

### Vercel
- [ ] Vercel 계정 확인
- [ ] GitHub 레포지토리 연동 확인
- [ ] 환경 변수 설정 완료
- [ ] 빌드 설정 확인
- [ ] 도메인 설정 (선택사항)

### Railway
- [ ] Railway 계정 생성
- [ ] 프로젝트 생성
- [ ] PostgreSQL 데이터베이스 생성
- [ ] API 서버 서비스 생성
- [ ] 환경 변수 설정 완료
- [ ] 데이터베이스 스키마 생성
- [ ] API 서버 배포 확인

### n8n
- [ ] n8n Cloud 계정 확인
- [ ] 환경 변수 설정 완료
- [ ] Gmail Trigger 설정 확인
- [ ] 워크플로우 1 (예약 확정 이메일 처리) 설정 확인
- [ ] 워크플로우 2 (알림톡 발송) 설정 확인
- [ ] 워크플로우 테스트 완료

### SolAPI
- [ ] SolAPI 계정 생성
- [ ] 알림톡 템플릿 등록 및 승인
- [ ] API 키 발급
- [ ] n8n 환경 변수 설정

---

## 🔗 연동 정보 요약

### 환경 변수 매핑

| 플랫폼 | 변수명 | 값 | 용도 |
|--------|--------|-----|------|
| Vercel | `NEXT_PUBLIC_API_URL` | `https://ouscaravan-api.railway.app` | Railway API 호출 |
| Vercel | `NEXT_PUBLIC_N8N_WEBHOOK_URL` | `https://your-n8n-instance.com/webhook/...` | n8n Webhook 호출 |
| Railway | `DATABASE_URL` | `postgresql://...` | 데이터베이스 연결 |
| Railway | `ADMIN_API_KEY` | `...` | 관리자 API 인증 |
| Railway | `N8N_WEBHOOK_URL` | `https://your-n8n-instance.com/webhook/...` | n8n Webhook URL |
| n8n | `RAILWAY_API_URL` | `https://ouscaravan-api.railway.app` | Railway API 호출 |
| n8n | `RAILWAY_API_KEY` | `...` | Railway API 인증 |
| n8n | `SOLAPI_API_KEY` | `...` | SolAPI 인증 |
| n8n | `SOLAPI_API_SECRET` | `...` | SolAPI 인증 |
| n8n | `SOLAPI_ALIMTALK_TEMPLATE_ID` | `...` | 알림톡 템플릿 ID |
| n8n | `WEB_APP_URL` | `https://ouscaravan.vercel.app` | 웹 앱 URL |

---

## 🆘 문제 해결

### Vercel 배포 실패
- 빌드 로그 확인
- 환경 변수 확인
- 의존성 문제 확인

### Railway 연결 실패
- 데이터베이스 연결 정보 확인
- 환경 변수 확인
- API 서버 로그 확인

### n8n 워크플로우 오류
- 각 노드의 실행 결과 확인
- 환경 변수 확인
- API 호출 응답 확인

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15  
**다음 리뷰**: 설정 변경 시
