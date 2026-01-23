# InfoInspector 스크롤 정책 가이드

**작성일**: 2026-01-23  
**대상 컴포넌트**: `components/guest/InfoInspector.tsx`

---

## 1) 목표

- 모바일(Drawer)에서 **드래그로 닫기**와 **본문 스크롤**이 충돌하지 않게 한다.
- 데스크톱(Sheet)에서도 긴 콘텐츠가 **오버레이 내부에서만 스크롤**되게 한다.
- 사용처마다 overflow를 제각각 적용하지 않도록, **기본 스크롤 구조를 컴포넌트 내부에서 고정**한다.

---

## 2) 기본 구조(강제)

- **컨테이너(SheetContent/DrawerContent)**: `flex flex-col overflow-hidden`
- **헤더(SheetHeader/DrawerHeader)**: `shrink-0`
- **본문(Body)**: `min-h-0 flex-1 overflow-y-auto overscroll-contain`

> 핵심: `min-h-0`가 없으면 flex 레이아웃에서 스크롤이 깨지는 경우가 많습니다.

---

## 3) Props 사용 규칙

### `contentClassName`
- 오버레이 “컨테이너”에 적용됩니다.
- 권장 용도:
  - 높이 제한: `max-h-[92dvh]`
  - 폭 제한(데스크톱): `md:max-w-xl`
  - 패딩/테두리/배경 톤 조정

### `bodyClassName`
- 오버레이 내부의 **본문 스크롤 영역**에만 적용됩니다.
- 권장 용도:
  - 내부 패딩 조정: `px-4`/`pb-6` 등
  - 특정 화면에서 overflow 전략 보정

---

## 4) 권장 예시

### (A) “한 화면에 가깝게” 보이도록 높이 제한

```tsx
<InfoInspector
  open={open}
  onOpenChange={setOpen}
  title="상세 안내"
  contentClassName="max-h-[92dvh] md:max-w-xl"
>
  {...}
</InfoInspector>
```

### (B) 본문 여백만 줄이고 싶을 때

```tsx
<InfoInspector
  open={open}
  onOpenChange={setOpen}
  title="상세"
  bodyClassName="px-3 pb-4"
>
  {...}
</InfoInspector>
```

---

## 5) 금지 패턴(문제 재발 원인)

- 컨테이너에 `overflow-y-auto`를 직접 주고, 본문도 `overflow-y-auto`로 중복 처리
- `min-h-0` 없이 `flex-1 overflow-y-auto`만 적용
- 콘텐츠가 길 때 본문이 아니라 “페이지 전체”가 스크롤되도록 방치

