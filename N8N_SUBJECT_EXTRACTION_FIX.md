# Gmail Trigger Subject 추출 수정 가이드

## 🔍 문제 진단

**증상:**
- Code 노드에서 Subject 추출 시도했지만 `subject` 값이 비어있음
- INPUT에는 `Subject` 필드가 있지만 (`[네이버 예약] 오우스카라반캠핑장 새로운 예약이 확정 되었습니다.`)
- OUTPUT의 `subject` 필드는 empty

**원인:**
- Gmail Trigger의 출력 구조에서 `Subject`가 `$input.item.json.payload.Subject`에 직접 있음
- 또는 `$input.item.json.payload.headers` 배열에 있음
- 현재 코드가 올바른 경로를 찾지 못함

---

## 🔧 해결 방법

### Code 노드 수정 (다양한 경로 시도)

**현재 코드:**
```javascript
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

**수정된 코드 (모든 가능한 경로 시도):**

```javascript
// Gmail Trigger 출력에서 Subject 추출 (모든 가능한 경로 시도)
let subject = '';

// 방법 1: 직접 subject 필드
if ($input.item.json.subject) {
  subject = $input.item.json.subject;
}
// 방법 2: payload.Subject (대문자)
else if ($input.item.json.payload?.Subject) {
  subject = $input.item.json.payload.Subject;
}
// 방법 3: payload.subject (소문자)
else if ($input.item.json.payload?.subject) {
  subject = $input.item.json.payload.subject;
}
// 방법 4: payload.headers 배열에서 찾기
else if ($input.item.json.payload?.headers) {
  const subjectHeader = ($input.item.json.payload.headers || []).find(h => 
    h.name === 'Subject' || h.name === 'subject' || h.name === 'SUBJECT'
  );
  if (subjectHeader && subjectHeader.value) {
    subject = subjectHeader.value;
  }
}
// 방법 5: snippet에서 추출 (최후의 수단)
else if ($input.item.json.snippet) {
  // snippet에서 제목 추출 시도
  const snippet = $input.item.json.snippet;
  // 네이버 예약 이메일 형식에 맞춘 추출
  const match = snippet.match(/\[네이버 예약\][^\n]+/);
  if (match) {
    subject = match[0].trim();
  }
}

// 디버깅을 위한 로그 (선택사항)
console.log('Extracted subject:', subject);
console.log('Input structure:', JSON.stringify($input.item.json, null, 2));

return {
  ...$input.item.json,
  subject: subject
};
```

---

## 🎯 간단한 버전 (스크린샷 기준)

스크린샷을 보면 `payload` 안에 직접 `Subject`가 있는 것 같습니다:

**간단한 수정 코드:**

```javascript
// Gmail Trigger 출력에서 Subject 추출
const subject = $input.item.json.subject 
  || $input.item.json.payload?.Subject 
  || $input.item.json.payload?.subject
  || ($input.item.json.payload?.headers || []).find(h => 
    h.name === 'Subject' || h.name === 'subject'
  )?.value 
  || '';

return {
  ...$input.item.json,
  subject: subject
};
```

---

## 🔍 디버깅: 데이터 구조 확인

먼저 실제 데이터 구조를 확인하는 Code 노드를 만들어보세요:

**디버깅 코드:**

```javascript
// 모든 가능한 Subject 경로 확인
const input = $input.item.json;

return {
  json: {
    // 원본 데이터
    original: input,
    
    // 각 경로별 확인
    subject_direct: input.subject,
    payload_Subject: input.payload?.Subject,
    payload_subject: input.payload?.subject,
    payload_headers: input.payload?.headers,
    
    // headers에서 Subject 찾기
    subject_from_headers: (input.payload?.headers || []).find(h => 
      h.name === 'Subject' || h.name === 'subject'
    )?.value,
    
    // 최종 추출된 subject
    extracted_subject: input.subject 
      || input.payload?.Subject 
      || input.payload?.subject
      || (input.payload?.headers || []).find(h => 
        h.name === 'Subject' || h.name === 'subject'
      )?.value 
      || ''
  }
};
```

이 코드를 실행하면 실제 데이터 구조를 확인할 수 있습니다.

---

## ✅ 최종 권장 코드

**가장 안전한 버전:**

```javascript
// Gmail Trigger 출력에서 Subject 추출
const input = $input.item.json;

// 모든 가능한 경로에서 Subject 찾기
let subject = '';

// 1. 직접 subject 필드
if (input.subject) {
  subject = input.subject;
}
// 2. payload.Subject (대문자)
else if (input.payload && input.payload.Subject) {
  subject = input.payload.Subject;
}
// 3. payload.subject (소문자)
else if (input.payload && input.payload.subject) {
  subject = input.payload.subject;
}
// 4. payload.headers 배열
else if (input.payload && input.payload.headers) {
  const headers = Array.isArray(input.payload.headers) ? input.payload.headers : [];
  const subjectHeader = headers.find(h => {
    const name = h.name || h.key || '';
    return name.toLowerCase() === 'subject';
  });
  if (subjectHeader) {
    subject = subjectHeader.value || subjectHeader.Value || '';
  }
}

// 결과 반환
return {
  ...input,
  subject: subject
};
```

---

## 🧪 테스트 방법

1. **Code 노드에 위 코드 입력**
2. **"Execute Node"** 클릭
3. **OUTPUT** 패널에서 `subject` 필드 확인
4. 값이 채워져 있는지 확인

**예상 결과:**
```json
{
  "subject": "[네이버 예약] 오우스카라반캠핑장 새로운 예약이 확정 되었습니다."
}
```

---

## 🆘 여전히 비어있다면

### 방법 1: JSON 뷰로 전체 구조 확인

1. Code 노드의 **INPUT** 패널에서 **"JSON"** 탭 클릭
2. 전체 JSON 구조 확인
3. `Subject` 필드의 정확한 경로 확인
4. 확인된 경로를 코드에 반영

### 방법 2: n8n Expression 사용

IF 노드에서 직접 Expression 사용:

**IF 노드 Value 1:**
```
{{ $json.subject || $json.payload?.Subject || $json.payload?.subject || ($json.payload?.headers || []).find(h => (h.name || '').toLowerCase() === 'subject')?.value || '' }}
```

이렇게 하면 Code 노드 없이도 IF 노드에서 직접 Subject를 찾을 수 있습니다.

---

## 📋 체크리스트

### Code 노드 수정
- [ ] 위의 수정된 코드로 교체
- [ ] "Execute Node"로 테스트
- [ ] OUTPUT에서 `subject` 필드 확인
- [ ] 값이 올바르게 추출되었는지 확인

### IF 노드 확인
- [ ] Code 노드 다음에 IF 노드 연결
- [ ] IF 노드 Value 1: `{{ $json.subject }}`
- [ ] IF 노드 Operation: `Contains`
- [ ] IF 노드 Value 2: `확정`
- [ ] IF 노드 테스트 실행
- [ ] True Branch에 데이터가 있는지 확인

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-01-15
