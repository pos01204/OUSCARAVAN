# 바탕화면으로 이동하는 방법

## 📍 현재 상황

- 현재 위치: `C:\Users\김지훈`
- 목표 위치: 바탕화면의 `[개인] 김지훈\오우스 자동화` 폴더

---

## 🚀 바탕화면으로 이동하는 방법

### 방법 1: Desktop 경로 사용 (영문 Windows)

**PowerShell에서:**

```powershell
# 바탕화면으로 이동
cd Desktop

# 프로젝트 폴더로 이동
cd "[개인] 김지훈\오우스 자동화"
```

**또는 한 번에:**

```powershell
cd "Desktop\[개인] 김지훈\오우스 자동화"
```

---

### 방법 2: 전체 경로 사용

**PowerShell에서:**

```powershell
# 전체 경로로 이동 (따옴표 필수!)
cd "C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화"
```

---

### 방법 3: 바탕화면 환경 변수 사용

**PowerShell에서:**

```powershell
# 바탕화면 경로 확인
[Environment]::GetFolderPath("Desktop")

# 바탕화면으로 이동
cd ([Environment]::GetFolderPath("Desktop"))

# 프로젝트 폴더로 이동
cd "[개인] 김지훈\오우스 자동화"
```

**또는 한 번에:**

```powershell
cd "$([Environment]::GetFolderPath('Desktop'))\[개인] 김지훈\오우스 자동화"
```

---

### 방법 4: 상대 경로 사용

**현재 위치가 `C:\Users\김지훈`인 경우:**

```powershell
# 바탕화면으로 이동
cd Desktop

# 현재 디렉토리 확인
pwd

# 폴더 목록 확인
dir

# 프로젝트 폴더 찾기 및 이동
cd "[개인] 김지훈\오우스 자동화"
```

---

## 📋 단계별 실행

**PowerShell에서 순서대로 실행:**

### 1단계: 현재 위치 확인

```powershell
pwd
```

**예상 출력:**
```
Path
----
C:\Users\김지훈
```

### 2단계: 바탕화면으로 이동

```powershell
cd Desktop
```

### 3단계: 바탕화면 내용 확인

```powershell
dir
```

### 4단계: 프로젝트 폴더로 이동

```powershell
cd "[개인] 김지훈\오우스 자동화"
```

### 5단계: 현재 위치 확인

```powershell
pwd
```

**예상 출력:**
```
Path
----
C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화
```

### 6단계: 파일 확인

```powershell
dir run-migration.js
dir MIGRATION_SQL_COMPLETE.sql
```

### 7단계: 마이그레이션 실행

```powershell
# 환경 변수 설정
$env:DATABASE_URL = "postgresql://postgres:KMnIhyLAmNcXmrORUPesiPzwrniFgLlB@switchyard.proxy.rlwy.net:38414/railway"

# 마이그레이션 실행
node run-migration.js
```

---

## 🎯 빠른 실행 (복사하여 붙여넣기)

**PowerShell에서 아래 명령어를 순서대로 실행:**

```powershell
cd Desktop
```

```powershell
cd "[개인] 김지훈\오우스 자동화"
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

## 🐛 문제 해결

### 문제 1: Desktop 폴더를 찾을 수 없음

**해결:**
```powershell
# 바탕화면 경로 확인
[Environment]::GetFolderPath("Desktop")

# 확인된 경로로 이동
cd "확인된경로"
```

### 문제 2: 폴더 이름이 다름

**해결:**
```powershell
# 바탕화면으로 이동
cd Desktop

# 폴더 목록 확인
dir

# 실제 폴더 이름으로 이동
cd "실제폴더이름"
```

### 문제 3: 대괄호 문제

**해결:**
- 경로를 따옴표로 감싸기
- 또는 이스케이프: `` `[개인`] ``

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
