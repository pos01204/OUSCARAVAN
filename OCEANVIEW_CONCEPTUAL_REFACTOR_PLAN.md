# OUSCARAVAN 오션뷰 카라반 컨셉 리팩토링 제안서
## 고객 페이지 전용 · 최종 기획

> **작성일**: 2026-01-24  
> **적용 범위**: **고객(Guest) 페이지만** — 관리자 페이지는 적용하지 않음  
> **목표**: 기존 프레임/레이아웃 유지 + "오션뷰 카라반" 감성 강화  
> **원칙**: 그라데이션 최소, 뉴트럴 서피스 + 오션 블루 포인트

---

## 1. 적용 범위 정의

### 1.1 적용 대상 (고객 페이지)

| 경로 | 설명 | 주요 컴포넌트 |
|------|------|---------------|
| `/guest/[token]` | 고객 홈 | `GuestHomeContent` |
| `/guest/[token]/order` | 주문 페이지 | `GuestOrderContent` |
| `/guest/[token]/guide` | 안내 페이지 | `GuestGuideContent` |
| `/guest/[token]/help` | 도움말 | `GuestHelpContent` |
| `/guest/[token]/checkinout` | 체크인/아웃 | `GuestCheckInOutContent` |
| `/guest/[token]/cafe` | 카페 정보 | `GuestCafeContent` |

### 1.2 적용 제외 (관리자 페이지)

| 경로 | 이유 |
|------|------|
| `/admin/*` | 관리자는 기능 중심 UI 유지 |
| `/kiosk/*` | 키오스크는 별도 디자인 시스템 |

### 1.3 공유 컴포넌트 처리

| 컴포넌트 | 처리 방식 |
|----------|-----------|
| `Card`, `Badge` | 기존 유지 (variant로 분기) |
| `CardIconBadge` | tone 값만 변경 (컴포넌트 수정 없음) |
| `GuestMotionCard` | 고객 전용, 그대로 사용 |
| `GuestPageHeader` | 고객 전용, 색상만 변경 |

---

## 2. 컨셉 정의

### 2.1 디자인 키워드

| 키워드 | 정의 | UI 적용 |
|--------|------|---------|
| **Wave Line** | 잔잔한 파도 | 타이틀 하단 짧은 오션 블루 라인 |
| **Sea Mist** | 부드러운 해무 | 뉴트럴 인셋 박스 (`background-muted`) |
| **Ocean Point** | 바다색 포인트 | 아이콘 타일 + 강조 텍스트에만 블루 |

### 2.2 핵심 원칙

```
✓ 바탕은 조용하게 → 뉴트럴 서피스, 대면적 색상 금지
✓ 포인트는 작고 또렷하게 → 라인/아이콘에만 오션 블루
✓ 움직임은 잔잔하게 → 미세 lift/scale만 적용
✓ 기존 레이아웃 100% 유지 → 색상/라인만 변경
```

---

## 3. 디자인 토큰 활용

### 3.1 사용할 기존 토큰 (추가 없음)

```css
/* 배경 */
--background: #F7F7F7;           /* 페이지 */
--background-elevated: #FFFFFF;  /* 카드 */
--background-muted: #F0F0F0;     /* 인셋 (Sea Mist) */

/* 오션 포인트 */
--status-info: #2563EB;          /* 오션 블루 */
```

### 3.2 컬러 사용 규칙

| 영역 | 사용 | 금지 |
|------|------|------|
| 타이틀 라인 | `bg-status-info/40` | 두꺼운 라인, 그라데이션 |
| 아이콘 타일 | `bg-muted/60` + `text-status-info` | 컬러 배경 타일 |
| 강조 텍스트 | `text-status-info` (숫자/배지) | 본문에 블루 사용 |
| 인셋 박스 | `bg-background-muted` | 컬러 배경 |

---

## 4. 컴포넌트별 변경 사항

### 4.1 GuestHomeContent.tsx — Hero Section

**현재:**
```tsx
<h1 className="font-heading text-2xl font-bold text-brand-dark">
  {WELCOME_MESSAGE.korean.replace('{name}', reservation.guestName)}
</h1>
```

