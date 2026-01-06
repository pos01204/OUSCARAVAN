# Railway PostgreSQL 마이그레이션 실행 스크립트 (간단 버전)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Railway PostgreSQL 마이그레이션 실행" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Railway Connect 다이얼로그에서 Connection URL 복사
# 형식: postgresql://postgres:비밀번호@switchyard.proxy.rlwy.net:38414/railway
$connectionUrl = "postgresql://postgres:KMnIhyLAmNcXmrORUPesiPzwrniFgLlB@switchyard.proxy.rlwy.net:38414/railway"

if ([string]::IsNullOrWhiteSpace($connectionUrl)) {
    Write-Host "Connection URL이 설정되지 않았습니다." -ForegroundColor Red
    exit 1
}

Write-Host "데이터베이스 연결 중..." -ForegroundColor Yellow
Write-Host ""

# DATABASE_URL 환경 변수 설정 및 Node.js 스크립트 실행
$env:DATABASE_URL = $connectionUrl
node run-migration.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ 마이그레이션이 완료되었습니다!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ 마이그레이션 실행 중 오류가 발생했습니다." -ForegroundColor Red
    exit 1
}
