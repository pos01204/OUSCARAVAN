# 가이드 페이지 럭셔리 리팩토링 기획안

> **목표**: "전문가가 봤을 때 잘 만든 페이지"로 인식되도록  
> **컨셉**: 차분하고 고급스러운 호텔 컨시어지 느낌  
> **원칙**: 색보다 **레이어/여백/타이포/일관성**으로 품질 표현

---

## 1. 현재 상태 진단

### 1.1 시각적 문제점

| 영역 | 문제 | 영향 |
|------|------|------|
| **카테고리 아이콘** | 6가지 색상(info, teal, purple, orange, success, slate) 혼용 | 화려하고 산만함 |
| **BBQ 배너** | `orange-50 → amber-50` 그라데이션 + 오렌지 테두리 | 페이지에서 과도하게 튐 |
| **경고 배지** | `bg-amber-100 text-amber-700` 원색 | 유치한 느낌 |
| **카드 구조** | Card > CardContent > 여러 요소 중첩 | 복잡한 레이어 |
| **모션** | `GuestMotionCard` spring 효과 | 과한 애니메이션 |
| **탭 UI** | 다중 탭 + 아이콘 + 진한 배경 | 정보 과부하 |

### 1.2 구조적 문제점

- 카테고리 필터가 **스크롤 영역**에 있어 탐색 중 사라짐
- BBQ 배너와 일반 가이드 카드의 **디자인 언어가 불일치**
- 상세 인스펙터(InfoInspector)에서 **4개 탭** 동시 노출 → 인지 부하
- `contentTypes` 메타 정보(`단계별 · 체크리스트 · FAQ`)가 **눈에 띄지 않음**

---

## 2. 리팩토링 방향

### 2.1 디자인 시스템 통일

```
현재: 6가지 톤(info, teal, purple, orange, success, slate)
     ↓
목표: 2가지 톤(brand-cream 계열 + neutral)
     - 일반 카드: brand-cream-dark/20 배경
     - 강조 카드(BBQ): brand-cream/30 배경
     - 주의 표시: brand-dark + 아이콘으로 대체 (색상 X)
```

### 2.2 레이어 단순화

```
현재: Page > Section > Card > CardContent > IconBadge + Text
     ↓
목표: Page > Section > GuideRow (단일 레이어)
     - 중첩 카드 제거
     - 플랫한 행(row) 디자인
```

### 2.3 모션 절제

```
현재: whileHover + whileTap + spring 애니메이션
     ↓
목표: hover:bg-brand-cream/10 정도의 미세한 변화만
     - 과한 scale/translate 제거
     - transition-colors 150ms 정도로 제한
```

---

## 3. 컴포넌트별 리팩토링 상세

### 3.1 헤더 영역

**현재:**
```tsx
<header className="pb-6">
  <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
    이용 안내
  </h1>
</header>
```

**개선 (도움말 페이지와 동일한 브랜드 악센트 추가):**
```tsx
<header className="mb-8 mt-2">
  <h1 className="text-2xl font-semibold text-brand-dark tracking-tight">
    이용 안내
  </h1>
  <p className="mt-2 text-sm text-brand-dark-muted leading-relaxed">
    숙소 이용에 필요한 정보를 확인하세요.
  </p>
  {/* 브랜드 악센트 라인 */}
  <div className="mt-4 flex items-center gap-2">
    <div className="h-0.5 w-8 rounded-full bg-brand-cream-dark" />
    <div className="h-0.5 w-2 rounded-full bg-brand-cream" />
  </div>
</header>
```

### 3.2 카테고리 네비게이션

**현재:** 언더라인 스타일 탭

**개선:** 도움말 페이지 섹션 구조와 유사하게 **수직 스크롤 기반 구조**로 전환하거나, 필터를 **더 미니멀하게** 변경

```
옵션 A: 카테고리 필터 유지 (미니멀 버전)
┌─────────────────────────────────────┐
│ (전체)  체크인  실내  요리  규칙    │  ← 선택된 pill만 brand-cream 배경
└─────────────────────────────────────┘

옵션 B: 카테고리 제거, 섹션 기반 구조
│ 체크인/체크아웃 섹션 (HelpSection 재사용)
│ 실내 설비 섹션
│ 요리/BBQ 섹션
│ 규칙 섹션
```

**추천: 옵션 A** (기존 UX 유지하면서 스타일만 개선)

```tsx
// 미니멀 pill 스타일
<button
  className={cn(
    "shrink-0 px-3 py-1.5 text-sm rounded-full transition-all duration-200",
    isSelected
      ? "bg-brand-cream text-brand-dark font-medium"
      : "text-brand-dark-muted hover:text-brand-dark hover:bg-brand-cream/30"
  )}
>
  {category}
</button>
```

### 3.3 가이드 카드 (핵심 리팩토링)

