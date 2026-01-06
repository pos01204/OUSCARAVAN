# Railway 리소스 확인 가이드

## 🔍 Railway Metrics 확인 방법

### 1단계: Railway 대시보드 접속

1. **Railway 대시보드 접속**
   - https://railway.app 접속 및 로그인

2. **프로젝트 선택**
   - OUSCARAVAN 프로젝트 선택

3. **서비스 선택**
   - OUSCARAVAN API 서비스 선택

---

### 2단계: Metrics 탭 확인

**Railway 대시보드 → OUSCARAVAN 서비스 → Metrics:**

**확인할 내용:**

1. **메모리 사용량:**
   - 현재 메모리 사용량 확인
   - 메모리 제한 확인
   - OOMKilled 발생 여부 확인

2. **CPU 사용량:**
   - 현재 CPU 사용량 확인
   - CPU 제한 확인

3. **네트워크 사용량:**
   - 인바운드/아웃바운드 트래픽 확인

---

### 3단계: Settings 탭 확인

**Railway 대시보드 → OUSCARAVAN 서비스 → Settings:**

**확인할 내용:**

1. **리소스 제한:**
   - 메모리 제한 확인
   - CPU 제한 확인
   - 필요시 증가

2. **Restart Policy:**
   - 자동 재시작 정책 확인
   - 필요시 조정

3. **Deployment 설정:**
   - 배포 타임아웃 확인
   - 롤링 업데이트 정책 확인

---

## 🐛 문제 해결

### 문제 1: OOMKilled 발생

**증상:**
- Railway 로그에 "OOMKilled" 메시지
- 메모리 사용량이 제한에 도달

**해결:**
1. Railway 대시보드 → OUSCARAVAN 서비스 → Settings
2. 메모리 제한 증가
3. 또는 코드 최적화 (메모리 사용량 감소)

### 문제 2: CPU 제한 도달

**증상:**
- CPU 사용량이 제한에 도달
- 서버 응답 지연

**해결:**
1. Railway 대시보드 → OUSCARAVAN 서비스 → Settings
2. CPU 제한 증가
3. 또는 코드 최적화 (CPU 사용량 감소)

### 문제 3: 서비스가 계속 재시작됨

**증상:**
- Railway 로그에서 서비스가 반복적으로 재시작
- "Stopping Container" 메시지 반복

**해결:**
1. Railway 대시보드 → OUSCARAVAN 서비스 → Settings
2. Restart Policy 확인
3. 필요시 조정

---

## 📋 체크리스트

- [ ] Railway 대시보드 → OUSCARAVAN 서비스 → Metrics 확인
- [ ] 메모리 사용량 확인
- [ ] CPU 사용량 확인
- [ ] OOMKilled 발생 여부 확인
- [ ] Railway 대시보드 → OUSCARAVAN 서비스 → Settings 확인
- [ ] 리소스 제한 확인
- [ ] Restart Policy 확인
- [ ] Deployment 설정 확인

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
