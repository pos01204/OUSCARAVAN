# 페이지 헤더 디자인 통일 제안서

## 📋 현재 상태 분석

현재 4개 페이지의 헤더가 모두 다른 스타일을 사용하고 있습니다:

| 페이지 | 제목 크기 | 설명 | 악센트 | 배경 구분 |
|--------|----------|------|--------|----------|
| 이용 안내 | `text-xl` | ✅ | 크림 라인 | ❌ |
| 불멍/BBQ | `text-2xl bold` | ❌ | ❌ | ❌ |
| 카페 | 없음 (히어로만) | - | - | - |
| 도움말 | `text-2xl bold` | ✅ | 크림 라인 | ❌ |

---

## 🎨 헤더 디자인 제안

### Option A: 미니멀 클린 헤더

가장 심플한 형태. BBQ 페이지 스타일 기반.

```
┌─────────────────────────────────────────┐
│                                         │
│  이용 안내                              │
│                                         │
│  ─────────────────────────────────────  │ ← 얇은 구분선
│                                         │
│  [전체] [실내] [편의시설] [규칙] [요리]  │
│                                         │
└─────────────────────────────────────────┘
```

**특징:**
- 제목만 표시 (`text-2xl font-bold`)
- 하단에 얇은 구분선으로 헤더 영역 명확히 구분
- 설명 텍스트 없음 → 깔끔함

**코드:**
```tsx
<header className="pb-4 border-b border-neutral-200/60">
  <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
    이용 안내
  </h1>
</header>
```

**장점:** 깔끔, 일관성 유지 쉬움, 공간 효율적  
**단점:** 페이지 설명이 없어 맥락 파악 어려울 수 있음

---

### Option B: 제목 + 설명 헤더

제목과 간단한 설명을 포함. 현재 도움말 페이지 스타일 기반.

```
┌─────────────────────────────────────────┐
│                                         │
│  이용 안내                              │
│  숙소 이용에 필요한 정보를 확인하세요.  │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  [전체] [실내] [편의시설] [규칙] [요리]  │
│                                         │
└─────────────────────────────────────────┘
```

**특징:**
- 제목 (`text-2xl font-bold`)
- 설명 (`text-sm text-neutral-500`)
- 하단 구분선

**코드:**
```tsx
<header className="pb-4 border-b border-neutral-200/60">
  <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
    이용 안내
  </h1>
  <p className="mt-1.5 text-sm text-neutral-500">
    숙소 이용에 필요한 정보를 확인하세요.
  </p>
</header>
```

**장점:** 페이지 목적 명확, 사용자 친화적  
**단점:** 공간 약간 더 사용

---

### Option C: 배경 구분 헤더 ⭐ 추천

배경색으로 헤더 영역을 시각적으로 확실히 구분.

```
┌─────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░                                   ░░ │
│ ░░  이용 안내                        ░░ │
│ ░░  숙소 이용에 필요한 정보를 확인하세요. ░░ │
│ ░░                                   ░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                         │
│  [전체] [실내] [편의시설] [규칙] [요리]  │
│                                         │
└─────────────────────────────────────────┘
```

**특징:**
- 헤더 영역에 subtle한 배경색 (`bg-neutral-50` 또는 `bg-brand-cream/10`)
- 제목 + 설명 포함
- 전체 너비로 확장 (`-mx-4 px-4`)
- 명확한 영역 구분

**코드:**
```tsx
<header className="-mx-4 px-4 py-5 bg-neutral-50 border-b border-neutral-200/60">
  <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
    이용 안내
  </h1>
  <p className="mt-1.5 text-sm text-neutral-500">
    숙소 이용에 필요한 정보를 확인하세요.
  </p>
</header>
```

**장점:** 헤더 영역 명확히 구분, 페이지 구조 직관적, 고급스러운 느낌  
**단점:** 약간의 추가 공간 사용

---

### Option D: 좌측 악센트 바 헤더

