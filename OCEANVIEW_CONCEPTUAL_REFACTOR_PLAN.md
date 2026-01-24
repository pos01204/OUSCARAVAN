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

## 11. 결론

**"오션뷰 카라반"의 감성**은 대면적 색상이 아니라,  
**잔잔한 Wave Line + 통일된 오션 블루 아이콘**으로 전달합니다.

### 핵심 변경 요약

| 변경 유형 | 파일 수 | 변경량 |
|-----------|---------|--------|
| 색상값 변경 | 7개 | 클래스 1~3개씩 |
| 라인 추가 | 4개 | 1~2줄씩 |
| CSS 추가 | 1개 | 15줄 |

### 기대 효과

- 기존 레이아웃 **100% 유지**
- 색상 토큰 추가 **없음**
- **P0 작업(4개)만으로** 감성 체감 가능
- 관리자 페이지 **영향 없음**

---

**다음 단계:** P0 작업부터 순차 적용 → 빌드 확인 → P1 적용
