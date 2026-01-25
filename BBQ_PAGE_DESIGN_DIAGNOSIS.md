# 불멍/BBQ 페이지 디자인 진단

## 📋 개요

불멍/BBQ 페이지(`/guest/[token]/order`)의 디자인이 최근 리팩토링된 도움말/가이드 페이지와 **심각한 불일치**를 보이고 있습니다. 이 문서는 현재 문제점을 진단하고 개선 방향을 제시합니다.

---

## 🔍 현재 상태 vs 목표 디자인 시스템

### 1. 헤더 영역

| 항목 | BBQ 페이지 (현재) | 가이드/도움말 페이지 (목표) |
|------|-------------------|----------------------------|
| 제목 스타일 | `text-2xl font-bold` | `text-xl font-semibold` |
| 설명 텍스트 | 없음 | `text-xs text-brand-dark-muted` |
| 브랜드 악센트 | ❌ 없음 | ✅ 크림색 라인 2개 (인라인) |
| 마진 | `pb-4` | `mb-3 mt-1` |

**문제점:**
- 브랜드 아이덴티티 요소(악센트 라인) 부재
- 헤더 구조가 다른 페이지와 완전히 다름

```tsx
// 현재 BBQ 헤더
<header className="pb-4">
  <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
    불멍 / 바베큐
  </h1>
</header>

// 목표 (가이드 페이지 스타일)
<header className="mb-3 mt-1">
  <div className="flex items-center justify-between">
    <h1 className="text-xl font-semibold text-brand-dark tracking-tight">
      불멍 / 바베큐
    </h1>
    <div className="flex items-center gap-1.5">
      <div className="h-0.5 w-6 rounded-full bg-brand-cream-dark" />
      <div className="h-0.5 w-1.5 rounded-full bg-brand-cream" />
    </div>
  </div>
  <p className="mt-1 text-xs text-brand-dark-muted">
    바베큐와 불멍을 주문하고 즐겨보세요.
  </p>
</header>
```

---

### 2. 탭 네비게이션

| 항목 | BBQ 페이지 (현재) | 가이드 페이지 (목표) |
|------|-------------------|---------------------|
| 스타일 | Underline (밑줄) | Pill (알약형 버튼) |
| 배경색 | 없음 | `bg-brand-cream/30` |
| 선택 상태 | 밑줄 `bg-brand-dark` | `bg-brand-cream` |
| 높이 | `py-3` | `min-h-[36px]` |
| 하단 경계선 | ✅ 있음 | ❌ 없음 |

**문제점:**
- 탭 스타일이 완전히 다름 (Underline vs Pill)
- 터치 타겟 크기 불충분
- 브랜드 색상 미적용

```tsx
// 현재 BBQ 탭 (Underline)
<button className={cn(
  "relative flex-1 py-3 text-sm font-medium",
  isActive ? "text-brand-dark" : "text-muted-foreground"
)}>
  {tab.label}
  {isActive && (
    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-brand-dark rounded-full" />
  )}
</button>

// 목표 (Pill 스타일)
<button className={cn(
  "shrink-0 px-3 py-1.5 min-h-[36px] text-xs rounded-full",
  isActive
    ? "bg-brand-cream text-brand-dark font-medium"
    : "bg-brand-cream/30 text-brand-dark-muted"
)}>
  {tab.label}
</button>
```

---

### 3. 색상 시스템

| 요소 | BBQ 페이지 (현재) | 목표 디자인 시스템 |
|------|-------------------|-------------------|
| 아이콘 색상 | `text-amber-500`, `text-indigo-400` | `text-brand-dark-soft` |
| 카드 배경 | `bg-white`, `bg-neutral-50` | `bg-white`, `bg-brand-cream/15` |
| 카드 테두리 | `border-neutral-200/80` | `border-brand-cream-dark/25` |
| 악센트 라인 | `bg-amber-500`, `bg-indigo-400` | `bg-brand-cream-dark` |
| 버튼 배경 | `bg-neutral-900` | `bg-brand-dark` |
| 배경 영역 | `bg-neutral-50 border-neutral-200/60` | `bg-brand-cream/10 border-brand-cream-dark/20` |

