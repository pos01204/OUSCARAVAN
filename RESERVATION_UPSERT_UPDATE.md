# 예약 데이터 UPSERT 업데이트 가이드

## 🔍 변경 사항

예약번호가 이미 존재하는 경우, 기존 데이터를 업데이트하도록 변경했습니다 (UPSERT).

### 변경 전:
- 예약번호가 이미 있으면 `409 Conflict` 에러 반환
- 중복 예약번호로 인한 에러 발생

### 변경 후:
- 예약번호가 이미 있으면 기존 데이터 업데이트
- 예약번호가 없으면 새로 생성
- 중복 에러 없이 처리

---

## ✅ 수정된 코드

### 1. `railway-backend/src/services/reservations.service.ts`

```typescript
export async function createReservation(data: CreateReservationData): Promise<Reservation> {
  // UPSERT: 예약번호가 이미 있으면 업데이트, 없으면 생성
  const query = `
    INSERT INTO reservations (
      reservation_number,
      guest_name,
      email,
      checkin,
      checkout,
      room_type,
      amount,
      status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (reservation_number) 
    DO UPDATE SET
      guest_name = EXCLUDED.guest_name,
      email = EXCLUDED.email,
      checkin = EXCLUDED.checkin,
      checkout = EXCLUDED.checkout,
      room_type = EXCLUDED.room_type,
      amount = EXCLUDED.amount,
      updated_at = CURRENT_TIMESTAMP
    RETURNING 
      id,
      reservation_number,
      guest_name,
      email,
      phone,
      checkin,
      checkout,
      room_type,
      assigned_room,
      amount,
      status,
      unique_token,
      created_at,
      updated_at
  `;

  const result = await pool.query(query, [
    data.reservationNumber,
    data.guestName,
    data.email,
    data.checkin,
    data.checkout,
    data.roomType,
    data.amount,
    'pending',
  ]);

  // ... (반환 로직 동일)
}
```

### 2. `railway-backend/src/controllers/reservations.controller.ts`

```typescript
export async function createReservationHandler(req: Request, res: Response) {
  try {
    // ... (검증 로직 동일)

    const reservation = await createReservation({
      reservationNumber,
      guestName,
      email: finalEmail,
      checkin,
      checkout,
      roomType,
      amount: finalAmount.toString(),
    });

    // UPSERT이므로 200 또는 201 반환
    // 새로 생성된 경우 201, 업데이트된 경우 200
    const isNew = reservation.createdAt === reservation.updatedAt;
    res.status(isNew ? 201 : 200).json(reservation);
  } catch (error: any) {
    console.error('Create reservation error:', error);
    
    // UPSERT로 변경했으므로 중복 에러는 발생하지 않음
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}
```

---

## 🎯 동작 방식

### 시나리오 1: 새 예약 생성
```
요청: 예약번호 "1124870293" (존재하지 않음)
결과: 새 예약 생성
응답: 201 Created
```

### 시나리오 2: 기존 예약 업데이트
```
요청: 예약번호 "1124870293" (이미 존재)
결과: 기존 예약 업데이트
- guest_name, email, checkin, checkout, room_type, amount 업데이트
- updated_at 자동 갱신
- phone, assigned_room, unique_token, status는 유지
응답: 200 OK
```

### 시나리오 3: 여러 상품 (객실 + 옵션)
```
요청 1: 예약번호 "1124870293", 상품명 "2인실(2인기준) 오션뷰카라반 예약(1)"
결과: 새 예약 생성 (201)

요청 2: 예약번호 "1124870293", 상품명 "[알림,저장이벤트] 오로라2개(1)"
결과: 기존 예약 업데이트 (200)
- room_type이 "[알림,저장이벤트] 오로라2개(1)"로 변경됨
- amount는 개별금액으로 업데이트됨
```

---

## ⚠️ 주의사항

### 1. roomType 덮어쓰기
- 여러 상품이 개별 아이템으로 전송될 때, 마지막 상품의 `roomType`이 저장됩니다
- 예: 객실 → 옵션 순서로 전송되면, 최종적으로 옵션의 `roomType`이 저장됨

### 2. amount 처리
- 각 요청의 `amount`가 업데이트됩니다
- 총 결제금액(`totalAmount`)을 저장하려면 n8n 코드 수정 필요

### 3. 기존 데이터 유지
- `phone`, `assigned_room`, `unique_token`, `status`는 업데이트되지 않습니다
- 기존에 배정된 방이나 상태가 유지됩니다

---

## 🔧 n8n 코드 개선 제안

### 옵션 1: ROOM만 저장 (권장)

```javascript
// Code Node에서 ROOM 카테고리만 필터링
const items = $input.all();
let results = [];

items.forEach(item => {
  const data = item.json;
  
  // ROOM 카테고리만 저장
  if (data.category === "ROOM") {
    results.push({
      json: {
        reservationNumber: data.reservationNumber,
        guestName: data.guestName,
        roomType: data.roomType,
        amount: data.totalAmount, // 총 결제금액 사용
        checkin: data.checkin,
        checkout: data.checkout
      }
    });
  }
});

return results;
```

### 옵션 2: 첫 번째 ROOM만 저장

```javascript
// 첫 번째 ROOM만 찾아서 저장
const items = $input.all();
let roomItem = null;

// ROOM 카테고리 찾기
for (const item of items) {
  if (item.json.category === "ROOM") {
    roomItem = item.json;
    break; // 첫 번째 ROOM만 사용
  }
}

if (roomItem) {
  return [{
    json: {
      reservationNumber: roomItem.reservationNumber,
      guestName: roomItem.guestName,
      roomType: roomItem.roomType,
      amount: roomItem.totalAmount, // 총 결제금액 사용
      checkin: roomItem.checkin,
      checkout: roomItem.checkout
    }
  }];
}

return [];
```

---

## 📋 배포 방법

### 1단계: 코드 수정
- `railway-backend/src/services/reservations.service.ts` 수정
- `railway-backend/src/controllers/reservations.controller.ts` 수정

### 2단계: 테스트
```bash
# 로컬에서 테스트
npm run dev

# Railway에 배포
git add .
git commit -m "Add UPSERT support for reservations"
git push
```

### 3단계: Railway 자동 배포 확인
- Railway가 자동으로 배포합니다
- 배포 완료 후 n8n 워크플로우 테스트

---

## 🔍 테스트 방법

### 테스트 1: 새 예약 생성
```bash
curl -X POST https://ouscaravan-production.up.railway.app/api/admin/reservations \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "reservationNumber": "TEST001",
    "guestName": "테스트",
    "email": "test@example.com",
    "checkin": "2026-01-01",
    "checkout": "2026-01-02",
    "roomType": "2인실",
    "amount": "100000"
  }'
```

### 테스트 2: 기존 예약 업데이트
```bash
# 같은 예약번호로 다시 요청
curl -X POST https://ouscaravan-production.up.railway.app/api/admin/reservations \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "reservationNumber": "TEST001",
    "guestName": "업데이트된 이름",
    "email": "updated@example.com",
    "checkin": "2026-01-01",
    "checkout": "2026-01-02",
    "roomType": "4인실",
    "amount": "200000"
  }'
```

응답:
- 첫 번째: `201 Created`
- 두 번째: `200 OK` (업데이트됨)

---

## 📚 참고

- [PostgreSQL UPSERT (ON CONFLICT)](https://www.postgresql.org/docs/current/sql-insert.html#SQL-ON-CONFLICT)
- [Railway 배포 가이드](https://docs.railway.app/deploy/builds)
