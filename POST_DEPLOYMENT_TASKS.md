# 배포 후 작업 가이드

## 🎯 우선순위별 작업 목록

### 🔴 높은 우선순위 (즉시 진행)

#### 1. 실제 이미지 추가
**위치**: `public/images/`

필요한 이미지:
- [ ] 메뉴 이미지 (3개)
  - `menu/ous-latte.jpg`
  - `menu/salt-bread.jpg`
  - `menu/ginseng-blended.jpg`
- [ ] BBQ 가이드 이미지 (6개)
  - `bbq/power-strip.jpg`
  - `bbq/gas-lever.jpg`
  - `bbq/ignition.jpg`
  - `bbq/flame-control.jpg`
  - `bbq/enjoy.jpg`
  - `bbq/turn-off.jpg`
- [ ] 세트 이미지 (5개)
  - `sets/bbq-small.jpg`
  - `sets/bbq-medium.jpg`
  - `sets/bbq-large.jpg`
  - `sets/fire-small.jpg`
  - `sets/fire-medium.jpg`

**이미지 최적화 팁:**
- WebP 포맷 사용 (JPG 폴백 제공)
- 적절한 크기로 리사이즈 (메뉴: 800x600, 가이드: 1200x800)
- 압축 도구 사용: [TinyPNG](https://tinypng.com/) 또는 [Squoosh](https://squoosh.app/)

#### 2. PWA 아이콘 생성
**위치**: `public/`

- [ ] `icon-192.png` (192x192px)
- [ ] `icon-512.png` (512x512px)

**생성 방법:**
1. 로고 이미지 준비 (최소 512x512px)
2. [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator) 사용
3. 또는 [RealFaviconGenerator](https://realfavicongenerator.net/) 사용

#### 3. 실제 데이터 업데이트
**파일**: `lib/constants.ts`

업데이트 항목:
- [ ] WiFi 비밀번호 (`WIFI_INFO.password`)
- [ ] 체크인/체크아웃 시간 (`CHECK_IN_OUT`)
- [ ] 일몰 시간 (`SUNSET_TIME`) - API 연동 또는 수동 업데이트
- [ ] 메뉴 정보 및 가격 (`MENU_ITEMS`)
- [ ] 카페 정보 (`CAFE_INFO`)
  - 운영 시간
  - 연락처
  - 주소
- [ ] 불멍/바베큐 세트 정보 (`BBQ_SETS`)
- [ ] FAQ 내용 (`FAQ_DATA`)
- [ ] 응급 연락처 (`EMERGENCY_CONTACTS`)

#### 4. 기본 동작 테스트
배포된 URL에서 테스트:

- [ ] 홈 페이지 로드
- [ ] 네비게이션 동작
- [ ] WiFi 비밀번호 복사
- [ ] QR 코드 표시
- [ ] 체크인/체크아웃
- [ ] 가이드 검색 및 필터
- [ ] BBQ 캐러셀
- [ ] 쿠폰 플립
- [ ] 주문 폼 제출
- [ ] 모바일 반응형
- [ ] 데스크톱 반응형

---

### 🟡 중간 우선순위 (1주일 내)

#### 5. SEO 최적화
**파일**: `app/layout.tsx`

```typescript
export const metadata: Metadata = {
  title: 'OUSCARAVAN - 스마트 컨시어지',
  description: 'OUSCARAVAN을 위한 프리미엄 컨시어지 서비스. WiFi, 가이드, 카페 쿠폰을 한 번에!',
  keywords: ['글램핑', '캠핑', '컨시어지', 'OUSCARAVAN', '속초'],
  authors: [{ name: 'OUSCARAVAN' }],
  openGraph: {
    title: 'OUSCARAVAN - 스마트 컨시어지',
    description: 'OUSCARAVAN을 위한 프리미엄 컨시어지 서비스',
    type: 'website',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OUSCARAVAN - 스마트 컨시어지',
    description: 'OUSCARAVAN을 위한 프리미엄 컨시어지 서비스',
  },
};
```

작업:
- [ ] 메타데이터 업데이트
- [ ] OG 이미지 생성 (`public/og-image.jpg`)
- [ ] 사이트맵 생성 (Next.js 자동 생성)
- [ ] robots.txt 확인

#### 6. 성능 최적화

**이미지 최적화**
- [ ] Next.js Image 컴포넌트로 교체
- [ ] 이미지 lazy loading 적용
- [ ] WebP 포맷 우선 사용

**코드 최적화**
- [ ] 큰 라이브러리 동적 import
- [ ] 불필요한 코드 제거
- [ ] 번들 크기 확인

**예시:**
```typescript
// app/guide/page.tsx
import dynamic from 'next/dynamic';

const BBQCarousel = dynamic(
  () => import('@/components/features/BBQCarousel'),
  { ssr: false }
);
```

#### 7. 에러 처리 개선

- [ ] 404 페이지 커스터마이징
- [ ] 에러 바운더리 추가
- [ ] 사용자 친화적 에러 메시지

**예시:**
```typescript
// app/not-found.tsx
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-4 text-muted-foreground">페이지를 찾을 수 없습니다.</p>
    </div>
  );
}
```

---

### 🟢 낮은 우선순위 (1개월 내)

#### 8. 분석 도구 추가

**Vercel Analytics** (무료)
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

작업:
- [ ] Vercel Analytics 설치
- [ ] Google Analytics 설정 (선택)
- [ ] 이벤트 추적 설정

#### 9. 다국어 지원 (선택사항)

- [ ] 영어 버전 추가
- [ ] 언어 전환 기능
- [ ] i18n 라이브러리 설정

#### 10. 고급 기능 추가

- [ ] 실시간 채팅 (게스트-관리자)
- [ ] 푸시 알림 (PWA)
- [ ] 오프라인 모드
- [ ] 다크 모드

---

## 🔗 n8n 연동 준비 (Phase 2)

### 1. n8n 워크플로우 설계

필요한 워크플로우:
- [ ] 체크인 웹훅 수신
- [ ] 체크아웃 웹훅 수신
- [ ] 주문 웹훅 수신
- [ ] 카카오톡 메시지 발송
- [ ] 데이터베이스 저장

### 2. API 엔드포인트 생성

**파일**: `app/api/n8n/route.ts` (향후 생성)

```typescript
// app/api/n8n/checkin/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const data = await request.json();
  
  // n8n 웹훅으로 전송
  const response = await fetch(
    process.env.N8N_WEBHOOK_URL!,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );
  
  return NextResponse.json({ success: true });
}
```

### 3. 환경 변수 설정

Vercel에서 설정:
- `NEXT_PUBLIC_N8N_WEBHOOK_URL`: n8n 웹훅 URL

### 4. 코드 활성화

`lib/store.ts`에서 주석 해제 및 수정:

```typescript
import { sendToN8N } from '@/lib/api';

// checkIn 함수
const handleCheckIn = async () => {
  checkIn();
  await sendToN8N('checkin', {
    guest: guestInfo.name,
    room: guestInfo.room,
    checkinTime: new Date().toISOString(),
  });
};
```

---

## 📋 정기 점검 체크리스트

### 주간 점검
- [ ] Vercel 로그 확인 (에러 없음)
- [ ] 주요 기능 동작 확인
- [ ] 사용자 피드백 확인

### 월간 점검
- [ ] 성능 지표 검토
- [ ] 사용자 통계 확인
- [ ] 보안 업데이트 확인

### 분기별 점검
- [ ] 의존성 업데이트
- [ ] 사용자 피드백 반영
- [ ] 기능 개선 계획 수립

---

## 🛠️ 유용한 도구 및 리소스

### 이미지 최적화
- [TinyPNG](https://tinypng.com/) - 이미지 압축
- [Squoosh](https://squoosh.app/) - 이미지 최적화
- [Next.js Image Optimization](https://nextjs.org/docs/app/api-reference/components/image)

### 아이콘 생성
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

### 테스트 도구
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - 성능 테스트
- [PageSpeed Insights](https://pagespeed.web.dev/) - 페이지 속도 분석

### 모니터링
- [Vercel Analytics](https://vercel.com/analytics)
- [Sentry](https://sentry.io/) - 에러 모니터링 (선택)

---

## 📞 지원 및 문의

문제가 발생하거나 도움이 필요한 경우:

1. **GitHub Issues**: [https://github.com/pos01204/OUSCARAVAN/issues](https://github.com/pos01204/OUSCARAVAN/issues)
2. **Vercel 문서**: [https://vercel.com/docs](https://vercel.com/docs)
3. **Next.js 문서**: [https://nextjs.org/docs](https://nextjs.org/docs)

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
