# 도움말 페이지 디자인 고도화 계획

## 레퍼런스 조사 결과

### 1. 글로벌 앱 디자인 패턴

#### Airbnb
- **Trips Tab**: 일자별 스케줄을 시각적으로 표현
- **개인화된 홈페이지**: 목적지, 동행자 기반 추천
- **직관적인 카테고리**: 작업 기반 정보 구조화

#### Grab / Uber Emergency SOS
- **Shield 아이콘**: 안전 관련 기능의 상징적 아이콘
- **Safety Centre**: 별도의 안전 센터 개념
- **단계적 접근**: 일반 도움 → 긴급 상황 분리
- **자동 감지**: 이상 패턴 감지 시 자동 알림

#### HotelTonight
- **작업 기반 구조**: "My Bookings", "My Account" 등 사용자 관점 분류
- **다채널 지원**: 채팅, 이메일, 전화의 명확한 구분

### 2. 디자인 시스템 원칙

#### Apple iOS HIG
- **최소 터치 영역**: 44pt x 44pt
- **가독성**: 최소 11pt 텍스트
- **명확한 대비**: 텍스트와 배경 간 충분한 콘트라스트
- **일관된 타이포그래피**: SF Pro 계열

#### Material Design (Cards)
- **단일 주제 집중**: 카드당 하나의 주제
- **스캔 가능성**: 정보를 빠르게 훑을 수 있는 구조
- **명확한 상호작용**: 탭 가능 영역의 시각적 표현

#### Gravity UI / Joy UI
- **상태 표현**: 카드 배경/테두리로 상태(성공/경고/오류) 표시
- **다양한 변형**: outlined, plain, soft, solid
- **호버/포커스 상태**: 명확한 인터랙션 피드백

---

## 현재 디자인 문제점 분석

### 시각적 문제
```
1. 아이콘 크기/배치 불균형
   - 아이콘이 작고 약함 (h-5 w-5)
   - 아이콘 배경이 너무 연함 (bg-neutral-100)
   
2. 카드 깊이감 부족
   - border만 있고 shadow 없음
   - 평면적인 느낌
   
3. 색상 대비 부족
   - 응급 연락처인데 긴급함이 느껴지지 않음
   - 119/112가 일반 텍스트처럼 보임
   
4. 여백/간격 불규칙
   - 섹션 간 간격이 일정하지 않음
   - 패딩이 답답하거나 헐거움
   
5. 타이포그래피 위계 약함
   - 제목과 본문의 크기 차이가 작음
   - 숫자(119, 112)의 강조가 부족
```

### 기능적 문제
```
1. 긴급 vs 일반의 구분 없음
   - 119/112와 편의점이 같은 레벨
   
2. 응급 상황의 긴박감 부족
   - 레드/오렌지 등 경고색 미사용
   
3. FAB 버튼의 존재감
   - 화면에서 분리된 느낌
```

---

## 디자인 개선안

### 전체 컨셉: "Calm Emergency"
> 평소에는 차분하고 신뢰감 있게, 긴급 시에는 명확하고 빠르게

### 1. 응급 연락처 섹션 리디자인

#### AS-IS
```
┌─────────────────────────────────┐
│ 🔥 119                       → │  ← 평범한 리스트
│ 소방서 · 응급 구조              │
├─────────────────────────────────┤
│ 👮 112                       → │
│ 경찰서                         │
└─────────────────────────────────┘
```

#### TO-BE: "Emergency Cards" 패턴
```
┌─────────────────────────────────────────┐
│                                         │
│   🚨 긴급 연락처                         │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │ ╭─────────╮                     │   │
│   │ │  🔥     │   119               │   │ ← 큰 아이콘
│   │ │  call   │   소방서 · 응급 구조  │   │ ← 강조된 숫자
│   │ ╰─────────╯                     │   │
│   │                                 │   │
│   │   ━━━━━━━━━━━━━━━━━━━━━━━━━━━   │   │ ← 프로그레스 바 스타일
│   │   탭하여 즉시 전화              │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │ ╭─────────╮                     │   │
│   │ │  👮     │   112               │   │
│   │ │  call   │   경찰서            │   │
│   │ ╰─────────╯                     │   │
│   └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

#### 구체적 스타일
```tsx
// 긴급 카드 (119, 112)
<div className="
  relative overflow-hidden
  rounded-2xl 
  bg-gradient-to-br from-red-50 to-orange-50
  border border-red-200/60
  shadow-sm shadow-red-100/50
  p-5
  active:scale-[0.98] transition-transform
