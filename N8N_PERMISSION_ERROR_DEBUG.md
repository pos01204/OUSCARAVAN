# n8n 권한 문제 디버깅 가이드

## 🔍 문제

**증상:**
- "Authorization failed" 에러 발생
- Expression 모드 문제가 아님 (fx 아이콘 없음)
- 권한 문제로 보임

**가능한 원인:**
1. Railway 환경 변수 `N8N_API_KEY`가 설정되지 않음
2. Railway 코드가 배포되지 않음 (API Key 인증 로직 미적용)
3. API Key 값이 일치하지 않음
4. Railway 헤더 읽기 로직 문제

---

## ✅ 해결 방법

### 1단계: Railway 환경 변수 확인

**Railway 대시보드 → OUSCARAVAN 서비스 → Variables:**

1. **`N8N_API_KEY`** 변수가 있는지 확인
2. 변수가 없다면 생성:
   - **"Add Variable"** 클릭
   - **Name:** `N8N_API_KEY`
   - **Value:** 강력한 랜덤 문자열 생성
   - **"Save"** 클릭
3. 변수가 있다면 값 복사하여 n8n에 입력

**PowerShell에서 API Key 생성:**
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))
```

---

### 2단계: Railway 로그 확인

**Railway 대시보드 → OUSCARAVAN 서비스 → Logs:**

**확인할 내용:**

1. **"API Key check" 로그 메시지 확인**
   - 이 메시지가 보이면 Railway 코드가 배포된 것
   - 이 메시지가 안 보이면 Railway 코드가 배포되지 않은 것

2. **로그 내용 분석:**
```javascript
API Key check: {
  hasApiKey: true/false,      // 헤더에서 API Key를 읽었는지
  apiKeyLength: 64,            // API Key 길이
  hasEnvKey: true/false,       // 환경 변수가 설정되어 있는지
  envKeyLength: 64,            // 환경 변수 값 길이
  headers: ['x-api-key']       // API 관련 헤더 목록
}
```

**문제 진단:**

**케이스 1: `hasApiKey: false`**
- n8n에서 헤더가 전송되지 않음
- 해결: n8n HTTP Request 노드에서 "Send Headers" 확인

**케이스 2: `hasEnvKey: false`**
- Railway 환경 변수가 설정되지 않음
- 해결: Railway Variables에서 `N8N_API_KEY` 생성

**케이스 3: "API Key mismatch" 메시지**
- API Key 값이 일치하지 않음
- 해결: Railway Variables와 n8n의 API Key 값이 동일한지 확인

**케이스 4: "API Key check" 로그가 없음**
- Railway 코드가 배포되지 않음
- 해결: Railway 코드 배포

---

### 3단계: Railway 코드 배포 확인

**Railway 코드가 배포되었는지 확인:**

1. **Git 저장소 확인:**
   - `railway-backend/src/routes/admin.routes.ts` 파일 확인
   - `authenticateOrApiKey` 함수가 있는지 확인

2. **Railway 배포 확인:**
   - Railway 대시보드 → OUSCARAVAN 서비스 → Deployments
   - 최근 배포가 성공했는지 확인

3. **코드 배포:**
```powershell
cd "C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화"
git add railway-backend/src/routes/admin.routes.ts
git commit -m "Add API Key authentication for n8n"
git push origin main
```

---

### 4단계: n8n HTTP Request 노드 재확인

**HTTP Request 노드 설정:**

1. **Method:** `POST`
2. **URL:** `https://ouscaravan-production.up.railway.app/api/admin/reservations`
3. **Authentication:** `None`
4. **Send Headers:** `ON` (활성화)
5. **Specify Headers:** `Using Fields Below`
6. **Header Parameters:**
   - **Name:** `X-API-Key` (정확히 일치)
   - **Value:** Railway Variables의 `N8N_API_KEY` 값 전체 복사
7. **Content-Type:** `application/json`

