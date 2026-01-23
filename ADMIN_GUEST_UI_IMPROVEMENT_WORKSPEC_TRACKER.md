# 관리자/고객 UI 개선 작업 명세 & 트래킹 보드

**작성일**: 2026-01-23  
**근거 문서**: `ADMIN_GUEST_UI_COMPONENT_DIAGNOSIS_2026-01-23.md`  
**목표**: 레이아웃/프레임 유지 + 디자인/컴포넌트 완성도 향상 + 운영/사용 편의성 강화  

---

## 0) 범위(Scope) / 비범위(Non-goals)

### 범위
- **관리자(Admin)**: `/admin/*` (홈/예약·배정/현장관리/주문/공지/알림)
- **고객(Guest)**: `/guest/[token]/*` (홈/공지/불멍·BBQ/카페·쿠폰/가이드/도움말/체크인아웃)
- **공통(UI System)**: `Card/Button/Tabs/Select/InfoInspector` 및 상태 배지/에러/재시도 패턴

### 비범위(이번 작업에서 하지 않음)
- 레이아웃 구조 변경(탭/메뉴/섹션의 대규모 재배치)
- 다크모드/테마 토글 도입
- 백엔드 API 스펙 변경(단, “서버 저장이 필요한 기능”은 별도 에픽으로 분리하여 제안만)

---

## 1) 작업 원칙(강제 규칙)

1. **상태/라벨/색상은 단일 소스에서만 정의**한다. (분산 switch/하드코딩 금지)
2. **오버레이 계층(z-index)**는 문서화된 규칙을 따른다. (Select/Drawer/Sheet/Dialog 충돌 방지)
3. **사용자 확신(피드백)**: 로딩/실패/재시도/최신성 표시를 모든 핵심 흐름에 제공한다.
4. **터치 UX**: 모바일에서 버튼/탭/클릭 타겟은 최소 44px을 유지한다.
5. **추가 아이콘 삽입 지양**: 기존 아이콘은 “대체”만 허용.

---

## 2) 에픽(Workstreams) 요약

### Epic A — 검색 결과 하이라이트(Guide/FAQ 공통)
- **목표**: “찾는 느낌” 강화(검색 UX 체감 개선)  
- **대상**: 고객 가이드/도움말(FAQ)  
- **성과 지표**: 검색 시 결과 텍스트 내 키워드가 즉시 강조되어 탐색 시간이 단축됨

### Epic B — 상태 배지/라벨/색상 단일화(관리자+고객)
- **목표**: 상태 용어 혼선 제거, 디자인 일관성/유지보수성 향상  
- **대상**: 관리자 주문/알림/현장관리(방) + 고객 주문 상태(요약/내역)
- **성과 지표**: 동일 상태가 모든 화면에서 같은 라벨/색/뱃지로 표시됨

### Epic C — 에러/재시도 패턴 통일(핵심 API 호출부)
- **목표**: 실패 시 사용자(관리자/고객) 행동 가이드 제공 → 문의 감소  
- **대상**: 목록 조회(주문/알림/예약) + 고객 주문/체크인아웃 등

### Epic D — 오버레이(z-index) 체계 문서화 + 적용 점검
- **목표**: Select/Drawer/Sheet/Dialog 겹침 이슈 재발 방지  
- **대상**: `components/ui/select.tsx`, `InfoInspector`, 관리자/고객의 각종 오버레이

### Epic E — Footer/하단 여백/안전영역 재검증
- **목표**: “하단 여백 과다” 체감 피로 제거(스크롤 길이 최적화)  
- **대상**: `app/guest/[token]/layout.tsx`, `components/shared/Footer.tsx`, `components/guest/GuestBottomNav.tsx`

### Epic F — (선택) 관리자 홈 KPI 보강
- **목표**: 알림이 없을 때도 “오늘 할 일”이 5초 내 보이게  
- **대상**: `/admin` 홈

