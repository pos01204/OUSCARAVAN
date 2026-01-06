# Railway PostgreSQL 마이그레이션 실행 스크립트 (공개 네트워크 사용)
# Railway Connect 다이얼로그에서 Connection URL을 사용합니다

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Railway PostgreSQL 마이그레이션 실행" -ForegroundColor Cyan
Write-Host "(공개 네트워크 사용)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Railway Connect 다이얼로그에서 Connection URL을 복사하세요:" -ForegroundColor Yellow
Write-Host "  1. Railway 대시보드 → Postgres → Connect 버튼" -ForegroundColor White
Write-Host "  2. Public Network 탭 선택" -ForegroundColor White
Write-Host "  3. Connection URL 복사" -ForegroundColor White
Write-Host ""

$connectionUrl = Read-Host "Connection URL을 붙여넣으세요 (또는 Enter를 눌러 기본값 사용)"

if ([string]::IsNullOrWhiteSpace($connectionUrl)) {
    Write-Host ""
    Write-Host "Connection URL이 필요합니다." -ForegroundColor Red
    Write-Host "Railway Connect 다이얼로그에서 Connection URL을 복사하세요." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "마이그레이션 실행 중..." -ForegroundColor Yellow
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
