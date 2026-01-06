@echo off
REM Railway PostgreSQL 마이그레이션 실행 스크립트 (CMD용)

echo ========================================
echo Railway PostgreSQL 마이그레이션 실행
echo ========================================
echo.

REM 프로젝트 디렉토리로 이동
cd /d "%~dp0"

REM 환경 변수 설정
set DATABASE_URL=postgresql://postgres:KMnIhyLAmNcXmrORUPesiPzwrniFgLlB@switchyard.proxy.rlwy.net:38414/railway

echo 데이터베이스 연결 중...
echo.

REM 마이그레이션 실행
node run-migration.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo 마이그레이션이 완료되었습니다!
) else (
    echo.
    echo 마이그레이션 실행 중 오류가 발생했습니다.
    exit /b 1
)
