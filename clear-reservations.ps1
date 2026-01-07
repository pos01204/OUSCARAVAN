# 예약 데이터 초기화 PowerShell 스크립트
# 
# 사용법:
# 1. Railway 대시보드 → PostgreSQL 서비스 → Connect 버튼 클릭
# 2. "Public Network" 탭 → "Connection URL" 복사
# 3. 이 스크립트 실행: .\clear-reservations.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "예약 데이터 초기화 스크립트" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# DATABASE_URL 확인
if (-not $env:DATABASE_URL) {
    Write-Host "DATABASE_URL 환경 변수가 설정되지 않았습니다." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Railway에서 Connection URL을 복사하세요:" -ForegroundColor Yellow
    Write-Host "1. Railway 대시보드 → PostgreSQL 서비스" -ForegroundColor Gray
    Write-Host "2. 'Connect' 버튼 클릭" -ForegroundColor Gray
    Write-Host "3. 'Public Network' 탭 선택 (중요: Internal Network 아님!)" -ForegroundColor Cyan
    Write-Host "4. 'Connection URL' 복사" -ForegroundColor Gray
    Write-Host ""
    Write-Host "⚠️  주의: 'Internal Network'가 아닌 'Public Network'를 사용해야 합니다!" -ForegroundColor Yellow
    Write-Host ""
    
    $connectionUrl = Read-Host "Connection URL을 입력하세요"
    
    if ($connectionUrl) {
        # 내부 네트워크 주소 체크
        if ($connectionUrl -match 'railway\.internal') {
            Write-Host ""
            Write-Host "❌ 내부 네트워크 주소를 사용하고 있습니다!" -ForegroundColor Red
            Write-Host "로컬에서 실행할 때는 공개 네트워크 주소를 사용해야 합니다." -ForegroundColor Yellow
            Write-Host ""
            Write-Host "다시 시도하세요:" -ForegroundColor Yellow
            Write-Host "1. Railway 대시보드 → PostgreSQL 서비스 → 'Connect' 버튼" -ForegroundColor Gray
            Write-Host "2. 'Public Network' 탭 선택 (Internal Network 아님!)" -ForegroundColor Cyan
            Write-Host "3. 'Connection URL' 복사" -ForegroundColor Gray
            exit 1
        }
        
        $env:DATABASE_URL = $connectionUrl
        Write-Host "✅ DATABASE_URL 설정 완료" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "❌ Connection URL이 입력되지 않았습니다." -ForegroundColor Red
        exit 1
    }
} else {
    # 이미 설정된 경우 내부 네트워크 주소 체크
    if ($env:DATABASE_URL -match 'railway\.internal') {
        Write-Host ""
        Write-Host "❌ 내부 네트워크 주소를 사용하고 있습니다!" -ForegroundColor Red
        Write-Host "현재 DATABASE_URL: $($env:DATABASE_URL.Substring(0, [Math]::Min(50, $env:DATABASE_URL.Length)))..." -ForegroundColor Gray
        Write-Host ""
        Write-Host "로컬에서 실행할 때는 공개 네트워크 주소를 사용해야 합니다." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "해결 방법:" -ForegroundColor Yellow
        Write-Host "1. Railway 대시보드 → PostgreSQL 서비스 → 'Connect' 버튼" -ForegroundColor Gray
        Write-Host "2. 'Public Network' 탭 선택 (Internal Network 아님!)" -ForegroundColor Cyan
        Write-Host "3. 'Connection URL' 복사" -ForegroundColor Gray
        Write-Host "4. PowerShell에서 실행:" -ForegroundColor Gray
        Write-Host "   `$env:DATABASE_URL='postgresql://...'" -ForegroundColor Cyan
        Write-Host "   .\clear-reservations.ps1" -ForegroundColor Cyan
        exit 1
    }
}

# Node.js 확인
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js 버전: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js가 설치되지 않았습니다." -ForegroundColor Red
    Write-Host "Node.js를 설치한 후 다시 시도하세요." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "예약 데이터 초기화를 시작합니다..." -ForegroundColor Yellow
Write-Host ""

# 스크립트 실행
node clear-reservations.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ 스크립트 실행 완료!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ 스크립트 실행 실패" -ForegroundColor Red
    exit 1
}