">
  {/* 배경 장식 */}
  <div className="absolute -right-4 -top-4 w-24 h-24 
    bg-red-100/40 rounded-full blur-2xl" />
  
  {/* 아이콘 */}
  <div className="
    w-14 h-14 rounded-xl 
    bg-red-500 
    flex items-center justify-center
    shadow-lg shadow-red-500/30
    mb-3
  ">
    <Flame className="h-7 w-7 text-white" />
  </div>
  
  {/* 번호 */}
  <p className="text-3xl font-black text-red-600 tracking-tight">119</p>
  <p className="text-sm text-red-700/70 mt-0.5">소방서 · 응급 구조</p>
  
  {/* CTA 힌트 */}
  <div className="mt-4 flex items-center gap-2 text-xs text-red-500/80">
    <div className="w-8 h-0.5 bg-red-300 rounded-full" />
    <span>탭하여 즉시 전화</span>
  </div>
</div>
```

### 2. 응급실/편의점 섹션 분리

```
┌─────────────────────────────────────────┐
│                                         │
│   📍 주변 시설                           │ ← 별도 섹션
│                                         │
│   ┌────────────────┐ ┌────────────────┐ │
│   │  🏥             │ │  🏪            │ │ ← 2열 그리드
│   │  응급실         │ │  편의점        │ │
│   │  강화의료원      │ │  가장 가까운   │ │
│   │       →        │ │       →       │ │
│   └────────────────┘ └────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

#### 구체적 스타일
```tsx
// 주변 시설 카드
<a className="
  flex flex-col
  p-4 rounded-xl
  bg-white
  border border-neutral-200
  shadow-sm
  hover:shadow-md hover:border-neutral-300
  transition-all
">
  <div className="
    w-11 h-11 rounded-lg
    bg-emerald-50
    flex items-center justify-center
    mb-3
  ">
    <Building2 className="h-5 w-5 text-emerald-600" />
  </div>
  
  <p className="font-semibold text-neutral-900">응급실</p>
  <p className="text-sm text-neutral-500 mt-0.5">인천강화의료원</p>
  
  <div className="mt-3 flex items-center text-xs text-neutral-400">
    <span>지도 보기</span>
    <ChevronRight className="h-3.5 w-3.5 ml-auto" />
  </div>
</a>
```

### 3. FAQ 섹션 리디자인

#### TO-BE: "Minimal Accordion" 패턴
```
┌─────────────────────────────────────────┐
│                                         │
│   ❓ 자주 묻는 질문                       │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │                                 │   │
│   │  체크인 시간은 언제인가요?        │   │ ← 깔끔한 타이포
│   │                            ＋   │   │ ← 미니멀 아이콘
│   │                                 │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │                                 │   │
│   │  바베큐/불멍은 어떻게 이용하나요?  │   │
│   │                            −   │   │ ← 열림 상태
│   │                                 │   │
│   │  ─────────────────────────────  │   │
│   │                                 │   │
│   │  주문하기 탭에서 원하시는 세트를  │   │ ← 부드러운 답변
│   │  선택하시면 원하시는 시간에       │   │
│   │  카라반으로 배송해 드립니다.      │   │
│   │                                 │   │
│   └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

#### 구체적 스타일
```tsx
<AccordionItem className="
  border-none
  bg-white rounded-xl
  shadow-sm
  mb-3
  overflow-hidden
">
  <AccordionTrigger className="
    px-5 py-4
    text-left
    font-medium text-neutral-800
    hover:bg-neutral-50
    data-[state=open]:bg-neutral-50
    [&[data-state=open]>svg]:rotate-45
  ">
    {question}
    <Plus className="h-4 w-4 shrink-0 text-neutral-400 transition-transform" />
  </AccordionTrigger>
  <AccordionContent className="
    px-5 pb-5 pt-0
    text-sm text-neutral-600 leading-relaxed
  ">
    {answer}
  </AccordionContent>
</AccordionItem>
```

### 4. 관리자 연락 섹션 리디자인

#### TO-BE: "Subtle Contact" 패턴
```
┌─────────────────────────────────────────┐
│                                         │
│   ┌─────────────────────────────────┐   │
│   │                                 │   │
│   │   💬  추가 문의가 필요하신가요?   │   │ ← 친근한 톤
│   │                                 │   │
│   │   관리자에게 연락하기            │   │
│   │   0507-1335-5154           →   │   │
│   │                                 │   │
│   └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

