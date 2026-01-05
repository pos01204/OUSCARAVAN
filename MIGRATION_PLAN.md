# 프로젝트 마이그레이션 계획

## 📋 현재 상태

### 기존 구조
```
app/
├── home/          # URL 파라미터로 게스트 정보 전달
├── guide/
├── market/
└── help/
```

### 목표 구조
```
app/
├── admin/         # 관리자 페이지 (신규)
│   ├── reservations/
│   ├── rooms/
│   └── orders/
├── guest/         # 고객 페이지 (기존 기능 마이그레이션)
│   └── [token]/
│       ├── page.tsx      # 기존 home 기능
│       ├── guide/        # 기존 guide 기능
│       ├── order/        # 기존 market 기능
│       ├── checkinout/   # 기존 home의 체크인/체크아웃
│       └── help/         # 기존 help 기능
└── (auth)/
    └── login/     # 관리자 로그인
```

---

## 🔄 마이그레이션 전략

### Phase 1: 기존 기능 유지하면서 새 구조 추가

1. **기존 페이지는 유지** (하위 호환성)
2. **새 구조 병행 개발**
3. **점진적 마이그레이션**

### Phase 2: 점진적 전환

1. `/guest/[token]` 구조 완성
2. 기존 기능을 새 구조로 이동
3. 기존 라우트는 리다이렉트로 처리

### Phase 3: 관리자 페이지 추가

1. `/admin` 구조 생성
2. 인증 시스템 구축
3. Railway API 연동

---

## 📝 상세 작업 계획

### 1단계: 미들웨어 및 인증 구조 추가

**파일:**
- `middleware.ts` (신규)
- `lib/auth.ts` (신규)
- `lib/api.ts` (신규)

**작업:**
- Next.js 미들웨어로 `/admin/*` 인증 체크
- Railway API 호출 함수 준비
- 인증 유틸리티 함수

### 2단계: 관리자 페이지 구조 생성

**파일:**
- `app/(auth)/login/page.tsx` (신규)
- `app/admin/layout.tsx` (신규)
- `app/admin/page.tsx` (신규)
- `app/admin/reservations/page.tsx` (신규)
- `app/admin/reservations/[id]/page.tsx` (신규)

**작업:**
- 관리자 로그인 페이지
- 관리자 레이아웃 (인증 체크)
- 예약 목록 페이지
- 예약 상세 페이지 (방 배정, 전화번호 입력)

### 3단계: 고객 페이지 구조 생성

**파일:**
- `app/guest/[token]/layout.tsx` (신규)
- `app/guest/[token]/page.tsx` (기존 home 마이그레이션)
- `app/guest/[token]/guide/page.tsx` (기존 guide 마이그레이션)
- `app/guest/[token]/order/page.tsx` (기존 market 마이그레이션)
- `app/guest/[token]/checkinout/page.tsx` (기존 home의 체크인/체크아웃)
- `app/guest/[token]/help/page.tsx` (기존 help 마이그레이션)

**작업:**
- 토큰 기반 라우팅
- Railway API에서 예약 정보 조회
- 기존 컴포넌트 재사용

### 4단계: 기존 라우트 처리

**파일:**
- `app/page.tsx` (수정)
- `app/home/page.tsx` (리다이렉트 또는 유지)
- `app/guide/page.tsx` (리다이렉트 또는 유지)
- `app/market/page.tsx` (리다이렉트 또는 유지)
- `app/help/page.tsx` (리다이렉트 또는 유지)

**작업:**
- 기존 URL 접근 시 안내 메시지 또는 리다이렉트
- 하위 호환성 유지

### 5단계: 컴포넌트 재구성

**파일:**
- `components/admin/` (신규)
- `components/guest/` (기존 features 마이그레이션)

**작업:**
- 관리자 전용 컴포넌트
- 고객 전용 컴포넌트 분리

---

## 🔧 기술적 고려사항

### 1. URL 파라미터 → 토큰 기반 전환

**기존:**
```
/home?guest=John&room=A1&checkin=2024-01-15&checkout=2024-01-17
```

**신규:**
```
/guest/abc123def456...
```

**전환 방법:**
- Railway API에서 토큰으로 예약 정보 조회
- 토큰이 없으면 404 또는 안내 페이지

### 2. 상태 관리

**기존:**
- Zustand 스토어 (`lib/store.ts`)
- URL 파라미터에서 게스트 정보 읽기

**신규:**
- Railway API에서 예약 정보 조회
- React Query 사용 (서버 상태 관리)

### 3. 하위 호환성

**옵션 1: 리다이렉트**
- 기존 URL 접근 시 새 구조로 리다이렉트
- 토큰이 없으면 안내 메시지

**옵션 2: 유지**
- 기존 라우트 유지
- 새 구조와 병행 운영

---

## 📦 의존성 추가

### 필요한 패키지

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.0.0"  // 서버 상태 관리
  }
}
```

---

## 🚀 배포 전략

### 1. 개발 환경 테스트
- 로컬에서 새 구조 테스트
- Railway API 연동 테스트

### 2. 스테이징 배포
- Vercel Preview 배포
- 전체 플로우 테스트

### 3. 프로덕션 배포
- 점진적 롤아웃
- 모니터링 및 에러 체크

---

## ✅ 체크리스트

### Phase 1: 기반 구조
- [ ] 미들웨어 추가
- [ ] Railway API 호출 함수
- [ ] 인증 유틸리티

### Phase 2: 관리자 페이지
- [ ] 로그인 페이지
- [ ] 관리자 레이아웃
- [ ] 예약 목록
- [ ] 예약 상세 (방 배정, 전화번호 입력)

### Phase 3: 고객 페이지
- [ ] 토큰 기반 라우팅
- [ ] 홈 페이지 (기존 home 마이그레이션)
- [ ] 안내 페이지 (기존 guide 마이그레이션)
- [ ] 주문 페이지 (기존 market 마이그레이션)
- [ ] 체크인/체크아웃 페이지
- [ ] 도움말 페이지 (기존 help 마이그레이션)

### Phase 4: 마이그레이션 완료
- [ ] 기존 라우트 처리
- [ ] 컴포넌트 재구성
- [ ] 테스트 완료
- [ ] 문서 업데이트

---

**문서 버전**: 1.0  
**작성일**: 2024-01-15