**문제점:**
- `amber`, `indigo`, `neutral` 계열 색상이 브랜드와 충돌
- 전체적으로 "차가운" 느낌 vs 목표의 "따뜻한 크림톤"

---

### 4. 상품 카드 (BBQSetCard)

#### 현재 문제점:
```tsx
// 현재 스타일
<div className="relative bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-sm">
  {/* 상단 악센트 라인 - amber/indigo */}
  <div className={`absolute top-0 left-6 right-6 h-[2px] ${accentColor} rounded-full`} />
  
  {/* 아이콘 - amber/indigo */}
  <Icon className={`h-4 w-4 ${type === 'bbq' ? 'text-amber-500' : 'text-indigo-400'}`} />
  
  {/* CTA 버튼 - 검은색 */}
  <Button className="rounded-full bg-neutral-900 text-white">
```

#### 목표 스타일:
```tsx
// 개선된 스타일
<div className="relative bg-white rounded-xl border border-brand-cream-dark/25 p-4">
  {/* 아이콘 - 브랜드 톤 */}
  <div className="w-9 h-9 rounded-lg bg-brand-cream/20 border border-brand-cream-dark/20 
                  flex items-center justify-center">
    <Icon className="h-4 w-4 text-brand-dark-soft" />
  </div>
  
  {/* CTA 버튼 - 브랜드 다크 */}
  <Button className="rounded-full bg-brand-dark text-white">
```

---

### 5. 히어로 섹션 (BBQHero)

| 항목 | 현재 | 개선 방향 |
|------|------|----------|
| 존재 여부 | 있음 (큰 이미지) | 유지하되 톤 조절 |
| 텍스트 색상 | `text-amber-200/80` | `text-brand-cream` |
| 그라데이션 | 검은색 기반 | 브랜드 다크 기반으로 조정 |

**히어로 섹션은 BBQ 페이지의 특성상 유지하되, 브랜드 톤으로 조정 필요**

---

### 6. 안내 카드 및 버튼

#### 배송 안내 카드
```tsx
// 현재
<div className="rounded-xl bg-neutral-50 border border-neutral-200/80 p-4">
  <div className="w-9 h-9 rounded-lg bg-neutral-100">
    <Truck className="text-neutral-500" />

// 목표
<div className="rounded-xl bg-brand-cream/15 border border-brand-cream-dark/25 p-4">
  <div className="w-9 h-9 rounded-lg bg-white border border-brand-cream-dark/20">
    <Truck className="text-brand-dark-muted" />
```

#### 사용 가이드 버튼
```tsx
// 현재 - 검은 배경
<button className="w-full rounded-xl bg-neutral-900 hover:bg-neutral-800">
  <div className="w-9 h-9 rounded-lg bg-white/10">
    <HelpCircle className="text-white/80" />
  </div>
  <p className="font-semibold text-white">처음이신가요?</p>
</button>

// 목표 - 브랜드 배경
<button className="w-full rounded-xl bg-brand-dark hover:bg-brand-dark-soft">
  <div className="w-9 h-9 rounded-lg bg-brand-cream/20">
    <HelpCircle className="text-brand-cream" />
  </div>
  <p className="font-semibold text-white">처음이신가요?</p>
</button>
```

---

### 7. 가이드 탭 (BBQGuideTab)

| 요소 | 현재 | 목표 |
|------|------|------|
| Card 배경 | 기본 Card 스타일 | `border-brand-cream-dark/25` |
| 진행률 바 | `bg-brand-dark`, `bg-muted` | `bg-brand-cream-dark`, `bg-brand-cream/30` |
| Step 배지 | `bg-muted/60` | `bg-brand-cream/30` |
| 경고 박스 | `bg-muted/40 border-border` | `bg-brand-cream/15 border-brand-cream-dark/25` |
| Accordion | `border rounded-xl bg-white` | `border-brand-cream-dark/20 bg-white` |
| 문의 안내 | `bg-muted/30 border-border` | `bg-brand-cream/15 border-brand-cream-dark/25` |

---

### 8. 주문 시트 (BBQOrderSheet)