**주의사항:**
- Header Name은 정확히 `X-API-Key` (대소문자 구분)
- Header Value는 Railway Variables의 값과 정확히 일치해야 함
- 공백이나 줄바꿈이 포함되지 않도록 주의

---

### 5단계: Railway API 직접 테스트

**PowerShell에서 테스트:**

```powershell
# Railway API Key를 변수에 저장
$apiKey = "YOUR_RAILWAY_API_KEY_HERE"

# Railway API 호출 테스트
$headers = @{
    "X-API-Key" = $apiKey
    "Content-Type" = "application/json"
}

$body = @{
    reservationNumber = "TEST123"
    guestName = "테스트"
    email = "test@example.com"
    checkin = "2026-01-22"
    checkout = "2026-01-23"
    roomType = "테스트 객실"
    amount = 0
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://ouscaravan-production.up.railway.app/api/admin/reservations" -Method POST -Headers $headers -Body $body
    Write-Host "Success: $($response | ConvertTo-Json)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Response: $($_.Exception.Response)"
}
```

**성공 시:**
- 예약 데이터가 생성됨
- Railway 로그에 "API Key authentication successful" 메시지

**실패 시:**
- Railway 로그에서 에러 메시지 확인
- API Key 값 확인

---

## 🐛 문제 해결 체크리스트

### Railway 설정:

- [ ] Railway 환경 변수 `N8N_API_KEY` 생성
- [ ] Railway 환경 변수 값 확인
- [ ] Railway 코드 배포 확인
- [ ] Railway 로그에서 "API Key check" 메시지 확인

### n8n 설정:

- [ ] HTTP Request 노드에서 Header Name: `X-API-Key`
- [ ] HTTP Request 노드에서 Header Value: Railway API Key 전체 값
- [ ] Send Headers: `ON` (활성화)
- [ ] Authentication: `None`

### 테스트:

- [ ] Railway 로그 확인
- [ ] n8n HTTP Request 노드 테스트
- [ ] PowerShell에서 직접 API 테스트

---

## 🔍 Railway 로그 분석

**성공 시 예상 로그:**
```
API Key check: {
  hasApiKey: true,
  apiKeyLength: 64,
  hasEnvKey: true,
  envKeyLength: 64,
  headers: ['x-api-key']
}
API Key authentication successful
```

**실패 시 예상 로그:**

**케이스 1: 환경 변수 없음**
```
API Key check: {
  hasApiKey: true,
  apiKeyLength: 64,
  hasEnvKey: false,  // 문제!
  envKeyLength: 0,
  headers: ['x-api-key']
}
```

**케이스 2: 헤더 없음**
```
API Key check: {
  hasApiKey: false,  // 문제!
  apiKeyLength: 0,
  hasEnvKey: true,
  envKeyLength: 64,
  headers: []
}
```

**케이스 3: API Key 불일치**
```
API Key check: {
  hasApiKey: true,
  apiKeyLength: 64,
  hasEnvKey: true,
  envKeyLength: 64,
  headers: ['x-api-key']
}
API Key mismatch: {
  received: 'YjMzYTBIY...',
  expected: 'YjMzYTBlY...'
}
```

---

## 📋 단계별 디버깅

1. **Railway 로그 확인**
   - Railway 대시보드 → Logs
   - "API Key check" 메시지 확인
   - 문제 진단

2. **Railway 환경 변수 확인**
   - Railway 대시보드 → Variables
   - `N8N_API_KEY` 확인
   - 없으면 생성

3. **Railway 코드 배포 확인**
   - Git 저장소 확인
   - Railway 배포 확인
   - 필요시 배포

4. **n8n 설정 재확인**
   - HTTP Request 노드 설정
   - Header Name/Value 확인

5. **테스트**
   - PowerShell에서 직접 테스트
   - n8n에서 테스트
   - Railway 로그 확인

---

**문서 버전**: 1.0  
**최종 업데이트**: 2026-01-06
