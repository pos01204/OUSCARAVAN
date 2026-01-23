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
| C-03 | P1 | IN_PROGRESS | 고객 주문/가이드/도움말 로드 실패 시 Retry UI 적용 | `components/guest/*` | 일회성 사용자가 “막힘” 없이 복구 가능 |
| C-04 | P1 | TODO | 데이터 최신성 표기(“마지막 업데이트”) 기본 패턴 추가 | 관리자/고객 공통 | 새로고침/자동 갱신이 실제로 동작하는지 신뢰 제공 |

---

### D. 오버레이(z-index) 체계 문서화 + 점검 (Epic D)

| ID | P | 상태 | 작업 | 변경 범위(예상 파일) | 완료 기준(AC) |
|---|---|---|---|---|---|
| D-01 | P1 | DONE | 오버레이 계층 규칙 문서화(z-index map) | `OVERLAY_ZINDEX_POLICY.md` | Select/Popover/Tooltip/Sheet/Drawer/Dialog 우선순위 정의 |
| D-02 | P1 | TODO | Select z-index “무조건 최상위” 정책 검토 및 충돌 테스트 | `components/ui/select.tsx` | Drawer/Sheet 위에서 예상대로 동작(충돌 시 정책 수정) |
| D-03 | P1 | TODO | InfoInspector(Sheet/Drawer) 스크롤 정책 통일 가이드 추가 | `components/guest/InfoInspector.tsx` + 문서 | `contentClassName` 사용 규칙 명확 |

---

### E. Footer/하단 여백/안전영역 재검증 (Epic E)

| ID | P | 상태 | 작업 | 변경 범위(예상 파일) | 완료 기준(AC) |
|---|---|---|---|---|---|
| E-01 | P1 | DONE | Guest 레이아웃 하단 패딩/푸터 마진 재조정 | `components/shared/Footer.tsx` | 하단 네비와 겹침 없이 “과한 여백” 제거 |
| E-02 | P1 | TODO | 바텀 네비 safe-area 처리 점검 | `components/guest/GuestBottomNav.tsx` | iOS safe-area에서도 터치/가독성 문제 없음 |
| E-03 | P2 | TODO | 관리자 모바일에서도 footer/하단 네비 겹침 점검(필요 시) | `app/admin/layout.tsx`, `AdminBottomNav.tsx` | 화면 하단 콘텐츠가 가려지지 않음 |

---

### F. (선택) 관리자 홈 KPI 보강 (Epic F)

| ID | P | 상태 | 작업 | 변경 범위(예상 파일) | 완료 기준(AC) |
|---|---|---|---|---|---|
| F-01 | P2 | TODO | 홈 KPI 카드(오늘 체크인/체크아웃/미배정/대기 주문) 설계/추가 | `app/admin/page.tsx` + 컴포넌트(신규) | 알림이 없어도 업무량/우선순위가 즉시 보임 |

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

---

## 7) 변경 기록(Changelog)

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| v1.0 | 2026-01-23 | 최초 작성 |
| v1.1 | 2026-01-23 | P0 작업(A/B/C 일부) 적용 및 트래킹 업데이트 |
| v1.2 | 2026-01-23 | A-04 완료, B-06 완료, C-03 진행(주문 영역) |
| v1.3 | 2026-01-23 | B-04/B-05/D-01/E-01 적용 및 트래킹 업데이트 |

