# PowerShell에서 특수문자 경로 이동 가이드

## 🔍 문제

경로에 대괄호(`[`, `]`) 같은 특수문자가 포함되어 있어 일반적인 `cd` 명령어로 이동할 수 없습니다.

**경로 예시:**
```
C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화
```

## ✅ 해결 방법

### 방법 1: 따옴표로 경로 감싸기 (가장 간단) ⭐

```powershell
cd "C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화"
```

또는 작은따옴표 사용:
```powershell
cd 'C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화'
```

### 방법 2: 백틱으로 특수문자 이스케이프

```powershell
cd "C:\Users\김지훈\Desktop\`[개인`] 김지훈\오우스 자동화"
```

### 방법 3: Set-Location 사용 (PowerShell 명령어)

```powershell
Set-Location "C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화"
```

또는 짧은 별칭:
```powershell
sl "C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화"
```

### 방법 4: Push-Location 사용 (이전 경로로 돌아갈 수 있음)

```powershell
Push-Location "C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화"
```

나중에 이전 경로로 돌아가려면:
```powershell
Pop-Location
```

## 📋 실제 사용 예시

### 현재 작업 디렉토리로 이동

```powershell
# 따옴표로 경로 감싸기
cd "C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화"

# 현재 경로 확인
pwd
```

### 스크립트 실행

```powershell
# 경로 이동
cd "C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화"

# 스크립트 실행
.\clear-reservations.ps1
```

### 한 줄로 실행

```powershell
cd "C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화"; .\clear-reservations.ps1
```

## 🔧 추가 팁

### 경로에 공백이 있는 경우

경로에 공백이 있어도 따옴표로 감싸면 문제없이 작동합니다:
```powershell
cd "C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화"
```

### 상대 경로 사용

현재 위치에서 상대 경로로 이동:
```powershell
# 현재 위치: C:\Users\김지훈\Desktop
cd ".\[개인] 김지훈\오우스 자동화"
```

### 탭 자동완성 사용

PowerShell에서 경로를 입력하다가 `Tab` 키를 누르면 자동완성됩니다:
```powershell
cd "C:\Users\김지훈\Desktop\[개인"  # Tab 키 누르면 자동완성
```

## ⚠️ 주의사항

1. **대괄호는 특수문자**
   - PowerShell에서 `[`와 `]`는 와일드카드 패턴으로 사용되므로 따옴표로 감싸야 합니다.

2. **한글 경로**
   - 한글이 포함된 경로도 따옴표로 감싸면 문제없이 작동합니다.

3. **경로 확인**
   - 이동 후 `pwd` 또는 `Get-Location`으로 현재 경로를 확인할 수 있습니다.

## 📚 참고

- PowerShell 경로 처리: [Microsoft Docs](https://docs.microsoft.com/powershell/module/microsoft.powershell.core/about/about_path_syntax)
- 특수문자 이스케이프: 백틱(`` ` ``) 사용
