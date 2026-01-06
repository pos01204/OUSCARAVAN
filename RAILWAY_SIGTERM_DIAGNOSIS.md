# Railway SIGTERM 종료 문제 진단 및 해결

## 🔍 현재 상황 분석

**로그 분석:**
```
Server is running on port 8080 ✅ (정상 기동)
Stopping Container ❌ (곧바로 종료)
npm error signal SIGTERM ❌ (프로세스 종료)
```

**확인된 사항:**
- ✅ 헬스체크 Path가 활성화되어 있지 않음 (헬스체크 실패는 원인이 아님)
- ✅ 데이터베이스 연결 성공
- ✅ 서버가 정상적으로 시작됨
- ❌ 서버가 시작 직후 종료됨

---

## 🔍 진단 체크리스트

### A. Railway 오케스트레이터가 컨테이너를 재시작/교체함

#### 1. Railway 서비스 리소스 확인

**Railway 대시보드 → OUSCARAVAN 서비스 → Metrics:**

**확인 사항:**
- [ ] 메모리 사용량이 제한에 도달했는지
- [ ] CPU 사용량이 제한에 도달했는지
- [ ] OOMKilled (Out of Memory) 발생 여부

**해결 방법:**
- Railway 대시보드 → OUSCARAVAN 서비스 → Settings
- 리소스 제한 확인 및 증가 (필요시)

#### 2. Railway 서비스 상태 확인

**Railway 대시보드 → OUSCARAVAN 서비스:**

**확인 사항:**
- [ ] 서비스가 "Online" 상태인지
- [ ] 서비스가 계속 재시작되는지
- [ ] 배포 정책이 너무 공격적인지

**해결 방법:**
- Railway 대시보드 → OUSCARAVAN 서비스 → Settings
- "Restart Policy" 확인
- "Deployment" 설정 확인

#### 3. 포트 바인딩 확인

**현재 코드 확인:**
```typescript
app.listen(PORT, '0.0.0.0', () => {
  // ✅ 이미 0.0.0.0으로 바인딩되어 있음
});
```

**확인 사항:**
- [x] 서버가 `0.0.0.0`으로 바인딩되어 있음 ✅
- [x] 포트가 `8080`으로 설정되어 있음 ✅

---

### B. 컨테이너가 "foreground 프로세스"를 잃어서 종료됨

#### 1. package.json start 스크립트 확인

**현재 설정:**
```json
{
  "scripts": {
    "start": "node dist/app.js"
  }
}
```

**확인 사항:**
- [x] `node dist/app.js`로 직접 실행 중 ✅
- [x] npm이 foreground 프로세스로 실행 중 ✅

**개선 사항:**
- 현재 설정은 올바름
- 추가로 `tini` 같은 init 프로세스 사용 고려 (선택사항)

---

### C. 앱이 SIGTERM을 받았을 때 "정상 종료 처리" 확인

#### 1. Graceful Shutdown 처리 확인

**현재 코드:**
```typescript
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    pool.end(() => {
      console.log('Database pool closed');
      process.exit(0);
    });
  });
});
```

**확인 사항:**
- [x] SIGTERM 핸들러가 구현되어 있음 ✅
- [x] 서버가 정상적으로 종료됨 ✅
- [x] 데이터베이스 풀이 정상적으로 종료됨 ✅

**개선 사항:**
- 타임아웃 추가 (서버가 종료되지 않을 경우 강제 종료)
- 에러 처리 개선

---

## 🔧 해결 방법

### 방법 1: Graceful Shutdown 개선 (권장)

**문제:**
- 현재 코드는 SIGTERM을 받으면 종료하지만, 타임아웃이 없음
- 서버가 종료되지 않으면 무한 대기 가능

**해결:**
- 타임아웃 추가
- 에러 처리 개선

### 방법 2: Railway 리소스 확인 및 증가

**Railway 대시보드 → OUSCARAVAN 서비스:**

1. **Metrics 탭 확인:**
   - 메모리 사용량 확인
   - CPU 사용량 확인
   - OOMKilled 발생 여부 확인

2. **Settings 탭 확인:**
   - 리소스 제한 확인
   - 필요시 리소스 증가

### 방법 3: Railway 서비스 재시작 정책 확인

**Railway 대시보드 → OUSCARAVAN 서비스 → Settings:**

1. **Restart Policy 확인:**
   - 자동 재시작 정책이 너무 공격적인지 확인
   - 필요시 조정

2. **Deployment 설정 확인:**
   - 롤링 업데이트 정책 확인
   - 배포 타임아웃 확인

---

## 🚀 코드 개선

### Graceful Shutdown 개선

**개선 사항:**
1. 타임아웃 추가 (10초 후 강제 종료)
2. 에러 처리 개선
3. 로깅 개선

---

## 📋 체크리스트

### Railway 대시보드에서 확인:

- [ ] OUSCARAVAN 서비스 → Metrics → 메모리/CPU 사용량 확인
- [ ] OUSCARAVAN 서비스 → Settings → 리소스 제한 확인
- [ ] OUSCARAVAN 서비스 → Settings → Restart Policy 확인
- [ ] OUSCARAVAN 서비스 → Settings → Deployment 설정 확인
- [ ] OUSCARAVAN 서비스 → Logs → OOMKilled 메시지 확인

### 코드에서 확인:

- [x] 서버가 `0.0.0.0`으로 바인딩되어 있음 ✅
- [x] SIGTERM 핸들러가 구현되어 있음 ✅
- [ ] Graceful shutdown 타임아웃 추가 (개선 필요)

---

## 🐛 문제 해결 우선순위

### 1순위: Railway 리소스 확인

**확인 방법:**
1. Railway 대시보드 → OUSCARAVAN 서비스 → Metrics
2. 메모리/CPU 사용량 확인
3. OOMKilled 발생 여부 확인

**해결 방법:**
- 리소스 제한 증가
- 또는 코드 최적화

### 2순위: Railway 서비스 재시작 정책 확인

**확인 방법:**
1. Railway 대시보드 → OUSCARAVAN 서비스 → Settings
2. Restart Policy 확인
3. Deployment 설정 확인

**해결 방법:**
- 재시작 정책 조정
- 배포 타임아웃 증가

### 3순위: Graceful Shutdown 개선

**확인 방법:**
1. 코드에서 SIGTERM 핸들러 확인
2. 타임아웃 추가 필요 여부 확인

**해결 방법:**
- 타임아웃 추가
- 에러 처리 개선

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
