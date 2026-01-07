# Gmail 기존 예약 확정 메일 반영 가이드

## 📋 개요

Gmail에 있는 기존 예약 확정 메일들을 시스템에 추가하는 방법을 안내합니다. n8n 워크플로우를 통해 과거 이메일을 처리할 수 있습니다.

## 🎯 방법 1: 현재 설정으로 기존 이메일 처리 (가장 간단)

### 현재 설정 확인

**현재 Gmail Trigger 설정:**
- **Search:** `subject:[네이버 예약]`
- **Sender:** `naverbooking_noreply@navercorp.com`
- **날짜 필터:** 없음 (모든 기간의 이메일 포함)

✅ **좋은 소식:** 현재 설정은 이미 기존 이메일을 가져올 수 있습니다!

### 단계별 가이드

#### 1단계: n8n 워크플로우 편집 모드 진입
1. n8n 대시보드에서 예약 처리 워크플로우 선택
2. 우측 상단 **"Edit"** 버튼 클릭

#### 2단계: Gmail Trigger 노드 확인
1. **Gmail Trigger** 노드 클릭
2. **"Search"** 필드 확인:
   - 현재: `subject:[네이버 예약]`
   - 이 설정은 날짜 제한이 없으므로 모든 기간의 이메일을 가져올 수 있습니다

#### 3단계: 워크플로우 활성화 및 실행
1. **"Save"** 버튼 클릭하여 저장
2. **"Publish"** 버튼 클릭하여 활성화
3. Gmail Trigger는 자동으로 실행되지만, 수동 실행도 가능:
   - 워크플로우 페이지에서 **"Execute Workflow"** 버튼 클릭

#### 4단계: 중복 방지 확인
- Railway API는 예약번호 중복을 자동으로 방지합니다
- 이미 등록된 예약번호는 `409 Conflict` 에러를 반환합니다
- 이는 정상 동작이며, 중복 예약이 생성되지 않습니다

---

## 🎯 방법 2: 특정 기간의 이메일만 처리 (선택사항)

특정 기간의 이메일만 처리하고 싶다면 Search 필터를 수정할 수 있습니다:

**옵션 A: 특정 기간의 이메일 가져오기**
```
subject:[네이버 예약] after:2024-01-01 before:2026-01-31
```
- `after:YYYY-MM-DD`: 시작 날짜
- `before:YYYY-MM-DD`: 종료 날짜

**옵션 B: 특정 날짜 이후의 이메일만**
```
subject:[네이버 예약] after:2024-01-01
```
- 2024년 1월 1일 이후의 모든 이메일

**옵션 C: 최근 N일 이내의 이메일만**
```
subject:[네이버 예약] newer_than:30d
```
- 최근 30일 이내의 이메일만

#### 4단계: 워크플로우 활성화 및 실행
1. **"Save"** 버튼 클릭하여 저장
2. **"Publish"** 버튼 클릭하여 활성화
3. Gmail Trigger는 자동으로 실행되지만, 수동 실행도 가능:
   - 워크플로우 페이지에서 **"Execute Workflow"** 버튼 클릭

#### 5단계: 중복 방지 확인
- Railway API는 예약번호 중복을 자동으로 방지합니다
- 이미 등록된 예약번호는 `409 Conflict` 에러를 반환합니다
- 이는 정상 동작이며, 중복 예약이 생성되지 않습니다

## 🎯 방법 2: 수동으로 이메일 선택하여 처리

### 단계별 가이드

#### 1단계: Gmail에서 이메일 라벨링
1. Gmail에서 처리할 예약 확정 이메일 선택
2. 라벨 생성 및 적용 (예: "예약확정-처리대기")
3. 또는 별도 폴더로 이동

#### 2단계: n8n 워크플로우 수정
1. Gmail Trigger의 검색 필터를 라벨 기반으로 변경:
   ```
   label:예약확정-처리대기
   ```

#### 3단계: 일괄 처리
1. 워크플로우 실행
2. 처리 완료 후 Gmail에서 라벨 제거 또는 폴더 이동

## 🎯 방법 3: Gmail API를 통한 직접 처리 (고급)

### 단계별 가이드

#### 1단계: Gmail API 노드 추가
1. n8n에서 **"Gmail"** 노드 추가
2. **"Get Many"** 액션 선택
3. 검색 쿼리 설정

#### 2단계: Loop 처리
1. **"Split In Batches"** 노드 추가
2. 배치 크기 설정 (예: 10개씩)
3. 각 배치를 Code Node로 전달하여 파싱

#### 3단계: 예약 생성
1. HTTP Request Node로 Railway API 호출
2. 중복 체크 및 에러 처리

## ⚠️ 주의사항

### 1. 중복 예약 방지
- Railway API는 예약번호(`reservation_number`)를 고유 키로 사용
- 동일한 예약번호가 이미 존재하면 `409 Conflict` 에러 반환
- 이는 정상 동작이며, 중복 예약이 생성되지 않음