### Epic G — 고객 “실시간/확신/오프라인” 보강 (Guest Phase 2)
- **목표**: 주문/체크인 같은 핵심 상태가 “자동으로 갱신되고”, 실패 시 “즉시 복구(재시도)”가 가능하도록 보강  
- **대상**: 고객 홈/주문/체크인아웃/공지

---

## 3) 상세 작업 명세(태스크 단위)

> 상태(Status): `TODO` / `IN_PROGRESS` / `BLOCKED` / `DONE`  
> 우선순위(P): `P0`(즉시) / `P1`(단기) / `P2`(중기)  

### A. 검색 하이라이트 (Epic A)

| ID | P | 상태 | 작업 | 변경 범위(예상 파일) | 완료 기준(AC) |
|---|---|---|---|---|---|
| A-01 | P0 | DONE | 하이라이트 유틸 함수 구현(escape/대소문자/부분매칭) | `lib/utils/highlight.tsx`(신규) | XSS 안전(텍스트만), 한글/영문 모두 정상 강조 |
| A-02 | P0 | DONE | 가이드 검색 결과에 하이라이트 적용 | `components/guest/GuestGuideContent.tsx` | 검색어가 결과 카드의 title/overview/content 일부에 시각적으로 강조 표시 |
| A-03 | P0 | DONE | 도움말(FAQ) 검색 결과에 하이라이트 적용 | `components/guest/GuestHelpContent.tsx` | 질문/답변 영역에서 검색어가 강조 표시 |
| A-04 | P1 | DONE | 하이라이트 스타일 토큰화(색/라운드) | `app/globals.css` | 테마 톤과 충돌 없이 읽기 쉬움(과한 형광 금지) |

---

### B. 상태 배지 단일화 (Epic B)

| ID | P | 상태 | 작업 | 변경 범위(예상 파일) | 완료 기준(AC) |
|---|---|---|---|---|---|
| B-01 | P0 | DONE | 상태 메타 정의(주문/알림/객실/예약 중 필요한 것부터) | `lib/utils/status-meta.ts`(신규) | `label/color/variant/priority/next` 등 단일 매핑 제공 |
| B-02 | P0 | DONE | 공통 `StatusPill`(또는 `StatusBadge`) 컴포넌트 추가 | `components/shared/StatusPill.tsx`(신규) | 단일 props로 모든 상태 렌더 가능 |
| B-03 | P0 | DONE | 관리자 주문 페이지 상태 표시/버튼 라벨 통일 | `app/admin/orders/page.tsx` | 상태 라벨이 실제 상태 모델과 1:1로 대응, “확인/완료” 혼선 제거 |
| B-04 | P1 | DONE | 관리자 알림 피드 타입별 아이콘/색/라벨 단일화 | `components/admin/NotificationFeed.tsx`, `lib/utils/notification-meta.ts` | 컴포넌트 내부 switch 제거(또는 최소화), 메타 사용 |
| B-05 | P1 | DONE | 관리자 현장관리(rooms) 배지 규칙 정리(방/예약/주문) | `app/admin/rooms/page.tsx` | 카드 상단/본문에서 상태 위계가 일관되고 과도한 색 남용 없음 |
| B-06 | P1 | DONE | 고객 주문 상태(요약/내역) 배지 스타일 통일 | `components/guest/OrderStatusSummaryBar.tsx`, `OrderHistory.tsx` | 고객이 “지금 상태”를 1초 내 인지 가능(텍스트+색) |

---

### C. 에러/재시도 패턴 통일 (Epic C)

