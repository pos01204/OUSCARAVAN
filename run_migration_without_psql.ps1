# Railway PostgreSQL 마이그레이션 실행 스크립트 (psql 없이)
# Railway CLI를 사용하여 SQL 파일을 직접 실행

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Railway PostgreSQL 마이그레이션 실행" -ForegroundColor Cyan
Write-Host "(psql 설치 없이)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# SQL 파일 확인
$sqlFile = "MIGRATION_SQL_COMPLETE.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "SQL 파일을 찾을 수 없습니다: $sqlFile" -ForegroundColor Red
    exit 1
}
Write-Host "[1/3] SQL 파일 확인: $sqlFile" -ForegroundColor Green

# Railway CLI 확인
Write-Host "[2/3] Railway CLI 확인 중..." -ForegroundColor Yellow
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
Write-Host "[3/3] Railway 로그인 확인 중..." -ForegroundColor Yellow
railway whoami 2>&1 | Out-Null
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
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "주의: psql이 설치되어 있지 않습니다." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "다음 중 하나의 방법을 선택하세요:" -ForegroundColor Yellow
Write-Host ""
Write-Host "방법 1: PostgreSQL 설치 (권장)" -ForegroundColor Cyan
Write-Host "  1. https://www.postgresql.org/download/windows/ 에서 다운로드" -ForegroundColor White
Write-Host "  2. 설치 후 다음 명령어 실행:" -ForegroundColor White
Write-Host "     railway connect Postgres" -ForegroundColor Green
Write-Host ""
Write-Host "방법 2: Railway 대시보드에서 직접 실행" -ForegroundColor Cyan
Write-Host "  1. Railway 대시보드 → Postgres → Database → Query 탭" -ForegroundColor White
Write-Host "  2. MIGRATION_SQL_COMPLETE.sql 파일 내용 복사하여 붙여넣기" -ForegroundColor White
Write-Host ""
Write-Host "방법 3: 외부 PostgreSQL 클라이언트 사용" -ForegroundColor Cyan
Write-Host "  - pgAdmin, DBeaver, TablePlus 등" -ForegroundColor White
Write-Host "  - Railway Connect 다이얼로그에서 연결 정보 확인" -ForegroundColor White
Write-Host ""