**변경:**
```tsx
<h1 className="font-heading text-2xl font-bold text-brand-dark relative z-10">
  {WELCOME_MESSAGE.korean.replace('{name}', reservation.guestName)}
</h1>
{/* Wave Line 추가 */}
<div className="mx-auto mt-3 h-1 w-12 rounded-full bg-status-info/40 relative z-10" aria-hidden="true" />
<p className="mt-3 text-sm text-muted-foreground relative z-10">
  바다가 보이는 특별한 휴식
</p>
```

**변경점:** Wave Line 추가 + 서브카피

---

### 4.2 GuestPageHeader.tsx — 모든 고객 페이지 타이틀

**현재:**
```tsx
<div className="mt-2 h-1 w-8 rounded-full bg-brand-cream-dark/50" aria-hidden="true" />
```

**변경:**
```tsx
<div className="mt-2 h-1 w-10 rounded-full bg-status-info/40" aria-hidden="true" />
```

**변경점:** 색상 `brand-cream-dark/50` → `status-info/40`, 너비 `w-8` → `w-10`

---

### 4.3 QuickActionGrid.tsx — 빠른 실행 버튼

**현재:**
```tsx
const items = [
  { tone: 'success', ... },  // 체크인
  { tone: 'info', ... },     // WiFi
  { tone: 'warning', ... },  // 주문
  { tone: 'brand', ... },    // 도움말
];
```

**변경:**
```tsx
const items = [
  { tone: 'info', ... },  // 체크인 → 오션 블루
  { tone: 'info', ... },  // WiFi (유지)
  { tone: 'info', ... },  // 주문 → 오션 블루
  { tone: 'info', ... },  // 도움말 → 오션 블루
];
```

**변경점:** 모든 아이콘 tone을 `info`로 통일

---

### 4.4 WifiCard.tsx — WiFi 카드

**현재:**
```tsx
<CardHeader className="pb-3">
  <CardTitle className="flex items-center gap-2 text-brand-dark">
    <CardIconBadge icon={Wifi} tone="info" />
    WiFi 연결하기
  </CardTitle>
</CardHeader>
```

**변경:**
```tsx
<CardHeader className="pb-2">
  <CardTitle className="flex items-center gap-2 text-brand-dark">
    <CardIconBadge icon={Wifi} tone="info" />
    WiFi 연결
  </CardTitle>
  {/* Wave Line 추가 */}
  <div className="mt-1.5 h-0.5 w-6 rounded-full bg-status-info/30" />
</CardHeader>
```

**추가 변경 (비밀번호 강조):**
```tsx
// 현재
<p className="text-base font-mono font-semibold text-brand-dark">{WIFI_INFO.password}</p>

// 변경
<p className="text-base font-mono font-semibold text-status-info">{WIFI_INFO.password}</p>
```

---

### 4.5 TimeCard.tsx — 이용 시간 카드

**현재:**
```tsx
<CardIconBadge icon={Clock} tone="brand" />
<CardIconBadge icon={LogIn} tone="success" size="sm" />
<CardIconBadge icon={LogOut} tone="info" size="sm" />
```

**변경:**
```tsx
<CardIconBadge icon={Clock} tone="info" />   // brand → info
<CardIconBadge icon={LogIn} tone="info" />   // success → info
<CardIconBadge icon={LogOut} tone="info" />  // 유지
```

**추가 (타이틀 Wave Line):**
```tsx
<CardTitle className="flex items-center gap-2 text-brand-dark">
  <CardIconBadge icon={Clock} tone="info" />
  이용 시간 안내
</CardTitle>
<div className="mt-1.5 h-0.5 w-6 rounded-full bg-status-info/30" />
```

---

### 4.6 GuestHelpContent.tsx — 도움말

**현재 아이콘 tone:**
```tsx
<CardIconBadge icon={HelpCircle} tone="info" />    // 유지
<CardIconBadge icon={AlertTriangle} tone="warning" />  // 유지 (경고는 warning)
```

**변경 없음** — 이미 적절함. 경고는 `warning` 유지가 적합.

---

