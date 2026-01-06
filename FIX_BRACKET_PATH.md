# 대괄호가 포함된 경로 이동 방법

## ❌ 문제: 대괄호가 포함된 폴더 이름

PowerShell에서 대괄호 `[` `]`는 특수 문자로 해석되어 경로 문제가 발생합니다.

---

## ✅ 해결 방법

### 방법 1: -LiteralPath 사용 (권장)

**PowerShell에서:**

```powershell
cd -LiteralPath "[개인] 김지훈"
```

**또는:**

```powershell
Set-Location -LiteralPath "[개인] 김지훈"
```

---

### 방법 2: 백틱으로 이스케이프

**PowerShell에서:**

```powershell
cd "`[개인`] 김지훈"
```

**주의**: 백틱(`)은 키보드에서 물결표(~) 키와 같은 위치에 있습니다.

---

### 방법 3: Tab 자동완성 사용

**PowerShell에서:**

```powershell
cd "[개인
```

그리고 **Tab 키**를 누르면 자동으로 완성됩니다.

---

### 방법 4: Get-ChildItem으로 정확한 이름 확인

**PowerShell에서:**

```powershell
# 현재 폴더 목록 확인
Get-ChildItem

# 특정 폴더 찾기
Get-ChildItem | Where-Object { $_.Name -like "*개인*" }

# 찾은 폴더로 이동
cd -LiteralPath (Get-ChildItem | Where-Object { $_.Name -like "*개인*" }).FullName
```

---

## 📋 전체 실행 순서

**PowerShell에서 순서대로 실행:**

### 1단계: 바탕화면으로 이동 (이미 완료)

```powershell
cd Desktop
```

### 2단계: 프로젝트 폴더로 이동 (-LiteralPath 사용)

```powershell
cd -LiteralPath "[개인] 김지훈"
```

### 3단계: 오우스 자동화 폴더로 이동

```powershell
cd -LiteralPath "오우스 자동화"
```

**또는 한 번에:**

```powershell
cd -LiteralPath "[개인] 김지훈\오우스 자동화"
```

### 4단계: 현재 위치 확인

```powershell
pwd
```

### 5단계: 파일 확인

```powershell
dir run-migration.js
dir MIGRATION_SQL_COMPLETE.sql
```

### 6단계: 마이그레이션 실행

```powershell
$env:DATABASE_URL = "postgresql://postgres:KMnIhyLAmNcXmrORUPesiPzwrniFgLlB@switchyard.proxy.rlwy.net:38414/railway"
```

```powershell
node run-migration.js
```

---

## 🎯 빠른 실행 (복사하여 붙여넣기)

**PowerShell에서 아래 명령어를 순서대로 실행:**

```powershell
cd -LiteralPath "[개인] 김지훈"
```

```powershell
cd -LiteralPath "오우스 자동화"
```

```powershell
pwd
```

```powershell
dir run-migration.js
```

```powershell
$env:DATABASE_URL = "postgresql://postgres:KMnIhyLAmNcXmrORUPesiPzwrniFgLlB@switchyard.proxy.rlwy.net:38414/railway"
```

```powershell
node run-migration.js
```

---

## 🔍 폴더 구조 확인

**현재 바탕화면 구조:**
```
Desktop/
  └── [개인] 김지훈/
      └── 오우스 자동화/  ← 여기로 이동해야 함
```

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
