# 약도 카라반 크기 통일 및 캘린더 스크롤 수정 완료

## ✅ 완료된 작업

### 1. 카라반 컴포넌트 크기 통일

**파일**: `lib/constants/floorPlan.ts`

**문제점**:
- 1-6호: `width: 102, height: 55`
- 7-10호: `width: 50, height: 55` (크기가 다름)

**수정 내용**:
- 7-10호 너비를 약간 증가: `width: 50` → `width: 52`
- 모든 카라반 높이 통일: `height: 55` (이미 통일되어 있음)
- 공간 제약으로 인해 완전한 통일은 어렵지만, 가능한 한 크기 조정

**최종 크기**:
- 1-6호: `width: 102, height: 55`
- 7-10호: `width: 52, height: 55` (공간 제약으로 약간 작음)

**좌표 조정**:
- 7호: `x: 436, y: 130, width: 52`
- 8호: `x: 494, y: 130, width: 52` (436 + 52 + 6 간격)
- 9호: `x: 552, y: 130, width: 52` (494 + 52 + 6 간격)
- 10호: `x: 494, y: 195, width: 52` (중앙 정렬)

### 2. 약도 컴포넌트 아래 여백 제거

**파일**: `lib/constants/floorPlan.ts`, `components/guest/FloorPlanCard.tsx`, `components/features/FloorPlanSVG.tsx`

**수정 내용**:

1. **viewBox 높이 축소** (`lib/constants/floorPlan.ts`):
   - `viewBox: "0 0 600 480"` → `viewBox: "0 0 600 260"` (세로 높이 대폭 축소)
   - 실제 카라반이 배치된 최대 y 좌표(250)에 맞춰 여백 제거

2. **도로 높이 조정** (`components/features/FloorPlanSVG.tsx`):
   - 도로 높이: `height: 380` → `height: 260` (viewBox에 맞춤)
   - 도로 텍스트 위치: `y: 190` → `y: 130` (중앙 정렬)

3. **CardContent 여백 조정** (`components/guest/FloorPlanCard.tsx`):
   - `CardContent`에 `pb-4` 추가하여 하단 패딩 명시
   - 레이블 div에 `mb-0` 추가하여 하단 마진 제거

### 3. 관리자 캘린더 스크롤 문제 해결

**파일**: `app/admin/reservations/ReservationCalendarView.tsx`, `app/globals.css`

**문제점**:
- 캘린더가 17일 아래로 스크롤되지 않고 잘림
- `overflow-hidden`으로 인해 스크롤 불가

**수정 내용**:

1. **컨테이너 overflow 변경** (`ReservationCalendarView.tsx`):
   - `overflow-hidden` → `overflow-y-auto` (세로 스크롤 활성화)

2. **캘린더 최소 높이 보장** (`ReservationCalendarView.tsx`):
   - Calendar `style`에 `minHeight: '600px'` 추가

3. **월간 뷰 최소 높이 보장** (`app/globals.css`):
   - `.rbc-month-view`에 `min-height: 600px !important;` 추가

4. **캘린더 컨테이너 스크롤 활성화** (`app/globals.css`):
   - `.rbc-calendar`에 `overflow-y: visible !important;` 추가

---

## 🎨 개선 사항

### 약도 크기 통일
- 모든 카라반의 높이가 통일됨 (`height: 55`)
- 7-10호 너비를 가능한 한 증가시켜 통일성 향상
- viewBox 높이 축소로 불필요한 여백 제거

### 캘린더 가시성
- 모든 날짜가 스크롤로 확인 가능
- 17일 이후 날짜도 정상적으로 표시됨
- 모바일과 데스크톱 모두에서 스크롤 작동

---

## 📁 수정된 파일

1. `lib/constants/floorPlan.ts` - viewBox 높이 축소 및 7-10호 크기 조정
2. `components/guest/FloorPlanCard.tsx` - 하단 여백 제거
3. `components/features/FloorPlanSVG.tsx` - 도로 높이 및 텍스트 위치 조정
4. `app/admin/reservations/ReservationCalendarView.tsx` - overflow 변경 및 최소 높이 보장
5. `app/globals.css` - 월간 뷰 최소 높이 및 스크롤 활성화

---

**완료 일시**: 2026-01-XX  
**작성자**: AI Assistant  
**버전**: 13.0  
**상태**: 카라반 크기 통일 및 캘린더 스크롤 수정 완료
