# Railway CLI를 사용한 마이그레이션 가이드

## 📋 현재 상황

- Railway UI에 Query 탭이 없음
- Connect 버튼을 통해 연결 정보 확인 가능
- Railway CLI를 사용하여 SQL 실행 필요

## 🚀 Railway CLI 사용 방법

### 1단계: Railway CLI 설치

터미널에서 실행:

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
1. 프로젝트 선택: `dynamic-radiance` (또는 해당 프로젝트)
2. 서비스 선택: `Postgres` (데이터베이스 서비스)

### 4단계: 데이터베이스 연결

```bash
railway connect Postgres
```

또는 Connect 다이얼로그에 표시된 명령어 사용:
```bash
railway connect Postgres
```

이 명령어를 실행하면 psql이 열립니다.

### 5단계: SQL 실행

psql이 열리면, `MIGRATION_SQL_COMPLETE.sql` 파일의 내용을 복사하여 붙여넣고 Enter를 누르세요.

또는 파일을 직접 실행:

```bash
# Railway CLI로 연결한 후
railway connect Postgres < MIGRATION_SQL_COMPLETE.sql
```

---

## 🔧 대안: psql 직접 사용

### 방법 1: Connection URL 사용

Connect 다이얼로그에서 "Connection URL"을 복사하고:

```bash
# Windows PowerShell에서
$env:PGPASSWORD="your-password-here"
psql "postgresql://postgres:password@switchyard.proxy.rlwy.net:38414/railway" -f MIGRATION_SQL_COMPLETE.sql
```

### 방법 2: Raw psql command 사용

Connect 다이얼로그에서 "Raw `psql` command"를 복사하고:

```bash
# Windows PowerShell에서
# PGPASSWORD 환경 변수 설정 (비밀번호는 Connect 다이얼로그에서 확인)
$env:PGPASSWORD="your-password-here"
psql -h switchyard.proxy.rlwy.net -U postgres -p 38414 -d railway -f MIGRATION_SQL_COMPLETE.sql
```

---

## 📝 단계별 실행 가이드

### 옵션 A: Railway CLI 사용 (권장)

1. **터미널 열기**
   - Windows PowerShell 또는 Command Prompt

2. **Railway CLI 설치 확인**
   ```bash
   railway --version
   ```
   설치되지 않았다면:
   ```bash
   npm install -g @railway/cli
   ```

3. **프로젝트 디렉토리로 이동**
   ```bash
   cd "C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화"
   ```

4. **Railway 로그인 및 연결**
   ```bash
   railway login
   railway link
   ```

5. **데이터베이스 연결**
   ```bash
   railway connect Postgres
   ```

6. **SQL 실행**
   - psql이 열리면 `MIGRATION_SQL_COMPLETE.sql` 파일 내용을 복사하여 붙여넣기
   - 또는 파일 경로를 사용:
   ```bash
   \i MIGRATION_SQL_COMPLETE.sql
   ```

### 옵션 B: psql 직접 사용

1. **PostgreSQL 클라이언트 설치 확인**
   ```bash
   psql --version
   ```
   설치되지 않았다면 PostgreSQL 설치 필요

2. **Connection URL 사용**
   - Connect 다이얼로그에서 "Connection URL" 복사
   - 비밀번호 부분을 실제 비밀번호로 교체
   ```bash
   psql "postgresql://postgres:실제비밀번호@switchyard.proxy.rlwy.net:38414/railway" -f MIGRATION_SQL_COMPLETE.sql
   ```

---

## ✅ 실행 후 확인

### Railway CLI에서 확인

psql이 열린 상태에서:

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
- PostgreSQL 공식 사이트에서 설치: https://www.postgresql.org/download/
- 또는 Railway CLI 사용 (psql 설치 불필요)

### 문제 3: 연결 실패

**해결**:
1. Connection URL이 올바른지 확인
2. 비밀번호가 올바른지 확인
3. Public Network를 사용하는 경우 Egress 비용 발생 가능

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
