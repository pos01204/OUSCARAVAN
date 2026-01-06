# 마이그레이션 실행 경로 가이드

## 📍 실행 경로

**현재 프로젝트 디렉토리에서 실행하세요:**

```
C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화
```

이 디렉토리에 다음 파일들이 있어야 합니다:
- `run-migration.js` - Node.js 마이그레이션 스크립트
- `MIGRATION_SQL_COMPLETE.sql` - 실행할 SQL 파일
- `package.json` - Node.js 프로젝트 설정

---

## ✅ 현재 디렉토리 확인 방법

**PowerShell에서:**

```powershell
# 현재 디렉토리 확인
pwd

# 또는
Get-Location
```

**예상 출력:**
```
Path
----
C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화
```

---

## 🚀 실행 방법

### 1단계: 프로젝트 디렉토리로 이동 (필요한 경우)

**PowerShell에서:**

```powershell
cd "C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화"
```

### 2단계: 필요한 파일 확인

```powershell
# 파일 존재 확인
ls run-migration.js
ls MIGRATION_SQL_COMPLETE.sql
```

### 3단계: 마이그레이션 실행

**방법 A: Node.js 스크립트 사용**

```powershell
# 환경 변수 설정
$env:DATABASE_URL = "postgresql://postgres:KMnIhyLAmNcXmrORUPesiPzwrniFgLlB@switchyard.proxy.rlwy.net:38414/railway"

# 마이그레이션 실행
node run-migration.js
```

**방법 B: psql 직접 사용**

```powershell
psql "postgresql://postgres:KMnIhyLAmNcXmrORUPesiPzwrniFgLlB@switchyard.proxy.rlwy.net:38414/railway" -f MIGRATION_SQL_COMPLETE.sql
```

---

## 📋 전체 실행 순서

### PowerShell 사용 시

**PowerShell에서 순서대로 실행:**

```powershell
# 1. 프로젝트 디렉토리로 이동 (이미 있는 경우 생략 가능)
cd "C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화"

# 2. 현재 디렉토리 확인
pwd

# 3. 필요한 파일 확인
dir run-migration.js
dir MIGRATION_SQL_COMPLETE.sql

# 4. 환경 변수 설정
$env:DATABASE_URL = "postgresql://postgres:KMnIhyLAmNcXmrORUPesiPzwrniFgLlB@switchyard.proxy.rlwy.net:38414/railway"

# 5. 마이그레이션 실행
node run-migration.js
```

### CMD(Command Prompt) 사용 시

**CMD에서 순서대로 실행:**

```cmd
REM 1. 프로젝트 디렉토리로 이동 (이미 있는 경우 생략 가능)
cd "C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화"

REM 2. 현재 디렉토리 확인
cd

REM 3. 필요한 파일 확인
dir run-migration.js
dir MIGRATION_SQL_COMPLETE.sql

REM 4. 환경 변수 설정 (따옴표 없이)
set DATABASE_URL=postgresql://postgres:KMnIhyLAmNcXmrORUPesiPzwrniFgLlB@switchyard.proxy.rlwy.net:38414/railway

REM 5. 마이그레이션 실행
node run-migration.js
```

### 또는 배치 파일 사용 (가장 간단)

**CMD에서:**

```cmd
run-migration.cmd
```

또는 더블 클릭으로 실행 가능합니다.

---

## 🐛 문제 해결

### 문제 1: 파일을 찾을 수 없음

**해결:**
```powershell
# 현재 디렉토리 확인
pwd

# 프로젝트 디렉토리로 이동
cd "C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화"
```

### 문제 2: node 명령어를 찾을 수 없음

**해결:**
- Node.js가 설치되어 있는지 확인
- PowerShell을 재시작
- 또는 전체 경로 사용: `C:\Program Files\nodejs\node.exe run-migration.js`

### 문제 3: psql 명령어를 찾을 수 없음

**해결:**
- PostgreSQL이 설치되어 있는지 확인
- PostgreSQL 설치 경로가 PATH에 포함되어 있는지 확인
- 또는 Node.js 스크립트 사용 (방법 A)

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
