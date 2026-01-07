# 고객 페이지와 관리자 페이지 데이터 호환 작업 완료

## 📋 작업 개요

관리자 페이지에 추가된 상품별 주문 내역 및 옵션 정보 표시 기능을 고객 페이지에도 동일하게 적용하여 데이터 호환성을 확보했습니다.

## ✅ 완료된 작업

### 1. 공통 유틸리티 함수 생성

**파일**: `lib/utils/reservation.ts`

관리자 페이지와 고객 페이지에서 공통으로 사용할 유틸리티 함수를 생성했습니다.

#### 주요 함수

1. **`formatOptionName(name: string)`**
   - 옵션명에서 대괄호 태그 추출
   - 관리자 페이지와 동일한 포맷팅 로직

2. **`calculateTotalAmount(reservation: Reservation)`**
   - 객실 금액 + 옵션 금액 계산
   - 일관된 금액 계산 로직

### 2. 고객 홈 페이지 개선

**파일**: `components/guest/GuestHomeContent.tsx`

#### 추가된 기능

1. **예약 상품 및 옵션 정보 카드**
   - ROOM 상품 표시 (roomType, amount)
   - OPTION 상품들 표시 (options 배열)
   - 옵션명 포맷팅 (대괄호 태그 추출)
   - 총 결제금액 표시

2. **관리자 페이지와 동일한 UI/UX**
   - 동일한 카드 레이아웃
   - 동일한 배지 스타일 (ROOM, OPTION)
   - 동일한 가격 표시 형식

### 3. 고객 레이아웃 개선

**파일**: `app/guest/[token]/layout.tsx`

#### 추가된 기능

- 예약 정보 헤더에 총 결제금액 표시
- 객실 정보와 함께 금액 정보 제공

### 4. 관리자 페이지 코드 통일

관리자 페이지의 모든 곳에서 공통 유틸리티 함수를 사용하도록 수정했습니다.

#### 수정된 파일

1. **`app/admin/reservations/[id]/page.tsx`**
   - `formatOptionName` 함수 제거 → 공통 함수 사용
   - `calculateTotalAmount` 함수 사용

2. **`app/admin/reservations/ReservationListView.tsx`**
   - `calculateTotalAmount` 함수 사용

3. **`app/admin/reservations/ReservationCalendarView.tsx`**
   - 모달 내 모든 금액 계산을 `calculateTotalAmount`로 통일

## 📊 데이터 호환성

### 관리자 페이지와 고객 페이지 공통 표시 항목

| 항목 | 관리자 페이지 | 고객 페이지 | 상태 |
|------|-------------|------------|------|
| ROOM 상품 정보 | ✅ | ✅ | 완료 |
| OPTION 상품 정보 | ✅ | ✅ | 완료 |
| 옵션명 포맷팅 | ✅ | ✅ | 완료 |
| 총 결제금액 | ✅ | ✅ | 완료 |
| 객실/옵션 금액 분리 표시 | ✅ | ✅ | 완료 |

### 데이터 구조 일치

- **타입 정의**: `types/index.ts`에서 통일된 `Reservation` 타입 사용
- **API 응답**: Railway 백엔드에서 동일한 데이터 구조 반환
- **옵션 파싱**: JSONB 파싱 로직이 서비스 레이어에서 통일

## 🎨 UI/UX 통일

### 공통 디자인 요소

1. **카드 레이아웃**
   - 동일한 Card 컴포넌트 사용
   - 동일한 spacing 및 padding

2. **배지 스타일**
   - ROOM: `variant="outline"`
   - OPTION: `variant="secondary"`
   - 태그: `variant="outline"` (작은 크기)

3. **가격 표시**
   - 동일한 폰트 크기 및 색상
   - 동일한 숫자 포맷팅 (천 단위 구분)

4. **옵션명 표시**
   - 대괄호 태그를 별도 Badge로 표시
   - 메인 옵션명은 자연스러운 줄바꿈
   - "무료" 옵션은 이탤릭체로 표시

## 🔄 데이터 흐름

```
[Railway Backend]
  ↓ (동일한 Reservation 타입)
[관리자 페이지] ←→ [고객 페이지]
  ↓ (공통 유틸리티 함수)
[일관된 표시]
```

## 📝 코드 개선 사항

### Before (중복 코드)

```typescript
// 여러 곳에서 반복
const roomAmount = parseInt(reservation.amount || '0');
const optionsAmount = reservation.options?.reduce((sum, opt) => sum + opt.optionPrice, 0) || 0;
const totalAmount = roomAmount + optionsAmount;
```

### After (공통 함수)

```typescript
// lib/utils/reservation.ts
import { calculateTotalAmount } from '@/lib/utils/reservation';

const { roomAmount, optionsAmount, totalAmount } = calculateTotalAmount(reservation);
```

## ✅ 검증 사항

1. **타입 안정성**: TypeScript 타입 체크 통과
2. **데이터 일관성**: 관리자와 고객 페이지에서 동일한 데이터 표시
3. **UI 일관성**: 동일한 디자인 시스템 사용
4. **코드 재사용성**: 공통 유틸리티 함수로 중복 제거

## 🚀 다음 단계

1. **알림톡 발송**: n8n 워크플로우 설정 후 작업 예정
2. **추가 개선 사항**:
   - 주문 내역과 예약 정보 통합 표시 (선택사항)
   - 고객 페이지에서 주문 내역과 예약 상품 구분 표시

---

**작성일**: 2026-01-XX
**작업 범위**: 고객 페이지와 관리자 페이지 데이터 호환 작업
**상태**: ✅ 완료
