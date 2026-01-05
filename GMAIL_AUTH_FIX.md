# Gmail Trigger 인증 오류 해결 가이드

## 🚨 현재 오류

**오류 메시지**: `Unable to sign without access token`

**원인**: Gmail API 인증 토큰이 없거나 만료됨

---

## 🔧 해결 방법

### 방법 1: Gmail Credential 재인증 (가장 빠른 해결)

#### 현재 화면에서:

1. **"Credential to connect with"** 섹션 확인
2. 드롭다운 옆의 **연필 아이콘 (✏️)** 클릭
3. 다음 중 하나 선택:

#### 옵션 A: 기존 Credential 재인증

1. **"Gmail account"** 선택
2. **"Reconnect"** 또는 **"Update"** 버튼 클릭
3. Google 계정 선택: **caiius960122@gmail.com**
4. 권한 승인:
   - ✅ Gmail 읽기 권한
   - ✅ n8n에 액세스 허용
5. **"Save"** 클릭

#### 옵션 B: 새 Credential 생성

1. **"Create New Credential"** 또는 **"Add Credential"** 선택
2. **Credential Name**: `Gmail - caiius960122`
3. **OAuth2 API** 선택
4. **"Connect my account"** 클릭
5. Google 계정 선택: **caiius960122@gmail.com**
6. 권한 승인
7. **"Save"** 클릭

---

### 방법 2: Google Cloud Console에서 Gmail API 활성화 확인

#### 2.1 Gmail API 활성화 확인

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택 (또는 새로 생성)
3. **API 및 서비스** → **라이브러리** 클릭
4. **Gmail API** 검색
5. **Gmail API** 클릭 → **사용 설정** 확인
   - 이미 활성화되어 있다면 그대로 두기
   - 활성화되지 않았다면 **사용 설정** 클릭

#### 2.2 OAuth 동의 화면 설정 확인

1. **API 및 서비스** → **OAuth 동의 화면** 클릭
2. 설정 확인:
   - **앱 이름**: 설정되어 있는지 확인
   - **사용자 지원 이메일**: `caiius960122@gmail.com`
   - **범위**: `https://www.googleapis.com/auth/gmail.readonly` 추가되어 있는지 확인
3. **테스트 사용자** 확인:
   - `caiius960122@gmail.com`이 테스트 사용자로 추가되어 있는지 확인
   - 없다면 **+ ADD USERS** 클릭하여 추가

#### 2.3 OAuth 클라이언트 ID 확인

1. **사용자 인증 정보** → **OAuth 클라이언트 ID** 확인
2. 클라이언트 ID가 생성되어 있는지 확인
3. 없다면 생성:
   - **+ 만들기** → **OAuth 클라이언트 ID**
   - **애플리케이션 유형**: 웹 애플리케이션
   - **이름**: `n8n Gmail Integration`
   - **승인된 리디렉션 URI**: n8n에서 제공하는 URI 추가

---

### 방법 3: n8n에서 Credential 완전히 재설정

#### 3.1 기존 Credential 삭제

1. n8n 상단 메뉴 → **Settings** (⚙️ 아이콘)
2. **Credentials** 메뉴 클릭
3. Gmail 관련 Credential 찾기
4. **삭제** 클릭

#### 3.2 새 Credential 생성

1. Gmail Trigger 노드로 돌아가기
2. **Credential to connect with** → **Create New Credential**
3. 새로 인증 진행

---

## 🔍 단계별 확인 체크리스트

### 1단계: Credential 확인
- [ ] Gmail Trigger 노드에서 Credential이 선택되어 있는지
- [ ] Credential 이름이 표시되는지
- [ ] 연필 아이콘으로 Credential 편집 가능한지

### 2단계: Google Cloud Console 확인
- [ ] Gmail API가 활성화되어 있는지
- [ ] OAuth 동의 화면이 설정되어 있는지
- [ ] 테스트 사용자가 추가되어 있는지
- [ ] OAuth 클라이언트 ID가 생성되어 있는지

### 3단계: 재인증 시도
- [ ] Credential 재인증 시도
- [ ] Google 계정 로그인 성공
- [ ] 권한 승인 완료
- [ ] n8n에 저장 완료

### 4단계: 테스트
- [ ] "Fetch Test Event" 버튼 클릭
- [ ] 오류가 사라졌는지 확인
- [ ] 이메일 데이터가 표시되는지 확인

---

## 🆘 추가 문제 해결

### 문제 1: "API not enabled" 오류

**해결 방법:**
1. Google Cloud Console에서 Gmail API 활성화
2. 몇 분 대기 후 다시 시도

### 문제 2: "Access denied" 오류

**해결 방법:**
1. OAuth 동의 화면에서 테스트 사용자 추가
2. `caiius960122@gmail.com`을 테스트 사용자로 추가

### 문제 3: "Invalid redirect URI" 오류

**해결 방법:**
1. n8n에서 제공하는 Redirect URI 확인
2. Google Cloud Console의 OAuth 클라이언트 ID에 해당 URI 추가

### 문제 4: 권한 승인 화면이 나타나지 않음

**해결 방법:**
1. 브라우저 캐시 삭제
2. 시크릿 모드에서 시도
3. 다른 브라우저에서 시도

---

## 📋 빠른 해결 순서

1. **Gmail Trigger 노드 열기**
2. **Credential 옆 연필 아이콘 클릭**
3. **"Reconnect" 또는 "Update" 클릭**
4. **Google 계정으로 로그인 및 권한 승인**
5. **"Save" 클릭**
6. **"Fetch Test Event" 다시 클릭**

---

## ✅ 성공 확인

오류가 해결되면:
- ✅ "No trigger output" 또는 실제 이메일 데이터가 표시됨
- ✅ 빨간색 오류 메시지가 사라짐
- ✅ OUTPUT 패널에 데이터가 표시됨

---

## 📚 참고 자료

- [n8n Gmail 노드 문서](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.gmail/)
- [Google Gmail API 문서](https://developers.google.com/gmail/api)
- [N8N_WORKFLOW_SETUP_GUIDE.md](./N8N_WORKFLOW_SETUP_GUIDE.md) - Gmail API 활성화 가이드

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