### 4.7 GuestGuideContent.tsx — 안내서

**변경 없음** — 기존 구조 유지. `GuestPageHeader`의 Wave Line 색상 변경으로 자동 적용.

---

### 4.8 GuestAnnouncements.tsx — 공지

**현재 배지:**
```tsx
<Badge className="bg-background-muted text-status-info border-border">안내</Badge>
```

**변경 (border 색상 추가):**
```tsx
<Badge className="bg-background-muted text-status-info border-status-info/30">안내</Badge>
```

---

### 4.9 FloorPlanCard.tsx — 약도 카드

**현재:**
```tsx
<CardIconBadge icon={Map} tone="brand" />
```

**변경:**
```tsx
<CardIconBadge icon={Map} tone="info" />
```

---

## 5. globals.css 추가

```css
/* ═══════════════════════════════════════════════════
   오션뷰 유틸리티 (고객 페이지 전용)
   ═══════════════════════════════════════════════════ */

/* Wave Line - 타이틀 하단 라인 */
.wave-line {
  @apply mt-2 h-1 w-10 rounded-full bg-status-info/40;
}

.wave-line-sm {
  @apply mt-1.5 h-0.5 w-6 rounded-full bg-status-info/30;
}

/* Sea Mist - 인셋 박스 */
.sea-mist-box {
  @apply rounded-xl bg-background-muted border border-border p-4;
}

/* Ocean Point - 텍스트 포인트 */
.ocean-point {
  @apply text-status-info;
}
```

---

## 6. 구현 체크리스트

### P0: 핵심 (가장 체감 큼)

| # | 작업 | 파일 | 상태 |
|---|------|------|------|
| 1 | Hero Wave Line + 서브카피 | `GuestHomeContent.tsx` | ☐ |
| 2 | PageHeader Wave Line 색상 | `GuestPageHeader.tsx` | ☐ |
| 3 | QuickAction tone 통일 | `QuickActionGrid.tsx` | ☐ |
| 4 | globals.css 유틸리티 추가 | `globals.css` | ☐ |

### P1: 정서 강화

| # | 작업 | 파일 | 상태 |
|---|------|------|------|
| 5 | WifiCard Wave Line + 비밀번호 색상 | `WifiCard.tsx` | ☐ |
| 6 | TimeCard tone 통일 + Wave Line | `TimeCard.tsx` | ☐ |
| 7 | FloorPlanCard tone 변경 | `FloorPlanCard.tsx` | ☐ |
| 8 | 공지 배지 border 색상 | `GuestAnnouncements.tsx` | ☐ |

### P2: 세부 정리

| # | 작업 | 파일 | 상태 |
|---|------|------|------|
| 9 | CheckInOut 카드 tone 점검 | `CheckInOut.tsx` | ☐ |
| 10 | CheckInInfoCard tone 점검 | `CheckInInfoCard.tsx` | ☐ |
| 11 | CafeInfoTab tone 점검 | `CafeInfoTab.tsx` | ☐ |

---

## 7. 예외 및 주의사항

### 7.1 변경하지 않는 항목

| 항목 | 이유 |
|------|------|
| 긴급 공지 아이콘 `tone="warning"` | 경고는 노란색 유지가 의미적으로 적합 |
| 응급 연락처 아이콘 `tone="warning"` | 위험 상황 인식 필요 |
| 에러 상태 `tone="error"` | 에러는 빨간색 유지 |
| 관리자 페이지 전체 | 적용 범위 외 |

### 7.2 주의사항

```
⚠️ status-info는 "오션 블루"로 사용하지만, 기존 "정보" 의미와 겹침
   → 고객 페이지에서는 "오션 포인트"로 일관되게 사용
   → 관리자 페이지에서는 기존 "정보" 의미 유지

⚠️ Wave Line은 타이틀에만 적용
   → 카드 본문, 버튼 등에는 적용하지 않음

⚠️ 비밀번호만 블루로 강조
   → 다른 본문 텍스트에 블루 사용 금지
```

---

## 8. 시각적 변화 요약

### 8.1 Before / After