#### 구체적 스타일
```tsx
<a className="
  block
  p-5 rounded-2xl
  bg-neutral-100
  border border-neutral-200/50
  hover:bg-neutral-150
  transition-colors
">
  <div className="flex items-start gap-3">
    <div className="
      w-10 h-10 rounded-full
      bg-neutral-200
      flex items-center justify-center
    ">
      <MessageCircle className="h-5 w-5 text-neutral-500" />
    </div>
    
    <div className="flex-1">
      <p className="text-sm text-neutral-500 mb-1">
        추가 문의가 필요하신가요?
      </p>
      <p className="font-semibold text-neutral-800">
        관리자에게 연락하기
      </p>
      <p className="text-sm text-neutral-600 mt-1">
        0507-1335-5154
      </p>
    </div>
    
    <ChevronRight className="h-5 w-5 text-neutral-400 mt-2" />
  </div>
</a>
```

---

## 색상 시스템

### 긴급도별 색상 매핑

| 긴급도 | 용도 | Primary | Background | Border |
|--------|------|---------|------------|--------|
| **Critical** | 119, 112 | `red-500` | `red-50` | `red-200` |
| **Warning** | 응급실 | `amber-500` | `amber-50` | `amber-200` |
| **Info** | 편의점, FAQ | `neutral-600` | `white` | `neutral-200` |
| **Subtle** | 관리자 연락 | `neutral-500` | `neutral-100` | `neutral-200` |

### 그라데이션 활용

```css
/* 긴급 카드 배경 */
.emergency-card {
  background: linear-gradient(135deg, 
    theme('colors.red.50') 0%, 
    theme('colors.orange.50') 100%
  );
}

/* 경찰 카드 배경 */
.police-card {
  background: linear-gradient(135deg, 
    theme('colors.blue.50') 0%, 
    theme('colors.indigo.50') 100%
  );
}
```

---

## 애니메이션 & 인터랙션

### 1. 카드 프레스 효과
```tsx
className="active:scale-[0.98] transition-transform duration-150"
```

### 2. 아코디언 전환
```tsx
// 질문 아이콘 회전
className="[&[data-state=open]>svg]:rotate-45 transition-transform"

// 답변 슬라이드
className="data-[state=open]:animate-accordion-down 
           data-[state=closed]:animate-accordion-up"
```

### 3. FAB 펄스 효과
```tsx
<div className="
  animate-ping absolute inset-0 
  bg-red-400 rounded-full opacity-20
" />
```

---

## 타이포그래피 시스템

| 요소 | 크기 | 두께 | 행간 |
|------|------|------|------|
| 페이지 타이틀 | `text-2xl` (24px) | `font-bold` | `leading-tight` |
| 섹션 타이틀 | `text-lg` (18px) | `font-bold` | `leading-snug` |
| 긴급 번호 | `text-3xl` (30px) | `font-black` | `tracking-tight` |
| 카드 타이틀 | `text-base` (16px) | `font-semibold` | `leading-normal` |
| 본문 | `text-sm` (14px) | `font-normal` | `leading-relaxed` |
| 힌트/캡션 | `text-xs` (12px) | `font-normal` | `leading-normal` |

---

## 간격 시스템

```
페이지 패딩: px-4 (16px)
섹션 간격: space-y-8 (32px)
카드 내부: p-5 (20px)
아이템 간격: gap-3 (12px)
텍스트 간격: mt-1 ~ mt-2
```

---

## 전체 레이아웃 목업

```
┌─────────────────────────────────────────┐
│            OUSCARAVAN                   │
├─────────────────────────────────────────┤
│                                         │
│   도움말                                 │ ← 타이틀
│   자주 묻는 질문과                        │
│   응급 연락처를 확인하세요                 │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│   🚨 긴급 연락처                         │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │  🔥                             │   │
│   │  119                            │   │ ← 그라데이션 카드
│   │  소방서 · 응급 구조              │   │    (red-50 to orange-50)
│   │  ━━━ 탭하여 즉시 전화            │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │  👮                             │   │
│   │  112                            │   │ ← 그라데이션 카드
│   │  경찰서                         │   │    (blue-50 to indigo-50)
│   │  ━━━ 탭하여 즉시 전화            │   │
│   └─────────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│   📍 주변 시설                           │
│                                         │
│   ┌──────────────┐ ┌──────────────┐     │
│   │ 🏥            │ │ 🏪           │     │ ← 2열 그리드
│   │ 응급실        │ │ 편의점       │     │
│   │ 강화의료원    │ │ 가장 가까운  │     │
│   └──────────────┘ └──────────────┘     │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│   ❓ 자주 묻는 질문                       │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │ 체크인 시간은 언제인가요?      ＋ │   │ ← 개별 카드
│   └─────────────────────────────────┘   │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │ 바베큐/불멍은 어떻게 이용하나요? − │   │
│   │ ─────────────────────────────── │   │
│   │ 주문하기 탭에서 원하시는 세트를  │   │
│   │ 선택하시면...                   │   │
│   └─────────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│   ┌─────────────────────────────────┐   │
│   │ 💬 추가 문의가 필요하신가요?     │   │ ← 관리자 연락
│   │    관리자에게 연락하기          │   │    (회색 배경)
│   │    0507-1335-5154          →   │   │
│   └─────────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│  🏠    📖    🔥    ☕    ❓            │
│  홈    안내   불멍   카페  도움말        │
└─────────────────────────────────────────┘
```

