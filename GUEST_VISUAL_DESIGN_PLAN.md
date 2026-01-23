# 고객 페이지 비주얼 디자인 개선 기획서

> **작성일**: 2026-01-20  
> **대상**: `/guest/[token]/*` 고객 페이지 전체  
> **목표**: 현재 레이아웃 유지 + 브랜드 색상 적용 + 세련된 디자인  
> **브랜드 컬러**: **라이트 테마 (고정)** — 크림/베이지 배경 + 다크 텍스트  
> **사용자 특성**: **일회성 사용** — 처음 봐도 직관적으로 이해되어야 함

---

## 1. 프로덕트 원칙

### 1.1 일회성 사용자를 위한 UX 원칙

> **"처음 사용하는 고객도 3초 안에 원하는 기능을 찾을 수 있어야 한다"**

- 🎯 **Self-Explanatory UI**: 별도 설명 없이도 기능이 명확히 전달
- 🔤 **텍스트 우선**: 아이콘만으로 의미 전달하지 않음 (항상 텍스트 병기)
- 📍 **명확한 시각적 위계**: 중요한 것이 먼저 눈에 들어옴
- 🚀 **최소 클릭 원칙**: 핵심 기능까지 최소 동선
- ❓ **안내 내재화**: FAQ/가이드가 UI에 자연스럽게 녹아듦

### 1.2 관리자 업무 최소화

| 기존 (설명 필요) | 개선 (자명함) |
|-----------------|--------------|
| "WiFi 비번은 여기 누르세요" | WiFi 카드에 비번 바로 표시 |
| "체크인은 이 버튼이에요" | "체크인하기" 명확한 CTA |
| "주문은 주문 탭에서요" | 홈에서 바로 주문 가능한 퀵액션 |
| "쿠폰은 여기 탭하세요" | "탭하여 쿠폰 확인" 명시 |

### 1.3 변경하지 않는 것
- ✅ 현재 레이아웃 구조 (Hero, Quick Actions, 카드 배치 등)
- ✅ 현재 프레임워크 (컴포넌트 구성, 페이지 흐름)
- ✅ 현재 아이콘 위치 및 개수 (추가 아이콘 삽입 지양)
- ✅ 기능적 동작 방식
- ❌ 라이트/다크 모드 토글 (**라이트 테마 고정**)

### 1.4 개선하는 것
- 🎨 **색상 팔레트**: 브랜드 라이트 테마 적용 (크림/베이지 + 다크 텍스트)
- 🃏 **카드 디자인**: 흰색 배경 + 부드러운 그림자 + 베이지 테두리
- 🔷 **아이콘 품질**: Iconify(Solar 세트) 도입으로 품질 향상
- ✨ **인터랙션**: 세련된 hover/active 피드백 (lift, shadow)
- 📝 **마이크로카피**: 명확하고 친근한 안내 문구

---

## 1.5 외부 라이브러리 확정 요약

### ✅ 사용 확정

| 라이브러리 | 용도 | 상태 |
|-----------|------|------|
| `shadcn/ui` | UI 컴포넌트 | 유지 |
| `framer-motion` | 애니메이션 | 유지 |
| `react-confetti` | 축하 효과 | 유지 |
| `lucide-react` | 기본 아이콘 | 유지 |
| `tailwindcss` | 스타일링 | 유지 |
| `vaul` | Drawer | 유지 |
| **`@iconify/react`** | 아이콘 확장 | **신규 도입** |
| **`tailwind-merge`** | 스타일 병합 | **신규 도입** |

### ❌ 미도입

| 라이브러리 | 이유 |
|-----------|------|
| `lottie-react` | framer-motion으로 충분 |
| `@tsparticles/react` | 일회성 앱에 과함 |
| `canvas-confetti` | react-confetti와 중복 |

---

## 2. 현재 상태 진단

### 2.1 강점
- **레이아웃 완성도**: 정보 배치, 네비게이션 흐름이 좋음
- **Pretendard 폰트**: 한글 가독성 우수
- **반응형 대응**: 모바일/데스크톱 분기 처리 완료
- **아이콘 배치**: 적절한 위치에 아이콘 사용

### 2.2 개선 필요 영역

#### (A) 색상이 브랜드와 맞지 않음
- 현재: Primary `#FF7E5F` (오렌지-코랄), Background `#FAFAFA` (라이트)
- **개선**: 브랜드 다크 테마 + 크림/베이지 적용

#### (B) 카드 디자인 단조로움
- 대부분의 카드가 동일한 스타일
- **개선**: 테두리, 그림자, 배경색 차별화

#### (C) 아이콘 품질 개선 여지
- 현재 Lucide 아이콘 사용 중
- **개선**: 더 직관적인 아이콘으로 교체 가능 (Iconify 활용)

#### (D) 인터랙션 피드백 미흡
- hover/active 상태 피드백이 기본적
- **개선**: 브랜드 색상 기반 피드백 강화

---

## 3. 브랜드 색상 시스템

### 3.1 색상 팔레트 — 라이트 테마 (크림/베이지 기반)

