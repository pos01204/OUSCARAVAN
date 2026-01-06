# Railway 마이그레이션 직접 실행 가이드

## 🔑 비밀번호 정보

Railway PostgreSQL 데이터베이스의 비밀번호는 Railway 대시보드에서 확인할 수 있습니다:

1. Railway 대시보드 → **Postgres** 서비스 선택
2. **"Database"** 탭 → **"Credentials"** 탭
3. **"Password"** 필드에서 비밀번호 확인 (또는 "Show" 클릭)

또는 **Railway CLI를 사용하면 비밀번호를 직접 입력할 필요가 없습니다** (자동 인증).

---

## 🚀 Railway CLI를 사용한 실행 (권장)

### 1단계: Railway CLI 설치

PowerShell 또는 Command Prompt에서 실행:

```bash
npm install -g @railway/cli
```

### 2단계: Railway 로그인

```bash
railway login
```

브라우저가 열리면 Railway 계정으로 로그인하세요.

### 3단계: 프로젝트 연결

```bash
railway link
```

프롬프트가 나타나면:
- 프로젝트 선택: `dynamic-radiance` (또는 해당 프로젝트)
- 서비스 선택: `Postgres`

### 4단계: 데이터베이스 연결 및 SQL 실행

**방법 A: psql 대화형 모드 사용**

```bash
railway connect Postgres
```

psql이 열리면:
1. `MIGRATION_SQL_COMPLETE.sql` 파일을 열어서 전체 내용 복사
2. psql 창에 붙여넣기 (Ctrl+V)
3. Enter 키를 눌러 실행

**방법 B: 파일 직접 실행**

```bash
# Windows PowerShell에서
Get-Content MIGRATION_SQL_COMPLETE.sql | railway connect Postgres
```

또는:

```bash
# psql이 열린 후
\i MIGRATION_SQL_COMPLETE.sql
```

---

## 🔧 psql 직접 사용 (Railway CLI 없이)

### 1단계: PostgreSQL 클라이언트 설치 확인

```bash
psql --version
```

설치되지 않았다면 PostgreSQL 설치 필요: https://www.postgresql.org/download/windows/

### 2단계: Railway Connect 다이얼로그에서 정보 확인

Railway 대시보드 → Postgres → "Connect" 버튼 클릭:

- **Connection URL**: `postgresql://postgres:비밀번호@switchyard.proxy.rlwy.net:38414/railway`
- **Host**: `switchyard.proxy.rlwy.net`
- **Port**: `38414`
- **Database**: `railway`
- **Username**: `postgres`
- **Password**: Railway 대시보드에서 확인

### 3단계: psql로 연결 및 SQL 실행

**Windows PowerShell에서:**

```powershell
# 비밀번호를 환경 변수로 설정 (Railway 대시보드에서 확인한 비밀번호)
$env:PGPASSWORD="your-password-here"

# psql로 연결
psql -h switchyard.proxy.rlwy.net -U postgres -p 38414 -d railway -f MIGRATION_SQL_COMPLETE.sql
```

또는 Connection URL 사용:

```powershell
# Connection URL 사용 (비밀번호 부분을 실제 비밀번호로 교체)
psql "postgresql://postgres:your-password-here@switchyard.proxy.rlwy.net:38414/railway" -f MIGRATION_SQL_COMPLETE.sql
```

---

## 📋 실행할 SQL 파일

`MIGRATION_SQL_COMPLETE.sql` 파일을 열어서 전체 내용을 복사하여 사용하세요.

파일 위치: `C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화\MIGRATION_SQL_COMPLETE.sql`

---

## ✅ 실행 후 확인

### 테이블 생성 확인

psql에서 다음 쿼리 실행:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**예상 결과** (4개 테이블):
- `check_in_out_logs`
- `orders`
- `reservations`
- `rooms`

### Railway UI에서 확인

1. Railway 대시보드 → Postgres → "Database" → "Data" 탭
2. 테이블 목록에 4개 테이블이 표시되는지 확인

---

## 🐛 문제 해결

### 문제 1: Railway CLI가 설치되지 않음

**해결**:
```bash
npm install -g @railway/cli
```

### 문제 2: psql이 설치되지 않음

**해결**:
- PostgreSQL 공식 사이트에서 설치: https://www.postgresql.org/download/windows/
- 또는 Railway CLI 사용 (psql 설치 불필요)

### 문제 3: 연결 실패

**해결**:
1. Connection URL이 올바른지 확인
2. 비밀번호가 올바른지 확인 (Railway 대시보드 → Postgres → Database → Credentials)
3. Public Network를 사용하는 경우 Egress 비용 발생 가능

### 문제 4: 비밀번호를 모르는 경우

**해결**:
1. Railway 대시보드 → Postgres 서비스 선택
2. "Database" 탭 → "Credentials" 탭
3. "Password" 필드에서 비밀번호 확인 (또는 "Show" 클릭)
4. 또는 Railway CLI 사용 (비밀번호 입력 불필요)

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