---

## 구현 우선순위

### Phase 1: 긴급 연락처 카드
1. EmergencyCard 컴포넌트 생성 (그라데이션 + 큰 아이콘)
2. 119/112 분리 카드화
3. 프레스 애니메이션 추가

### Phase 2: 주변 시설 그리드
1. NearbyFacilities 컴포넌트 생성
2. 응급실/편의점 2열 그리드
3. 호버/프레스 효과

### Phase 3: FAQ 개별 카드화
1. Accordion 스타일 오버라이드
2. 개별 카드 + 그림자
3. Plus/Minus 아이콘 전환

### Phase 4: 관리자 연락 리디자인
1. 회색 배경 + 둥근 카드
2. MessageCircle 아이콘
3. 친근한 문구

---

## 아이콘 라이브러리

### 선정: Phosphor Icons

기본 Lucide 아이콘 대신 **Phosphor Icons**를 사용하여 더 세련된 디자인을 구현합니다.

#### 선정 이유

| 항목 | Phosphor Icons |
|------|----------------|
| 아이콘 수 | 9,072+ |
| 스타일 | 6종 (thin, light, regular, bold, fill, **duotone**) |
| Duotone | ✅ 두 가지 톤으로 깊이감 표현 |
| Tree-shaking | ✅ 번들 최적화 |
| React 지원 | @phosphor-icons/react |

#### 설치
```bash
npm install @phosphor-icons/react
```

#### 활용 예시
```tsx
import { 
  FirstAidKit,    // 응급 (duotone: 빨강)
  ShieldCheck,    // 경찰 (duotone: 파랑)
  Hospital,       // 응급실
  Storefront,     // 편의점
  Question,       // FAQ
  ChatCircle,     // 관리자 연락
  Phone           // 전화
} from "@phosphor-icons/react";

// Duotone 스타일 - 깊이감 있는 아이콘
<FirstAidKit 
  size={28} 
  weight="duotone" 
  className="text-red-500"
/>

// Fill 스타일 - 강조
<ShieldCheck 
  size={28} 
  weight="fill" 
  className="text-blue-500"
/>
```

#### 아이콘 매핑

| 용도 | Lucide (기존) | Phosphor (신규) | Weight |
|------|--------------|-----------------|--------|
| 소방/응급 | `Flame` | `FirstAidKit` | duotone |
| 경찰 | `Shield` | `ShieldCheck` | duotone |
| 응급실 | `Building2` | `Hospital` | duotone |
| 편의점 | `Store` | `Storefront` | duotone |
| FAQ | `HelpCircle` | `Question` | regular |
| 관리자 연락 | `MessageCircle` | `ChatCircle` | regular |
| 전화 | `Phone` | `Phone` | fill |
| 화살표 | `ChevronRight` | `CaretRight` | bold |

---

## 참고 레퍼런스

1. **Grab Emergency SOS** - 긴급 연락처의 시각적 강조
2. **Uber Safety Centre** - Shield 아이콘, 단계적 접근
3. **Airbnb Help Centre** - 작업 기반 정보 구조
4. **Apple iOS HIG** - 터치 영역, 타이포그래피
5. **Material Design Cards** - 카드 깊이감, 그림자
6. **Gravity UI** - 상태별 카드 색상
7. **Phosphor Icons** - 세련된 duotone 스타일 아이콘

---

## 예상 개선 효과

| 항목 | Before | After |
|------|--------|-------|
| 긴급함 전달 | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| 시각적 위계 | ⭐⭐ | ⭐⭐⭐⭐ |
| 탭 유도성 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 전문성 | ⭐⭐ | ⭐⭐⭐⭐ |
| 브랜드 일관성 | ⭐⭐⭐ | ⭐⭐⭐⭐ |
