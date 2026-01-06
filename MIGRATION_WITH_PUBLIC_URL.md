# Railway 마이그레이션 실행 가이드 (공개 네트워크 사용)

## ❌ 문제: 내부 네트워크 주소 오류

`DATABASE_URL` 환경 변수가 내부 네트워크 주소(`postgres.railway.internal`)를 가리키고 있어서 로컬에서 연결할 수 없습니다.

## ✅ 해결 방법: 공개 네트워크 주소 사용

### 방법 1: PowerShell 스크립트 사용 (가장 간단)

**1단계: Railway Connect 다이얼로그에서 Connection URL 복사**

1. Railway 대시보드 → **Postgres** 서비스 선택
2. **"Connect"** 버튼 클릭
3. **"Public Network"** 탭 선택
4. **"Connection URL"** 복사
   ```
   postgresql://postgres:비밀번호@switchyard.proxy.rlwy.net:38414/railway
   ```

**2단계: PowerShell 스크립트 실행**

```powershell
.\run-migration-public.ps1
```

스크립트가 Connection URL을 요청하면 위에서 복사한 URL을 붙여넣으세요.

---

### 방법 2: 수동으로 환경 변수 설정

**PowerShell에서 실행:**

```powershell
# Railway Connect 다이얼로그에서 복사한 Connection URL 사용
$env:DATABASE_URL="postgresql://postgres:비밀번호@switchyard.proxy.rlwy.net:38414/railway"

# 마이그레이션 실행
node run-migration.js
```

**또는 한 줄로:**

```powershell
$env:DATABASE_URL="postgresql://postgres:비밀번호@switchyard.proxy.rlwy.net:38414/railway"; node run-migration.js
```

---

### 방법 3: psql 직접 사용

**Railway Connect 다이얼로그에서 Connection URL 복사 후:**

```powershell
# Connection URL을 직접 사용
psql "postgresql://postgres:비밀번호@switchyard.proxy.rlwy.net:38414/railway" -f MIGRATION_SQL_COMPLETE.sql
```

---

## 📋 Connection URL 형식

Railway Connect 다이얼로그에서 제공하는 Connection URL 형식:

```
postgresql://postgres:비밀번호@switchyard.proxy.rlwy.net:38414/railway
```

**구성 요소:**
- **프로토콜**: `postgresql://`
- **사용자명**: `postgres`
- **비밀번호**: Railway에서 자동 생성된 비밀번호
- **호스트**: `switchyard.proxy.rlwy.net`
- **포트**: `38414` (Railway에서 제공)
- **데이터베이스**: `railway`

---

## ✅ 실행 후 확인

마이그레이션 실행 후 Railway 대시보드에서 확인:

1. Railway 대시보드 → Postgres → **"Database"** → **"Data"** 탭
2. 테이블 목록에 4개 테이블이 표시되는지 확인:
   - `check_in_out_logs`
   - `orders`
   - `reservations`
   - `rooms`

---

## 🐛 문제 해결

### 문제 1: Connection URL을 모르는 경우

**해결**:
1. Railway 대시보드 → Postgres → **"Connect"** 버튼
2. **"Public Network"** 탭 선택
3. **"Connection URL"** 복사

### 문제 2: 비밀번호를 모르는 경우

**해결**:
- Railway Connect 다이얼로그의 Connection URL에 비밀번호가 포함되어 있습니다
- 또는 Railway 대시보드 → Postgres → **"Database"** → **"Credentials"** 탭에서 확인

### 문제 3: 연결 실패

**해결**:
1. Connection URL이 올바른지 확인
2. Public Network를 사용하는지 확인 (Private Network는 로컬에서 연결 불가)
3. Railway 서비스가 실행 중인지 확인

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