도움말 페이지의 섹션 스타일을 헤더에 적용.

```
┌─────────────────────────────────────────┐
│                                         │
│  ▌ 이용 안내                            │
│    숙소 이용에 필요한 정보를 확인하세요. │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  [전체] [실내] [편의시설] [규칙] [요리]  │
│                                         │
└─────────────────────────────────────────┘
```

**특징:**
- 제목 좌측에 세로 악센트 바 (`w-1 h-7 bg-brand-cream-dark rounded-full`)
- 브랜드 컬러 강조
- 하단 구분선

**코드:**
```tsx
<header className="pb-4 border-b border-neutral-200/60">
  <div className="flex items-start gap-3">
    <div className="w-1 h-7 mt-1 rounded-full bg-brand-cream-dark" />
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
        이용 안내
      </h1>
      <p className="mt-1.5 text-sm text-neutral-500">
        숙소 이용에 필요한 정보를 확인하세요.
      </p>
    </div>
  </div>
</header>
```

**장점:** 브랜드 아이덴티티 강조, 시선 유도  
**단점:** 다소 복잡해 보일 수 있음

---

### Option E: 하단 그라데이션 라인 헤더

하단에 브랜드 컬러 그라데이션 라인으로 구분.

```
┌─────────────────────────────────────────┐
│                                         │
│  이용 안내                              │
│  숙소 이용에 필요한 정보를 확인하세요.  │
│                                         │
│  ════════════════════                   │ ← 그라데이션 라인
│                                         │
│  [전체] [실내] [편의시설] [규칙] [요리]  │
│                                         │
└─────────────────────────────────────────┘
```

**특징:**
- 제목 + 설명
- 하단에 브랜드 그라데이션 라인 (`bg-gradient-to-r from-brand-cream-dark to-brand-cream`)
- 전체 너비가 아닌 부분 너비 (약 40%)

**코드:**
```tsx
<header className="pb-4">
  <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
    이용 안내
  </h1>
  <p className="mt-1.5 text-sm text-neutral-500">
    숙소 이용에 필요한 정보를 확인하세요.
  </p>
  <div className="mt-4 h-0.5 w-2/5 rounded-full bg-gradient-to-r from-brand-cream-dark to-brand-cream/50" />
</header>
```

**장점:** 세련된 느낌, 브랜드 컬러 활용  
**단점:** 현재 가이드 페이지와 유사 (이미 적용됨)

---

### Option F: 전체 너비 구분선 + 심플 헤더

BBQ 스타일의 심플함 + 명확한 구분.

```
┌─────────────────────────────────────────┐
│                                         │
│  이용 안내                              │
│                                         │
│ ═══════════════════════════════════════ │ ← 전체 너비 구분선
│                                         │
│  [전체] [실내] [편의시설] [규칙] [요리]  │
│                                         │
└─────────────────────────────────────────┘
```

**특징:**
- 제목만 (`text-2xl font-bold`)
- 하단에 전체 너비 구분선 (`-mx-4`)
- 설명 없음

**코드:**
```tsx
<header className="pb-4">
  <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
    이용 안내
  </h1>
</header>
<div className="-mx-4 border-b border-neutral-200" />
```

**장점:** 매우 깔끔, BBQ 스타일과 유사  
**단점:** 맥락 정보 부족

---

## 📊 옵션 비교표

| 옵션 | 심플함 | 브랜드 표현 | 영역 구분 | 정보량 | 추천도 |
|------|--------|------------|----------|--------|--------|
| A. 미니멀 클린 | ⭐⭐⭐ | ⭐ | ⭐⭐ | ⭐ | ★★★☆☆ |
| B. 제목+설명 | ⭐⭐ | ⭐ | ⭐⭐ | ⭐⭐⭐ | ★★★★☆ |
| **C. 배경 구분** | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ★★★★★ |
| D. 좌측 악센트 | ⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ★★★☆☆ |
| E. 그라데이션 | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ★★★★☆ |
| F. 전체 구분선 | ⭐⭐⭐ | ⭐ | ⭐⭐⭐ | ⭐ | ★★★☆☆ |

