# Next.js themeColor 경고 수정 가이드

## 🔍 문제

**증상:**
- Vercel 로그에서 경고 메시지 표시:
  ```
  ⚠ Unsupported metadata themeColor is configured in metadata export in /login. 
  Please move it to viewport export instead.
  ```

**원인:**
- Next.js 14+ 에서 `themeColor`는 `metadata` export가 아닌 `viewport` export에 설정해야 함
- 현재 `app/layout.tsx`에서 `metadata`에 `themeColor`가 설정되어 있음

**영향:**
- ⚠️ 경고일 뿐, 기능에는 문제 없음
- 로그인 페이지는 정상적으로 작동함 (200 응답)
- 하지만 Next.js 권장 사항에 따라 수정 권장

---

## ✅ 해결 방법

### 1단계: app/layout.tsx 수정

**현재 코드 (잘못된 방식):**
```typescript
export const metadata: Metadata = {
  title: "OUSCARAVAN - 스마트 컨시어지",
  // ... 다른 설정들
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: "#FF7E5F", // ❌ metadata에 있음
  manifest: "/manifest.json",
};
```

**수정된 코드 (올바른 방식):**
```typescript
export const metadata: Metadata = {
  title: "OUSCARAVAN - 스마트 컨시어지",
  // ... 다른 설정들
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FF7E5F", // ✅ viewport로 이동
};
```

---

## 🔧 수정 단계

### app/layout.tsx 파일 수정:

1. **`themeColor`를 `metadata`에서 제거**
2. **`viewport`를 별도 export로 분리**
3. **`themeColor`를 `viewport`에 추가**

---

## 📋 수정 후 확인

**수정 후:**
- ✅ 경고 메시지 사라짐
- ✅ 로그인 페이지 정상 작동
- ✅ Next.js 권장 사항 준수

---

## 🔍 현재 상태 확인

**Vercel 로그 분석:**
- ✅ GET `/login` → 200 (정상)
- ⚠️ themeColor 경고 (기능에는 문제 없음)

**결론:**
- 로그인 페이지는 정상적으로 작동하고 있음
- 경고는 수정 가능하지만 기능에는 영향 없음

---

**문서 버전**: 1.0  
**최종 업데이트**: 2026-01-06
