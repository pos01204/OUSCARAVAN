# 예약 데이터 초기화 가이드 (로컬 실행)

## 🔍 문제

Railway CLI로 실행할 때 내부 네트워크 주소(`postgres.railway.internal`)를 사용하여 로컬에서 연결할 수 없습니다.

**에러 메시지:**
```
❌ 오류 발생: getaddrinfo ENOTFOUND postgres.railway.internal
```

## ✅ 해결 방법

로컬에서 실행할 때는 **공개 네트워크 주소**를 사용해야 합니다.

### 방법 1: PowerShell 스크립트 사용 (가장 간단) ⭐

1. **Railway에서 공개 네트워크 Connection URL 복사:**
   - Railway 대시보드 → PostgreSQL 서비스
   - **"Connect"** 버튼 클릭
   - **"Public Network"** 탭 선택 (⚠️ Internal Network 아님!)
   - **"Connection URL"** 복사
   - 예시: `postgresql://postgres:비밀번호@switchyard.proxy.rlwy.net:38414/railway`

2. **스크립트 실행:**
   ```powershell
   .\clear-reservations.ps1
   ```
   
   스크립트가 Connection URL을 요청하면 위에서 복사한 URL을 붙여넣으세요.

### 방법 2: 수동으로 환경 변수 설정

1. **Railway에서 공개 네트워크 Connection URL 복사** (위와 동일)

2. **PowerShell에서 실행:**
   ```powershell
   $env:DATABASE_URL="postgresql://postgres:비밀번호@switchyard.proxy.rlwy.net:38414/railway"
   node clear-reservations.js
   ```

### 방법 3: Railway CLI 사용 (Railway 서버 내부에서 실행)

Railway CLI는 Railway 서버 내부에서 실행되므로 내부 네트워크 주소를 사용합니다. 로컬에서 실행할 때는 위의 방법 1 또는 2를 사용하세요.

## 📋 Connection URL 형식

### ❌ 잘못된 형식 (내부 네트워크)
```
postgresql://postgres:비밀번호@postgres.railway.internal:5432/railway
```
- 로컬에서 연결할 수 없음
- Railway 서버 내부에서만 사용 가능

### ✅ 올바른 형식 (공개 네트워크)
```
postgresql://postgres:비밀번호@switchyard.proxy.rlwy.net:38414/railway
```
- 로컬에서 연결 가능
- Railway Connect 다이얼로그의 "Public Network" 탭에서 제공

## 🔍 확인 방법

### Connection URL이 올바른지 확인

**올바른 URL 특징:**
- `switchyard.proxy.rlwy.net` 또는 `*.proxy.rlwy.net` 포함
- 포트 번호가 포함됨 (예: `:38414`)
- `railway.internal`이 **없음**

**잘못된 URL 특징:**
- `postgres.railway.internal` 포함
- `railway.internal` 포함

## ⚠️ 주의사항

1. **Public Network vs Internal Network**
   - 로컬 실행: **Public Network** 사용 필수
   - Railway 서버 내부 실행: Internal Network 사용 가능

2. **보안**
   - 공개 네트워크 URL은 비밀번호를 포함하므로 안전하게 관리하세요
   - 사용 후 환경 변수를 삭제하는 것을 권장합니다:
     ```powershell
     Remove-Item Env:\DATABASE_URL
     ```

3. **방 데이터는 유지됨**
   - 예약 데이터만 삭제됩니다
   - 방 데이터(rooms)는 삭제되지 않습니다

## 🐛 문제 해결

### 문제 1: 여전히 내부 네트워크 주소 사용

**해결:**
1. Railway 대시보드에서 **"Public Network"** 탭을 선택했는지 확인
2. 환경 변수 확인:
   ```powershell
   echo $env:DATABASE_URL
   ```
3. 내부 네트워크 주소가 포함되어 있으면 제거 후 다시 설정

### 문제 2: 연결 시간 초과

**해결:**
1. Railway PostgreSQL 서비스가 "Online" 상태인지 확인
2. 방화벽 설정 확인
3. Connection URL이 올바른지 다시 확인

### 문제 3: 인증 실패

**해결:**
1. Connection URL의 비밀번호가 올바른지 확인
2. Railway에서 새로운 Connection URL 생성 시도
3. PostgreSQL 서비스 재시작

## 📚 참고

- Railway PostgreSQL 연결: [Railway 문서](https://docs.railway.app/databases/postgresql)
- 예약 데이터 초기화 스크립트: `clear-reservations.js`
- PowerShell 스크립트: `clear-reservations.ps1`
