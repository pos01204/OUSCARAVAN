# n8n roomType 추출 문제 해결 가이드

## 🔍 문제

n8n에서 예약 데이터를 전송할 때 `roomType`이 빈 문자열("")로 전송되어 400 에러가 발생합니다.

**에러 메시지:**
```
400 - "{\"error\":\"Validation failed\",\"code\":\"VALIDATION_ERROR\",\"details\":[\"roomType is required\"]}"
```

**요청 본문:**
```json
{
  "roomType": "",  // 빈 문자열!
  "roomAmount": 0,
  "category": "ROOM"
}
```

## ✅ 해결 방법

### 방법 1: n8n Code 노드에서 roomType 추출 로직 개선

현재 사용 중인 그룹화된 데이터 생성 로직에서 `roomType` 추출 부분을 개선해야 합니다.

#### 개선된 Code 노드 로직

```javascript
const allItems = $input.all();
const groupedByReservation = {};

allItems.forEach(item => {
    const raw = item.json;
    const resNo = (raw['예약번호'] || "").split(' ')[0] || "unknown";

    if (!groupedByReservation[resNo]) {
        const dates = (raw['이용일시'] || "").match(/\d{4}\.\d{2}\.\d{2}/g);
        
        // 결제금액 텍스트에서 최종 합계(= 이후 금액) 추출
        const paymentText = raw['결제금액'] || "";
        const totalAmountMatch = paymentText.split('=')[1]?.match(/[\d,]+/);
        const totalAmount = totalAmountMatch ? parseInt(totalAmountMatch[0].replace(/,/g, '')) : 0;

        // roomType 추출 개선
        // 방법 1: 예약상품 필드에서 추출
        let roomType = (raw['예약상품'] || "").trim();
        
        // 방법 2: 결제금액 텍스트에서 객실명 추출
        if (!roomType || roomType === '') {
            // 결제금액 형식: "2인실(2인기준) 오션뷰카라반 예약(1) 150,000원 + ..."
            const roomTypeMatch = paymentText.match(/([^+]+?)\s+\d{1,3}(?:,\d{3})*\s*원/);
            if (roomTypeMatch) {
                roomType = roomTypeMatch[1].trim();
                // "예약(1)" 같은 부분 제거
                roomType = roomType.replace(/\s*예약\s*\(\d+\)\s*$/, '').trim();
            }
        }
        
        // 방법 3: snippet에서 직접 추출
        if (!roomType || roomType === '') {
            const snippet = raw['snippet'] || raw['body'] || '';
            const snippetMatch = snippet.match(/예약상품[:\s]*([^\n\r]+?)(?:\s*이용일시|\s*결제금액|$)/i);
            if (snippetMatch) {
                roomType = snippetMatch[1].trim();
            }
        }
        
        // 방법 4: 기본값 설정 (최후의 수단)
        if (!roomType || roomType === '') {
            roomType = '오션뷰카라반 예약'; // 기본값
            console.warn(`[WARNING] roomType을 추출할 수 없어 기본값 사용: ${resNo}`);
        }

        groupedByReservation[resNo] = {
            reservationNumber: resNo,
            guestName: (raw['예약자명'] || "").replace("님", "").trim(),
            checkin: dates ? dates[0].replace(/\./g, '-') : "",
            checkout: dates && dates.length > 1 ? dates[1].replace(/\./g, '-') : "",
            amount: totalAmount,
            roomType: roomType, // 개선된 roomType 사용
            roomAmount: 0,
            options: []
        };
    }

    const paymentText = raw['결제금액'] || "";
    const detailPart = paymentText.split('=')[0] || "";
    
    detailPart.split('+').forEach(p => {
        const text = p.trim();
        const priceMatch = text.match(/[\d,]+(?=원)/);
        const price = priceMatch ? parseInt(priceMatch[0].replace(/,/g, '')) : 0;
        const name = text.replace(/[\d,]+원/g, "").trim();

        if (name.includes("예약")) {
            // roomType 업데이트 (더 정확한 값이 있으면)
            if (name.trim() && name.trim() !== '') {
                groupedByReservation[resNo].roomType = name;
                groupedByReservation[resNo].roomAmount = price;
            }
        } else if (name) {
            groupedByReservation[resNo].options.push({
                optionName: name,
                optionPrice: price,
                category: "OPTION"
            });
        }
    });
});

// 최종 검증: roomType이 빈 문자열이면 기본값 설정
Object.values(groupedByReservation).forEach(v => {
    if (!v.roomType || v.roomType.trim() === '') {
        v.roomType = '오션뷰카라반 예약';
        console.warn(`[WARNING] 최종 검증에서 roomType 기본값 설정: ${v.reservationNumber}`);
    }
});

return Object.values(groupedByReservation).map(v => ({ json: v }));
```

### 방법 2: 서버 측에서 빈 문자열 처리 개선

서버 측 validation을 개선하여 더 명확한 에러 메시지를 제공합니다.

**이미 적용됨:** `railway-backend/src/controllers/reservations.controller.ts`에서 빈 문자열 검증 추가

## 🔧 적용 방법

### 1단계: n8n Code 노드 수정

1. n8n 워크플로우에서 **Code 노드** 클릭
2. 기존 코드를 위의 **개선된 Code 노드 로직**으로 교체
3. **"Save"** 클릭

### 2단계: 테스트

1. **"Execute Workflow"** 클릭
2. Code 노드 출력 확인:
   - `roomType` 필드가 빈 문자열이 아닌지 확인
   - 각 예약 항목의 `roomType`이 올바르게 추출되었는지 확인

### 3단계: 디버깅

Code 노드에 디버깅 로그 추가:

```javascript
// 각 예약 항목 출력 전에 로그 추가
Object.values(groupedByReservation).forEach(v => {
    console.log(`[DEBUG] Reservation ${v.reservationNumber}:`, {
        roomType: v.roomType,
        roomTypeLength: v.roomType ? v.roomType.length : 0,
        hasRoomType: !!v.roomType && v.roomType.trim() !== '',
    });
});
```

## 📋 roomType 추출 우선순위

1. **예약상품 필드** (가장 정확)
2. **결제금액 텍스트** (객실명 추출)
3. **snippet/body** (정규식으로 추출)
4. **기본값** (최후의 수단)

## ⚠️ 주의사항

- `roomType`이 빈 문자열이면 서버에서 400 에러가 발생합니다
- Code 노드에서 최종 검증을 통해 빈 문자열을 방지해야 합니다
- 기본값을 사용하는 경우 로그에 경고를 남겨야 합니다

## 🔍 디버깅 팁

### n8n Code 노드 출력 확인

각 예약 항목의 `roomType` 필드를 확인:
```json
{
  "reservationNumber": "1108020464",
  "roomType": "2인실(2인기준) 오션뷰카라반 예약",  // 빈 문자열이 아니어야 함
  "roomAmount": 150000,
  "options": []
}
```

### 서버 로그 확인

Railway 로그에서 다음 메시지 확인:
```
[CREATE_RESERVATION] Request body: {
  roomType: "2인실(2인기준) 오션뷰카라반 예약",  // 빈 문자열이 아니어야 함
  ...
}
```

## 📚 참고

- 이전 Code 노드 로직: `N8N_CODE_NODE_UPDATED.md`
- 서버 validation: `railway-backend/src/middleware/validation.middleware.ts`