| ID | P | 상태 | 작업 | 변경 범위(예상 파일) | 완료 기준(AC) |
|---|---|---|---|---|---|
| C-01 | P0 | DONE | 공통 `ErrorState`/`RetryCard` 컴포넌트 도입 | `components/shared/ErrorState.tsx`(신규) | 한 줄 안내 + 재시도 버튼 + 접근성(aria-live) |
| C-02 | P0 | DONE | 관리자 주문/알림 목록 로드 실패 시 Retry UI 적용 | `app/admin/orders/page.tsx`, `NotificationFeed.tsx` | 실패 시 토스트만이 아니라 화면 내 재시도 제공 |
| C-03 | P1 | DONE | 고객 주문/가이드/도움말 로드 실패 시 Retry UI 적용 | `app/guest/[token]/*/page.tsx`, `components/shared/RetryablePageError.tsx`, `lib/api.ts` | 네트워크 장애/서버 오류에서 “다시 시도” 가능(토큰 무효는 404 유지) |
| C-04 | P1 | DONE | 데이터 최신성 표기(“마지막 업데이트”) 기본 패턴 추가 | `components/shared/LastUpdatedAt.tsx` + 적용처 | 새로고침/자동 갱신이 실제로 동작하는지 신뢰 제공 |

---

### D. 오버레이(z-index) 체계 문서화 + 점검 (Epic D)

| ID | P | 상태 | 작업 | 변경 범위(예상 파일) | 완료 기준(AC) |
|---|---|---|---|---|---|
| D-01 | P1 | DONE | 오버레이 계층 규칙 문서화(z-index map) | `OVERLAY_ZINDEX_POLICY.md` | Select/Popover/Tooltip/Sheet/Drawer/Dialog 우선순위 정의 |
| D-02 | P1 | DONE | Select z-index “무조건 최상위” 정책 검토 및 충돌 테스트 | `components/ui/select.tsx` | 정책 문서와 동일한 z-index(`99999`)로 명시, Drawer/Sheet/Dialog 위에서 가려짐 방지 |
| D-03 | P1 | DONE | InfoInspector(Sheet/Drawer) 스크롤 정책 통일 가이드 추가 | `components/guest/InfoInspector.tsx`, `INFOINSPECTOR_SCROLL_POLICY.md` | Sheet/Drawer 모두 “오버레이 내부 스크롤”로 통일, `contentClassName/bodyClassName` 규칙 문서화 |

---

### E. Footer/하단 여백/안전영역 재검증 (Epic E)

| ID | P | 상태 | 작업 | 변경 범위(예상 파일) | 완료 기준(AC) |
|---|---|---|---|---|---|
| E-01 | P1 | DONE | Guest 레이아웃 하단 패딩/푸터 마진 재조정 | `components/shared/Footer.tsx` | 하단 네비와 겹침 없이 “과한 여백” 제거 |
| E-02 | P1 | DONE | 바텀 네비 safe-area 처리 점검 | `components/guest/GuestBottomNav.tsx`, `app/guest/[token]/layout.tsx`, `components/guest/GuestHelpContent.tsx` | iOS safe-area에서도 터치/가독성 문제 없음 |
| E-03 | P2 | DONE | 관리자 모바일에서도 footer/하단 네비 겹침 점검(필요 시) | `app/admin/layout.tsx`, `components/admin/AdminBottomNav.tsx` | safe-area 포함 하단 패딩으로 화면 하단 콘텐츠가 가려지지 않음 |

---

### F. (선택) 관리자 홈 KPI 보강 (Epic F)