| 요소 | Before | After |
|------|--------|-------|
| 타이틀 라인 | 크림 (`brand-cream-dark/50`) | 오션 블루 (`status-info/40`) |
| QuickAction 아이콘 | 다양한 색상 (success/warning/brand) | 모두 오션 블루 (`info`) |
| WiFi 비밀번호 | 검정 (`brand-dark`) | 오션 블루 (`status-info`) |
| Hero 영역 | 환영 문구만 | + Wave Line + 서브카피 |
| 정보 카드 타이틀 | 라인 없음 | + Wave Line (sm) |

### 8.2 체감 변화

```
Before: 따뜻한 크림 톤 중심, 기능 위주
After:  차분한 오션 블루 포인트, "바다가 보이는 카라반" 감성
```

---

## 9. Mockup

### 9.1 고객 홈

```
┌────────────────────────────────────────────────┐
│                                                │
│         강**님, 환영합니다                     │
│         ━━━━━━━━ (ocean blue)                  │
│         바다가 보이는 특별한 휴식              │
│                                                │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│  [●]  공지 안내                                │
│        읽지 않은 공지 2건                      │
└────────────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────┐
│  [●] 체크인/아웃  │  │  [●] WiFi 연결   │
│  (ocean blue)     │  │  (ocean blue)    │
└──────────────────┘  └──────────────────┘

┌────────────────────────────────────────────────┐
│  [●]  WiFi 연결                                │
│        ━━ (thin line)                          │
│  ┌─────────────────────────────────────────┐   │
│  │  네트워크: OUS-GUEST                    │   │
│  │  비밀번호: ocean1234 (blue)             │   │
│  └─────────────────────────────────────────┘   │
└────────────────────────────────────────────────┘
```

### 9.2 하위 페이지 (도움말/안내)

```
┌────────────────────────────────────────────────┐
│  도움말                                        │
│  ━━━━━━━━ (ocean blue wave line)               │
│  응급 연락처와 자주 묻는 질문을 확인하세요     │
└────────────────────────────────────────────────┘
```

---

## 10. 검증 방법

### 10.1 시각적 검증

```bash
# 로컬 개발 서버에서 확인
npm run dev

# 확인할 페이지
/guest/[token]          # 홈
/guest/[token]/order    # 주문
/guest/[token]/guide    # 안내
/guest/[token]/help     # 도움말
```

### 10.2 체크포인트

| 항목 | 확인 방법 |
|------|-----------|
| Wave Line 색상 | 타이틀 아래 파란 라인 표시 확인 |
| QuickAction 아이콘 | 4개 모두 파란색 확인 |
| WiFi 비밀번호 | 파란색 텍스트 확인 |
| 모션 유지 | 카드 호버 시 lift 효과 확인 |
| 관리자 페이지 | 변경 없음 확인 (`/admin/*`) |

---

## 11. 업스케일 적용 (최종)

### 11.1 Hero 영역 강화

```tsx
// GuestHomeContent.tsx
<motion.section className="ocean-wave-bg ...">
  <p className="text-xs tracking-widest text-status-info/70 uppercase">
    Welcome to OUSCARAVAN
  </p>
  <h1>강**님, 환영합니다</h1>
  <div className="wave-line-animated" />  {/* 애니메이션 Wave Line */}
  <p>파도 소리와 함께하는 <span className="text-status-info">특별한 휴식</span></p>
</motion.section>
```

### 11.2 카드 상단 오션 라인

```css
/* Card variant="info" */
before:bg-gradient-to-r before:from-transparent before:via-status-info/30 before:to-transparent

/* Card variant="cta" */
before:bg-gradient-to-r before:from-transparent before:via-status-info/40 before:to-transparent
```

### 11.3 아이콘 오션 글로우

```tsx
// CardIconBadge tone="info"
const oceanGlowClass = 'bg-status-info/8 shadow-[0_0_0_1px_rgba(37,99,235,0.08),0_1px_3px_rgba(37,99,235,0.06)]';
```

### 11.4 CSS 애니메이션

