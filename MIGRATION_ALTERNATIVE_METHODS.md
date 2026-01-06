# Railway 마이그레이션 대안 방법

## ❌ 문제: psql이 설치되지 않음

Railway CLI의 `railway connect Postgres` 명령어는 psql이 필요합니다.

---

## ✅ 해결 방법

### 방법 1: PostgreSQL 설치 (가장 간단)

**PostgreSQL 다운로드 및 설치:**
1. https://www.postgresql.org/download/windows/ 접속
2. "Download the installer" 클릭
3. 설치 파일 실행
4. 설치 과정에서:
   - **Password**: PostgreSQL superuser 비밀번호 설정 (기억해두세요)
   - **Port**: 기본값 `5432` 사용
   - 나머지는 기본값 사용
5. 설치 완료 후 PowerShell에서 확인:
   ```powershell
   psql --version
   ```

**설치 후 실행:**
```powershell
railway connect Postgres
```

psql이 열리면 `MIGRATION_SQL_COMPLETE.sql` 파일 내용을 복사하여 붙여넣고 Enter를 누르세요.

---

### 방법 2: Railway 대시보드에서 직접 실행

**Railway UI에서 Query 탭 찾기:**

1. Railway 대시보드 → **Postgres** 서비스 선택
2. **"Database"** 탭 클릭
3. **"Query"** 또는 **"SQL Editor"** 탭 찾기
   - "Data" 탭 옆에 있을 수 있습니다
   - 상단 네비게이션에서 찾아보세요
4. Query 탭에서:
   - `MIGRATION_SQL_COMPLETE.sql` 파일 내용 복사
   - 붙여넣기
   - **"Run"** 또는 **"Execute"** 클릭

**Query 탭이 보이지 않는 경우:**
- Railway 버전에 따라 Query 탭이 없을 수 있습니다
- 아래 방법 3 또는 4 사용

---

### 방법 3: 외부 PostgreSQL 클라이언트 사용

**추천 클라이언트:**
- **pgAdmin** (무료, 공식): https://www.pgadmin.org/download/
- **DBeaver** (무료): https://dbeaver.io/download/
- **TablePlus** (유료, 무료 체험): https://tableplus.com/

**연결 정보 확인:**
1. Railway 대시보드 → Postgres → **"Connect"** 버튼 클릭
2. **"Public Network"** 탭 선택
3. **"Connection URL"** 복사:
   ```
   postgresql://postgres:비밀번호@switchyard.proxy.rlwy.net:38414/railway
   ```
4. 또는 개별 정보:
   - **Host**: `switchyard.proxy.rlwy.net`
   - **Port**: `38414`
   - **Database**: `railway`
   - **Username**: `postgres`
   - **Password**: Railway 대시보드에서 확인

**클라이언트에서 연결 후:**
1. SQL 쿼리 창 열기
2. `MIGRATION_SQL_COMPLETE.sql` 파일 내용 붙여넣기
3. 실행

---

### 방법 4: Railway CLI 환경 변수 사용

**Railway CLI로 환경 변수 확인:**

```powershell
# Railway 프로젝트 연결
railway link

# DATABASE_URL 환경 변수 확인
railway variables
```

**환경 변수를 사용하여 psql 실행:**

PostgreSQL이 설치되어 있다면:

```powershell
# DATABASE_URL 환경 변수 가져오기
$dbUrl = railway variables | Select-String "DATABASE_URL"

# psql로 연결 (DATABASE_URL 형식: postgresql://user:password@host:port/database)
psql $dbUrl -f MIGRATION_SQL_COMPLETE.sql
```

---

### 방법 5: Node.js 스크립트 사용

PostgreSQL이 설치되지 않은 경우, Node.js를 사용하여 SQL을 실행할 수 있습니다:

**1. pg 패키지 설치:**

```powershell
npm install pg
```

**2. 실행 스크립트 생성:**

`run-migration.js` 파일 생성:

```javascript
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Railway DATABASE_URL 환경 변수 사용
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@switchyard.proxy.rlwy.net:38414/railway';

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  try {
    await client.connect();
    console.log('데이터베이스에 연결되었습니다.');

    const sql = fs.readFileSync(path.join(__dirname, 'MIGRATION_SQL_COMPLETE.sql'), 'utf8');
    
    await client.query(sql);
    console.log('마이그레이션이 완료되었습니다!');

    // 테이블 확인
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n생성된 테이블:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

  } catch (error) {
    console.error('오류 발생:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
```

**3. Railway 환경 변수 설정 후 실행:**

```powershell
# Railway 프로젝트 연결
railway link

# Railway 환경 변수 사용하여 실행
railway run node run-migration.js
```

---

## 🎯 권장 방법

1. **가장 간단**: PostgreSQL 설치 (방법 1)
2. **빠른 실행**: Railway 대시보드 Query 탭 (방법 2)
3. **GUI 선호**: 외부 클라이언트 사용 (방법 3)
4. **자동화**: Node.js 스크립트 (방법 5)

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