| ID | P | 상태 | 작업 | 변경 범위(예상 파일) | 완료 기준(AC) |
|---|---|---|---|---|---|
| F-01 | P2 | DONE | 홈 KPI 카드(오늘 체크인/체크아웃/미배정/대기 주문) 설계/추가 | `app/admin/page.tsx`, `components/admin/AdminKpiCards.tsx` | 알림이 없어도 업무량/우선순위가 즉시 보임 |
| F-02 | P2 | DONE | KPI 카드 → 해당 리스트로 딥링크 연결(클릭 이동) | `app/admin/page.tsx`, `components/admin/AdminKpiCards.tsx` | 숫자 클릭으로 즉시 “예약/주문” 화면으로 이동 |
| F-03 | P2 | DONE | 관리자 핵심 화면(예약/주문/현장관리) “마지막 업데이트” 표기 확대 | `app/admin/reservations/page.tsx`, `app/admin/orders/page.tsx`, `app/admin/rooms/page.tsx` | 관리자 화면에서 데이터 최신성 신뢰 제공 |
| F-04 | P2 | DONE | 관리자 예약/현장관리 새로고침 버튼 추가(행동 유도) | `app/admin/reservations/page.tsx`, `app/admin/rooms/page.tsx` | 운영자가 “내가 갱신했다”를 즉시 확인 가능 |
| F-05 | P2 | DONE | 관리자 알림 피드 초기 로딩/수동 새로고침 UX 개선 | `components/admin/NotificationFeed.tsx` | 로딩 중 “알림 없음” 오해 방지 + 수동 새로고침 제공 |
| F-06 | P2 | DONE | 예약/배정 새로고침 버튼 로딩 상태 보강 | `app/admin/reservations/page.tsx` | 새로고침 중 버튼 disabled + 스피너 표시로 확신 강화 |
| F-07 | P2 | DONE | 예약/배정 새로고침 트리거 안정화(라우터/URL 의존 제거) + 현장관리 로딩 스피너 추가 | `app/admin/reservations/page.tsx`, `app/admin/rooms/page.tsx` | 새로고침이 “항상” 재조회로 이어지고 로딩이 명확 |
| F-08 | P2 | DONE | 관리자 예약/주문 “Soft Refresh”(리스트 유지) + 예약 로드 실패 ErrorState 추가 | `app/admin/reservations/page.tsx`, `app/admin/orders/page.tsx` | 새로고침/필터 변경 시 화면이 통째로 깜빡이지 않고, 실패 시 재시도 가능 |
| F-09 | P2 | DONE | 관리자 현장관리 Soft Refresh(스켈레톤 전환 최소화) | `app/admin/rooms/page.tsx` | 새로고침 시 기존 카드 유지 + “갱신 중…” 표기로 피로감 감소 |
| F-10 | P2 | DONE | 관리자 현장관리 로드 실패 시 화면 내 ErrorState/Retry 추가 | `app/admin/rooms/page.tsx` | 토스트만으로 끝나지 않고 화면에서 복구 가능 |
| F-11 | P2 | DONE | 예약/배정 캘린더 이벤트 제목 축약(미/입/퇴 + 이름) + 인스펙터 “미배정만” 토글 | `app/admin/reservations/ReservationCalendarView.tsx` | 월간 스캔이 빨라지고, 배정 업무를 더 빠르게 수행 가능 |
| F-12 | P2 | DONE | 인스펙터 “미배정만” 토글 시 탭 리셋/비활성화 + 캘린더 디버그 로그(개발 환경만) 정리 | `app/admin/reservations/ReservationCalendarView.tsx` | 토글 전환 시 빈 탭 화면 방지 + 프로덕션 로그 소음 최소화 |
| F-13 | P2 | DONE | (iOS) 인스펙터 스크롤 모멘텀/오버스크롤 정책 보강(Tailwind 유효 클래스 적용) | `app/admin/reservations/ReservationCalendarView.tsx` | 모바일에서 내부 스크롤이 더 안정적이고 드래그/닫힘과 충돌이 줄어듦 |
| F-14 | P2 | DONE | 로그인 페이지 디버그 로그를 개발 환경에서만 출력 + 비밀번호 표시 버튼 접근성(aria) 보강 | `app/(auth)/login/page.tsx` | 프로덕션 로그 소음 최소화 + 키보드/스크린리더 사용성 개선 |
| F-15 | P2 | DONE | 예약/배정 인스펙터 카운트(미배정/전체) 표기 + “미배정 없음 → 전체 보기” 빈 상태 UX + Sheet 스크롤 구조 정리 | `app/admin/reservations/ReservationCalendarView.tsx` | 필터 ON에서도 맥락(전체 대비)이 유지되고, 빈 화면/혼동 없이 즉시 복구 가능 |
| F-16 | P2 | DONE | (모바일) 스와이프 닫기 동작을 “정식 닫기 루틴”과 동일화(선택 날짜/상태 잔존 방지) | `app/admin/reservations/ReservationCalendarView.tsx` | 스와이프 닫기 후에도 다음 오픈에서 상태 꼬임/오동작이 발생하지 않음 |

