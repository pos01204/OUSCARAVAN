# 예약 데이터 초기화 간단 가이드

## ✅ 가장 간단한 방법: Node.js 스크립트 사용

`psql`이 설치되어 있지 않아도 Node.js만 있으면 됩니다.

### 1단계: 환경 변수 설정

PowerShell에서 실행:

```powershell
$env:DATABASE_URL="postgresql://postgres:KMnIhyLAmNcXmrORUPesiPzwrniFgLlB@switchyard.proxy.rlwy.net:38414/railway"
```

### 2단계: 스크립트 실행

```powershell
node clear-reservations.js
```

## 📋 전체 과정 (한 번에)

```powershell
# 현재 위치 확인 (이미 올바른 위치에 있음)
pwd

# 환경 변수 설정
$env:DATABASE_URL="postgresql://postgres:KMnIhyLAmNcXmrORUPesiPzwrniFgLlB@switchyard.proxy.rlwy.net:38414/railway"

# 스크립트 실행
node clear-reservations.js
```

## 🔧 또는 PowerShell 스크립트 사용

```powershell
.\clear-reservations.ps1
```

스크립트가 Connection URL을 요청하면:
```
postgresql://postgres:KMnIhyLAmNcXmrORUPesiPzwrniFgLlB@switchyard.proxy.rlwy.net:38414/railway
```

를 붙여넣으세요.

## ⚠️ 주의사항

1. **Node.js 필요**: `node --version`으로 Node.js가 설치되어 있는지 확인
2. **pg 패키지 필요**: `npm install pg`로 설치 (이미 설치되어 있을 수 있음)
3. **보안**: Connection URL에 비밀번호가 포함되어 있으므로 사용 후 환경 변수 삭제 권장:
   ```powershell
   Remove-Item Env:\DATABASE_URL
   ```

## 🐛 문제 해결

### Node.js가 없을 때

```powershell
# Node.js 설치 확인
node --version

# 없으면 Node.js 설치 필요
# https://nodejs.org/ 에서 다운로드
```

### pg 패키지가 없을 때

```powershell
# pg 패키지 설치
npm install pg
```

## 📚 참고

- Node.js 스크립트: `clear-reservations.js`
- PowerShell 스크립트: `clear-reservations.ps1`
- 상세 가이드: `CLEAR_RESERVATIONS_GUIDE.md`
