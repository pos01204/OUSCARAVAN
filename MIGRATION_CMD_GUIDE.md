# CMD(Command Prompt)에서 마이그레이션 실행 가이드

## 📋 현재 상황

Command Prompt(CMD)를 사용하고 있습니다. CMD에서는 PowerShell 명령어가 작동하지 않습니다.

---

## ✅ 해결 방법

### 방법 1: PowerShell로 전환 (권장)

**CMD에서 PowerShell 실행:**

```cmd
powershell
```

PowerShell이 열리면:

```powershell
# 프로젝트 디렉토리로 이동
cd "C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화"

# 환경 변수 설정
$env:DATABASE_URL = "postgresql://postgres:KMnIhyLAmNcXmrORUPesiPzwrniFgLlB@switchyard.proxy.rlwy.net:38414/railway"

# 마이그레이션 실행
node run-migration.js
```

---

### 방법 2: CMD에서 직접 실행

**CMD에서:**

```cmd
REM 프로젝트 디렉토리로 이동 (이미 있는 경우 생략)
cd "C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화"

REM 환경 변수 설정
set DATABASE_URL=postgresql://postgres:KMnIhyLAmNcXmrORUPesiPzwrniFgLlB@switchyard.proxy.rlwy.net:38414/railway

REM 마이그레이션 실행
node run-migration.js
```

**주의**: CMD에서는 따옴표 없이 설정해야 합니다.

---

### 방법 3: psql 직접 사용 (CMD)

**CMD에서:**

```cmd
cd "C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화"

psql "postgresql://postgres:KMnIhyLAmNcXmrORUPesiPzwrniFgLlB@switchyard.proxy.rlwy.net:38414/railway" -f MIGRATION_SQL_COMPLETE.sql
```

---

## 📋 CMD vs PowerShell 명령어 비교

| 작업 | CMD | PowerShell |
|------|-----|------------|
| 현재 디렉토리 확인 | `cd` | `pwd` |
| 파일 목록 | `dir` | `ls` 또는 `dir` |
| 환경 변수 설정 | `set VAR=value` | `$env:VAR = "value"` |
| 환경 변수 확인 | `set VAR` | `$env:VAR` |

---

## 🚀 빠른 실행 (CMD)

**CMD에서 순서대로 실행:**

```cmd
cd "C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화"
set DATABASE_URL=postgresql://postgres:KMnIhyLAmNcXmrORUPesiPzwrniFgLlB@switchyard.proxy.rlwy.net:38414/railway
node run-migration.js
```

---

## 🚀 빠른 실행 (PowerShell)

**CMD에서 PowerShell 실행 후:**

```powershell
cd "C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화"
$env:DATABASE_URL = "postgresql://postgres:KMnIhyLAmNcXmrORUPesiPzwrniFgLlB@switchyard.proxy.rlwy.net:38414/railway"
node run-migration.js
```

---

## ✅ 파일 확인 (CMD)

**CMD에서:**

```cmd
dir run-migration.js
dir MIGRATION_SQL_COMPLETE.sql
```

**또는:**

```cmd
dir *.js
dir *.sql
```

---

## 🐛 문제 해결

### 문제 1: node 명령어를 찾을 수 없음

**해결:**
- Node.js가 설치되어 있는지 확인
- Node.js 설치 경로가 PATH에 포함되어 있는지 확인
- CMD를 재시작

### 문제 2: psql 명령어를 찾을 수 없음

**해결:**
- PostgreSQL이 설치되어 있는지 확인
- PostgreSQL 설치 경로가 PATH에 포함되어 있는지 확인
- 또는 Node.js 스크립트 사용

### 문제 3: 파일을 찾을 수 없음

**해결:**
```cmd
cd "C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화"
dir
```

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