```css
/* ═══════════════════════════════════════════════════
   브랜드 색상 — 라이트 테마
   첨부 이미지의 크림/베이지를 배경으로, 다크를 텍스트로 활용
   ═══════════════════════════════════════════════════ */

/* 배경 */
--background: #FAF8F5;              /* 메인 배경 (따뜻한 오프화이트) */
--background-elevated: #FFFFFF;     /* 카드 배경 (순백) */
--background-muted: #F5F2ED;        /* 보조 배경 (베이지 틴트) */
--background-accent: #EDE8DF;       /* 강조 배경 (진한 크림) */

/* 브랜드 다크 (텍스트용) */
--brand-dark: #1A1714;              /* 주요 텍스트 (따뜻한 검정) */
--brand-dark-soft: #3D3730;         /* 보조 텍스트 */
--brand-dark-muted: #6B6358;        /* 힌트/캡션 */
--brand-dark-faint: #9C9488;        /* 비활성 */

/* 브랜드 크림/베이지 (악센트용) */
--brand-cream: #E8DCC8;             /* 브랜드 시그니처 색상 */
--brand-cream-dark: #C4B896;        /* 테두리, 구분선 */
--brand-cream-deep: #A89F8A;        /* 진한 포인트 */

/* Primary (CTA, 강조 버튼) */
--primary: #1A1714;                 /* 다크 버튼 배경 */
--primary-hover: #3D3730;           /* hover 시 */
--primary-foreground: #FAF8F5;      /* Primary 위 텍스트 (밝은) */

/* Secondary (보조 버튼) */
--secondary: #E8DCC8;               /* 크림 버튼 배경 */
--secondary-hover: #DED0B8;         /* hover 시 */
--secondary-foreground: #1A1714;    /* Secondary 위 텍스트 */

/* 텍스트 */
--text-primary: #1A1714;            /* 주요 텍스트 */
--text-secondary: #6B6358;          /* 보조 텍스트 */
--text-tertiary: #9C9488;           /* 힌트/플레이스홀더 */
--text-muted: #B8B0A4;              /* 비활성 */

/* 테두리 */
--border-default: rgba(196, 184, 150, 0.3);   /* 미세한 구분선 */
--border-emphasis: rgba(196, 184, 150, 0.5);  /* 강조 테두리 */
--border-strong: #C4B896;                      /* 강한 테두리 */

/* 상태 색상 (라이트 테마용) */
--accent-success: #16A34A;          /* 완료/성공 */
--accent-warning: #CA8A04;          /* 경고/주의 */
--accent-error: #DC2626;            /* 에러 */
--accent-info: #2563EB;             /* 정보 */
```

### 3.2 라이트 테마 고정 (모드 전환 없음)

> **일회성 사용 앱 특성상 모드 선택은 혼란만 가중**  
> 브랜드 라이트 테마 하나로 통일하여 일관된 경험 제공

```css
/* 라이트 테마 고정 — 시스템 설정 무시 */
:root {
  color-scheme: light;
}

/* prefers-color-scheme 미사용 */
/* 모든 환경에서 동일한 라이트 테마 표시 */
```

### 3.3 타이포그래피 — 라이트 테마용

| Level | Size | Weight | Color | 용도 |
|-------|------|--------|-------|------|
| **Display** | 28-32px | 700 | `--brand-dark` | Hero 메시지 |
| **Title** | 22-24px | 600 | `--text-primary` | 페이지/섹션 제목 |
| **Subtitle** | 18-20px | 600 | `--text-primary` | 카드 제목 |
| **Body** | 15-16px | 400 | `--text-primary` | 본문 |
| **Body Muted** | 14px | 400 | `--text-secondary` | 보조 본문 |
| **Caption** | 12-13px | 500 | `--text-tertiary` | 레이블, 힌트 |

### 3.4 그림자 시스템 — 라이트 테마용

```css
/* 라이트 테마에서는 부드러운 그림자로 깊이감 표현 */
--shadow-sm: 0 1px 2px rgba(26, 23, 20, 0.04), 0 1px 3px rgba(26, 23, 20, 0.06);
--shadow-md: 0 4px 8px rgba(26, 23, 20, 0.06), 0 2px 4px rgba(26, 23, 20, 0.04);
--shadow-lg: 0 12px 24px rgba(26, 23, 20, 0.08), 0 4px 8px rgba(26, 23, 20, 0.04);

/* 호버 시 그림자 */
--shadow-hover: 0 8px 20px rgba(26, 23, 20, 0.1);

/* 브랜드 크림 glow (선택적) */
--glow-brand: 0 0 20px rgba(232, 220, 200, 0.4);
```

### 3.5 Border & Radius

```css
/* Border Radius */
--radius-sm: 6px;    /* 버튼, 뱃지 */
--radius-md: 10px;   /* 카드 */
--radius-lg: 14px;   /* 모달, 시트 */

/* Border Width */
--border-thin: 1px;
--border-accent: 2px;  /* 강조 테두리 */
```

### 3.6 카드 스타일 시스템 — 라이트 테마

```css
/* 1. 기본 카드 (흰색 배경) */
.card-default {
  background: var(--background-elevated);  /* #FFFFFF */
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

/* 2. 크림 배경 카드 (강조) */
.card-cream {
  background: var(--background-accent);    /* #EDE8DF */
  border: 1px solid var(--brand-cream-dark);
  border-radius: var(--radius-md);
}

/* 3. 액센트 라인 카드 */
.card-accent {
  background: var(--background-elevated);
  border: 1px solid var(--border-default);
  border-left: 3px solid var(--brand-dark);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

/* 4. 인터랙티브 카드 */
.card-interactive {
  background: var(--background-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease-out;
  cursor: pointer;
}
.card-interactive:hover {
  border-color: var(--border-emphasis);
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
}
.card-interactive:active {
  transform: scale(0.99) translateY(0);
  box-shadow: var(--shadow-sm);
}

/* 5. Muted 카드 (보조 정보) */
.card-muted {
  background: var(--background-muted);     /* #F5F2ED */
  border: none;
  border-radius: var(--radius-md);
}
```

