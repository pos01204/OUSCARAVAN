# IF 노드 False 분기 문제 해결 가이드

## 🔍 문제 진단

**증상:**
- 이메일 제목에 "확정"이 포함되어 있음에도 IF 노드에서 False로 분기됨
- 제목: `[네이버 예약] 오우스카라반캠핑장 새로운 예약이 확정 되었습니다.`

**원인:**
- Gmail Trigger의 출력 데이터 구조에서 `subject` 필드 경로가 잘못 설정됨
- `$json.subject`가 실제 데이터 경로와 일치하지 않음

---

## 🔧 해결 방법

### 방법 1: IF 노드 조건 수정 (권장)

**현재 설정:**
- Value 1: `{{ $json.subject }}`
- Operation: `Contains`
- Value 2: `확정`

**수정 방법:**

**Option A: `$json.payload.headers`에서 Subject 찾기**

1. IF 노드 클릭
2. **Parameters** 탭에서 **Conditions** 수정
3. **Value 1**을 다음 중 하나로 변경:

```
{{ $json.payload.headers.find(h => h.name === 'Subject')?.value }}
```

또는

```
{{ $json.payload.headers.find(h => h.name === 'subject')?.value }}
```

**Option B: `$json.subject` 직접 사용 (Gmail Trigger 버전에 따라)**

일부 Gmail Trigger 버전에서는 `$json.subject`가 직접 사용 가능합니다.

1. **Value 1**을 다음과 같이 설정:

```
{{ $json.subject }}
```

2. **Execute Node**로 테스트하여 데이터 확인

**Option C: Code 노드로 Subject 추출 후 IF 노드 사용**

1. Gmail Trigger와 IF 노드 사이에 **Code 노드** 추가
2. Code 노드에서 Subject 추출:

```javascript
// Gmail Trigger 출력에서 Subject 추출
const subject = $input.item.json.subject 
  || $input.item.json.payload?.headers?.find(h => h.name === 'Subject')?.value
  || $input.item.json.payload?.headers?.find(h => h.name === 'subject')?.value
  || '';

return {
  ...$input.item.json,
  subject: subject
};
```

3. IF 노드에서 `{{ $json.subject }}` 사용

---

## 🎯 권장 해결 방법 (단계별)

### 1단계: Gmail Trigger 출력 구조 확인

1. **Gmail Trigger** 노드에서 **"Execute Node"** 클릭
2. **OUTPUT** 패널에서 데이터 구조 확인
3. Subject 필드의 정확한 경로 확인:
   - `$json.subject`?
   - `$json.payload.headers`?
   - `$json.payload.Subject`?

### 2단계: IF 노드 조건 수정

**가장 안전한 방법:**

1. IF 노드 클릭
2. **Parameters** 탭에서 **Conditions** 수정
3. **Value 1**을 다음과 같이 설정:

```
{{ $json.subject || $json.payload?.headers?.find(h => h.name === 'Subject')?.value || $json.payload?.headers?.find(h => h.name === 'subject')?.value || '' }}
```

또는 더 간단하게:

```
{{ $json.subject || ($json.payload?.headers || []).find(h => h.name === 'Subject' || h.name === 'subject')?.value || '' }}
```

4. **Operation**: `Contains` 유지
5. **Value 2**: `확정` 유지
6. **Save** 클릭

### 3단계: 테스트

1. IF 노드에서 **"Execute Node"** 클릭
2. **OUTPUT** 패널에서 **True Branch** 확인
3. "확정"이 포함된 이메일이 True로 분기되는지 확인

---

## 🔍 디버깅 방법

### 방법 1: Code 노드로 데이터 구조 확인

1. Gmail Trigger와 IF 노드 사이에 **Code 노드** 추가
2. Code 노드에서 모든 데이터 출력:

```javascript
// 모든 데이터 구조 확인
return {
  json: {
    all_data: $input.item.json,
    subject_direct: $input.item.json.subject,
    payload_subject: $input.item.json.payload?.Subject,
    headers: $input.item.json.payload?.headers,
    subject_from_headers: $input.item.json.payload?.headers?.find(h => h.name === 'Subject')?.value
  }
};
```

3. **Execute Node**로 실행하여 실제 데이터 구조 확인
4. 확인된 경로를 IF 노드에 적용

### 방법 2: IF 노드에서 직접 확인