**현재 구조:**
```
┌────────────────────────────────────────┐
│ [컬러 아이콘]  타이틀 [주의 배지]      │
│               설명 텍스트...           │
│               단계별 · 체크리스트 · FAQ│
│                                    →   │
└────────────────────────────────────────┘
```

**개선 구조 (플랫 & 미니멀):**
```
┌────────────────────────────────────────┐
│ ●  타이틀                          →   │  ← 작은 도트 인디케이터
│    설명 텍스트 (1줄)                   │
└────────────────────────────────────────┘

- 컬러 아이콘 배지 → 작은 neutral 도트
- 주의 배지 → 타이틀 뒤 (!) 아이콘으로 대체
- 메타 정보 → 숨김 (상세에서 확인)
- 전체적으로 더 낮은 정보 밀도
```

**코드:**
```tsx
function GuideRow({
  title,
  overview,
  warning,
  onClick,
}: {
  title: string;
  overview?: string;
  warning?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="
        w-full text-left
        flex items-center gap-3
        px-4 py-3.5
        rounded-xl border border-brand-cream-dark/25 bg-white
        hover:bg-brand-cream/15 hover:border-brand-cream-dark/40
        transition-all duration-200
        active:scale-[0.99] motion-reduce:transform-none
        group
      "
    >
      {/* 미니멀 인디케이터 */}
      <div className="w-2 h-2 rounded-full bg-brand-cream-dark/60 shrink-0" />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-brand-dark">
            {title}
          </span>
          {warning && (
            <WarningCircle 
              size={14} 
              weight="fill" 
              className="text-brand-dark-muted" 
            />
          )}
        </div>
        {overview && (
          <p className="text-xs text-brand-dark-muted mt-0.5 line-clamp-1">
            {overview}
          </p>
        )}
      </div>
      
      <CaretRight
        size={16}
        weight="regular"
        className="text-brand-dark-faint group-hover:text-brand-dark-muted transition-colors shrink-0"
      />
    </button>
  );
}
```

### 3.4 BBQ 하이라이트 배너

**현재:**
- 오렌지 그라데이션 배경
- 큰 아이콘 + "시작" 버튼
- 눈에 과하게 튐

**개선:**
```tsx
// 일반 GuideRow와 동일한 스타일 + 작은 강조 포인트만
<button
  onClick={() => setShowBBQCarousel(true)}
  className="
    w-full text-left
    flex items-center gap-3
    px-4 py-3.5
    rounded-xl border border-brand-cream-dark/30 bg-brand-cream/20
    hover:bg-brand-cream/30 hover:border-brand-cream-dark/50
    transition-all duration-200
    group
  "
>
  {/* 불꽃 아이콘 (차분한 톤) */}
  <div className="w-8 h-8 rounded-lg bg-white border border-brand-cream-dark/20 flex items-center justify-center">
    <Fire size={16} weight="duotone" className="text-brand-dark-soft" />
  </div>
  
  <div className="flex-1 min-w-0">
    <span className="text-sm font-semibold text-brand-dark">
      불멍/바베큐 가이드
    </span>
    <p className="text-xs text-brand-dark-muted mt-0.5">
      단계별 안내 · 약 5분 소요
    </p>
  </div>
  
  <span className="text-xs font-medium text-brand-dark-muted group-hover:text-brand-dark transition-colors">
    시작 →
  </span>
</button>
```

### 3.5 상세 인스펙터 (InfoInspector)

**현재 문제:**
- 4개 탭 동시 노출 (단계별, 체크, FAQ, 해결)
- 각 탭에 아이콘 포함
- 탭 배경이 진함

**개선:**
```
옵션 A: 탭 제거, 콘텐츠 순차 노출
┌────────────────────────────────────┐
│ [타이틀]                           │
│ [설명]                             │
│                                    │
│ ● 단계별 안내                       │  ← 섹션 헤더
│   1. ...                           │
│   2. ...                           │
│                                    │
│ ● 자주 묻는 질문                    │  ← 접힌 Accordion
│   ▸ 질문 1                         │
│   ▸ 질문 2                         │
└────────────────────────────────────┘

옵션 B: 탭 유지, 스타일 미니멀화
┌────────────────────────────────────┐
│ [타이틀]                           │
│                                    │
│  단계별  |  FAQ  |  해결            │  ← 아이콘 제거, 텍스트만
│  ───────                           │  ← 선택 인디케이터
└────────────────────────────────────┘
```

**추천: 옵션 A** (정보 밀도 낮추고 스캔 용이하게)

---

## 4. 삭제/간소화 대상

| 컴포넌트/기능 | 조치 | 이유 |
|--------------|------|------|
| `CardIconBadge` | 간소화 또는 제거 | 톤별 색상이 화려함의 원인 |
| `GuestMotionCard` | 제거 | spring 애니메이션 과함 |
| `card-hover-glow` 클래스 | 제거 | 글로우 효과 불필요 |
| `CATEGORY_STYLES` 색상 매핑 | 제거 | 모노톤으로 통일 |
| `contentTypes` 메타 | 숨김 | 정보 과부하 |
| 탭 아이콘 | 제거 | 텍스트만으로 충분 |