---

### G. 고객 “실시간/확신/오프라인” 보강 (Epic G)

| ID | P | 상태 | 작업 | 변경 범위(예상 파일) | 완료 기준(AC) |
|---|---|---|---|---|---|
| G-01 | P1 | DONE | 고객 주문 자동 갱신(가시성 기반 폴링/백오프) + 수동 새로고침 + “갱신 중” 피드백 | `lib/hooks/useGuestOrders.ts`, `components/guest/GuestOrderContent.tsx`, `components/guest/GuestHomeContent.tsx` | 고객이 “상태가 업데이트 된다”는 확신을 갖고, 화면이 과도하게 깜빡이지 않음 |
| G-02 | P1 | DONE | 오프라인/네트워크 불안정 배너(전 고객 페이지 공통) | `components/shared/NetworkStatusBanner.tsx`, `app/guest/[token]/layout.tsx` | 오프라인에서 원인/기대 행동이 즉시 안내됨(연결 시 자동 갱신 기대 제공) |
| G-03 | P1 | DONE | 체크인/체크아웃 서버 상태 동기화(주기/포커스) + 실패 시 재시도 UI + 체크아웃 체크리스트 진행률/누락 강조 | `components/features/CheckInOut.tsx` | 새로고침/다른 기기에서도 상태가 일관되고, 실패 시 화면 내에서 복구 가능 |
| G-04 | P2 | DONE | 공지 자동 갱신(가시성 기반 폴링 + 온라인/포커스 트리거) | `lib/hooks/useGuestAnnouncements.ts` | 공지가 “한 번만 불러오고 끝”이 아니라, 체감상 최신 상태로 유지됨 |
| G-05 | P0 | DONE | 게스트 주문 “서버 푸시(실시간)” SSE 추가 + 프론트 즉시 갱신 연결(폴링 폴백 유지) | `railway-backend/src/services/guest-orders-sse.service.ts`, `railway-backend/src/controllers/*`, `railway-backend/src/routes/guest.routes.ts`, `lib/hooks/useGuestOrders.ts` | 관리자 상태 변경/신규 주문이 고객 화면에 즉시 반영(실패 시 폴링으로 지속 동작) |
| G-06 | P1 | DONE | 공지 읽음 상태 서버 저장(기기/브라우저 간 유지) + 로컬스토리지 폴백 | `railway-backend/src/services/announcement-reads.service.ts`, `railway-backend/src/controllers/announcements.controller.ts`, `railway-backend/src/routes/guest.routes.ts`, `railway-backend/src/migrations/run-migrations.ts`, `lib/api.ts`, `components/guest/GuestAnnouncements.tsx` | 다른 기기에서도 “읽음” 상태가 유지되고, 서버 장애 시에도 로컬로 UX 유지 |
| G-07 | P0 | DONE | 주문 페이지 로딩 루프/스켈레톤 고착 수정 + 섹션 헤더 반응형 정리 | `lib/hooks/useGuestOrders.ts`, `components/guest/GuestOrderContent.tsx` | 마지막 업데이트가 찍혔는데도 스켈레톤이 계속 뜨는 현상 제거 + 모바일에서 제목이 깨지지 않음 |
| G-08 | P1 | DONE | globals.css @import 위치 규칙 준수(배포 경고 제거) | `app/globals.css` | `@import` 경고 없이 폰트 로딩 정상 |
| G-09 | P0 | DONE | 게스트 공지 “서버 푸시(실시간)” SSE 추가 + 프론트 즉시 갱신 연결(폴링 폴백 유지) | `railway-backend/src/services/guest-announcements-sse.service.ts`, `railway-backend/src/controllers/announcements.controller.ts`, `railway-backend/src/routes/guest.routes.ts`, `lib/hooks/useGuestAnnouncements.ts` | 공지 등록/수정/삭제가 고객 홈에 즉시 반영(실패 시 폴링으로 지속 동작) |
| G-10 | P1 | DONE | 주문 폼 실패 시 인라인 에러 + “다시 시도” 버튼 제공(토스트 의존 감소) | `components/features/OrderForm.tsx` | 주문 실패 시 사용자가 화면에서 즉시 복구 가능 |
| G-11 | P1 | DONE | 주문 완료 “확신 카드”(토스트 외 인라인 피드백) + 접수 직후 1회 즉시 갱신 | `components/features/OrderForm.tsx`, `components/guest/GuestOrderContent.tsx` | 주문 후 “접수됨”을 화면에서 확실히 확인 가능(초보 사용자 문의 감소) |
| G-12 | P2 | DONE | 체크아웃 알림 설정 실패 시 대체 안내 배너 제공(환경/권한 이슈 대응) | `components/features/CheckoutReminder.tsx` | 알림 설정이 불가능해도 사용자에게 다음 행동이 안내됨(공백 상태 제거) |

