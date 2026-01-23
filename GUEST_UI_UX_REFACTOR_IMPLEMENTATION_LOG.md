# 고객(Guest) UI/UX 리팩토링 구현 로그

> **작성일**: 2026-01-19  
> **근거 문서**: `GUEST_UI_UX_REFACTOR_PLAN.md`  
> **원칙**: 누락 방지 체크리스트 기반으로 “공통 기반 → 핵심 화면 적용” 순서로 진행

---

## 1) 이번 라운드 목표(Phase G0~G3)
- **상세 표면 통일**: 모바일은 Drawer, 데스크톱은 Sheet로 동일한 상세 UX 제공(`InfoInspector`)
- **홈 1차 행동 강화**: Quick Actions 도입 + 핵심 행동으로 빠르게 이동
- **인앱/저사양 안전성 개선**: `window` 직접 참조/Clipboard 실패 시 대체 UX 제공
- **도움말 탐색성 개선(기초)**: FAQ 검색 + 카테고리 필터 + “가장 많이 필요한 3개” 상단 고정
- **주문 전환 UX 고도화(Phase G3)**: 주문 폼 단계형(선택→시간→확인) + 상태 요약/필터와 주문 내역의 연결

---

## 2) 구현 내역(변경 사항)

### 2.1 공통 기반(Phase G0)
- `lib/hooks/useMediaQuery.ts`
  - `matchMedia` 기반으로 **반응형 모드 판별 훅** 추가(SSR/인앱 안전)

- `components/guest/InfoInspector.tsx`
  - **상세 표면 통일 컴포넌트**
  - 모바일: `Drawer` / 데스크톱: `Sheet`(기본 right) 자동 선택

- `components/guest/GuestPageHeader.tsx`
  - 페이지 타이틀/설명 UI를 통일하는 공통 헤더

- `components/guest/QuickActionGrid.tsx`
  - 홈 상단 1차 행동(와이파이/체크인아웃/주문/도움말) 바로가기 그리드

### 2.2 화면 적용(Phase G1 일부)
- `components/features/WifiCard.tsx`
  - QR 상세를 `InfoInspector`로 통일(이전: `vaul` 직접 사용)
  - `Confetti`에서 `window.innerWidth/Height`를 **가드 처리**(인앱/SSR 안전)
  - Clipboard 미지원/실패 시 **대체 UX(비밀번호 직접 노출 + select-all)** 제공

- `components/guest/GuestGuideContent.tsx`
  - 인라인 확장형 상세를 제거하고 **카드 클릭 → `InfoInspector`에서 상세 보기**로 통일
  - 카테고리 필터를 1줄 가로 스크롤 칩 형태로 변경(상단 높이 증가 방지)
  - 페이지 헤더를 `GuestPageHeader`로 통일

- `components/guest/GuestHelpContent.tsx`
  - 상단에 “가장 많이 필요한 3개(관리자 전화/응급실 지도/WiFi 비번)” 고정 섹션 추가
  - FAQ에 **검색 + 카테고리 필터** 추가(탐색성 개선)
  - 페이지 헤더를 `GuestPageHeader`로 통일

- `components/guest/GuestHomeContent.tsx`
  - Hero 아래에 `QuickActionGrid` 추가
  - 홈 내 이동을 위해 `WiFiCard`/`CheckInOut`에 앵커 id 부여(`#wifi`, `#checkinout`)
  - “예약 상품 및 옵션”을 **요약 카드 + 상세 인스펙터**로 분리(스크롤 피로 감소)
  - 홈 섹션 순서를 “1차 행동/핵심 정보” 중심으로 재배치(Quick Actions → 약도 → 핵심 카드 → 나머지)
  - 주문 내역은 “요약 + 더보기(주문 페이지 이동)”로 정보 밀도 최적화

- `components/guest/RecentOrdersSummary.tsx`
  - 홈 전용 “최근 주문 요약” 컴포넌트 추가(최근 1~2개 + 전체 보기 CTA)

### 2.3 주문(Phase G3 일부 – 상태 요약)
- `lib/hooks/useGuestOrders.ts`
  - 주문 조회를 재사용 가능한 훅으로 분리(중복 fetch 방지 기반)
