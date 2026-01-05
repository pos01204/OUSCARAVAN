# Gmail Trigger 노드 설정 가이드 (스크린샷 기준)

## 📸 현재 화면 상태

**노드 이름**: Gmail Trigger1  
**Parameters 탭**: 활성화됨 (빨간색으로 표시)  
**Credential**: "Gmail account" 선택됨  
**Event**: "Message Received" 설정됨  
**Filters**: "No properties" (아직 필터 없음)

---

## 1단계: Credential 확인 및 설정

### 현재 상태:
- **Credential to connect with**: "Gmail account" 드롭다운에 표시됨
- 연필 아이콘(✏️)이 옆에 있음 (편집 가능)

### 작업:

#### 옵션 A: 이미 연결된 Credential이 있는 경우
- 그대로 사용 가능
- 연필 아이콘을 클릭하여 다른 계정으로 변경 가능

#### 옵션 B: 새 Credential을 만들어야 하는 경우
1. **연필 아이콘(✏️)** 클릭
2. **"Create New Credential"** 또는 **"Add Credential"** 선택
3. **Credential Name**: `Gmail - caiius960122` 입력
4. **OAuth2 API** 선택
5. **"Connect my account"** 클릭
6. Google 계정 선택: **caiius960122@gmail.com**
7. 권한 승인:
   - ✅ Gmail 읽기 권한
   - ✅ n8n에 액세스 허용
8. **"Save"** 클릭

### ⚠️ 중요: Gmail API 활성화 필요

만약 인증 시 오류가 발생하면:
- Google Cloud Console에서 Gmail API를 활성화해야 합니다
- 자세한 내용: `N8N_WORKFLOW_SETUP_GUIDE.md`의 "1단계: Gmail API 활성화" 참고

---

## 2단계: Poll Times 설정 (현재 상태 유지)

### 현재 상태:
- **Mode**: "Every Minute" (기본값, 그대로 두면 됨)

### 설명:
- n8n이 1분마다 Gmail을 확인하여 새 이메일을 감지합니다
- 변경할 필요 없음 (기본값 유지)

---

## 3단계: Event 확인 (이미 설정됨)

### 현재 상태:
- **Event**: "Message Received" ✅ (올바르게 설정됨)

### 설명:
- 새 이메일이 수신될 때 워크플로우가 트리거됩니다
- 변경할 필요 없음

---

## 4단계: Simplify 설정 (현재 상태 유지)

### 현재 상태:
- **Simplify**: 켜져 있음 (녹색 토글)

### 설명:
- 출력 데이터를 간소화하여 표시합니다
- 그대로 두면 됨

---

## 5단계: Filters 추가 (중요!)

### 현재 화면 상태:
- **Filters** 섹션이 열려있음
- 두 개의 입력 필드가 보임:
  1. **Search** 필드 (예시: "has:attachment")
  2. **Sender** 필드 (비어있음)
- 하단에 **"Add Filter"** 버튼이 있음

### 작업 순서:

#### 첫 번째 필터: Sender (발신자 필터링)

1. **"Sender"** 필드 클릭
2. 다음 중 하나 입력:
   - `naver.com` (네이버 도메인)
   - `reservation@naver.com` (실제 네이버 예약 이메일 주소, 정확한 주소를 알고 있다면)
3. **설명**: "Enter an email or part of a sender name." - 이메일 주소 또는 발신자 이름의 일부를 입력

**입력 예시:**
```
naver.com
```

#### 두 번째 필터: Search (제목/내용 검색)

1. **"Search"** 필드 클릭
2. 기존 예시 텍스트(`has:attachment`) 삭제
3. 다음 중 하나 입력:
   - `subject:예약 완료` (제목에 "예약 완료" 포함)
   - `예약 완료` (제목 또는 본문에 "예약 완료" 포함)
4. **설명**: "Use the same format as in the Gmail search box." - Gmail 검색창과 동일한 형식 사용

**입력 예시:**
```
subject:예약 완료
```

또는

```
예약 완료
```

### 필터 설정 완료 후:

1. 두 필드 모두 입력 확인
2. 하단의 **"Add Filter"** 버튼 클릭
3. 필터가 추가되었는지 확인

### 필터 옵션 설명:

**옵션 1: Sender 필터 (권장)**
- **Sender** → `Contains` → `naver.com`
- 네이버에서 온 이메일만 감지

**옵션 2: Search 필터 (제목 검색)**
- **Search** → `Contains` → `예약 완료`
- 제목에 "예약 완료"가 포함된 이메일만 감지

**옵션 3: 두 필터 모두 사용 (가장 안전)**
- Sender: `naver.com`
- Search: `예약 완료`
- 두 조건을 모두 만족하는 이메일만 감지

### 최종 Filters 설정 예시:

**화면에 표시될 내용:**

```
Filters:
  Search: subject:예약 완료
  Sender: naver.com
```

**또는 더 간단하게:**

```
Filters:
  Search: 예약 완료
  Sender: naver.com
```

### Gmail Search 문법 참고:

- `subject:예약 완료` - 제목에 "예약 완료" 포함
- `from:naver.com` - 발신자가 naver.com
- `예약 완료` - 제목 또는 본문에 "예약 완료" 포함
- `has:attachment` - 첨부파일이 있는 이메일

---

## 6단계: 테스트

### 현재 화면에서:

#### 방법 1: Fetch Test Event 버튼 사용
1. 우측 상단의 **빨간색 "Fetch Test Event"** 버튼 클릭
   - Parameters 섹션 우측 상단에 있음
   - 또는 왼쪽 화면 중앙에도 있음
2. 결과 확인:
   - 이메일이 있으면: 데이터가 OUTPUT 섹션에 표시됨
   - 이메일이 없으면: "No trigger output" 메시지 (정상)

#### 방법 2: OUTPUT 섹션에서 테스트
1. 우측 **OUTPUT** 섹션 확인
2. **"Test this trigger"** 버튼 클릭
3. 또는 **"or set mock data"** 링크 클릭하여 테스트 데이터 설정

### 테스트 이메일 발송 (선택사항):

테스트를 위해 직접 이메일을 발송할 수 있습니다:

1. **caiius960122@gmail.com**으로 이메일 발송
2. 제목: `[네이버 예약] 예약이 완료되었습니다`
3. 본문:
   ```
   안녕하세요.
   
   예약이 완료되었습니다.
   
   게스트명: 홍길동
   객실: Airstream1
   체크인: 2024-01-15
   체크아웃: 2024-01-17
   전화번호: 010-1234-5678
   
   감사합니다.
   ```
4. 발송 후 **"Fetch Test Event"** 다시 클릭

---

## 7단계: 노드 저장

### 현재 화면에서:

1. 노드 설정 화면 하단의 **"Save"** 버튼 클릭
   - 또는 워크플로우 상단의 **"Save"** 버튼 클릭
2. 저장 완료 확인

---

## 📋 설정 체크리스트

현재 화면 기준으로 확인:

- [ ] **Credential**: "Gmail account" 연결 확인
  - [ ] 연필 아이콘 클릭하여 계정 확인
  - [ ] 필요시 새 Credential 생성 및 연결
- [ ] **Poll Times**: "Every Minute" (기본값 유지)
- [ ] **Event**: "Message Received" ✅ (이미 설정됨)
- [ ] **Simplify**: 켜져 있음 (기본값 유지)
- [ ] **Filters**: 
  - [ ] "Add Filter" 클릭
  - [ ] 첫 번째 필터: Sender → Contains → `naver.com`
  - [ ] 두 번째 필터: Search → Contains → `예약 완료`
- [ ] **테스트**: "Fetch Test Event" 클릭하여 확인
- [ ] **저장**: "Save" 버튼 클릭

---

## 다음 단계

Gmail Trigger 노드 설정이 완료되면:

1. 노드 우측의 **"+" 버튼** 클릭
2. 다음 노드 추가:
   - **IF 노드** (예약 완료 확인)
   - **Code 노드** (이메일 파싱)
   - **Set 노드** (데이터 정리)
   - **Function 노드** (고유 링크 생성)
   - **HTTP Request 노드** (카카오톡 발송)

**자세한 내용**: `N8N_STEP_BY_STEP.md` 참고

---

## 🆘 문제 해결

### "No trigger output" 메시지가 계속 나타남:

**원인:**
- 아직 예약 이메일이 없음 (정상)
- 필터 조건이 너무 엄격함
- Gmail API 권한 문제

**해결 방법:**
1. 테스트 이메일 발송 후 다시 시도
2. 필터 조건 완화 (예: Sender 필터만 사용)
3. Gmail API 활성화 확인

### Credential 연결 실패:

**원인:**
- Gmail API가 활성화되지 않음
- OAuth 동의 화면 설정 미완료

**해결 방법:**
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. Gmail API 활성화
3. OAuth 동의 화면 설정
4. 테스트 사용자 추가 (`caiius960122@gmail.com`)

### 필터가 작동하지 않음:

**원인:**
- 필터 값 오타
- 필터 조건이 너무 엄격함

**해결 방법:**
1. 필터 값 확인 (대소문자, 공백)
2. 필터를 하나씩 제거하며 테스트
3. "Search" 필터 대신 "Sender" 필터만 사용해보기

---

## 📸 화면 구성 요약

```
┌─────────────────────────────────────────┐
│  M Gmail Trigger1          Docs    [X]  │
├─────────────────────────────────────────┤
│ Parameters (활성)    │    OUTPUT        │
├──────────────────────┼──────────────────┤
│                      │                  │
│ Credential:          │  No trigger      │
│ [Gmail account] ✏️   │  output          │
│                      │                  │
│ Poll Times:          │  [Test this     │
│ [Every Minute]       │   trigger]       │
│                      │                  │
│ Event:               │                  │
│ [Message Received]   │                  │
│                      │                  │
│ Simplify: [ON]       │                  │
│                      │                  │
│ Filters:             │                  │
│ [No properties]      │                  │
│ [+ Add Filter]       │                  │
│                      │                  │
│ [Fetch Test Event]   │                  │
└──────────────────────┴──────────────────┘
```

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