---

## 5. 추가 개선 사항 (고급 완성도)

### 5.1 스크롤 위치 저장
```ts
// 마지막으로 본 가이드 ID를 localStorage에 저장
// 재방문 시 "이어서 보기" 제공
localStorage.setItem('guide:last_viewed', guideId);
```

### 5.2 빈 상태 개선
```tsx
// 현재: Card + CardContent + 아이콘 + 버튼
// 개선: 심플한 메시지만
<div className="py-12 text-center">
  <p className="text-sm text-brand-dark-muted">
    해당 카테고리에 안내가 없습니다.
  </p>
  <button 
    onClick={() => setSelectedCategory('전체')}
    className="mt-3 text-sm font-medium text-brand-dark underline"
  >
    전체 보기
  </button>
</div>
```

### 5.3 로딩 상태 개선
```tsx
// 현재: 스피너 + "로딩 중..."
// 개선: 스켈레톤 UI (3~4개 row placeholder)
<div className="space-y-3">
  {[1, 2, 3, 4].map((i) => (
    <div key={i} className="h-16 rounded-xl bg-brand-cream/30 animate-pulse" />
  ))}
</div>
```

### 5.4 이벤트 로깅
```ts
// 도움말 페이지와 동일한 패턴
logGuideEvent('guide_view');
logGuideEvent('guide_category_change', { category });
logGuideEvent('guide_open', { id: guideId });
logGuideEvent('guide_bbq_start');
```

---

## 6. 목업 (Before → After)

### Before (현재)
```
┌──────────────────────────────────────┐
│ 이용 안내                            │
│                                      │
│ (전체) 실내 편의시설 규칙 요리 쓰레기 │
│  ─────                               │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │🔥 불멍/바베큐 가이드         시작 │ │  ← 오렌지 그라데이션
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ [🔵] 체크인/체크아웃              │ │  ← 컬러 아이콘
│ │      체크인: 오후 3시 ~       →   │ │
│ │      단계별 · 체크리스트          │ │  ← 메타 정보
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ [🟣] 난방/에어컨 [주의]           │ │  ← 경고 배지
│ │      컨트롤러 사용법...       →   │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

### After (개선)
```
┌──────────────────────────────────────┐
│ 이용 안내                            │
│ 숙소 이용에 필요한 정보를 확인하세요  │
│ ════                                 │  ← 브랜드 악센트 라인
│                                      │
│ (전체) 체크인 실내 요리 규칙          │  ← pill 스타일
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ | 불멍/바베큐 가이드               │ │  ← 브랜드 악센트 바
│ │   단계별 안내 · 약 5분        →    │ │
│ └──────────────────────────────────┘ │  ← 크림 톤 배경
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ ●  체크인/체크아웃            →   │ │  ← 심플 도트
│ │    체크인 오후 3시, 체크아웃 11시  │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ ●  난방/에어컨 (!)            →   │ │  ← 주의는 아이콘만
│ │    컨트롤러로 온도 설정           │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

---

## 7. 구현 우선순위

### Phase 1: 시각적 통일 (필수)
1. `CardIconBadge` → 미니멀 도트로 대체
2. `GuestMotionCard` → 일반 div + hover 스타일로 대체
3. BBQ 배너 → 브랜드 크림 톤으로 변경
4. 경고 배지 → 아이콘으로 대체
5. 헤더에 브랜드 악센트 라인 추가

### Phase 2: 구조 개선 (권장)
1. 카테고리 필터 → pill 스타일로 변경
2. 가이드 카드 → `GuideRow` 플랫 디자인
3. 상세 인스펙터 탭 → 텍스트만 또는 순차 노출

### Phase 3: 고급 기능 (선택)
1. 스크롤 위치/마지막 가이드 저장
2. 스켈레톤 로딩 UI
3. 이벤트 로깅 (`lib/guide-telemetry.ts`)

---

## 8. 예상 작업량

| Phase | 작업 | 예상 파일 수 |
|-------|------|-------------|
| Phase 1 | 스타일 변경 | 2~3개 |
| Phase 2 | 컴포넌트 구조 변경 | 3~5개 |
| Phase 3 | 신규 기능 추가 | 2~3개 |

---

## 9. 성공 기준

- [ ] 페이지에서 사용되는 컬러가 **brand-cream 계열 + neutral** 2가지 이하
- [ ] 카드 중첩이 **1레벨 이하**
- [ ] 애니메이션이 **hover 색상 변화만** 존재
- [ ] 도움말 페이지와 **동일한 디자인 언어** 사용
- [ ] 전문가가 봤을 때 **"정돈되어 있다"**고 느낄 수 있는 일관성

---

*작성일: 2026-01-25*  
*참조: 도움말 페이지 럭셔리 리팩토링 결과*