---

## 4) 작업 일정(권장)

### Phase 0 (P0): 빠른 승리(0.5~1.5일)
- A-01~A-03 (검색 하이라이트)
- B-01~B-03 (주문 상태 단일화 최소 세트)
- C-01~C-02 (Retry UI + 관리자 적용)

### Phase 1 (P1): 일관성 강화(1~3일)
- B-04~B-06
- C-03~C-04
- D-01~D-03
- E-01~E-02

### Phase 2 (P2): 운영 완성도(선택, 1~2일)
- E-03
- F-01

---

## 5) 테스트/검증 체크리스트(작업 트래킹용)

### 공통(오버레이/스크롤)
- [ ] Select가 Drawer/Sheet/Dialog 위에서 정상적으로 열리고, 클릭/스크롤이 먹힌다
- [ ] InfoInspector 내부 스크롤이 “드래그로 닫힘”과 충돌하지 않는다

### 관리자
- [ ] 주문 상태 라벨이 실제 상태와 일치한다(“확인/준비중/완료” 등 용어 혼선 없음)
- [ ] 알림이 SSE 실패 상황에서도 30초 폴링으로 복구된다

### 고객
- [ ] 가이드/FAQ 검색 시 검색어가 하이라이트된다
- [ ] 하단 여백이 과하지 않고, 바텀 네비로 콘텐츠가 가려지지 않는다

---

## 6) 트래킹 보드(실사용용)

> 아래 표는 “매일 작업 시작/종료 시” 업데이트 용도입니다.