```css
/* Wave Line 펄스 애니메이션 */
@keyframes wave-pulse {
  0%, 100% { opacity: 0.4; transform: scaleX(1); }
  50% { opacity: 0.6; transform: scaleX(1.1); }
}

/* Ocean Wave 배경 패턴 */
.ocean-wave-bg::before {
  background: 
    radial-gradient(ellipse 80% 50% at 50% 120%, rgba(37, 99, 235, 0.03) 0%, transparent 50%),
    radial-gradient(ellipse 60% 30% at 70% 110%, rgba(37, 99, 235, 0.02) 0%, transparent 40%);
}
```

---

## 12. 모바일 전용 운영 설계 (라이트 모드 고정)

### 12.1 라이트 모드 고정 원칙

- 다크모드 미지원 전제 → 대비/가독성은 라이트 기준으로만 최적화
- `color-scheme: light` 유지, 토큰 추가 금지
- 블루 포인트는 **아이콘/라인/숫자**에만 제한

### 12.2 모바일 터치/정보 구조 규칙 (필수)

- 터치 타겟: **최소 44px** (이미 globals.css 반영)
- 카드 구조: **제목 1줄 + 보조 1줄 + 액션 1개** 기본형
- 리스트 간격: **12~16px**, 섹션 간격 **20~24px**
- 카드 타이틀은 **항상 1줄**, 보조 문구는 **2줄 제한**

### 12.3 모바일 전용 섹션 패턴 (SSOT)

#### A. 섹션 헤더
```tsx
<header className="space-y-2">
  <h2 className="text-lg font-heading font-bold text-brand-dark">섹션 타이틀</h2>
  <div className="wave-line-sm" aria-hidden="true" />
  <p className="text-sm text-muted-foreground">보조 설명</p>
</header>
```

#### B. 카드 기본형 (정보 카드)
```tsx
<Card variant="info">
  <CardHeader className="pb-2">
    <CardTitle className="flex items-center gap-2">
      <CardIconBadge icon={Info} tone="info" />
      카드 제목
    </CardTitle>
    <div className="wave-line-sm" />
  </CardHeader>
  <CardContent className="space-y-3">
    <div className="sea-mist-box">핵심 정보</div>
    <Button className="w-full">액션</Button>
  </CardContent>
</Card>
```

#### C. 리스트 아이템 (공지/FAQ)
```tsx
<button className="w-full rounded-md border border-border/60 p-3 text-left">
  <div className="flex items-center gap-2">
    <Badge variant="outline" className="bg-background-muted text-status-info border-status-info/30">
      안내
    </Badge>
    <span className="text-sm font-semibold">제목</span>
  </div>
  <p className="mt-2 text-xs text-muted-foreground line-clamp-2">내용</p>
</button>
```

### 12.4 모바일 모션 규칙 (최소 3종)

- 페이지 진입: `opacity + y(8px)` / 200~260ms  
- 카드 인터랙션: `hover lift 1~2px`, `press scale 0.99`
- 리스트 스태거: 40~60ms

### 12.5 가독성/심사 포인트 체크리스트

- 타이틀 1줄, 설명 2줄 규칙 유지
- CTA는 항상 **하단 1개 버튼** 형태
- 오션 블루는 **포인트 전용**으로만 사용
- 작은 텍스트는 **12~13px** 이상 유지
- 숫자/상태는 **Badge or 색상 텍스트**로만 강조

---

### 12.6 판매/공모전용 “완성도 업스케일” (브랜드 · 시스템 · 폴리싱)

> 목표: “예쁘다”보다 **제품처럼 느껴지는 일관성/표정/품질**을 만든다. (모바일 기준)

#### 12.6.1 브랜드 레이어 (기억에 남는 차별점)

##### A) Hero를 ‘브랜드 카드’ 프리셋으로 운영 (2~3개만)

- **운영 원칙**
  - 프리셋은 **3개 이하**로 제한 (과하면 촌스러움/산만함)
  - 프리셋 구성요소: **문구(카피) + 포인트(라인/아이콘) + 패턴 강도**
  - 선택 기준: **체류 상태(입실 전/체류/퇴실) 우선**, 그 다음 시간대/날씨는 “문구만” 미세 변경

