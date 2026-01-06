# Railway 헬스체크 비활성화 가이드

## 🔍 문제: Railway 서버가 시작 후 종료됨

**증상:**
- 서버가 정상적으로 시작됨 ("Server is running on port 8080")
- 곧바로 "Stopping Container" 메시지
- SIGTERM으로 프로세스 종료

**원인:**
- Railway 헬스체크 실패
- Railway가 배포 후 헬스체크를 수행하는데, 서버가 완전히 준비되기 전에 실패하면 컨테이너를 종료시킴

---

## ✅ 해결 방법: Railway 헬스체크 비활성화

### 방법 1: Railway 대시보드에서 헬스체크 비활성화

**Railway 대시보드 → OUSCARAVAN 서비스 → Settings:**

1. **"Health Check"** 섹션 찾기
2. **"Disable Health Check"** 또는 **"Health Check Path"**를 비워두기
3. **"Save"** 클릭

**또는:**

1. **"Networking"** 섹션 찾기
2. **"Health Check"** 설정 찾기
3. 비활성화 또는 경로를 `/` 또는 `/health`로 설정

---

### 방법 2: Railway CLI 사용

**Railway CLI 설치 (필요시):**
```bash
npm install -g @railway/cli
railway login
```

**헬스체크 비활성화:**
```bash
railway service --service OUSCARAVAN
railway variables set HEALTHCHECK_DISABLED=true
```

---

## 🔍 Railway 헬스체크 설정 위치

### Railway 대시보드에서 찾기

**방법 1: Settings 탭**
1. Railway 대시보드 → OUSCARAVAN 서비스
2. **"Settings"** 탭 클릭
3. **"Health Check"** 또는 **"Networking"** 섹션 찾기

**방법 2: Service Settings**
1. Railway 대시보드 → OUSCARAVAN 서비스
2. 서비스 이름 옆 **"⚙️"** 아이콘 클릭
3. **"Health Check"** 설정 찾기

---

## ⚠️ 주의사항

**헬스체크 비활성화 시:**
- Railway가 서버 상태를 자동으로 모니터링하지 않음
- 서버가 실제로 종료되어도 Railway가 자동으로 재시작하지 않을 수 있음
- 수동으로 서버 상태를 확인해야 함

**대안:**
- 헬스체크를 비활성화하지 않고, 헬스체크 경로와 타임아웃을 조정
- Health Check Path: `/` 또는 `/health`
- Health Check Timeout: `30` (초) 이상

---

## 📋 체크리스트

### Railway 헬스체크 설정:

- [ ] Railway 대시보드 → OUSCARAVAN 서비스 → Settings
- [ ] Health Check 설정 확인
- [ ] Health Check 비활성화 또는 경로/타임아웃 조정
- [ ] 변경사항 저장

### 배포 후 확인:

- [ ] Railway 로그에서 "Stopping Container" 메시지 없음
- [ ] 서버가 계속 실행 중인지 확인
- [ ] Health check 직접 테스트: `https://ouscaravan-production.up.railway.app/health`

---

**문서 버전**: 1.0  
**최종 업데이트**: 2026-01-06
