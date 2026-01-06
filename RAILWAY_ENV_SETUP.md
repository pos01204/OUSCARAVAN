# Railway 환경 변수 설정 가이드

## 📋 개요

이 문서는 Railway 백엔드 API 서버를 배포하기 위해 필요한 환경 변수 설정을 안내합니다.

---

## 🔧 필수 환경 변수

### 1. 데이터베이스 연결

Railway에서 PostgreSQL 데이터베이스를 생성하면 자동으로 `DATABASE_URL` 환경 변수가 설정됩니다.

**설정 위치**: Railway 대시보드 → 프로젝트 → PostgreSQL 서비스 → Variables 탭

**형식**:
```
DATABASE_URL=postgresql://user:password@host:port/database
```

**확인 방법**:
1. Railway 대시보드에서 PostgreSQL 서비스 선택
2. "Connect" 또는 "Variables" 탭에서 `DATABASE_URL` 확인
3. API 서비스의 환경 변수에도 동일한 값 설정

---

### 2. JWT 토큰 비밀키

**변수명**: `JWT_SECRET`

**설정 위치**: Railway 대시보드 → 프로젝트 → API 서비스 → Variables 탭

**생성 방법**:
```bash
# 터미널에서 실행
openssl rand -base64 32
```

또는 온라인 생성기 사용:
- https://randomkeygen.com/
- "CodeIgniter Encryption Keys" 섹션의 256-bit 키 사용

**예시**:
```
JWT_SECRET=your-generated-secret-key-here-minimum-32-characters
```

**주의사항**:
- 최소 32자 이상의 랜덤 문자열 사용
- 프로덕션과 개발 환경에서 다른 값 사용
- 절대 공개 저장소에 커밋하지 않기

---

### 3. 서버 포트

**변수명**: `PORT`

**설정 위치**: Railway 대시보드 → 프로젝트 → API 서비스 → Variables 탭

**기본값**: Railway가 자동으로 설정 (일반적으로 3000 또는 동적 포트)

**설정 예시**:
```
PORT=3000
```

**참고**: Railway는 자동으로 포트를 할당하므로 명시적으로 설정하지 않아도 됩니다.

---

### 4. 환경 모드

**변수명**: `NODE_ENV`

**설정 위치**: Railway 대시보드 → 프로젝트 → API 서비스 → Variables 탭

**값**:
```
NODE_ENV=production
```

---

## 📝 Railway 환경 변수 설정 방법

### 방법 1: Railway 대시보드에서 설정

1. **Railway 대시보드 접속**
   - https://railway.app 접속 및 로그인

2. **프로젝트 선택**
   - 배포할 프로젝트 선택

3. **서비스 선택**
   - API 서비스 선택 (또는 새로 생성)

4. **Variables 탭 클릭**
   - 서비스 상세 페이지에서 "Variables" 탭 선택

5. **환경 변수 추가**
   - "New Variable" 버튼 클릭
   - 변수명과 값 입력
   - "Add" 버튼 클릭

6. **변경사항 저장**
   - 환경 변수 추가 후 자동으로 재배포됨

### 방법 2: Railway CLI 사용

```bash
# Railway CLI 설치
npm install -g @railway/cli

# 로그인
railway login

# 프로젝트 연결
railway link

# 환경 변수 설정
railway variables set JWT_SECRET=your-secret-key
railway variables set NODE_ENV=production
```

---

## 🔐 보안 고려사항

### 1. 환경 변수 보호

- ✅ `.env` 파일을 `.gitignore`에 추가
- ✅ 환경 변수를 코드에 하드코딩하지 않기
- ✅ 프로덕션과 개발 환경 분리

### 2. JWT_SECRET 관리

- ✅ 강력한 랜덤 문자열 사용 (최소 32자)
- ✅ 정기적으로 변경 (선택사항)
- ✅ 각 환경별로 다른 값 사용

### 3. DATABASE_URL 보호

- ✅ Railway가 자동으로 관리하므로 별도 설정 불필요
- ✅ 외부에 노출되지 않도록 주의

---

## 📋 환경 변수 체크리스트

Railway 배포 전 확인사항:

- [ ] `DATABASE_URL` 설정 확인 (PostgreSQL 서비스에서 자동 설정)
- [ ] `JWT_SECRET` 생성 및 설정
- [ ] `NODE_ENV=production` 설정
- [ ] `PORT` 설정 (선택사항, Railway가 자동 설정)

---

## 🧪 환경 변수 확인 방법

### Railway 대시보드에서 확인

1. Railway 대시보드 → 프로젝트 → 서비스 선택
2. "Variables" 탭에서 모든 환경 변수 확인
3. 값이 올바르게 설정되었는지 확인

### 로그에서 확인

Railway 대시보드 → 서비스 → "Logs" 탭에서:
- 데이터베이스 연결 성공 메시지 확인
- 서버 시작 메시지 확인
- 에러 메시지 확인

---

## 🚨 문제 해결

### 문제 1: 데이터베이스 연결 실패

**증상**: `Error: connect ECONNREFUSED`

**해결 방법**:
1. `DATABASE_URL` 환경 변수 확인
2. PostgreSQL 서비스가 실행 중인지 확인
3. Railway 대시보드에서 PostgreSQL 서비스 상태 확인

### 문제 2: JWT 토큰 검증 실패

**증상**: `Invalid token` 에러

**해결 방법**:
1. `JWT_SECRET` 환경 변수 확인
2. 프론트엔드와 백엔드의 `JWT_SECRET` 일치 확인
3. 환경 변수 재설정 후 재배포

### 문제 3: 포트 충돌

**증상**: `EADDRINUSE` 에러

**해결 방법**:
1. Railway가 자동으로 포트를 할당하므로 `PORT` 환경 변수 제거
2. 또는 다른 포트 번호로 변경

---

## 📚 참고 문서

- [Railway 환경 변수 문서](https://docs.railway.app/develop/variables)
- [Railway PostgreSQL 문서](https://docs.railway.app/databases/postgresql)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