1. IF 노드의 **Value 1** 필드 옆 **"fx"** 버튼 클릭
2. Expression 편집기에서 다음 코드 입력:

```javascript
{{ $json.subject || ($json.payload?.headers || []).find(h => h.name === 'Subject' || h.name === 'subject')?.value || '' }}
```

3. **Test** 버튼으로 결과 확인
4. "확정"이 포함되어 있는지 확인

---

## 📋 최종 IF 노드 설정 (권장)

### IF 노드 Parameters 설정

**Condition 1:**
- **Value 1**: 
```
{{ $json.subject || ($json.payload?.headers || []).find(h => h.name === 'Subject' || h.name === 'subject')?.value || '' }}
```
- **Operation**: `Contains`
- **Value 2**: `확정`

**설명:**
- 먼저 `$json.subject` 확인
- 없으면 `$json.payload.headers`에서 Subject 찾기
- 대소문자 구분 없이 Subject 또는 subject 모두 확인
- 최종적으로 빈 문자열이면 False

---

## 🧪 테스트 방법

### 1. IF 노드 단독 테스트

1. IF 노드에서 **"Execute Node"** 클릭
2. **OUTPUT** 패널 확인:
   - **True Branch**: "확정"이 포함된 이메일
   - **False Branch**: "확정"이 없는 이메일

### 2. 전체 플로우 테스트

1. 실제 네이버 예약 확정 이메일 발송
2. Gmail Trigger가 자동으로 감지
3. IF 노드에서 True로 분기되는지 확인

---

## 🆘 추가 문제 해결

### 문제 1: 여전히 False로 분기됨

**원인:**
- Subject 필드에 공백이나 특수문자 포함
- 대소문자 구분 문제

**해결:**
1. IF 노드 조건을 다음과 같이 수정:

```
{{ ($json.subject || ($json.payload?.headers || []).find(h => h.name === 'Subject' || h.name === 'subject')?.value || '').toLowerCase() }}
```

2. **Value 2**도 소문자로: `확정` → `확정` (한글은 대소문자 없음)

또는 공백 제거:

```
{{ ($json.subject || ($json.payload?.headers || []).find(h => h.name === 'Subject' || h.name === 'subject')?.value || '').replace(/\s+/g, '') }}
```

### 문제 2: Expression 오류 발생

**원인:**
- n8n Expression 문법 오류
- 옵셔널 체이닝(`?.`) 미지원 (구버전)

**해결 (구버전 n8n):**

```
{{ $json.subject || ($json.payload && $json.payload.headers && $json.payload.headers.find(h => h.name === 'Subject' || h.name === 'subject') && $json.payload.headers.find(h => h.name === 'Subject' || h.name === 'subject').value) || '' }}
```

또는 Code 노드 사용 (가장 안전):

```javascript
// Code 노드에서 Subject 추출
const subject = $input.item.json.subject 
  || ($input.item.json.payload?.headers || []).find(h => 
    h.name === 'Subject' || h.name === 'subject'
  )?.value 
  || '';

return {
  ...$input.item.json,
  subject: subject
};
```

그리고 IF 노드에서 `{{ $json.subject }}` 사용

---

## 📊 체크리스트

### IF 노드 설정 확인
- [ ] Value 1이 올바른 Subject 경로를 참조하는지 확인
- [ ] Operation이 "Contains"로 설정되어 있는지 확인
- [ ] Value 2가 "확정"으로 설정되어 있는지 확인
- [ ] IF 노드 테스트 실행하여 True/False 분기 확인

### 데이터 구조 확인
- [ ] Gmail Trigger 출력에서 Subject 필드 경로 확인
- [ ] Code 노드로 데이터 구조 디버깅 (필요시)
- [ ] 실제 이메일 제목에 "확정"이 포함되어 있는지 확인

### 테스트
- [ ] IF 노드 단독 테스트 완료
- [ ] True Branch에 "확정" 이메일이 분기되는지 확인
- [ ] False Branch에 "취소" 이메일이 분기되는지 확인

---

## 🎯 최종 권장 설정

### IF 노드 최종 설정

**Parameters → Conditions:**

**Value 1:**
```
{{ $json.subject || ($json.payload?.headers || []).find(h => h.name === 'Subject' || h.name === 'subject')?.value || '' }}
```

**Operation:** `Contains`

**Value 2:** `확정`

**Convert types where required:** ✅ (체크)

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
