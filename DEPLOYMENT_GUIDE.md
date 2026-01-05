# OUSCARAVAN 배포 가이드

## 📦 GitHub 레포지토리에 푸시하기

### 1. Git 초기화 (아직 초기화하지 않은 경우)

```bash
# Git 초기화
git init

# 원격 레포지토리 추가
git remote add origin https://github.com/pos01204/OUSCARAVAN.git
```

### 2. 파일 추가 및 커밋

```bash
# 모든 파일 추가
git add .

# 커밋
git commit -m "Initial commit: OUSCARAVAN Smart Concierge Web App"

# 메인 브랜치로 푸시
git branch -M main
git push -u origin main
```

### 3. 인증 문제 해결

만약 인증 오류가 발생하면:

**옵션 1: Personal Access Token 사용**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token" 클릭
3. `repo` 권한 선택
4. 토큰 생성 후 복사
5. 비밀번호 대신 토큰 사용

**옵션 2: GitHub CLI 사용**
```bash
gh auth login
git push -u origin main
```

---

## 🚀 Vercel 배포

### 1. Vercel 계정 연결

1. [Vercel](https://vercel.com)에 접속
2. "Sign Up" 또는 "Log In"
3. GitHub 계정으로 로그인

### 2. 프로젝트 Import

1. Vercel 대시보드에서 "Add New..." → "Project" 클릭
2. GitHub 레포지토리 목록에서 `pos01204/OUSCARAVAN` 선택
3. "Import" 클릭

### 3. 빌드 설정

Vercel이 자동으로 Next.js 프로젝트를 감지하므로 기본 설정을 사용하면 됩니다:

- **Framework Preset**: Next.js
- **Root Directory**: `./` (기본값)
- **Build Command**: `npm run build` (자동 감지)
- **Output Directory**: `.next` (자동 감지)
- **Install Command**: `npm install` (자동 감지)

### 4. 환경 변수 설정 (향후 필요 시)

현재는 환경 변수가 필요하지 않지만, 향후 n8n 웹훅 연동 시 필요합니다:

1. 프로젝트 설정 → "Environment Variables"
2. 다음 변수 추가:
   - `NEXT_PUBLIC_N8N_WEBHOOK_URL`: n8n 웹훅 URL

### 5. 배포 실행

1. "Deploy" 버튼 클릭
2. 빌드 완료 대기 (약 2-3분)
3. 배포 완료 후 제공되는 URL 확인

### 6. 커스텀 도메인 설정 (선택사항)

1. 프로젝트 설정 → "Domains"
2. 원하는 도메인 추가 (예: `ouscaravan.com`)
3. DNS 설정 안내에 따라 레코드 추가

---

## ✅ 배포 후 확인 사항

### 1. 기본 동작 확인

배포된 URL에서 다음을 확인하세요:

- [ ] 홈 페이지 로드 확인
- [ ] 네비게이션 동작 확인
- [ ] 모바일/데스크톱 반응형 확인
- [ ] URL 파라미터 테스트: `?guest=Test&room=A1`

### 2. 기능 테스트

각 탭의 주요 기능을 테스트하세요:

**HOME 탭**
- [ ] WiFi 비밀번호 복사
- [ ] QR 코드 표시
- [ ] 체크인/체크아웃 버튼

**GUIDE 탭**
- [ ] 검색 기능
- [ ] 카테고리 필터
- [ ] BBQ 캐러셀 모달

**MARKET 탭**
- [ ] 쿠폰 플립 애니메이션
- [ ] 메뉴 캐러셀 스와이프
- [ ] 주문 폼 제출

**HELP 탭**
- [ ] 응급 연락처 버튼
- [ ] FAQ 아코디언

---

## 🔧 배포 후 작업

### 1. 이미지 추가

현재 이미지는 플레이스홀더로 표시됩니다. 실제 이미지를 추가하세요:

```bash
# public/images/ 디렉토리 구조
public/
  images/
    menu/
      ous-latte.jpg
      salt-bread.jpg
      ginseng-blended.jpg
    guide/
      heating.jpg
      hot-water.jpg
      projector.jpg
    bbq/
      power-strip.jpg
      gas-lever.jpg
      ignition.jpg
      flame-control.jpg
      enjoy.jpg
      turn-off.jpg
    sets/
      bbq-small.jpg
      bbq-medium.jpg
      bbq-large.jpg
      fire-small.jpg
      fire-medium.jpg
```

**이미지 최적화 권장사항:**
- 포맷: WebP (JPG 폴백)
- 메뉴 이미지: 800x600px
- BBQ 가이드: 1200x800px
- 세트 이미지: 1000x1000px

### 2. PWA 아이콘 추가

PWA 설치를 위해 아이콘을 추가하세요:

```bash
# public/ 디렉토리에 추가
public/
  icon-192.png  # 192x192px
  icon-512.png  # 512x512px
```

**아이콘 생성 도구:**
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

### 3. 실제 데이터 업데이트

`lib/constants.ts` 파일에서 실제 데이터로 업데이트:

- WiFi 비밀번호
- 체크인/체크아웃 시간
- 일몰 시간 (API 연동 또는 수동 업데이트)
- 메뉴 정보 및 가격
- 카페 운영 시간 및 연락처
- FAQ 내용

### 4. n8n 웹훅 연동 (Phase 2)

#### 4.1 n8n 워크플로우 설정

1. n8n에서 웹훅 노드 생성
2. 웹훅 URL 복사
3. Vercel 환경 변수에 추가

#### 4.2 코드 활성화

`lib/store.ts` 파일에서 주석 처리된 웹훅 호출 코드를 활성화:

```typescript
// lib/api.ts 파일 생성
export const sendToN8N = async (endpoint: string, data: any) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL}/${endpoint}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );
  return response.json();
};

// lib/store.ts에서 사용
import { sendToN8N } from '@/lib/api';

// checkIn 함수 내부
sendToN8N('checkin', {
  guest: guestInfo.name,
  room: guestInfo.room,
  checkinTime: new Date().toISOString(),
});
```

### 5. 성능 최적화

#### 5.1 이미지 최적화

Next.js Image 컴포넌트를 사용하여 이미지 최적화:

```typescript
import Image from 'next/image';

<Image
  src="/images/menu/ous-latte.jpg"
  alt="OUS Latte"
  width={800}
  height={600}
  priority
/>
```

#### 5.2 코드 스플리팅

큰 라이브러리는 동적 import 사용:

```typescript
const BBQCarousel = dynamic(() => import('@/components/features/BBQCarousel'), {
  ssr: false,
});
```

### 6. 분석 도구 추가 (선택사항)

#### Google Analytics

```bash
npm install @next/third-parties
```

```typescript
// app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      </body>
    </html>
  );
}
```

#### Vercel Analytics

```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 7. SEO 최적화

`app/layout.tsx`에서 메타데이터 업데이트:

```typescript
export const metadata: Metadata = {
  title: 'OUSCARAVAN - 스마트 컨시어지',
  description: 'OUSCARAVAN을 위한 프리미엄 컨시어지 서비스',
  keywords: ['글램핑', '캠핑', '컨시어지', 'OUSCARAVAN'],
  openGraph: {
    title: 'OUSCARAVAN - 스마트 컨시어지',
    description: 'OUSCARAVAN을 위한 프리미엄 컨시어지 서비스',
    images: ['/og-image.jpg'],
  },
};
```

### 8. 에러 모니터링 (선택사항)

#### Sentry 설정

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## 🔄 지속적인 업데이트

### Git 워크플로우

1. **로컬에서 수정**
   ```bash
   git checkout -b feature/update-menu
   # 파일 수정
   git add .
   git commit -m "Update menu items"
   git push origin feature/update-menu
   ```

2. **GitHub에서 Pull Request 생성**
   - GitHub 레포지토리에서 "Compare & pull request" 클릭
   - 리뷰 후 머지

3. **자동 배포**
   - Vercel이 자동으로 새 커밋을 감지
   - Preview 배포 생성
   - 머지 후 Production 배포

### 데이터 업데이트 프로세스

비개발자도 쉽게 업데이트할 수 있도록:

1. **constants.ts 파일 수정**
   - GitHub 웹 인터페이스에서 직접 수정 가능
   - 또는 로컬에서 수정 후 커밋

2. **이미지 교체**
   - `public/images/` 폴더에 새 이미지 업로드
   - 같은 파일명으로 교체하면 자동 반영

---

## 📊 모니터링 및 유지보수

### Vercel 대시보드 확인

- **Analytics**: 방문자 수, 페이지뷰, 성능 지표
- **Logs**: 에러 로그 및 디버깅 정보
- **Deployments**: 배포 이력 및 롤백

### 정기 점검 사항

- [ ] 주간: 에러 로그 확인
- [ ] 월간: 성능 지표 검토
- [ ] 분기: 사용자 피드백 반영
- [ ] 연간: 보안 업데이트 및 의존성 업그레이드

---

## 🆘 문제 해결

### 배포 실패 시

1. **빌드 로그 확인**
   - Vercel 대시보드 → Deployments → 실패한 배포 클릭
   - 빌드 로그에서 에러 확인

2. **일반적인 문제**
   - 의존성 오류: `package.json` 확인
   - 타입 오류: `tsconfig.json` 확인
   - 환경 변수 누락: Vercel 설정 확인

### 로컬과 배포 환경 차이

- 환경 변수 확인
- Node.js 버전 확인 (Vercel은 자동 감지)
- 빌드 명령어 확인

---

## 📝 체크리스트

배포 전:
- [ ] 모든 기능 테스트 완료
- [ ] 이미지 최적화 완료
- [ ] 실제 데이터로 업데이트
- [ ] PWA 아이콘 추가
- [ ] SEO 메타데이터 설정

배포 후:
- [ ] 모든 페이지 동작 확인
- [ ] 모바일/데스크톱 반응형 확인
- [ ] URL 파라미터 테스트
- [ ] 에러 로그 모니터링
- [ ] 성능 지표 확인

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
