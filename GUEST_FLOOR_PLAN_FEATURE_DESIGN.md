# 고객 페이지 약도 표시 기능 설계 문서 (반응형 컴포넌트 기반)

## 📋 목차
1. [목적 및 배경](#목적-및-배경)
2. [기능 요구사항](#기능-요구사항)
3. [기술 스택 및 구현 방식](#기술-스택-및-구현-방식)
4. [약도 구조 분석](#약도-구조-분석)
5. [UI/UX 설계](#uiux-설계)
6. [데이터 구조](#데이터-구조)
7. [구현 단계](#구현-단계)
8. [고려사항](#고려사항)
9. [향후 확장 가능성](#향후-확장-가능성)

---

## 1. 목적 및 배경

### 1.1 비즈니스 목적
- **문제점**: 특정 호수(예: "9호")에 대한 부정적 리뷰가 올라올 경우, 해당 호수로 배정받은 고객이 민원을 제기할 수 있음
- **해결책**: 호수 대신 약도(Floor Plan)를 통해 배정된 공간을 시각적으로 표시하여, 고객이 자신의 공간을 직관적으로 확인할 수 있도록 함
- **효과**: 
  - 호수 기반 민원 감소
  - 고객 만족도 향상 (시각적 정보 제공)
  - 브랜드 이미지 개선 (프리미엄 서비스 경험)
  - **재사용성**: 약도 컴포넌트를 관리자 페이지, 예약 페이지 등에서도 활용 가능

### 1.2 사용자 시나리오
1. 관리자가 고객에게 방을 배정하고 체크인 처리
2. 고객이 고객 페이지에 접속
3. 고객이 환영 메시지 섹션에서 약도를 확인
4. 약도에서 자신이 배정받은 공간이 하이라이트되어 표시됨
5. 고객이 자신의 공간 위치를 직관적으로 파악

---

## 2. 기능 요구사항

### 2.1 핵심 기능
- ✅ **반응형 약도 컴포넌트**: SVG 기반으로 모든 화면 크기에서 최적화
- ✅ **배정 공간 하이라이트**: 고객이 배정받은 공간을 시각적으로 강조
- ✅ **반응형 디자인**: 모바일/태블릿/데스크톱 모든 화면 크기에서 완벽한 표시
- ✅ **인터랙티브 UI**: 호버, 클릭 등 인터랙션 지원
- ✅ **접근성**: 스크린 리더 지원 및 키보드 네비게이션
- ✅ **재사용성**: 관리자 페이지, 예약 페이지 등에서도 활용 가능

### 2.2 표시 조건
- **표시 시점**: 체크인 완료 후 (`isCheckedIn === true`)
- **표시 위치**: 환영 메시지 섹션 하단 또는 별도 카드 섹션
- **대체 표시**: 체크인 전이거나 배정되지 않은 경우, 약도 대신 "객실: {assignedRoom}" 텍스트 표시

### 2.3 비기능 요구사항
- **성능**: 가벼운 렌더링 (SVG는 벡터 기반으로 빠름)
- **유지보수성**: 코드로 관리되어 버전 관리 용이
- **확장성**: 새로운 공간 추가 시 코드 수정만으로 가능
- **재사용성**: 다양한 페이지에서 동일 컴포넌트 활용

---

## 3. 기술 스택 및 구현 방식

### 3.1 구현 방식 비교

#### 옵션 1: SVG 기반 React 컴포넌트 (✅ 추천)

**장점**:
- ✅ **완벽한 반응형**: 모든 화면 크기에서 자동 조정
- ✅ **확대 시 품질 유지**: 벡터 기반으로 선명함
- ✅ **인터랙션 용이**: React 이벤트 핸들러 직접 연결
- ✅ **접근성 향상**: 각 공간에 `aria-label` 추가 가능
- ✅ **코드로 관리**: 버전 관리 및 협업 용이
- ✅ **재사용성**: Props로 다양한 설정 전달 가능
- ✅ **성능**: 이미지 로딩 불필요, 즉시 렌더링
- ✅ **커스터마이징**: 테마, 색상 등 쉽게 변경

**단점**:
- 초기 구현 시간 소요 (이미지보다)
- 복잡한 디자인일 경우 코드가 길어질 수 있음

**사용 사례**: 반응형이 중요하고 재사용성이 필요한 경우

#### 옵션 2: 이미지 + CSS Overlay
**장점**: 빠른 구현
**단점**: 반응형 구현 복잡, 확대 시 품질 저하, 재사용성 낮음

#### 옵션 3: Canvas 기반
**장점**: 복잡한 그래픽 처리 가능
**단점**: 접근성 문제, 반응형 구현 복잡, SEO 불리

### 3.2 최종 선택: **SVG 기반 React 컴포넌트**

**선택 이유**:
1. **반응형 자동 지원**: `viewBox` 속성으로 모든 화면 크기 대응
2. **재사용성**: Props로 다양한 설정 전달
3. **유지보수성**: 코드로 관리되어 변경 용이
4. **성능**: 이미지 로딩 불필요
5. **확장성**: 새로운 공간 추가 시 코드만 수정

**구현 방식**:
- React 컴포넌트로 SVG 구조 정의
- `viewBox`로 반응형 구현
- 각 공간을 `<rect>` 또는 `<path>`로 정의
- 배정된 공간은 조건부 스타일링으로 하이라이트

---

## 4. 약도 구조 분석

### 4.1 약도 레이아웃 분석

약도는 그리드 형태의 레이아웃으로 구성되어 있습니다:

```
┌─────────────────────────────────────────┐
│  [공간1]  [공간2]  [공간3]  [공간4]     │
│                                         │
│  [공간5]  [공간6]  [공간7]  [공간8]     │
│                                         │
│  [공간9]  [공간10] [공간11] [공간12]    │
│                                         │
│  [공간13] [공간14] [공간15] [공간16]    │
└─────────────────────────────────────────┘
```

**특징**:
- 그리드 형태의 정렬된 레이아웃
- 각 공간은 독립적인 영역
- 공간 간 일정한 간격
- 전체적으로 균형잡힌 배치

### 4.2 공간 식별 방식

**현재 시스템**:
- 호수 기반: "1호", "2호", ..., "9호", "10호"
- 또는 알파벳+숫자: "A1", "A2", "B1", "B2"

**약도 매핑**:
- `assignedRoom` 값 (예: "9호", "A1")을 약도 컴포넌트의 공간 ID와 매핑
- 매핑 테이블로 관리하여 유연성 확보

---

## 5. UI/UX 설계

### 5.1 레이아웃

```
┌─────────────────────────────────────┐
│     환영 메시지 섹션 (Hero)          │
│   {고객명}님, 환영합니다.            │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│     약도 카드 (Floor Plan Card)      │
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  │   [SVG 약도 컴포넌트]          │  │
│  │   ┌─────┐ ┌─────┐ ┌─────┐   │  │
│  │   │  1  │ │  2  │ │  3  │   │  │
│  │   └─────┘ └─────┘ └─────┘   │  │
│  │   ┌─────┐ ┌─────┐ ┌─────┐   │  │
│  │   │  4  │ │  5  │ │  6  │   │  │
│  │   └─────┘ └─────┘ └─────┘   │  │
│  │   ┌─────┐ ┌─────┐ ┌─────┐   │  │
│  │   │  7  │ │  8  │ │[9] │ ←  │  │
│  │   └─────┘ └─────┘ └─────┘   │  │
│  │   (빨간 테두리 = 배정 공간)   │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│  "당신의 공간" (텍스트 표시)        │
└─────────────────────────────────────┘
```

### 5.2 컴포넌트 구조

```
components/
├── guest/
│   └── FloorPlanCard.tsx          # 약도 카드 컴포넌트
└── features/
    └── FloorPlanViewer.tsx         # SVG 기반 약도 뷰어 (재사용 가능)
        └── FloorPlanSVG.tsx        # SVG 구조 정의
```

### 5.3 시각적 디자인

**약도 카드**:
- 배경: 흰색 카드 (`Card` 컴포넌트)
- 패딩: 모바일 `p-4`, 데스크톱 `p-6`
- 테두리: `border border-border rounded-lg`
- 그림자: `shadow-sm`

**일반 공간**:
- 배경: `bg-gray-50` 또는 `bg-white`
- 테두리: `border border-gray-300`
- 텍스트: 공간 번호 (예: "9호", "A1")
- 호버: `hover:bg-gray-100` (선택사항)

**배정 공간 하이라이트**:
- 배경: `bg-red-50` 또는 `bg-primary/10`
- 테두리: `border-2 border-red-500` 또는 `border-primary`
- 텍스트: 굵게 표시
- 애니메이션: 펄스 효과 (선택사항)
- 레이블: "당신의 공간" 또는 "Your Space"

**반응형**:
- 모바일: 전체 너비, 세로 스크롤
- 태블릿: 최대 너비 768px, 중앙 정렬
- 데스크톱: 최대 너비 1024px, 중앙 정렬
- SVG `viewBox`로 자동 비율 유지

### 5.4 인터랙션

**기본**:
- 약도 표시
- 배정 공간 하이라이트
- 호버 시 공간 정보 툴팁 (선택사항)

**향후 확장 가능**:
- 클릭으로 공간 상세 정보 표시
- 확대/축소 (Zoom In/Out)
- 팬 (Pan) - 드래그로 이동
- 핀치 제스처 (모바일)

---

## 6. 데이터 구조

### 6.1 공간 정의 인터페이스

```typescript
// types/floorPlan.ts
export interface FloorPlanSpace {
  id: string;              // 공간 식별자 (예: "9", "A1", "room-9")
  name: string;            // 공간 이름 (표시용, 예: "9호", "A1")
  displayName: string;     // 표시 이름 (예: "9호")
  coordinates: {
    x: number;             // SVG 좌표 (viewBox 기준)
    y: number;             // SVG 좌표 (viewBox 기준)
    width: number;         // 너비
    height: number;        // 높이
  };
  // 또는 path로 정의 (복잡한 형태의 경우)
  // path?: string;        // SVG path 데이터
}

export interface FloorPlanConfig {
  viewBox: string;         // SVG viewBox (예: "0 0 800 600")
  spaces: FloorPlanSpace[]; // 공간 목록
  grid?: {
    columns: number;       // 그리드 열 수
    rows: number;         // 그리드 행 수
    gap: number;          // 공간 간 간격
  };
}
```

### 6.2 예약 데이터 연동

```typescript
// Reservation 인터페이스에 이미 포함됨
interface Reservation {
  // ... 기존 필드
  assignedRoom: string;    // "A1", "A2", "9호" 등
  // ... 기존 필드
}
```

### 6.3 약도 설정 파일

```typescript
// lib/constants/floorPlan.ts
export const FLOOR_PLAN_CONFIG: FloorPlanConfig = {
  viewBox: "0 0 800 600",  // SVG 뷰포트 크기
  grid: {
    columns: 4,            // 4열 그리드
    rows: 4,               // 4행 그리드
    gap: 20,               // 공간 간 간격 (픽셀)
  },
  spaces: [
    {
      id: '1',
      name: '1호',
      displayName: '1호',
      coordinates: { x: 20, y: 20, width: 180, height: 130 },
    },
    {
      id: '2',
      name: '2호',
      displayName: '2호',
      coordinates: { x: 220, y: 20, width: 180, height: 130 },
    },
    // ... 모든 공간 정의
    {
      id: '9',
      name: '9호',
      displayName: '9호',
      coordinates: { x: 20, y: 170, width: 180, height: 130 },
    },
    // ... 나머지 공간들
  ],
};

// assignedRoom → spaceId 매핑
export const ROOM_TO_SPACE_MAP: Record<string, string> = {
  '1호': '1',
  '2호': '2',
  // ... 모든 호수 매핑
  '9호': '9',
  '10호': '10',
  'A1': '1',
  'A2': '2',
  // ... 알파벳+숫자 형식 매핑
};
```

---

## 7. 구현 단계

### Phase 1: SVG 기반 약도 컴포넌트 구현 (2-3일)

**작업 내용**:
1. 약도 설정 파일 생성
   - `lib/constants/floorPlan.ts` 생성
   - 모든 공간 좌표 정의
   - `ROOM_TO_SPACE_MAP` 매핑 테이블 생성
2. `FloorPlanSVG` 컴포넌트 구현
   - SVG 구조 정의
   - `viewBox`로 반응형 구현
   - 각 공간을 `<rect>`로 렌더링
   - 공간 번호 텍스트 표시
3. `FloorPlanViewer` 컴포넌트 구현
   - `FloorPlanSVG` 래핑
   - Props로 배정 공간 ID 전달
   - 하이라이트 로직 구현
4. `FloorPlanCard` 컴포넌트 구현
   - 카드 레이아웃
   - `FloorPlanViewer` 통합
   - "당신의 공간" 텍스트 표시
5. `GuestHomeContent`에 통합
   - 체크인 후에만 표시
   - 환영 메시지 섹션 하단 배치

**파일 목록**:
- `lib/constants/floorPlan.ts` (신규)
- `types/floorPlan.ts` (신규)
- `components/features/FloorPlanSVG.tsx` (신규)
- `components/features/FloorPlanViewer.tsx` (신규)
- `components/guest/FloorPlanCard.tsx` (신규)
- `components/guest/GuestHomeContent.tsx` (수정)

### Phase 2: 하이라이트 및 스타일링 (1일)

**작업 내용**:
1. 배정 공간 하이라이트 구현
   - 조건부 스타일링 (`isAssigned` prop)
   - 빨간 테두리 및 반투명 배경
   - 텍스트 굵게 표시
2. 스타일 개선
   - 호버 효과 (선택사항)
   - 부드러운 전환 애니메이션
   - 반응형 텍스트 크기
3. 접근성 개선
   - `aria-label` 추가
   - `role` 속성 설정
   - 키보드 네비게이션 (선택사항)

**파일 목록**:
- `components/features/FloorPlanSVG.tsx` (수정)
- `components/features/FloorPlanViewer.tsx` (수정)

### Phase 3: 인터랙션 및 최적화 (1-2일)

**작업 내용**:
1. 인터랙션 추가 (선택사항)
   - 호버 시 공간 정보 툴팁
   - 클릭 이벤트 핸들러
2. 성능 최적화
   - `useMemo`로 공간 필터링 최적화
   - `useCallback`으로 이벤트 핸들러 최적화
   - 불필요한 리렌더링 방지
3. 애니메이션 추가 (선택사항)
   - 펄스 효과 (배정 공간)
   - 페이드인 효과 (약도 로드 시)

**파일 목록**:
- `components/features/FloorPlanViewer.tsx` (수정)
- `components/guest/FloorPlanCard.tsx` (수정)

### Phase 4: 재사용성 및 확장 (1일)

**작업 내용**:
1. 관리자 페이지 통합 (선택사항)
   - 예약 관리 페이지에서 약도 표시
   - 방 배정 시 약도에서 선택
2. 공간 상세 정보 표시 (선택사항)
   - 공간별 시설 정보
   - 공간별 사진
3. 문서화
   - 컴포넌트 사용법
   - 새로운 공간 추가 가이드
   - Props 문서

**파일 목록**:
- `components/features/FloorPlanViewer.tsx` (수정)
- `app/admin/reservations/[id]/page.tsx` (수정, 선택사항)

### Phase 5: 테스트 및 문서화 (1일)

**작업 내용**:
1. 반응형 테스트
   - 모바일 (350px, 375px, 414px)
   - 태블릿 (768px, 1024px)
   - 데스크톱 (1280px, 1920px)
2. 브라우저 호환성 테스트
   - Chrome, Safari, Firefox, Edge
3. 접근성 테스트
   - 스크린 리더 테스트
   - 키보드 네비게이션 테스트

---

## 8. 고려사항

### 8.1 SVG 좌표 시스템

**viewBox 사용**:
- `viewBox="0 0 800 600"` 형식으로 정의
- 실제 픽셀 크기와 무관하게 비율 유지
- `width="100%"` `height="auto"`로 반응형 구현

**좌표 계산**:
- 그리드 기반 계산으로 일관성 유지
- 공간 간 간격(`gap`) 고려
- 중앙 정렬을 위한 오프셋 계산

### 8.2 성능 최적화

**렌더링 최적화**:
- `useMemo`로 공간 필터링 결과 캐싱
- `useCallback`으로 이벤트 핸들러 최적화
- 불필요한 리렌더링 방지 (`React.memo` 사용 가능)

**SVG 최적화**:
- 불필요한 요소 제거
- 그룹화 (`<g>`)로 구조화
- `defs`로 공통 스타일 정의

### 8.3 접근성

**스크린 리더 지원**:
- 각 공간에 `aria-label`: "공간 {name}, {배정 여부}"
- 배정된 공간: "공간 {name}, 당신의 공간"
- 전체 약도: `role="img"` `aria-label="약도"`

**키보드 네비게이션** (선택사항):
- Tab 키로 각 공간 포커스
- Enter/Space로 상세 정보 표시

### 8.4 에러 처리

**배정 공간 없음**:
- `assignedRoom`이 없는 경우 약도만 표시
- 또는 "객실: {assignedRoom}" 텍스트 표시

**매핑 데이터 없음**:
- `assignedRoom`이 `ROOM_TO_SPACE_MAP`에 없는 경우
- 약도는 표시하되 하이라이트 없음
- 콘솔 경고 메시지

### 8.5 재사용성

**Props 설계**:
```typescript
interface FloorPlanViewerProps {
  assignedSpaceId?: string;    // 배정된 공간 ID
  onSpaceClick?: (spaceId: string) => void;  // 공간 클릭 핸들러
  showLabels?: boolean;         // 공간 번호 표시 여부
  interactive?: boolean;        // 인터랙션 활성화 여부
  theme?: 'light' | 'dark';    // 테마 (향후 확장)
}
```

**다양한 사용 사례**:
- 고객 페이지: 배정 공간 하이라이트
- 관리자 페이지: 모든 공간 표시, 배정 상태 표시
- 예약 페이지: 예약 가능한 공간 표시

---

## 9. 향후 확장 가능성

### 9.1 인터랙션 기능
- 확대/축소 (Zoom In/Out)
- 팬 (Pan) - 드래그로 이동
- 핀치 제스처 (모바일)
- 공간 클릭 시 상세 정보 모달

### 9.2 추가 정보 표시
- 공간별 시설 정보 (예: "해안가 뷰", "야외 테라스")
- 공간별 사진 갤러리
- 공간별 리뷰 요약
- 공간별 가격 정보

### 9.3 관리자 기능
- 약도에서 직접 방 배정
- 실시간 배정 상태 표시
- 공간별 통계 정보

### 9.4 테마 및 커스터마이징
- 다크 모드 지원
- 색상 테마 변경
- 레이아웃 변경 (그리드 → 리스트 등)

---

## 10. 구현 예시 코드

### 10.1 FloorPlanSVG 컴포넌트

```typescript
// components/features/FloorPlanSVG.tsx
'use client';

import { FLOOR_PLAN_CONFIG } from '@/lib/constants/floorPlan';
import type { FloorPlanSpace } from '@/types/floorPlan';

interface FloorPlanSVGProps {
  assignedSpaceId?: string;
  onSpaceClick?: (spaceId: string) => void;
  showLabels?: boolean;
}

export function FloorPlanSVG({
  assignedSpaceId,
  onSpaceClick,
  showLabels = true,
}: FloorPlanSVGProps) {
  const { viewBox, spaces } = FLOOR_PLAN_CONFIG;

  return (
    <svg
      viewBox={viewBox}
      className="w-full h-auto"
      role="img"
      aria-label="약도"
      preserveAspectRatio="xMidYMid meet"
    >
      {spaces.map((space) => {
        const isAssigned = space.id === assignedSpaceId;
        
        return (
          <g key={space.id}>
            <rect
              x={space.coordinates.x}
              y={space.coordinates.y}
              width={space.coordinates.width}
              height={space.coordinates.height}
              fill={isAssigned ? 'rgba(239, 68, 68, 0.1)' : '#f9fafb'}
              stroke={isAssigned ? '#ef4444' : '#d1d5db'}
              strokeWidth={isAssigned ? 3 : 1}
              className={onSpaceClick ? 'cursor-pointer hover:opacity-80' : ''}
              onClick={() => onSpaceClick?.(space.id)}
              aria-label={`공간 ${space.displayName}${isAssigned ? ', 당신의 공간' : ''}`}
            />
            {showLabels && (
              <text
                x={space.coordinates.x + space.coordinates.width / 2}
                y={space.coordinates.y + space.coordinates.height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-sm font-medium ${isAssigned ? 'font-bold fill-red-600' : 'fill-gray-700'}`}
              >
                {space.displayName}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
```

### 10.2 FloorPlanViewer 컴포넌트

```typescript
// components/features/FloorPlanViewer.tsx
'use client';

import { FloorPlanSVG } from './FloorPlanSVG';
import { ROOM_TO_SPACE_MAP } from '@/lib/constants/floorPlan';

interface FloorPlanViewerProps {
  assignedRoom?: string;
  onSpaceClick?: (spaceId: string) => void;
  showLabels?: boolean;
  interactive?: boolean;
}

export function FloorPlanViewer({
  assignedRoom,
  onSpaceClick,
  showLabels = true,
  interactive = false,
}: FloorPlanViewerProps) {
  // assignedRoom을 spaceId로 변환
  const assignedSpaceId = assignedRoom
    ? ROOM_TO_SPACE_MAP[assignedRoom] || undefined
    : undefined;

  return (
    <div className="w-full">
      <FloorPlanSVG
        assignedSpaceId={assignedSpaceId}
        onSpaceClick={interactive ? onSpaceClick : undefined}
        showLabels={showLabels}
      />
    </div>
  );
}
```

### 10.3 FloorPlanCard 컴포넌트

```typescript
// components/guest/FloorPlanCard.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FloorPlanViewer } from '@/components/features/FloorPlanViewer';

interface FloorPlanCardProps {
  assignedRoom?: string;
}

export function FloorPlanCard({ assignedRoom }: FloorPlanCardProps) {
  if (!assignedRoom) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>배정된 공간</CardTitle>
        <CardDescription>약도에서 당신의 공간을 확인하세요</CardDescription>
      </CardHeader>
      <CardContent>
        <FloorPlanViewer assignedRoom={assignedRoom} showLabels={true} />
        <p className="mt-4 text-center text-sm font-medium text-primary">
          당신의 공간
        </p>
      </CardContent>
    </Card>
  );
}
```

---

## 11. 예상 소요 시간

- **Phase 1**: 2-3일 (SVG 컴포넌트 구현)
- **Phase 2**: 1일 (하이라이트 및 스타일링)
- **Phase 3**: 1-2일 (인터랙션 및 최적화)
- **Phase 4**: 1일 (재사용성 및 확장)
- **Phase 5**: 1일 (테스트 및 문서화)

**총 예상 시간**: 6-8일

---

## 12. 참고 자료

### SVG 관련
- [MDN: SVG Tutorial](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial)
- [SVG viewBox 설명](https://css-tricks.com/scale-svg/)
- [React + SVG Best Practices](https://www.robinwieruch.de/react-svg/)

### 접근성
- [WAI-ARIA: img role](https://www.w3.org/TR/wai-aria-1.1/#img)
- [SVG Accessibility](https://www.sitepoint.com/tips-accessible-svg/)

### 성능 최적화
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [SVG Optimization](https://jakearchibald.github.io/svgomg/)

---

**작성일**: 2026-01-XX  
**작성자**: AI Assistant  
**버전**: 2.0 (반응형 컴포넌트 기반)  
**상태**: 설계 완료, 구현 대기