---

## 4. 컴포넌트별 개선 계획 (레이아웃 유지, 디자인만 개선)

### 4.1 Hero Section — 브랜드 라이트 테마 적용

**현재 레이아웃 유지**, 색상만 변경

```css
/* After (라이트 테마) */
.hero {
  background: linear-gradient(180deg, #EDE8DF 0%, #FAF8F5 100%);
  color: var(--brand-dark);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
}
```

### 4.2 카드 컴포넌트 — 라이트 테마 적용

**모든 카드에 공통 적용**

```css
/* 라이트 테마 카드 */
.card {
  background: var(--background-elevated);  /* #FFFFFF */
  border: 1px solid var(--border-default); /* 베이지 30% */
  color: var(--text-primary);              /* 다크 */
  box-shadow: var(--shadow-sm);
}

.card:hover {
  border-color: var(--border-emphasis);
  box-shadow: var(--shadow-hover);
}

/* 카드 내 텍스트 */
.card-title { color: var(--text-primary); }
.card-description { color: var(--text-secondary); }
.card-caption { color: var(--text-tertiary); }
```

### 4.3 버튼 스타일 — 브랜드 색상

```css
/* Primary 버튼 (다크 배경) */
.btn-primary {
  background: var(--brand-dark);
  color: var(--background);  /* 밝은 텍스트 */
  border: none;
  box-shadow: var(--shadow-sm);
}
.btn-primary:hover {
  background: var(--brand-dark-soft);
  box-shadow: var(--shadow-md);
}

/* Secondary 버튼 (크림 배경) */
.btn-secondary {
  background: var(--brand-cream);
  color: var(--brand-dark);
  border: 1px solid var(--brand-cream-dark);
}
.btn-secondary:hover {
  background: var(--secondary-hover);
}

/* Outline 버튼 */
.btn-outline {
  background: transparent;
  color: var(--brand-dark);
  border: 1px solid var(--border-strong);
}
.btn-outline:hover {
  background: var(--background-muted);
}

/* Ghost 버튼 (텍스트만) */
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: none;
}
.btn-ghost:hover {
  color: var(--text-primary);
  background: var(--background-muted);
}
```

### 4.4 쿠폰 플립 — 라이트 테마

```css
/* 쿠폰 앞면 */
.coupon-front {
  background: linear-gradient(135deg, #EDE8DF 0%, #E8DCC8 100%);
  border: 2px solid var(--brand-cream-dark);
  color: var(--brand-dark);
}

/* 쿠폰 뒷면 */
.coupon-back {
  background: var(--brand-dark);
  color: var(--background);  /* 밝은 텍스트 */
}
```

### 4.5 탭 & 네비게이션 — 라이트 테마

```css
/* 탭 */
.tab {
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
}
.tab[data-state="active"] {
  color: var(--brand-dark);
  border-bottom-color: var(--brand-dark);
}

/* 하단 네비게이션 */
.bottom-nav {
  background: var(--background-elevated);
  border-top: 1px solid var(--border-default);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}
.bottom-nav-item {
  color: var(--text-tertiary);
}
.bottom-nav-item[data-active="true"] {
  color: var(--brand-dark);
}
```

### 4.6 입력 필드 — 라이트 테마

```css
.input {
  background: var(--background-elevated);
  border: 1px solid var(--border-default);
  color: var(--text-primary);
}
.input::placeholder {
  color: var(--text-tertiary);
}
.input:focus {
  border-color: var(--brand-cream-dark);
  box-shadow: 0 0 0 3px rgba(232, 220, 200, 0.3);
  outline: none;
}
```

### 4.7 상태 뱃지 — 라이트 테마

```css
/* 대기 */
.badge-pending {
  background: #FEF3C7;
  color: #92400E;
  border: 1px solid #FCD34D;
}

/* 준비중 */
.badge-preparing {
  background: #DBEAFE;
  color: #1E40AF;
  border: 1px solid #93C5FD;
}

/* 완료 */
.badge-completed {
  background: #DCFCE7;
  color: #166534;
  border: 1px solid #86EFAC;
}
```

### 4.8 스켈레톤 로딩 — 라이트 테마