| 프리셋 | 트리거(우선순위) | 카피(예시) | 패턴/라인 강도 | 포인트 컬러 사용 |
|--------|------------------|------------|----------------|------------------|
| **Arrival** | 입실 전 | “곧 입실 안내를 시작해요” | Wave Line: 기본, 배경 패턴: 약(현재) | `status-info` 최소 |
| **Stay** | 체류 중 | “파도 소리와 함께하는 특별한 휴식” | Wave Line: 애니메이션, 패턴: 중 | `status-info` 1~2곳 |
| **Departure** | 퇴실 후 | “오늘의 추억을 간직해 주세요” | Wave Line: 약, 패턴: 약, 텍스트 강조 최소 | `status-info` 최소 |

- **구현 형태(권장)**
  - `lib/guest/heroPreset.ts`에 프리셋 함수(상태→프리셋) 1개로 중앙 관리
  - `GuestHomeContent`는 “프리셋 데이터”만 받아 렌더링

##### B) “비주얼 에셋 1개” 전략 (사진/영상/일러스트 중 하나만)

- **추천**
  - 공모전/판매 기준: **사진 1장(또는 4~6초 루프 영상 1개)**가 가장 즉시 체감됨
  - 단, **오버레이는 단색 10~20%**만 허용(현재 `BrandMediaLayer`와 궁합 좋음)
- **스펙**
  - 1장 고정: 1440px 폭 기준 WebP(품질 70~80), 180~350KB 목표
  - LCP 고려: Hero는 `priority` 유지, 레이지 에셋은 금지

##### C) 타이포 위계 “고객 전용” 고정

- **원칙**
  - 고객 페이지에서만: `font-heading`은 타이틀, 본문은 기본 폰트(pretendard)
  - 제목/본문의 자간/행간을 고정(화면마다 달라지면 상용감 하락)
- **권장 스펙(모바일)**
  - Page Title: 24~28px, 700~800, tracking-tight
  - Card Title: 16px, 600~700, leading-tight
  - Body: 14px, 400~500, leading-relaxed
  - Meta: 12~13px, muted

---

#### 12.6.2 시스템 레이어 (완성도 = 일관성, SSOT)

##### A) “5 컴포넌트 SSOT” 정의 (스펙을 고정값으로 문서/코드화)

1) **Card**
- Radius: 16px(`rounded-2xl`) 고정
- Shadow: `shadow-card` / hover `shadow-card-hover` 2단계만
- Variant:
  - `info/cta`: 상단 오션 라인(현재 적용) = 브랜드 시그널
  - `alert`: 왼쪽 스트립만
- Padding:
  - Header: `p-4 pb-2~3` (현재 흐름 유지)

2) **Badge**
- 배경: `bg-background-muted` (뉴트럴)
- 텍스트/테두리: 상태별(`status-info|warning|error` + `/30`)
- 크기: 기본(12px) 고정, 페이지마다 임의 확대 금지

3) **IconTile (CardIconBadge)**
- Size: sm(32), md(36), lg(40)만
- Tone:
  - 고객 페이지 기본: `info`
  - 의미색 유지: 경고/에러는 `warning/error`
- Surface:
  - `tone=info`만 오션 글로우(현재 적용)

4) **SectionHeader (고객 페이지 타이틀/섹션 타이틀)**
- Wave Line: sm(24) / md(32) / lg(48) 3단계로만
- 설명: 2줄 제한(line-clamp-2) 권장

5) **InsetBox (SeaMist)**
- `sea-mist-box`만 사용(임의 배경/테두리 금지)
- 내부 여백: 12~16px, 콘텐츠 간격 8~12px

##### B) 상태 컴포넌트 통일 (판매/심사에서 강력한 가산점)

- 목표: 로딩/빈 상태/오류/권한/오프라인을 **각 1개 컴포넌트**로 고정
- 권장 파일(예시)
  - `components/shared/states/LoadingState.tsx`
  - `components/shared/states/EmptyState.tsx` (기존 있으면 확장)
  - `components/shared/states/ErrorState.tsx`
  - `components/shared/states/OfflineState.tsx`
  - `components/shared/states/PermissionState.tsx`