| 날짜 | 작업자 | 진행 태스크(ID) | 상태 변경 | 메모(이슈/결정) |
|---|---|---|---|---|
| 2026-01-23 |  | A-01~A-04, B-01~B-03, C-01~C-02 | DONE | 검색 하이라이트/상태 배지 단일화/에러 재시도 패턴 적용 |
| 2026-01-23 |  | B-06, C-03(부분) | IN_PROGRESS | 고객 주문 상태 배지 통일 + 주문 내역 Retry 적용 |
| 2026-01-23 |  | B-04, B-05, D-01, E-01 | DONE | 관리자 알림 메타 단일화 + 현장관리 배지 정리 + 오버레이 정책 문서화 + Footer 여백 방식 변경 |
| 2026-01-23 |  | C-03, C-04, E-02 | DONE | 가이드/도움말 토큰 검증 실패 시 Retry UI + “마지막 업데이트” 패턴 추가 + safe-area 보정 |
| 2026-01-23 |  | D-02, D-03 | DONE | Select z-index 정책을 문서와 1:1로 정리 + InfoInspector(Sheet/Drawer) 내부 스크롤 구조 통일 및 가이드 문서 추가 |
| 2026-01-23 |  | E-03, F-01 | DONE | 관리자 하단 네비 safe-area/겹침 방지 패딩 적용 + 관리자 홈 KPI(4종) 카드 추가 |
| 2026-01-23 |  | F-02 | DONE | 관리자 홈 KPI 클릭 시 해당 리스트(예약/주문)로 바로 이동(딥링크) |
| 2026-01-23 |  | F-03 | DONE | 관리자 예약/주문/현장관리 화면에 “마지막 업데이트” 표기 추가 |
| 2026-01-23 |  | F-04 | DONE | 관리자 예약/현장관리 화면에 “새로고침” 버튼 추가 |
| 2026-01-23 |  | F-05 | DONE | 관리자 알림 피드 로딩/새로고침 UX 개선 |
| 2026-01-23 |  | F-06 | DONE | 관리자 예약/배정 새로고침 버튼 로딩/disable 처리 |
| 2026-01-23 |  | F-07 | DONE | 예약/배정 새로고침 트리거를 상태 기반으로 안정화 + 현장관리 새로고침 스피너/disable 처리 |
| 2026-01-23 |  | F-08 | DONE | 관리자 예약/주문 Soft Refresh + 예약 로드 실패 ErrorState/Retry 추가 |
| 2026-01-23 |  | F-09 | DONE | 관리자 현장관리 Soft Refresh 적용(새로고침 시 화면 유지) |
| 2026-01-23 |  | F-10 | DONE | 관리자 현장관리 ErrorState/Retry 추가 |
| 2026-01-23 |  | F-11 | DONE | 예약/배정 캘린더 이벤트 축약 표기 + 인스펙터 미배정 토글 추가 |
| 2026-01-23 |  | F-12 | DONE | 인스펙터 미배정 토글 전환 시 탭 “전체” 리셋 + 기타 탭 비활성화 + 캘린더 디버그 로그를 개발 환경에서만 출력 |
| 2026-01-23 |  | F-13 | DONE | (iOS) 인스펙터 스크롤 모멘텀/오버스크롤 정책 보강(유효 클래스 적용) |
| 2026-01-23 |  | F-14 | DONE | 로그인 디버그 로그 dev-only + 비밀번호 표시 버튼 aria 보강 |
| 2026-01-23 |  | F-15 | DONE | 인스펙터 “미배정/전체” 카운트 표기 + 미배정 없음 빈상태에서 “전체 보기” 제공 + Sheet 본문만 스크롤되도록 구조 정리 |
| 2026-01-23 |  | F-16 | DONE | 스와이프 닫기 경로에서도 selectedDate/상태가 정상적으로 정리되도록 닫기 루틴 통일 |
| 2026-01-23 |  | G-01~G-04 | DONE | 고객 주문 자동 갱신/수동 새로고침 + 오프라인 배너 + 체크인아웃 동기화/재시도/체크리스트 진행률 + 공지 자동 갱신 |
| 2026-01-23 |  | G-05 | DONE | 게스트 주문 SSE(서버 푸시) 추가 + 프론트 즉시 갱신 연결 |
| 2026-01-23 |  | G-06~G-08 | DONE | 공지 읽음 서버 저장 + 주문 페이지 스켈레톤 고착/헤더 줄바꿈 수정 + globals.css @import 경고 제거 |
| 2026-01-23 |  | G-09~G-12 | DONE | 게스트 공지 SSE(서버 푸시) + 주문 폼 실패 인라인 재시도 + 주문 접수 확신 카드 + 체크아웃 알림 실패 대체 안내 |

