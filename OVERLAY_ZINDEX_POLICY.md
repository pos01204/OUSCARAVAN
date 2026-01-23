# 오버레이(z-index) 정책 문서

**작성일**: 2026-01-23  
**목적**: `Select/Popover/Drawer/Sheet/Dialog` 등 오버레이가 “겹치거나 가려지는 문제”를 재발 방지하기 위해, z-index 우선순위를 명확히 정의합니다.

---

## 1) 기본 원칙

1. **오버레이는 Portal 기반**을 우선 사용한다. (Radix/vaul/shadcn 기본 정책)
2. z-index는 “무조건 크게”가 아니라 **계층 규칙**으로 관리한다.
3. `Select`처럼 “항상 위에 떠야 하는” UI는 예외로 두되, 예외는 문서에 기록한다.

---

## 2) 권장 계층(우선순위)

| 계층 | 대상 예시 | 권장 z-index(가이드) | 비고 |
|---|---|---:|---|
| Base | 일반 페이지 컨텐츠 | (기본) | |
| Fixed UI | 헤더/바텀 네비 | 50 | 앱 고정 UI |
| Popover | Tooltip, Popover, Dropdown | 1000 | 작은 오버레이 |
| Sheet/Drawer | 사이드 패널/바텀 시트 | 2000 | 화면 큰 오버레이 |
| Dialog/Modal | 다이얼로그/모달 | 3000 | 가장 강한 오버레이 |
| **Select(Content)** | SelectContent | **99999(예외)** | “겹침 이슈” 재발 방지 목적 |

---

## 3) 현재 코드 상태(참조)

### Select
- 파일: `components/ui/select.tsx`
- 현재 정책: `SelectContent`에 `z-[9999]` + `style={{ zIndex: 99999 }}` 적용
- 의도: 모바일/인앱 환경에서 드롭다운이 다른 컴포넌트에 가려지는 문제를 확실히 방지

### Drawer/Sheet
- 파일: `components/guest/InfoInspector.tsx`
- Drawer 본문 스크롤은 `overflow-y-auto`로 보장(“스크롤 잘림” 방지)
- Sheet는 `contentClassName`으로 스크롤 전략을 위임하므로, 각 사용처에서 overflow 정책을 일관되게 적용해야 함

---

## 4) 적용/검증 체크리스트

- [ ] Drawer 위에서 Select가 가려지지 않는가?
- [ ] Sheet 위에서 Select가 가려지지 않는가?
- [ ] Dialog 위에서 Select가 가려지지 않는가?
- [ ] Select가 너무 “최상위”여서 Dialog 닫기/Backdrop 클릭을 방해하지 않는가?