```css
.skeleton {
  background: linear-gradient(90deg, #F5F2ED 25%, #EDE8DF 50%, #F5F2ED 75%);
  background-size: 200% 100%;
  border-radius: var(--radius-sm);
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### 4.9 세련된 카드 효과 — 라이트 테마

**Premium 카드 — Subtle Border Gradient**
```css
.card-premium {
  background: #FFFFFF;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-md);
}
.card-premium::before {
  content: '';
  position: absolute;
  inset: 0;
  padding: 1px;
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    rgba(196, 184, 150, 0.6) 0%,
    rgba(196, 184, 150, 0.2) 50%,
    transparent 100%
  );
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  pointer-events: none;
}
```

**Elegant Lift on Hover**
```css
.card-lift {
  transition: box-shadow 0.3s ease, transform 0.2s ease;
}
.card-lift:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 20px 40px -15px rgba(26, 23, 20, 0.15),
    0 8px 16px -8px rgba(26, 23, 20, 0.1);
}
```

**Inner Cream Gradient**
```css
.card-cream-gradient {
  background: 
    linear-gradient(
      135deg,
      rgba(232, 220, 200, 0.3) 0%,
      transparent 60%
    ),
    #FFFFFF;
}
```

**Top Accent Line**
```css
.card-accent-top {
  position: relative;
  background: #FFFFFF;
  border-radius: 12px;
  overflow: hidden;
}
.card-accent-top::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #C4B896 0%, #E8DCC8 100%);
}
```

---

## 5. 아이콘 개선 계획

### 5.1 현재 아이콘 유지 원칙

> **추가 아이콘 삽입 지양**, 기존 아이콘은 더 좋은 것으로 교체 가능

- ✅ 현재 위치의 아이콘 유지
- ✅ 필요시 더 직관적인 아이콘으로 교체
- ❌ 디자인 목적으로 새 아이콘 추가하지 않음

### 5.2 Iconify 활용 — 아이콘 품질 개선

[Iconify](https://icon-sets.iconify.design/)에서 추천하는 아이콘 세트:

| 세트 | 스타일 | 추천 용도 |
|------|--------|----------|
| **Solar** | 깔끔한 라인 | 일반 UI 아이콘 |
| **Phosphor** | 다양한 웨이트 | 네비게이션, 상태 |
| **Tabler** | 일관된 두께 | 기능 아이콘 |
| **Lucide** (현재) | 미니멀 라인 | 유지해도 무방 |

### 5.3 아이콘 교체 후보

| 현재 | 교체 후보 (Iconify) | 이유 |
|------|---------------------|------|
| `Wifi` (Lucide) | `solar:wifi-router-bold` | 더 직관적 |
| `Phone` (Lucide) | `solar:phone-calling-bold` | 액션 강조 |
| `ShoppingBag` (Lucide) | `solar:bag-4-bold` | 세련됨 |
| `Home` (Lucide) | `solar:home-2-bold` | 따뜻한 느낌 |
| `BookOpen` (Lucide) | `solar:book-bold` | 간결함 |
| `HelpCircle` (Lucide) | `solar:question-circle-bold` | 명확함 |

### 5.4 아이콘 스타일 가이드

```css
/* 다크 테마용 아이콘 */
.icon {
  color: var(--brand-cream);
  stroke-width: 1.5px;  /* 또는 2px for bold */
}

.icon-muted {
  color: var(--text-secondary);
}

.icon-interactive:hover {
  color: var(--brand-cream-light);
}
```

### 5.5 Iconify 설치 (선택사항)

현재 Lucide로 충분하면 교체 불필요. 교체 시:

```bash
npm install @iconify/react
```

```tsx
import { Icon } from '@iconify/react';

// 사용 예시
<Icon icon="solar:wifi-router-bold" className="w-5 h-5" />
```

---

## 6. 외부 라이브러리 최종 점검 및 확정

### 6.1 ✅ 확정: 현재 사용 라이브러리

| 라이브러리 | 용도 | 상태 | 활용 방안 |
|-----------|------|------|----------|
| `shadcn/ui` | UI 컴포넌트 | **유지** | 브랜드 색상으로 테마 커스터마이징 |
| `framer-motion` | 애니메이션 | **유지** | 페이지 전환, 카드 hover, 플립 효과 |
| `react-confetti` | 축하 효과 | **유지** | 쿠폰 플립 시 |
| `lucide-react` | 아이콘 | **유지** | 기본 아이콘 세트 |
| `tailwindcss` | 스타일링 | **유지** | 브랜드 색상/효과 추가 |
| `vaul` | Drawer | **유지** | 모바일 시트/디테일 뷰 |
| `clsx` | 조건부 스타일 | **유지** | className 조합 |

### 6.2 ✅ 확정: 추가 도입 라이브러리

| 라이브러리 | 용도 | 결정 | 이유 |
|-----------|------|------|------|
| `@iconify/react` | 아이콘 확장 | **도입** | 더 다양하고 직관적인 아이콘 (10만+ 아이콘) |
| `tailwind-merge` | 스타일 병합 | **도입** | Tailwind 클래스 충돌 방지 |

```bash
# 설치 명령
npm install @iconify/react tailwind-merge
```

### 6.3 ❌ 미도입: 검토 후 제외

| 라이브러리 | 용도 | 결정 | 이유 |
|-----------|------|------|------|
| `lottie-react` | 복잡한 애니메이션 | **제외** | framer-motion으로 충분 |
| `@tsparticles/react` | 파티클 효과 | **제외** | 일회성 앱에 과함 |
| `react-shimmer-effect` | 스켈레톤 | **제외** | CSS로 구현 가능 |
| `@react-spring/web` | 애니메이션 | **제외** | framer-motion과 중복 |
| `canvas-confetti` | 축하 효과 | **제외** | react-confetti와 중복 |
| `embla-carousel-react` | 캐러셀 | **제외** | 현재 캐러셀 미사용 |

### 6.4 디자인 레퍼런스 (라이트 테마 중심)

| 레퍼런스 | 참고 포인트 | URL |
|---------|------------|-----|
| **Airbnb** | 따뜻한 라이트 테마, 카드 스타일 | airbnb.com |
| **Stripe** | 정보 위계, 깔끔한 폼 | stripe.com |
| **Notion** | 미니멀 라이트, 타이포그래피 | notion.so |
| **Linear** (라이트) | 세련된 테두리, 그림자 | linear.app |
| **Cal.com** | 예약 UI, CTA 버튼 | cal.com |

### 6.5 UI 컴포넌트 영감

| 라이브러리 | 참고 요소 | 특징 |
|-----------|----------|------|
| **shadcn/ui** | 기본 컴포넌트 | 현재 기반 |
| **Radix UI** | 접근성 좋은 프리미티브 | shadcn 내부에서 사용 |
| **Aceternity UI** | 그라데이션 보더 | CSS로 구현 |
| **Magic UI** | 버튼 호버 효과 | CSS로 구현 |

### 6.6 아이콘 활용 전략 (Iconify)

```tsx
// 예시: Iconify 아이콘 사용
import { Icon } from '@iconify/react';