---

## 7) 변경 기록(Changelog)

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| v1.0 | 2026-01-23 | 최초 작성 |
| v1.1 | 2026-01-23 | P0 작업(A/B/C 일부) 적용 및 트래킹 업데이트 |
| v1.2 | 2026-01-23 | A-04 완료, B-06 완료, C-03 진행(주문 영역) |
| v1.3 | 2026-01-23 | B-04/B-05/D-01/E-01 적용 및 트래킹 업데이트 |
| v1.4 | 2026-01-23 | C-03/C-04/E-02 적용 및 트래킹 업데이트 |
| v1.5 | 2026-01-23 | D-02/D-03 적용 및 트래킹 업데이트 |
| v1.6 | 2026-01-23 | E-03/F-01 적용 및 트래킹 업데이트 |
| v1.7 | 2026-01-23 | F-02(KPI 딥링크) 적용 및 트래킹 업데이트 |
| v1.8 | 2026-01-23 | F-03(관리자 LastUpdatedAt 확대) 적용 및 트래킹 업데이트 |
| v1.9 | 2026-01-23 | F-04(관리자 새로고침 버튼 확장) 적용 및 트래킹 업데이트 |
| v1.10 | 2026-01-23 | F-05(관리자 알림 피드 로딩/새로고침 UX) 적용 및 트래킹 업데이트 |
| v1.11 | 2026-01-23 | F-06(예약 새로고침 버튼 로딩 상태) 적용 및 트래킹 업데이트 |
| v1.12 | 2026-01-23 | F-07(새로고침 트리거 안정화/현장관리 스피너) 적용 및 트래킹 업데이트 |
| v1.13 | 2026-01-23 | F-08(예약/주문 Soft Refresh + 예약 ErrorState) 적용 및 트래킹 업데이트 |
| v1.14 | 2026-01-23 | F-09(현장관리 Soft Refresh) 적용 및 트래킹 업데이트 |
| v1.15 | 2026-01-23 | F-10(현장관리 ErrorState/Retry) 적용 및 트래킹 업데이트 |
| v1.16 | 2026-01-23 | F-11(예약 캘린더 축약 표기/미배정 토글) 적용 및 트래킹 업데이트 |
| v1.17 | 2026-01-23 | F-12(인스펙터 탭 리셋/비활성화 + 캘린더 디버그 로그 정리) 적용 및 트래킹 업데이트 |
| v1.18 | 2026-01-23 | F-13~F-14(iOS 인스펙터 스크롤 보강 + 로그인 dev-only 로그/aria) 적용 및 트래킹 업데이트 |
| v1.19 | 2026-01-23 | F-15(인스펙터 카운트/빈상태 UX + Sheet 스크롤 구조 정리) 적용 및 트래킹 업데이트 |
| v1.20 | 2026-01-23 | F-16(스와이프 닫기 루틴 통일) 적용 및 트래킹 업데이트 |
| v1.21 | 2026-01-23 | G-01~G-04(주문 자동 갱신/오프라인 배너/체크인아웃 동기화/공지 자동 갱신) 적용 및 트래킹 업데이트 |
| v1.22 | 2026-01-23 | G-05(게스트 주문 SSE 실시간 갱신) 적용 및 트래킹 업데이트 |
| v1.23 | 2026-01-23 | G-06~G-08(공지 읽음 서버 저장 + 주문 스켈레톤 고착/헤더 줄바꿈 + CSS @import 경고 제거) 적용 및 트래킹 업데이트 |
| v1.24 | 2026-01-23 | G-09~G-10(게스트 공지 SSE 실시간 갱신 + 주문 폼 인라인 재시도) 적용 및 트래킹 업데이트 |
| v1.25 | 2026-01-23 | G-11~G-12(주문 접수 확신 카드 + 체크아웃 알림 실패 대체 안내) 적용 및 트래킹 업데이트 |