- `components/features/OrderForm.tsx`
  - **단계형 주문 폼**으로 리팩토링: `select → quantity → time → review`
  - 제출 중 상태(`isSubmitting`) 반영으로 **중복 제출 방지**
- `components/features/KioskOrderForm.tsx`
  - **단계형 주문 폼**으로 리팩토링: `select → time → review`
  - “수정” 버튼으로 이전 단계로 안전하게 복귀 가능(상품/장바구니 수정)
- `components/guest/OrderStatusSummaryBar.tsx`
  - 주문 상태 요약 바를 **클릭 가능한 필터 칩**으로 업그레이드(전체/대기/준비/배송/완료)
- `components/guest/GuestOrderContent.tsx`
  - 페이지 헤더(`GuestPageHeader`) 적용
  - `useGuestOrders(token)`으로 주문 데이터를 1회만 조회하고, 요약 바/주문 내역에 공유
  - 요약 바 클릭 시 주문 내역이 즉시 필터링되도록 연결
- `components/features/OrderHistory.tsx`
  - 주문 상세 보기 표면을 `InfoInspector`로 통일(모바일 Drawer / 데스크톱 Sheet)
  - 주문 내역 리스트는 **상위에서 주입받은 orders**를 렌더링(중복 fetch 제거)

---

## 3) 누락 방지 체크리스트(이번 라운드)
- [x] 공통 상세 표면(`InfoInspector`) 도입
- [x] 홈 Quick Actions 도입
- [x] 가이드 상세를 인스펙터로 통일(인라인 확장 제거)
- [x] 도움말 FAQ 탐색성(검색/카테고리) 추가
- [x] 인앱 리스크(`window` 직접 참조/Clipboard 실패) 완화
- [x] 주문 폼 단계형 UX(선택→시간→확인) 적용
- [x] 주문 상태 요약 바 ↔ 주문 내역 필터 연결
- [x] 주문 상세 표면을 `InfoInspector`로 통일
- [x] BBQ 진입 전 “소요 시간/준비물” 미니 요약 제공

---

## 4) 자체 평가(진단/효과)

### 4.1 잘 된 점
- **“상세 보기” 패턴이 통일**되어 제품 일관성이 올라감(Guide/WiFi에서 특히 체감)
- 홈에서 “무엇을 해야 하는지”가 선명해짐(Quick Actions)
- 인앱 환경에서 자주 터지는 포인트(Clipboard/Window 참조)에 대해 **대체 UX까지 포함**해 안정성이 상승
- 주문에서 “선택 누락/빈 장바구니” 같은 실수가 단계 진행에서 자연스럽게 방지되고, **완료 전 확인(review) 단계**로 신뢰감이 상승

### 4.2 남은 과제(다음 라운드 권장)
- 주문 페이지(Phase G3):
  - 주문 상태 변경을 더 명확히 보여주는 “타임라인/상태 스텝” 표현 검토
- 홈(Phase G1):
  - 위젯(일몰/시간/카운트다운) 우선순위 재조정(실사용 데이터 기반)
- 안내(Phase G2):
  - 가이드 상세 내부 콘텐츠(체크리스트/FAQ/트러블슈팅) 카드/간격 규칙 추가 정리

### 4.3 누락/리스크 점검
- **중복 fetch 제거**: 주문 데이터는 `GuestOrderContent`에서 1회 조회 후 하위로 전달(요약 바/리스트 불일치 방지)
- **파일 안정성**: 단계형 전환은 조건부 렌더링으로 구성해, 강제 종료/부분 적용 상황에서도 JSX 구조가 쉽게 깨지지 않도록 유지
- **재주문 UX**: 주문 상세에서 재주문 → 폼을 review 단계로 프리필 오픈(“수정”으로 즉시 조정 가능)

---

## 5) 추가 구현(Phase G3 – 재주문 UX)

### 5.1 구현 내역
- `components/features/OrderHistory.tsx`
  - 주문 상세 인스펙터에 **“재주문” 버튼** 추가(`onReorder` 콜백 기반)
- `components/guest/GuestOrderContent.tsx`
  - `handleReorder(order)` 추가: 주문 타입에 따라 `OrderForm`/`KioskOrderForm`을 프리필로 열기
  - 주문 데이터는 기존대로 상위에서 1회 조회(`useGuestOrders`) 후 필터/리스트 공유
