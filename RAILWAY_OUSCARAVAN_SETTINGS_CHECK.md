# Railway OUSCARAVAN 서비스 설정 확인 가이드

## 🔍 확인해야 할 설정

현재 Postgres 서비스 설정이 보이지만, **OUSCARAVAN 서비스의 Settings**를 확인해야 합니다.

---

## ✅ OUSCARAVAN 서비스 Settings 확인 방법

### 1단계: OUSCARAVAN 서비스 선택

**Railway 대시보드:**

1. **왼쪽 사이드바에서 "OUSCARAVAN" 서비스 클릭**
   - GitHub Octocat 아이콘이 있는 서비스
   - "ouscaravan-production.up.r..." 표시된 서비스

2. **"Settings" 탭 클릭**

---

### 2단계: 확인해야 할 설정들

**Railway 대시보드 → OUSCARAVAN 서비스 → Settings:**

#### 1. Restart Policy (재시작 정책)

**확인 사항:**
- [ ] 현재 설정: "On Failure" 또는 "Always" 또는 "Never"
- [ ] "Number of times to try and restart" 값 확인

**권장 설정:**
- **"On Failure"** - 에러 발생 시에만 재시작 (권장)
- **"Number of times"**: 10 (기본값)

**문제가 있다면:**
- "Always"로 설정되어 있으면 서버가 종료될 때마다 재시작 시도
- 이 경우 서버가 계속 재시작될 수 있음

---

#### 2. Healthcheck Path (헬스체크 경로)

**확인 사항:**
- [ ] Healthcheck Path가 설정되어 있는지 확인
- [ ] 설정되어 있다면 경로가 `/` 또는 `/health`인지 확인
- [ ] 포트가 `8080`인지 확인

**권장 설정:**
- **경로**: `/` 또는 `/health`
- **포트**: `8080` (또는 Railway가 할당한 포트)

**문제가 있다면:**
- 잘못된 경로로 헬스체크하면 실패하여 서버가 종료될 수 있음
- 헬스체크를 비활성화하는 것도 방법

---

#### 3. Serverless (서버리스)

**확인 사항:**
- [ ] "Enable Serverless"가 활성화되어 있는지 확인

**권장 설정:**
- **비활성화** (현재 서버가 계속 실행되어야 하므로)

**문제가 있다면:**
- Serverless가 활성화되어 있으면 트래픽이 없을 때 컨테이너가 종료됨
- 이 경우 서버가 시작 후 곧바로 종료될 수 있음

---

#### 4. Resource Limits (리소스 제한)

**확인 사항:**
- [ ] CPU 제한 확인
- [ ] Memory 제한 확인
- [ ] 제한이 너무 낮은지 확인

**권장 설정:**
- **CPU**: 최소 0.5 vCPU 이상
- **Memory**: 최소 512 MB 이상

**문제가 있다면:**
- 리소스가 너무 낮으면 OOMKilled 발생 가능
- 서버가 시작 후 곧바로 종료될 수 있음

---

## 🐛 현재 문제 해결

### 문제: 서버가 시작 후 곧바로 종료됨

**확인해야 할 설정 (우선순위 순):**

1. **Serverless 설정**
   - "Enable Serverless"가 **비활성화**되어 있어야 함
   - 활성화되어 있으면 비활성화

2. **Restart Policy**
   - "On Failure"로 설정 권장
   - "Always"로 설정되어 있으면 "On Failure"로 변경

3. **Healthcheck Path**
   - 헬스체크가 활성화되어 있다면 경로를 `/` 또는 `/health`로 설정
   - 또는 헬스체크 비활성화

4. **Resource Limits**
   - CPU/Memory 제한이 충분한지 확인
   - 필요시 증가

---

## 📋 체크리스트

### OUSCARAVAN 서비스 Settings 확인:

- [ ] Railway 대시보드 → OUSCARAVAN 서비스 선택
- [ ] Settings 탭 클릭
- [ ] Serverless → "Enable Serverless" **비활성화** 확인
- [ ] Restart Policy → "On Failure" 설정 확인
- [ ] Healthcheck Path → 경로 확인 또는 비활성화
- [ ] Resource Limits → CPU/Memory 제한 확인
- [ ] 설정 변경 후 서비스 재배포

---

## 🚀 빠른 해결 방법

### 단계별 가이드:

1. **Railway 대시보드 → 왼쪽 사이드바 → "OUSCARAVAN" 서비스 클릭**
   - GitHub Octocat 아이콘이 있는 서비스

2. **"Settings" 탭 클릭**

3. **"Serverless" 섹션 확인:**
   - "Enable Serverless"가 **비활성화**되어 있는지 확인
   - 활성화되어 있으면 **비활성화**

4. **"Restart Policy" 섹션 확인:**
   - "On Failure"로 설정되어 있는지 확인
   - "Always"로 설정되어 있으면 "On Failure"로 변경

5. **"Healthcheck Path" 섹션 확인:**
   - 헬스체크가 활성화되어 있다면 경로를 `/` 또는 `/health`로 설정
   - 또는 헬스체크 비활성화

6. **"Resource Limits" 섹션 확인:**
   - CPU/Memory 제한이 충분한지 확인
   - 필요시 증가

7. **"Deployments" 탭 → "Redeploy" 클릭**

8. **"Logs" 탭에서 확인:**
   - "Stopping Container" 메시지가 사라졌는지 확인
   - 서버가 계속 실행 중인지 확인

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
