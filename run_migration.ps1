# Railway PostgreSQL 마이그레이션 실행 스크립트
# PowerShell 스크립트

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Railway PostgreSQL 마이그레이션 실행" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Railway CLI 확인
Write-Host "[1/4] Railway CLI 확인 중..." -ForegroundColor Yellow
$railwayInstalled = Get-Command railway -ErrorAction SilentlyContinue

if (-not $railwayInstalled) {
    Write-Host "Railway CLI가 설치되지 않았습니다." -ForegroundColor Red
    Write-Host "설치를 진행합니다..." -ForegroundColor Yellow
    npm install -g @railway/cli
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Railway CLI 설치 실패!" -ForegroundColor Red
        exit 1
    }
    Write-Host "Railway CLI 설치 완료!" -ForegroundColor Green
} else {
    Write-Host "Railway CLI가 설치되어 있습니다." -ForegroundColor Green
}

Write-Host ""

# Railway 로그인 확인
Write-Host "[2/4] Railway 로그인 확인 중..." -ForegroundColor Yellow
railway whoami
if ($LASTEXITCODE -ne 0) {
    Write-Host "Railway에 로그인되지 않았습니다." -ForegroundColor Yellow
    Write-Host "로그인을 진행합니다..." -ForegroundColor Yellow
    railway login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Railway 로그인 실패!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Railway에 로그인되어 있습니다." -ForegroundColor Green
}

Write-Host ""

# 프로젝트 연결 확인
Write-Host "[3/4] 프로젝트 연결 확인 중..." -ForegroundColor Yellow
railway status
if ($LASTEXITCODE -ne 0) {
    Write-Host "프로젝트가 연결되지 않았습니다." -ForegroundColor Yellow
    Write-Host "프로젝트 연결을 진행합니다..." -ForegroundColor Yellow
    railway link
    if ($LASTEXITCODE -ne 0) {
        Write-Host "프로젝트 연결 실패!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "프로젝트가 연결되어 있습니다." -ForegroundColor Green
}

Write-Host ""

# SQL 파일 확인
Write-Host "[4/4] SQL 파일 확인 중..." -ForegroundColor Yellow
$sqlFile = "MIGRATION_SQL_COMPLETE.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "SQL 파일을 찾을 수 없습니다: $sqlFile" -ForegroundColor Red
    exit 1
}
Write-Host "SQL 파일을 찾았습니다: $sqlFile" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "데이터베이스 연결 및 SQL 실행" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Railway 데이터베이스에 연결합니다..." -ForegroundColor Yellow
Write-Host "psql이 열리면 아래 SQL 코드를 복사하여 붙여넣고 Enter를 누르세요." -ForegroundColor Yellow
Write-Host ""
Write-Host "또는 psql에서 다음 명령어를 실행하세요:" -ForegroundColor Yellow
Write-Host "  \i MIGRATION_SQL_COMPLETE.sql" -ForegroundColor Cyan
Write-Host ""
Write-Host "연결 중..." -ForegroundColor Yellow
Write-Host ""

# Railway 데이터베이스 연결
railway connect Postgres

Write-Host ""
Write-Host "마이그레이션이 완료되었습니다!" -ForegroundColor Green
Write-Host ""
Write-Host "테이블 생성 확인을 위해 다음 쿼리를 실행하세요:" -ForegroundColor Yellow
Write-Host "  SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;" -ForegroundColor Cyan
Write-Host ""
