# 빠른 마이그레이션 실행 가이드

## 🚀 PowerShell에서 실행

### 올바른 명령어 (복사하여 사용)

**PowerShell에서 순서대로 실행:**

```powershell
# 1. 프로젝트 디렉토리로 이동 (cd 한 번만!)
cd "C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화"

# 2. 현재 디렉토리 확인
pwd

# 3. 환경 변수 설정
$env:DATABASE_URL = "postgresql://postgres:KMnIhyLAmNcXmrORUPesiPzwrniFgLlB@switchyard.proxy.rlwy.net:38414/railway"

# 4. 마이그레이션 실행
node run-migration.js
```

---

## ❌ 잘못된 명령어

```powershell
# 잘못됨: cd를 두 번 입력
cd cd "C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화"
```

---

## ✅ 올바른 명령어

```powershell
# 올바름: cd 한 번만
cd "C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화"
```

---

## 📋 전체 실행 순서 (복사하여 붙여넣기)

**PowerShell에서 아래 명령어를 순서대로 실행하세요:**

```powershell
cd "C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화"
```

```powershell
$env:DATABASE_URL = "postgresql://postgres:KMnIhyLAmNcXmrORUPesiPzwrniFgLlB@switchyard.proxy.rlwy.net:38414/railway"
```

```powershell
node run-migration.js
```

---

## 🎯 한 줄씩 실행

**PowerShell에서:**

1. 첫 번째 줄 실행:
   ```powershell
   cd "C:\Users\김지훈\Desktop\[개인] 김지훈\오우스 자동화"
   ```

2. 두 번째 줄 실행:
   ```powershell
   $env:DATABASE_URL = "postgresql://postgres:KMnIhyLAmNcXmrORUPesiPzwrniFgLlB@switchyard.proxy.rlwy.net:38414/railway"
   ```

3. 세 번째 줄 실행:
   ```powershell
   node run-migration.js
   ```

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