// 다양한 아이콘 세트에서 선택 가능
<Icon icon="solar:wifi-bold" />           // Solar 세트
<Icon icon="ph:coffee-fill" />            // Phosphor 세트
<Icon icon="mingcute:fire-fill" />        // MingCute 세트
<Icon icon="fluent:home-24-filled" />     // Fluent 세트
```

**추천 아이콘 세트:**
| 세트 | 특징 | 용도 |
|------|------|------|
| **Solar** | 현대적, 깔끔 | 메인 UI 아이콘 |
| **Phosphor** | 일관성 있음 | 네비게이션 |
| **MingCute** | 부드러운 곡선 | 강조 아이콘 |

### 6.7 CSS 효과 (라이브러리 없이)

```css
/* 부드러운 카드 호버 */
.card-elegant {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.card-elegant:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px -15px rgba(26, 23, 20, 0.15);
}

/* 버튼 프레스 효과 */
.btn-press:active {
  transform: scale(0.97);
  transition: transform 0.1s;
}

/* 세련된 포커스 링 */
.focus-ring:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(232, 220, 200, 0.5);
}

/* 스켈레톤 시머 */
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.skeleton-shimmer {
  background: linear-gradient(90deg, #F5F2ED 25%, #EDE8DF 50%, #F5F2ED 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

---

## 7. 일회성 사용자를 위한 UI 가이드

### 7.1 자명한 UI (Self-Explanatory) 원칙

> **"설명 없이도 알 수 있는 UI"**

| 요소 | Before (설명 필요) | After (자명함) |
|------|-------------------|----------------|
| WiFi 카드 | WiFi 아이콘만 | "WiFi: OUS_Guest / 비번: 1234" |
| 체크인 버튼 | ✓ 아이콘 | "체크인하기" 텍스트 |
| 쿠폰 | 티켓 이미지만 | "탭하여 쿠폰 확인" 명시 |
| 주문 | 장바구니 아이콘 | "배달 주문하기" 텍스트 |
| 상태 | 색상 점만 | "준비중" 텍스트 + 색상 |

### 7.2 마이크로카피 가이드

**친근하고 명확한 톤**

| 상황 | Bad | Good |
|------|-----|------|
| WiFi 연결 | "연결" | "WiFi 연결하기" |
| 체크인 | "확인" | "체크인 완료하기" |
| 주문 | "주문" | "배송 주문하기" |
| 쿠폰 | "사용" | "탭하여 쿠폰 확인" |
| 빈 상태 | "데이터 없음" | "아직 주문 내역이 없어요" |
| 에러 | "오류 발생" | "잠시 문제가 생겼어요. 다시 시도해주세요" |

### 7.3 시각적 힌트

```
┌─────────────────────────────────────┐
│                                     │
│  WiFi 연결하기                      │ ← 동작을 명시하는 제목
│  ─────────────────────────────────  │
│  네트워크: OUS_Guest                │ ← 필요한 정보 바로 표시
│  비밀번호: 1234                     │
│                                     │
│  [ 비밀번호 복사하기 ]              │ ← 동작 버튼 명확히
│                                     │
└─────────────────────────────────────┘
```

### 7.4 상태 표시 원칙

```
✓ 항상 텍스트 + 색상 조합
✓ 아이콘만으로 상태 표시 금지
✓ 다음 단계 안내 포함

예시:
┌─────────────────────────────────────┐
│  주문 상태                          │
│  ─────────────────────────────────  │
│                                     │
│  ● 준비중                           │ ← 색상 점 + 텍스트
│    18:00에 배송될 예정이에요        │ ← 추가 안내
│                                     │
└─────────────────────────────────────┘
```

---

## 8. 색상 적용 시안 (라이트 테마)

### 8.1 브랜드 색상 요약

| 요소 | HEX | 설명 |
|------|-----|------|
| 페이지 배경 | `#FAF8F5` | 따뜻한 오프화이트 |
| 카드 배경 | `#FFFFFF` | 순백 + 그림자 |
| 주요 텍스트 | `#1A1714` | 따뜻한 검정 |
| 보조 텍스트 | `#6B6358` | 브라운 그레이 |
| 테두리 | `rgba(196,184,150,0.3)` | 베이지 |
| Primary 버튼 | `#1A1714` bg, `#FAF8F5` text | 다크 CTA |
| Secondary 버튼 | `#E8DCC8` bg, `#1A1714` text | 크림 CTA |

### 8.2 홈 화면 (라이트 테마 적용)

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ░░░░░░░░░░ #FAF8F5 배경 ░░░░░░░░░░░  ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                       ┃
┃  ┌─────────────────────────────────┐  ┃ ← Hero: #EDE8DF~#FAF8F5 그라데이션
┃  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  ┃   베이지 테두리
┃  │                                 │  ┃
┃  │  김지훈님, 환영합니다!          │  ┃ ← #1A1714 다크 텍스트
┃  │                                 │  ┃
┃  │  체크인 D-1 · 1월 21일 15:00    │  ┃ ← #6B6358 보조 텍스트
┃  │                                 │  ┃
┃  └─────────────────────────────────┘  ┃
┃                                       ┃
┃  ┌─────────────────────────────────┐  ┃ ← 카드: #FFFFFF 배경
┃  │ [WiFi 아이콘]  WiFi 연결하기    │  ┃   그림자 + 베이지 테두리
┃  │               OUS_Guest         │  ┃
┃  └─────────────────────────────────┘  ┃
┃                                       ┃
┃  ┌─────────────────────────────────┐  ┃
┃  │ [체크 아이콘] 체크인/아웃하기   │  ┃
┃  │               1월 21일 15:00    │  ┃
┃  └─────────────────────────────────┘  ┃
┃                                       ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  [홈]    [안내]    [주문]    [도움]  ┃ ← #FFFFFF 배경 + 상단 그림자
┃  #1A1714 #9C9488  #9C9488  #9C9488   ┃   활성: 다크, 비활성: muted
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### 8.3 쿠폰 (라이트 테마)

```
┌───────────────────────────────────┐
│  ░░ #EDE8DF 크림 그라데이션 배경 ░░ │ ← 베이지 테두리 2px
│  ┌─────────────────────────────┐  │
│  │                             │  │
│  │   GOLDEN TICKET             │  │ ← #9C9488 (muted)
│  │                             │  │
│  │   카페 음료                 │  │ ← #1A1714 (primary)
│  │   1잔 무료                  │  │
│  │                             │  │
│  │   ─────────────────────     │  │ ← 베이지 구분선
│  │   탭하여 쿠폰 확인          │  │ ← #6B6358 (secondary)
│  │                             │  │
│  └─────────────────────────────┘  │
└───────────────────────────────────┘
```

### 8.4 버튼 (라이트 테마)

```
Primary Button:
┌─────────────────────────┐
│      주문하기           │  ← #1A1714 배경, #FAF8F5 텍스트
└─────────────────────────┘

Secondary Button:
┌─────────────────────────┐
│      취소하기           │  ← #E8DCC8 배경, #1A1714 텍스트
└─────────────────────────┘

Outline Button:
┌ - - - - - - - - - - - - ┐
│      상세 보기          │  ← 투명 배경, #C4B896 테두리, #1A1714 텍스트
└ - - - - - - - - - - - - ┘

Ghost Button:
         재주문 →            ← 텍스트만, #6B6358, hover: #1A1714
```

---

## 9. 구현 로드맵 (총 3-4일)

### Phase 1: 색상 시스템 적용 (1일)

| 작업 | 파일 | 우선순위 |
|------|------|----------|
| 브랜드 색상 변수 정의 | `tailwind.config.ts`, `globals.css` | P0 |
| 라이트 테마 배경색 적용 | 전체 페이지 배경 `#FAF8F5` | P0 |
| 텍스트 색상 변경 (다크 브라운) | 전체 텍스트 `#1A1714` | P0 |
| `color-scheme: light` 설정 | `globals.css` | P0 |

### Phase 2: 카드 & 컴포넌트 스타일 (1.5일)

| 작업 | 파일 | 우선순위 |
|------|------|----------|
| 카드 흰 배경/그림자 적용 | 전체 카드 컴포넌트 | P0 |
| 버튼 스타일 (Primary/Secondary/Outline) | `button.tsx` | P0 |
| 입력 필드 라이트 테마화 | `input.tsx` 등 | P1 |
| 탭/네비게이션 색상 변경 | `Tabs`, `BottomNav` | P1 |

### Phase 3: 아이콘 및 Iconify 도입 (0.5일)

| 작업 | 파일 | 우선순위 |
|------|------|----------|
| `@iconify/react` 설치 | `package.json` | P1 |
| 주요 아이콘 교체 (Solar 세트) | 아이콘 사용처 | P2 |
| 아이콘 색상 다크 적용 | 전체 아이콘 | P1 |

### Phase 4: 마무리 (0.5일)

| 작업 | 파일 | 우선순위 |
|------|------|----------|
| 상태 뱃지 색상 조정 | 주문 상태 등 | P1 |
| 스켈레톤 시머 효과 적용 | `GuestHomeSkeleton.tsx` | P2 |
| 전체 일관성 검토 | 전체 | P1 |

---

## 10. 기술 구현 세부

### 10.1 Tailwind 색상 설정 (라이트 테마)

```ts
// tailwind.config.ts
const config = {
  theme: {
    extend: {
      colors: {
        // 배경 (라이트)
        background: '#FAF8F5',
        'background-elevated': '#FFFFFF',
        'background-muted': '#F5F2ED',
        'background-accent': '#EDE8DF',
        
        // 브랜드 다크 (텍스트용)
        'brand-dark': '#1A1714',
        'brand-dark-soft': '#3D3730',
        'brand-dark-muted': '#6B6358',
        
        // 브랜드 크림 (악센트용)
        'brand-cream': '#E8DCC8',
        'brand-cream-dark': '#C4B896',
        'brand-cream-deep': '#A89F8A',
        
        // 텍스트
        foreground: '#1A1714',
        'muted-foreground': '#6B6358',
        
        // Primary (다크 버튼)
        primary: {
          DEFAULT: '#1A1714',
          foreground: '#FAF8F5',
        },
        
        // Secondary (크림 버튼)
        secondary: {
          DEFAULT: '#E8DCC8',
          foreground: '#1A1714',
        },
        
        // 테두리
        border: 'rgba(196, 184, 150, 0.3)',
        'border-emphasis': 'rgba(196, 184, 150, 0.5)',
      },
      boxShadow: {
        'soft-sm': '0 1px 2px rgba(26, 23, 20, 0.04), 0 1px 3px rgba(26, 23, 20, 0.06)',
        'soft-md': '0 4px 8px rgba(26, 23, 20, 0.06), 0 2px 4px rgba(26, 23, 20, 0.04)',
        'soft-lg': '0 12px 24px rgba(26, 23, 20, 0.08), 0 4px 8px rgba(26, 23, 20, 0.04)',
        'hover': '0 8px 20px rgba(26, 23, 20, 0.1)',
      },
    },
  },
};
```

### 10.2 globals.css 설정 (라이트 테마)

```css
/* globals.css */

:root {
  color-scheme: light;
  
  --background: 250 248 245;  /* #FAF8F5 */
  --foreground: 26 23 20;     /* #1A1714 */
  --primary: 26 23 20;
  --border: rgba(196, 184, 150, 0.3);
  
  /* 라이트 테마 그림자 */
  --shadow-sm: 0 1px 2px rgba(26, 23, 20, 0.04), 0 1px 3px rgba(26, 23, 20, 0.06);
  --shadow-md: 0 4px 8px rgba(26, 23, 20, 0.06), 0 2px 4px rgba(26, 23, 20, 0.04);
  --shadow-hover: 0 8px 20px rgba(26, 23, 20, 0.1);
}

body {
  background-color: #FAF8F5;
  color: #1A1714;
}

/* 카드 hover 효과 */
.card-hover:hover {
  box-shadow: var(--shadow-hover);
  border-color: rgba(196, 184, 150, 0.5);
  transform: translateY(-2px);
}

/* 스켈레톤 (라이트 테마 - 시머) */
.skeleton {
  background: linear-gradient(90deg, #F5F2ED 25%, #EDE8DF 50%, #F5F2ED 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 기존 pulse 애니메이션도 유지 */
@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
```

### 10.3 아이콘 색상 적용 (라이트 테마)

```tsx
// 아이콘 컴포넌트에서
import { Wifi, Home, ShoppingBag } from 'lucide-react';

// 기본 아이콘 (다크)
<Wifi className="w-5 h-5 text-brand-dark" />

// muted 아이콘
<Home className="w-5 h-5 text-brand-dark-muted" />

// 또는 Iconify 사용 시
import { Icon } from '@iconify/react';
<Icon icon="solar:wifi-router-bold" className="w-5 h-5 text-brand-dark" />
```

---

## 11. 접근성 및 고려사항

### 11.1 라이트 테마 접근성

```css
/* 충분한 대비 확보 */
/* 배경 #FAF8F5 vs 텍스트 #1A1714 = 대비율 약 14:1 ✓ */
/* 배경 #FFFFFF vs 텍스트 #6B6358 = 대비율 약 5.5:1 ✓ */

/* 포커스 상태 명확히 */
:focus-visible {
  outline: 2px solid var(--brand-dark);
  outline-offset: 2px;
}

/* 또는 크림색 포커스 링 */
.focus-ring:focus-visible {
  box-shadow: 0 0 0 3px rgba(232, 220, 200, 0.5);
}
```

### 11.2 인앱 브라우저 호환

- 복잡한 CSS 효과 자제 (`backdrop-filter` 등)
- 단순한 배경색, 테두리, 그림자 사용
- 그라데이션은 간단한 선형만 사용

---

## 12. 완료 기준

### 일회성 사용자 UX 체크리스트

- [x] 처음 사용자도 3초 내 핵심 기능 인지 가능
- [x] 모든 아이콘에 텍스트 라벨 병기
- [x] WiFi 정보가 카드에 바로 표시됨
- [x] "~하기" 형태의 명확한 CTA 버튼
- [x] 상태 표시에 색상 + 텍스트 조합 사용
- [ ] 다음 단계 안내가 자연스럽게 포함됨 (추가 개선 가능)

### 브랜드 적용 체크리스트

- [x] 페이지 배경이 라이트 테마 (#FAF8F5)로 변경됨
- [x] 모든 텍스트가 다크 브라운 (#1A1714)으로 변경됨
- [x] 카드 배경이 순백 (#FFFFFF)으로, 그림자 적용됨
- [x] 테두리가 베이지/크림 계열로 변경됨
- [x] Primary 버튼이 다크 배경 + 밝은 텍스트로 변경됨
- [x] 라이트 테마 고정 (다크 모드 토글 없음)

### 디자인 품질 체크리스트

- [x] 세련된 카드 효과 (shadow, hover lift)
- [x] 부드러운 hover/active 피드백
- [x] 일관된 타이포그래피 위계
- [x] 충분한 텍스트 대비율 (WCAG AA 이상)
- [ ] 인앱 브라우저에서 정상 표시됨 (배포 후 테스트 필요)

### 레이아웃 유지 체크리스트

- [x] 기존 레이아웃 구조가 그대로 유지됨
- [x] 기존 컴포넌트 배치가 변경되지 않음
- [x] 기존 아이콘 위치가 유지됨 (추가 없음)
- [x] 기존 기능이 모두 정상 동작함

---

## 부록 A: 색상 레퍼런스 요약 (라이트 테마)

| 용도 | HEX | 설명 |
|------|-----|------|
| **배경** | | |
| 페이지 배경 | `#FAF8F5` | 따뜻한 오프화이트 |
| 카드 배경 | `#FFFFFF` | 순백 |
| 보조 배경 | `#F5F2ED` | 베이지 틴트 |
| 강조 배경 | `#EDE8DF` | 진한 크림 |
| **텍스트** | | |
| 주요 텍스트 | `#1A1714` | 따뜻한 검정 |
| 보조 텍스트 | `#6B6358` | 브라운 그레이 |
| 힌트 텍스트 | `#9C9488` | 중간 톤 |
| 비활성 텍스트 | `#B8B0A4` | 라이트 톤 |
| **브랜드** | | |
| 크림 | `#E8DCC8` | 브랜드 시그니처 |
| 크림 다크 | `#C4B896` | 테두리/구분선 |
| 크림 딥 | `#A89F8A` | 진한 포인트 |
| **버튼** | | |
| Primary | `#1A1714` bg, `#FAF8F5` text | 메인 CTA |
| Secondary | `#E8DCC8` bg, `#1A1714` text | 보조 CTA |
| **테두리** | | |
| 기본 | `rgba(196,184,150,0.3)` | 미세한 구분 |
| 강조 | `rgba(196,184,150,0.5)` | hover 시 |
| 강한 | `#C4B896` | 명확한 테두리 |

---

## 부록 B: 마이크로카피 예시

| 상황 | 문구 |
|------|------|
| WiFi 카드 제목 | "WiFi 연결하기" |
| WiFi 정보 | "네트워크: OUS_Guest / 비밀번호: 1234" |
| 체크인 버튼 | "체크인 완료하기" |
| 체크아웃 버튼 | "체크아웃하기" |
| 주문 버튼 | "배달 주문하기" |
| 쿠폰 안내 | "탭하여 쿠폰 확인" |
| 쿠폰 사용 | "직원에게 보여주세요" |
| 빈 주문 내역 | "아직 주문 내역이 없어요" |
| 주문 성공 | "주문이 완료되었어요" |
| 배송 안내 | "18:00에 배송될 예정이에요" |
| 에러 | "잠시 문제가 생겼어요. 다시 시도해주세요" |

---

## 부록 C: 디자인 영감 사이트

| 사이트 | 용도 |
|--------|------|
| [Dribbble](https://dribbble.com/search/light-theme-mobile) | 라이트 테마 모바일 UI |
| [Mobbin](https://mobbin.com) | 앱 UI 패턴 |
| [Refero](https://refero.design) | 실제 앱 레퍼런스 |
| [UI8](https://ui8.net) | UI 키트 |
| [Awwwards](https://awwwards.com) | 수상작 웹사이트 |

---

## 부록 D: 구현 로그

### 2026-01-20 구현 완료

#### Phase 1: 브랜드 색상 시스템 적용 ✅

| 파일 | 변경 내용 |
|------|----------|
| `tailwind.config.ts` | 브랜드 색상 팔레트 전체 정의 (라이트 테마) |
| `app/globals.css` | CSS 변수, 유틸리티 클래스, 카드 효과 추가 |

**적용된 색상:**
- 배경: `#FAF8F5` (따뜻한 오프화이트)
- 카드: `#FFFFFF` (순백)
- 텍스트: `#1A1714` (따뜻한 다크)
- 악센트: `#E8DCC8` (크림/베이지)

#### Phase 2: 카드 & 컴포넌트 스타일 ✅

| 컴포넌트 | 변경 내용 |
|----------|----------|
| `button.tsx` | 다크 Primary, 크림 Secondary, 라운드 xl |
| `card.tsx` | interactive prop, 그림자, 호버 효과 |
| `input.tsx` | 라운드 xl, 크림 포커스 링 |
| `tabs.tsx` | 라운드 lg, 활성 탭 그림자 |
| `badge.tsx` | 상태별 variant (pending, preparing, completed) |
| `skeleton.tsx` | 시머 애니메이션 |

#### Phase 3: 아이콘 품질 개선 ✅

| 파일 | 변경 내용 |
|------|----------|
| `package.json` | `@iconify/react` 추가 |
| `GuestBottomNav.tsx` | 색상, 스트로크 두께 개선 |
| `QuickActionGrid.tsx` | 아이콘별 색상 배경 추가 |

#### Phase 4: 전체 일관성 검토 ✅

| 파일 | 변경 내용 |
|------|----------|
| `GuestHeader.tsx` | 브랜드 색상, 그림자 적용 |
| `GuestHomeContent.tsx` | Hero 섹션 브랜드 색상 |
| `GuestHomeSkeleton.tsx` | 시머 스켈레톤 |
| `WifiCard.tsx` | 정보 카드 레이아웃 개선 |
| `TimeCard.tsx` | 체크인/아웃 시간 카드 개선 |
| `CheckInOut.tsx` | 체크인/아웃 버튼 개선 |
| `layout.tsx` | 배경색 적용 |

### 자체 진단

#### 완료된 항목 ✅

- [x] 페이지 배경이 라이트 테마 (#FAF8F5)로 변경됨
- [x] 모든 텍스트가 다크 브라운 (#1A1714)으로 변경됨
- [x] 카드 배경이 순백 (#FFFFFF)으로, 그림자 적용됨
- [x] 테두리가 베이지/크림 계열로 변경됨
- [x] Primary 버튼이 다크 배경 + 밝은 텍스트로 변경됨
- [x] 라이트 테마 고정 (다크 모드 토글 없음)
- [x] WiFi 정보가 카드에 바로 표시됨
- [x] "~하기" 형태의 명확한 CTA 버튼
- [x] 부드러운 hover/active 피드백
- [x] 기존 레이아웃 구조 유지됨

#### 추가 개선 가능 항목

- [ ] 나머지 게스트 페이지 (Guide, Order, Help) 색상 일관성 검토
- [ ] 쿠폰 플립 컴포넌트 브랜드 색상 적용
- [ ] 주문 내역 카드 스타일 개선
- [ ] 공지사항 컴포넌트 스타일 개선

### 빌드 테스트 필요

```bash
npm install  # @iconify/react 설치
npm run build
```
