# Railway PostgreSQL 인증 실패 해결 가이드

## ❌ 문제: PostgreSQL 인증 실패

**증상:**
- Health check는 성공: `{"status":"ok","timestamp":"2026-01-06T05:26:50.984Z"}`
- 서버가 시작되지만 곧바로 종료됨: `npm error signal SIGTERM`
- PostgreSQL 인증 실패: `FATAL: password authentication failed for user "postgres"`

**원인:**
- Railway의 `DATABASE_URL` 환경 변수가 잘못되었거나 만료됨
- Postgres 서비스와 OUSCARAVAN 서비스의 연결이 끊어짐
- Postgres 서비스가 재생성되면서 DATABASE_URL이 변경됨

---

## ✅ 해결 방법

### 방법 1: Railway에서 DATABASE_URL 재설정 (권장)

#### 1단계: Postgres 서비스 확인

**Railway 대시보드 → Postgres 서비스:**

1. Postgres 서비스가 "Online" 상태인지 확인
2. Postgres 서비스 → **"Variables"** 탭 클릭
3. `DATABASE_URL` 또는 `POSTGRES_URL` 변수 확인
4. **Connection URL 복사**

#### 2단계: OUSCARAVAN 서비스에 DATABASE_URL 설정

**Railway 대시보드 → OUSCARAVAN 서비스:**

1. **"Variables"** 탭 클릭
2. `DATABASE_URL` 변수 확인
3. **변수가 없거나 잘못되었다면:**
   - Postgres 서비스의 `DATABASE_URL` 복사
   - OUSCARAVAN → Variables → `DATABASE_URL` 추가/업데이트
4. **또는 Railway가 자동으로 연결하도록:**
   - OUSCARAVAN 서비스 → **"Settings"** 탭
   - Postgres 서비스를 **"Connect"** 또는 **"Add Service"**로 연결
   - Railway가 자동으로 `DATABASE_URL` 설정

#### 3단계: 서비스 재배포

**Railway 대시보드 → OUSCARAVAN 서비스:**

1. **"Deployments"** 탭 클릭
2. **"Redeploy"** 버튼 클릭
3. 배포 완료 대기

---

### 방법 2: Postgres 서비스 재생성 (최후의 수단)

**주의:** 이 방법은 기존 데이터를 모두 삭제합니다!

1. **Railway 대시보드 → Postgres 서비스**
2. **"Settings"** 탭 → **"Delete Service"** 클릭
3. **새 Postgres 서비스 생성:**
   - Railway 대시보드 → 프로젝트
   - **"+ New"** → **"Database"** → **"Add PostgreSQL"**
4. **OUSCARAVAN 서비스에 연결:**
   - OUSCARAVAN 서비스 → **"Settings"** 탭
   - Postgres 서비스를 **"Connect"**로 연결
5. **데이터베이스 마이그레이션 재실행:**
   - `MIGRATION_SQL_COMPLETE.sql` 파일 실행

---

## 🔍 확인 사항

### 1. Railway 서비스 연결 확인

**Railway 대시보드 → Architecture:**

1. Postgres 서비스와 OUSCARAVAN 서비스가 연결되어 있는지 확인
2. 연결선이 보이지 않으면 연결 필요

### 2. DATABASE_URL 형식 확인

**올바른 형식:**
```
postgresql://postgres:PASSWORD@HOST:PORT/railway
```

**또는:**
```
postgresql://postgres:PASSWORD@HOST.railway.app:PORT/railway
```

**확인 사항:**
- `postgres` 사용자명
- 올바른 비밀번호
- 올바른 호스트 및 포트
- `railway` 데이터베이스명

### 3. Railway 로그 확인

**Railway 대시보드 → OUSCARAVAN → Logs:**

**성공 시 예상 로그:**
```
Testing database connection...
Database client connected
Database connected successfully
Server is running on port 8080
```

**실패 시 로그:**
```
Testing database connection...
Failed to start server: [에러 메시지]
DATABASE_URL: Set
Error message: password authentication failed
```

---

## 🐛 문제 해결

### 문제 1: DATABASE_URL을 찾을 수 없음

**해결:**
1. Railway 대시보드 → Postgres → Variables
2. `DATABASE_URL` 또는 `POSTGRES_URL` 확인
3. 없으면 Postgres 서비스 → Settings → "Connect" 확인

### 문제 2: DATABASE_URL이 업데이트되지 않음

**해결:**
1. Railway 대시보드 → OUSCARAVAN → Variables
2. `DATABASE_URL` 삭제 후 재추가
3. Postgres 서비스의 최신 `DATABASE_URL` 사용
4. OUSCARAVAN 서비스 재배포

### 문제 3: 여전히 인증 실패

**해결:**
1. Postgres 서비스가 "Online" 상태인지 확인
2. Postgres 서비스 재시작
3. OUSCARAVAN 서비스 재배포

---

## 📋 체크리스트

- [ ] Postgres 서비스가 "Online" 상태인지 확인
- [ ] Postgres 서비스와 OUSCARAVAN 서비스가 연결되어 있는지 확인
- [ ] OUSCARAVAN 서비스의 `DATABASE_URL` 환경 변수 확인
- [ ] `DATABASE_URL`이 Postgres 서비스의 최신 URL과 일치하는지 확인
- [ ] OUSCARAVAN 서비스 재배포
- [ ] Railway 로그에서 "Database connected successfully" 확인
- [ ] Health Check 테스트 (`/health`)
- [ ] 로그인 API 테스트 (`/api/auth/login`)

---

## 🚀 빠른 해결 방법

### 단계별 가이드:

1. **Railway 대시보드 → OUSCARAVAN 서비스**
2. **"Variables"** 탭 클릭
3. **`DATABASE_URL`** 변수 확인
4. **변수가 없거나 잘못되었다면:**
   - Postgres 서비스 → Variables → `DATABASE_URL` 복사
   - OUSCARAVAN → Variables → `DATABASE_URL` 추가/업데이트
5. **"Deployments"** 탭 → **"Redeploy"** 클릭
6. **로그 확인:**
   - "Database connected successfully" 메시지 확인
   - "password authentication failed" 메시지가 사라졌는지 확인

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