---

## 🎯 페이지별 적용 예시 (Option C 기준)

### 이용 안내 페이지
```
┌─────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░  이용 안내                        ░░ │
│ ░░  숙소 이용에 필요한 정보를 확인하세요. ░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                         │
│  [전체] [실내] [편의시설] [규칙] [요리]  │
└─────────────────────────────────────────┘
```

### 불멍/바베큐 페이지
```
┌─────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░  불멍 / 바베큐                     ░░ │
│ ░░  바베큐와 불멍을 주문하고 즐겨보세요. ░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                         │
│  [주문하기]  [사용 가이드]  [내 주문]   │
└─────────────────────────────────────────┘
```

### 카페 페이지
```
┌─────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░  카페                             ░░ │
│ ░░  여유로운 한 잔의 시간을 즐겨보세요. ░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🖼️ 히어로 이미지                │   │
└──┴─────────────────────────────────┴───┘
```

### 도움말 페이지
```
┌─────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░  도움말                           ░░ │
│ ░░  자주 묻는 질문과 긴급 연락처를 한 곳에. ░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                         │
│  ▌ 긴급 연락처                          │
└─────────────────────────────────────────┘
```

---

## 🔧 공통 헤더 컴포넌트 제안

재사용 가능한 공통 헤더 컴포넌트:

```tsx
// components/shared/PageHeader.tsx

interface PageHeaderProps {
  title: string;
  description?: string;
  variant?: 'simple' | 'background' | 'accent';
}

export function PageHeader({ 
  title, 
  description, 
  variant = 'background' 
}: PageHeaderProps) {
  if (variant === 'simple') {
    return (
      <header className="pb-4 border-b border-neutral-200/60">
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm text-neutral-500">{description}</p>
        )}
      </header>
    );
  }

  if (variant === 'background') {
    return (
      <header className="-mx-4 px-4 py-5 bg-neutral-50 border-b border-neutral-200/60 mb-4">
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm text-neutral-500">{description}</p>
        )}
      </header>
    );
  }

  // variant === 'accent'
  return (
    <header className="pb-4 border-b border-neutral-200/60">
      <div className="flex items-start gap-3">
        <div className="w-1 h-7 mt-1 rounded-full bg-brand-cream-dark" />
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 text-sm text-neutral-500">{description}</p>
          )}
        </div>
      </div>
    </header>
  );
}
```

**사용 예시:**
```tsx
// 이용 안내 페이지
<PageHeader 
  title="이용 안내" 
  description="숙소 이용에 필요한 정보를 확인하세요."
  variant="background"
/>

// 불멍/BBQ 페이지
<PageHeader 
  title="불멍 / 바베큐" 
  description="바베큐와 불멍을 주문하고 즐겨보세요."
  variant="background"
/>
```

---

## ✅ 권장 사항

### 1순위 추천: **Option C (배경 구분 헤더)**

**이유:**
- 헤더 영역이 **시각적으로 명확히 구분**됨
- 제목 + 설명으로 **페이지 맥락 제공**
- **모든 페이지에 일관되게 적용** 가능
- neutral 톤으로 **브랜드 컬러와 충돌 없음**
- **고급스럽고 정돈된** 느낌

### 2순위 추천: **Option B (제목+설명 헤더)**

**이유:**
- 배경 구분이 부담스러울 경우 대안
- 간단하면서도 정보 제공
- 하단 구분선으로 영역 구분

---

## 🚀 구현 우선순위

1. **공통 PageHeader 컴포넌트 생성**
2. **BBQPageContent** - 헤더 교체
3. **GuestGuideContent** - 헤더 교체
4. **GuestHelpContent** - 헤더 교체
5. **카페 페이지** - 헤더 추가 (히어로 위에)

선택하신 옵션을 알려주시면 바로 구현 작업을 진행하겠습니다.