### 2. 처리 속도 제한
- Gmail API는 요청 제한이 있습니다
- 많은 이메일을 한 번에 처리할 경우:
  - 배치 크기를 작게 설정 (10-20개)
  - 처리 간격 추가 (Delay Node 사용)

### 3. 에러 처리
- 파싱 실패한 이메일은 로그에 기록
- Railway 로그에서 확인 가능:
  ```
  [getRooms] Found rooms: X
  Create reservation error: ...
  ```

## 🔍 검증 방법

### 1. Railway 로그 확인
1. Railway 대시보드 → 프로젝트 선택
2. **"Deployments"** → 최신 배포 → **"View Logs"**
3. 다음 로그 확인:
   - `[AUTH] Login request received` (n8n API Key 인증)
   - `Create reservation error: duplicate key` (중복 예약 - 정상)
   - `Create reservation error: ...` (기타 에러)

### 2. 예약 관리 페이지 확인
1. 관리자 페이지 → **"예약 관리"** 이동
2. 캘린더 뷰에서 예약 확인
3. 리스트 뷰에서 예약 목록 확인

### 3. n8n 실행 로그 확인
1. n8n 워크플로우 페이지
2. **"Executions"** 탭에서 실행 기록 확인
3. 성공/실패 상태 확인

## 📝 추천 워크플로우 설정

### 단계별 노드 구성

```
1. Gmail Trigger
   - Search: `subject:"예약 확정" after:2024-01-01`
   - Poll Times: Every 1 hour (처리 후에는 비활성화 가능)

2. Code Node (이메일 파싱)
   - 기존 파싱 로직 유지
   - 예약번호, 예약자명, 체크인/아웃, 방 타입 추출

3. HTTP Request Node (Railway API)
   - Method: POST
   - URL: https://ouscaravan-production.up.railway.app/api/reservations
   - Headers:
     - X-API-Key: {N8N_API_KEY}
     - Content-Type: application/json
   - Body: 파싱된 예약 데이터

4. (선택) IF Node (중복 체크)
   - Status Code = 409 → 중복 예약 (정상)
   - Status Code = 201 → 새 예약 생성 성공
   - 기타 → 에러 처리
```

## 🚀 빠른 시작 가이드

### 기존 이메일 일괄 처리

1. **n8n 워크플로우 편집**
   ```
   Gmail Trigger → Search 필드 수정
   ```

2. **검색 필터 설정**
   ```
   subject:"예약 확정" after:2024-01-01 before:2026-01-31
   ```

3. **워크플로우 저장 및 활성화**
   - Save → Publish

4. **수동 실행 (선택)**
   - Execute Workflow 버튼 클릭

5. **결과 확인**
   - Railway 로그 확인
   - 예약 관리 페이지에서 확인

## 🔄 처리 후 원상복구 (선택사항)

기존 이메일 처리가 완료된 후, 최신 이메일만 처리하도록 제한하고 싶다면:

1. **Gmail Trigger 검색 필터 수정**
   ```
   subject:[네이버 예약] newer_than:1d
   ```
   - 최근 1일 이내의 이메일만 처리

2. **워크플로우 저장 및 활성화**

3. **정상적인 자동 처리 재개**

**참고:** 현재 설정(`subject:[네이버 예약]`)을 그대로 유지해도 됩니다. Gmail Trigger는 이미 처리한 이메일을 다시 처리하지 않으므로, 중복 처리가 발생하지 않습니다.

## 📊 처리 현황 모니터링

### n8n 실행 통계
- 총 실행 횟수
- 성공/실패 건수
- 처리된 이메일 수

### Railway 로그 분석
- 생성된 예약 수
- 중복 예약 수 (정상)
- 에러 발생 건수

## ❓ FAQ

### Q: 중복 예약이 생성되나요?
A: 아니요. Railway API는 예약번호를 고유 키로 사용하므로 중복 예약이 생성되지 않습니다. `409 Conflict` 에러는 정상 동작입니다.

### Q: 처리 속도가 느린가요?
A: Gmail API 제한과 Railway API 응답 시간에 따라 다릅니다. 많은 이메일을 처리할 경우 배치 처리와 지연 시간을 추가하세요.

### Q: 파싱 실패한 이메일은 어떻게 하나요?
A: Railway 로그에서 에러 메시지를 확인하고, 필요시 수동으로 예약을 생성하거나 이메일 형식을 확인하세요.

### Q: 특정 기간의 이메일만 처리할 수 있나요?
A: 네, Gmail 검색 필터에서 `after:YYYY-MM-DD before:YYYY-MM-DD`를 사용하여 특정 기간의 이메일만 처리할 수 있습니다.

## 📚 참고 자료

- [Gmail 검색 연산자](https://support.google.com/mail/answer/7190)
- [n8n Gmail Trigger 문서](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.gmailtrigger/)
- [Railway API 문서](./railway-backend/README.md)
