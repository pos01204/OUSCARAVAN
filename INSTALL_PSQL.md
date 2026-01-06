# psql 설치 가이드

## 🚀 PostgreSQL 설치 (psql 포함)

### 방법 1: PostgreSQL 공식 설치 (권장)

1. **PostgreSQL 다운로드**
   - https://www.postgresql.org/download/windows/
   - "Download the installer" 클릭
   - 최신 버전 다운로드 (예: PostgreSQL 16.x)

2. **설치**
   - 다운로드한 설치 파일 실행
   - 설치 과정에서:
     - **Installation Directory**: 기본값 사용 (또는 원하는 경로)
     - **Data Directory**: 기본값 사용
     - **Password**: PostgreSQL superuser 비밀번호 설정 (기억해두세요)
     - **Port**: 기본값 `5432` 사용
     - **Advanced Options**: 기본값 사용
   - 설치 완료

3. **환경 변수 확인**
   - 설치 후 자동으로 PATH에 추가됩니다
   - PowerShell에서 확인:
     ```powershell
     psql --version
     ```

### 방법 2: Chocolatey 사용 (빠른 설치)

```powershell
# Chocolatey가 설치되어 있는 경우
choco install postgresql
```

### 방법 3: Scoop 사용

```powershell
# Scoop이 설치되어 있는 경우
scoop install postgresql
```

---

## ✅ 설치 확인

PowerShell에서:

```powershell
psql --version
```

**예상 출력**:
```
psql (PostgreSQL) 16.x
```

---

## 🔧 설치 후 Railway 연결

psql이 설치되면:

```powershell
railway connect Postgres
```

psql이 열리면 `MIGRATION_SQL_COMPLETE.sql` 파일 내용을 복사하여 붙여넣고 Enter를 누르세요.

---

## 📋 대안: Railway CLI로 SQL 파일 직접 실행

psql 설치 없이 SQL을 실행하는 방법:

### 방법 1: Railway CLI + stdin 사용

```powershell
# SQL 파일 내용을 Railway CLI로 전달
Get-Content MIGRATION_SQL_COMPLETE.sql | railway connect Postgres
```

### 방법 2: Railway 환경 변수 사용

Railway CLI는 환경 변수를 통해 데이터베이스 연결 정보를 제공합니다:

```powershell
# Railway 환경 변수 가져오기
railway variables

# DATABASE_URL 환경 변수 사용
railway run --service Postgres psql $DATABASE_URL -f MIGRATION_SQL_COMPLETE.sql
```

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
