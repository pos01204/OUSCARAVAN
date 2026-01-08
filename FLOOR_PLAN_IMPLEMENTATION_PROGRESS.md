# 약도 기능 구현 진행 상황

## 📋 작업 개요

고객 페이지에서 배정된 공간을 약도로 확인할 수 있는 기능을 구현 중입니다.

---

## ✅ Phase 1: 기본 컴포넌트 구현 (완료)

### 1. FloorPlanSVG 컴포넌트
**파일**: `components/features/FloorPlanSVG.tsx`

**구현 내용**:
- SVG 기반 약도 렌더링
- `viewBox`로 반응형 구현
- 각 공간을 `<rect>`로 렌더링
- 공간 번호 텍스트 표시
- 배정된 공간 하이라이트 (빨간 테두리, 반투명 배경)
- 배정된 공간에 "당신의 공간" 레이블 표시
- 그리드 배경 패턴 추가
- 호버 효과 및 전환 애니메이션

**주요 기능**:
- `assignedSpaceId` prop으로 배정된 공간 하이라이트
- `showLabels` prop으로 공간 번호 표시/숨김
- `onSpaceClick` prop으로 인터랙션 지원 (향후 확장)

### 2. FloorPlanViewer 컴포넌트
**파일**: `components/features/FloorPlanViewer.tsx`

**구현 내용**:
- `FloorPlanSVG` 래핑 컴포넌트
- `assignedRoom` (예: "1호")을 `spaceId` (예: "1")로 변환
- `ROOM_TO_SPACE_MAP` 매핑 테이블 활용
- Props 전달 및 인터페이스 제공

### 3. FloorPlanCard 컴포넌트
**파일**: `components/guest/FloorPlanCard.tsx`

**구현 내용**:
- 카드 레이아웃으로 약도 표시
- `assignedRoom`이 있고 `isCheckedIn`이 true일 때만 표시
- MapPin 아이콘 추가
- "당신의 공간" 레이블 및 인디케이터
- 반응형 패딩 (모바일/데스크톱)

### 4. GuestHomeContent 통합
**파일**: `components/guest/GuestHomeContent.tsx`

**구현 내용**:
- `FloorPlanCard` 컴포넌트 import
- Time Countdown 하단에 약도 카드 배치
- `reservation.assignedRoom`이 있을 때만 표시

---

## 🎨 스타일링

### 배정된 공간 하이라이트
- **배경**: `rgba(239, 68, 68, 0.15)` (반투명 빨간색)
- **테두리**: `#ef4444` (빨간색), `strokeWidth: 3`
- **그림자**: `drop-shadow(0 2px 4px rgba(239, 68, 68, 0.3))`
- **텍스트**: 빨간색, 굵게
- **애니메이션**: 펄스 효과 (인디케이터)

### 일반 공간
- **배경**: `#ffffff` (흰색)
- **테두리**: `#d1d5db` (회색), `strokeWidth: 1.5`
- **텍스트**: 회색, 중간 굵기

### 반응형
- SVG `viewBox`로 자동 비율 유지
- `width="100%"` `height="auto"`로 반응형 구현
- 모바일/태블릿/데스크톱 모든 화면 크기 대응

---

## ⚠️ 주의사항

### 약도 좌표 조정 필요
현재 `lib/constants/floorPlan.ts`의 좌표는 예시 값입니다. 실제 약도 이미지에 맞춰 다음을 조정해야 합니다:

1. **viewBox**: 실제 약도 크기에 맞게 조정
2. **각 공간의 coordinates**: 실제 약도에서 공간 위치에 맞게 조정
3. **그리드 설정**: 실제 레이아웃에 맞게 columns, rows, gap 조정

**조정 방법**:
- 실제 약도 이미지를 참고하여 각 공간의 위치를 픽셀 단위로 측정
- `viewBox`를 약도 이미지 크기에 맞게 설정
- 각 공간의 `x`, `y`, `width`, `height`를 실제 위치에 맞게 조정

---

## 📁 생성된 파일

1. `components/features/FloorPlanSVG.tsx` - SVG 약도 컴포넌트
2. `components/features/FloorPlanViewer.tsx` - 약도 뷰어 래퍼
3. `components/guest/FloorPlanCard.tsx` - 약도 카드 컴포넌트
4. `types/floorPlan.ts` - 타입 정의 (이미 생성됨)
5. `lib/constants/floorPlan.ts` - 약도 설정 (이미 생성됨)

---

## 🔄 수정된 파일

1. `components/guest/GuestHomeContent.tsx` - 약도 카드 통합

---

## 📝 다음 단계

1. **약도 좌표 조정**: 실제 약도 이미지에 맞춰 좌표 수정
2. **테스트**: 다양한 화면 크기에서 반응형 동작 확인
3. **최적화**: 성능 최적화 및 접근성 개선

---

**작성일**: 2026-01-XX  
**작성자**: AI Assistant  
**버전**: 1.0  
**상태**: Phase 1 완료, 좌표 조정 필요
