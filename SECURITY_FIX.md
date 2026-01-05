# 보안 취약점 수정 가이드

## 🔒 문제 상황

Railway 배포 중 Next.js 보안 취약점이 감지되어 배포가 중단되었습니다.

**감지된 취약점:**
- `next@14.2.5`에 HIGH 심각도 취약점 2개
  - CVE-2025-55184 (HIGH)
  - CVE-2025-67779 (HIGH)

**해결 방법:**
- Next.js를 `14.2.35`로 업그레이드

---

## ✅ 수정 완료

### package.json 업데이트

다음 항목이 업데이트되었습니다:

```json
{
  "dependencies": {
    "next": "14.2.35"  // 14.2.5 → 14.2.35
  },
  "devDependencies": {
    "eslint-config-next": "14.2.35"  // 14.2.5 → 14.2.35
  }
}
```

---

## 🚀 다음 단계

### 1. 의존성 설치

터미널에서 다음 명령어를 실행하세요:

```bash
npm install
```

또는

```bash
npm update next eslint-config-next
```

### 2. 빌드 테스트

로컬에서 빌드가 정상적으로 작동하는지 확인:

```bash
npm run build
```

### 3. 변경사항 커밋 및 푸시

```bash
git add package.json package-lock.json
git commit -m "fix: Update Next.js to 14.2.35 to fix security vulnerabilities"
git push origin main
```

### 4. Railway 배포 확인

- GitHub에 푸시하면 Railway가 자동으로 재배포를 시도합니다
- Railway 대시보드에서 배포 상태 확인
- 보안 취약점 오류가 해결되었는지 확인

---

## 📋 체크리스트

- [x] `package.json`에서 Next.js 버전 업데이트
- [x] `package.json`에서 eslint-config-next 버전 업데이트
- [ ] 로컬에서 `npm install` 실행
- [ ] 로컬에서 `npm run build` 테스트
- [ ] 변경사항 커밋 및 푸시
- [ ] Railway 배포 확인

---

## 🔍 참고 정보

### 취약점 상세

- **CVE-2025-55184**: https://github.com/vercel/next.js/security/advisories/GHSA-mwv6-3258-q52c
- **CVE-2025-67779**: https://github.com/vercel/next.js/security/advisories/GHSA-5j59-xgg2-r9c4

### Next.js 업그레이드 가이드

- [Next.js 공식 문서](https://nextjs.org/docs/app/building-your-application/upgrading/version-14)

---

**문서 버전**: 1.0  
**작성일**: 2024-01-15