- `components/features/OrderForm.tsx`
  - `initial` props 추가(세트/수량/시간/요청사항/초기 step)
- `components/features/KioskOrderForm.tsx`
  - `initial` props 추가(장바구니/시간/요청사항/초기 step)

### 5.2 자체 진단
- 장점:
  - “다시 주문하고 싶다”는 순간의 마찰을 최소화(상세 → 재주문 → review에서 바로 완료)
  - 프리필 이후에도 사용자가 바로 수정 가능(리뷰/수정 버튼)
- 리스크/후속:
  - 메뉴/세트 구성이 변경되었을 때(상품 id가 사라짐) 프리필 실패 가능 → 추후 토스트 안내/대체 플로우 추가 여지
  - “최근 주문” 카드에서도 재주문 CTA 제공하면 전환이 더 빨라질 수 있음(홈/주문 탭 상단)

## 6) 추가 구현(Phase G3 – 주문 상태 스텝 시각화)

### 6.1 구현 내역
- `components/features/OrderHistory.tsx`
  - 주문 카드에 **상태 스텝(대기→준비→배송→완료)** 바를 추가하여 “현재 어디까지 왔는지” 즉시 파악 가능
  - 주문 상세 인스펙터에도 동일 스텝을 노출해 상세 화면에서도 일관된 상태 인지 제공

### 6.2 자체 진단
- 장점:
  - 텍스트 배지 1개보다 “흐름”을 이해하기 쉬워 고객의 불안(언제 오지?) 감소
  - 카드/상세 모두 동일 표현이라 인지 비용이 낮음
- 리스크/후속:
  - 상태가 더 늘어날 경우(예: 취소/환불) 스텝 확장 규칙 필요 → 향후 `cancelled`가 생기면 별도 경로로 분기(스텝 바 + 경고 배지)

---

## 7) 추가 구현(정보 위계/모션 저감/가이드 가독성)

### 7.1 홈: 부가 위젯을 “추가 정보”로 묶기(스크롤 피로 감소)
- `components/guest/GuestHomeContent.tsx`
  - 홈에서 핵심 카드(와이파이/시간/체크인아웃/약도)는 그대로 유지
  - **부가 위젯(일몰/체크인 카운트다운/PWA 설치)**은 “추가 정보” 카드 + `InfoInspector` 내부로 이동
  - 목적: 핵심 행동이 스크롤 아래로 밀리는 문제를 완화하고, 필요한 사람만 부가 정보를 열어보게 하기

### 7.2 모션 저감: 콘페티 1회성 + prefers-reduced-motion 존중
- `components/features/CouponFlip.tsx`
  - `useReducedMotion()` 적용: 저감 모드에서는 콘페티/펄스 애니메이션을 억제
  - 세션 1회성(`sessionStorage`)으로 콘페티 과다 노출 방지
- `components/features/WifiCard.tsx`
  - WiFi 비밀번호 복사 성공 콘페티도 동일하게 **저감 모드/세션 1회성** 적용

### 7.3 안내 인스펙터: 내부 레이아웃 규칙 정리(탭/간격/카드)
- `components/guest/GuestGuideContent.tsx`
  - 탭을 고정 4칸(grid-cols-4) 대신 **자동 균등 분배(grid-flow-col/auto-cols-fr)**로 변경(탭 개수 변화에 안정)
  - 각 탭 콘텐츠를 `Card`로 감싸 “콘텐츠 영역”의 **여백/경계/가독성**을 통일

### 7.4 자체 진단
- 잘 된 점:
  - 홈에서 “핵심 카드”가 더 빨리 노출되어 사용자가 길을 잃을 확률이 낮아짐
  - 인앱/저사양 환경에서 모션 과다(콘페티)가 주는 부담을 줄이면서도 “기쁨 요소”는 유지
  - 안내 상세 내부가 카드/탭 규칙으로 정돈되어 읽기 피로가 감소
- 리스크/후속:
  - 부가 위젯을 접어둔 만큼, 실제 사용자 피드백(일몰/카운트다운 사용률)에 따라 “홈 고정 여부”는 재조정 가능