- 적용 규칙
  - 카드 내부 상태는 `variant="muted"` + 상태 컴포넌트 삽입
  - “텍스트만 띄우기” 금지(화면마다 퀄리티 편차 발생)

##### C) 정보 밀도 규칙(모바일 기준)

- 기본형: **제목 1줄 + 보조 1줄 + 액션 1개**
- 예외 허용: 공지(리스트), 가이드(탭/인스펙터)
- 버튼은 1개가 원칙(보조 액션은 `ghost/outline`로 접기)

---

#### 12.6.3 폴리싱 레이어 (아, 잘 만들었네)

##### A) 모션 3종 세트 + 토큰화

- **A. 페이지 진입**: `opacity: 0→1`, `y: 8→0`, 220ms
- **B. 카드 인터랙션**: hover y:-2, tap scale:0.99 (현재 `GuestMotionCard`)
- **C. 리스트 스태거**: 50ms, 최대 8개까지만

> 구현 권장: `lib/motion.ts`에 duration/ease/stagger를 상수로 SSOT.

##### B) 리듬 통일 (Wave Line / Icon / Spacing)

- Wave Line 길이 고정: 24/32/48 (sm/md/lg)
- IconTile 크기 고정: 32/36/40 (sm/md/lg)
- Spacing 단위 고정: 8/12/16/24만 사용(특히 카드 내부)

##### C) Shadow 2단계로 축소(고급감)

- 기본: `shadow-card`
- hover/focus: `shadow-card-hover`
- 그 외 shadow-soft-md 같은 예외는 **고객 페이지에서 제거/대체** 권장

##### D) 접근성(심사 가산점) 체크

- 포커스 링: 모든 버튼/링크/카드에 일관 적용(현재 `focus-visible:ring` 계열 유지)
- 대비: `status-info`는 “포인트”로만(본문 링크/본문 강조 남발 금지)
- 터치: 44px 유지(현재 적용됨)
- 모션 감소: `useReducedMotion` 존중(현재 `GuestMotionCard` 기반 OK)

---

### 12.7 모바일 기준 적용 로드맵 (P0~P2)

#### P0 (1~2일, 심사/판매 체감 최상)
- Hero 프리셋 2종(Arrival/Stay) 도입 + 프리셋 선택 로직
- 상태 컴포넌트 2개(Loading/Empty) 통일 적용(홈/공지/주문)
- SectionHeader 패턴을 2~3곳에 고정 적용(Help/Guide/Order)

#### P1 (2~3일, 전체 완성도 상승)
- Error/Offline/Permission 상태 컴포넌트 추가 및 전 페이지 적용
- 모션 토큰화(`lib/motion.ts`) + 리스트 스태거 표준화
- Shadow/Border 예외 제거(고객 페이지 스캔)

#### P2 (옵션, “제품 같은” 마감)
- 카피 톤/문장 길이 규칙 정리(한글 기준 14~18자 권장)
- 스토어/공모전 스크린샷 4장에 맞춘 “대표 화면” 마감(홈/공지/도움말/주문완료)

## 13. 결론

**"오션뷰 카라반"의 감성**은 대면적 색상이 아니라,  
**잔잔한 Wave Line + 미세한 오션 글로우 + 통일된 블루 포인트**로 전달합니다.

### 최종 적용 요소

| 요소 | 적용 위치 | 효과 |
|------|-----------|------|
| **Ocean Wave Background** | Hero 영역 | 미세한 웨이브 그라데이션 배경 |
| **Animated Wave Line** | Hero, PageHeader | 미세한 펄스 애니메이션 |
| **Ocean Card Line** | Card info/cta | 상단 오션 블루 그라데이션 라인 |
| **Ocean Icon Glow** | CardIconBadge info | 옅은 블루 배경 + 미세 그림자 |
| **Accent Text** | Hero 서브카피 | "특별한 휴식" 블루 강조 |

### 체감 변화

```
Before: 단순 색상 변경 → 기능적
After:  미세한 패턴 + 애니메이션 + 글로우 → 감성적
```

---

**적용 완료:** P0~P2 + 업스케일 전체 반영
