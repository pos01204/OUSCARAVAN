# 경로 문제 해결 가이드

## ❌ 문제: 대괄호가 포함된 경로

경로에 `[개인]`이 포함되어 있어서 PowerShell이 특수 문자로 해석합니다.

---

## ✅ 해결 방법: 따옴표로 경로 감싸기

### 올바른 명령어

**PowerShell에서:**

```powershell
cd "C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화"
```

**중요**: 경로를 **따옴표(`"`)로 감싸야** 합니다!

---

## 📋 전체 실행 순서

**PowerShell에서 순서대로 실행:**

```powershell
# 1. 프로젝트 디렉토리로 이동 (따옴표 필수!)
cd "C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화"
```

```powershell
# 2. 현재 디렉토리 확인
pwd
```

```powershell
# 3. 환경 변수 설정
$env:DATABASE_URL = "postgresql://postgres:KMnIhyLAmNcXmrORUPesiPzwrniFgLlB@switchyard.proxy.rlwy.net:38414/railway"
```

```powershell
# 4. 마이그레이션 실행
node run-migration.js
```

---

## 🔍 경로 확인 방법

**PowerShell에서:**

```powershell
# 현재 디렉토리 확인
pwd

# 파일 목록 확인
dir

# 특정 파일 확인
dir run-migration.js
dir MIGRATION_SQL_COMPLETE.sql
```

---

## 🐛 문제 해결

### 문제: 경로를 찾을 수 없음

**해결:**
1. 경로가 정확한지 확인
2. 따옴표로 감싸기
3. 대괄호 이스케이프 (필요한 경우):
   ```powershell
   cd "C:\Users\김지훈\Desktop\`[개인`] 김지훈\오우스 자동화"
   ```

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