| 요소 | 현재 | 목표 |
|------|------|------|
| 시간 선택 활성 | `bg-brand-dark` | ✅ 유지 |
| 시간 선택 비활성 | `bg-muted/40` | `bg-brand-cream/30` |
| textarea focus | `ring-brand-dark/20` | ✅ 유지 |
| CTA 버튼 | `bg-brand-dark` | ✅ 유지 |

---

## 📊 불일치 심각도 평가

| 컴포넌트 | 심각도 | 영향도 |
|----------|--------|--------|
| BBQPageContent (헤더) | 🔴 높음 | 첫인상, 브랜드 인지 |
| BBQTabNav (탭) | 🔴 높음 | UX 일관성 |
| BBQSetCard (상품 카드) | 🔴 높음 | 핵심 전환 요소 |
| BBQHero (히어로) | 🟡 중간 | 페이지 특성상 허용 |
| BBQOrderTab (안내 영역) | 🔴 높음 | 전체 색상 불일치 |
| BBQGuideTab (가이드) | 🟡 중간 | 색상 조정 필요 |
| BBQOrderSheet (주문 시트) | 🟢 낮음 | 대부분 브랜드 톤 적용됨 |

---

## 🎯 개선 우선순위

### Phase 1: 즉시 수정 (High Impact)
1. **BBQPageContent** - 헤더 스타일 통일
2. **BBQTabNav** - Pill 스타일로 변경
3. **BBQSetCard** - 색상 시스템 적용, 악센트 제거

### Phase 2: 색상 통일
4. **BBQOrderTab** - 안내 카드/버튼 색상 변경
5. **BBQHero** - 텍스트 색상 조정
6. **BBQGuideTab** - 전체 색상 시스템 적용

### Phase 3: 세부 조정
7. **BBQOrderSheet** - 비활성 상태 색상 조정
8. **BBQHistoryTab** - 색상 시스템 적용 (추가 확인 필요)

---

## 🎨 색상 매핑 가이드

| 현재 사용 색상 | 변경 대상 |
|---------------|----------|
| `text-amber-500` | `text-brand-dark-soft` |
| `text-indigo-400` | `text-brand-dark-soft` |
| `bg-amber-500` | `bg-brand-cream-dark` |
| `bg-indigo-400` | `bg-brand-cream` |
| `bg-neutral-50` | `bg-brand-cream/15` |
| `bg-neutral-100` | `bg-brand-cream/20` |
| `border-neutral-200` | `border-brand-cream-dark/25` |
| `text-neutral-500` | `text-brand-dark-muted` |
| `text-neutral-400` | `text-brand-dark-faint` |
| `text-neutral-800` | `text-brand-dark` |
| `text-neutral-900` | `text-brand-dark` |
| `bg-neutral-900` | `bg-brand-dark` |
| `text-muted-foreground` | `text-brand-dark-muted` |
| `bg-muted` | `bg-brand-cream/20` |
| `bg-muted/40` | `bg-brand-cream/15` |
| `border-border` | `border-brand-cream-dark/20` |

---

## 📝 예상 수정 파일

1. `components/guest/bbq/BBQPageContent.tsx` - 헤더
2. `components/guest/bbq/BBQTabNav.tsx` - 탭 네비게이션
3. `components/guest/bbq/order/BBQSetCard.tsx` - 상품 카드
4. `components/guest/bbq/order/BBQHero.tsx` - 히어로 섹션
5. `components/guest/bbq/order/BBQOrderTab.tsx` - 주문 탭
6. `components/guest/bbq/guide/BBQGuideTab.tsx` - 가이드 탭
7. `components/guest/bbq/order/BBQOrderSheet.tsx` - 주문 시트
8. `components/guest/bbq/history/BBQHistoryTab.tsx` - 히스토리 탭

---

## ✅ 목표

- **디자인 일관성**: 모든 고객 페이지가 동일한 "Quiet Luxury" 브랜드 톤 유지
- **색상 통일**: `brand-cream`, `brand-dark` 시스템으로 완전 전환
- **UX 일관성**: 탭, 카드, 버튼의 인터랙션 패턴 통일
- **모바일 최적화**: 터치 타겟 크기 유지 (min-h-[36px] ~ min-h-[52px])
