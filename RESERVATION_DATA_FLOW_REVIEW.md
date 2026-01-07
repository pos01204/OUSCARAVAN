# 예약 데이터 처리 흐름 재점검 및 보완

## 🔍 현재 문제점

사용자가 보여준 데이터를 분석한 결과:
- `amount: "0"` - ROOM 금액이 0으로 저장됨
- `options` 배열에는 OPTION만 있고 ROOM 정보는 없음
- ROOM과 OPTION이 분리되어 전송되는데, ROOM의 amount가 제대로 저장되지 않음

## 📋 데이터 흐름 분석

### n8n에서 전송되는 데이터 구조:
```json
// ROOM 요청
{
  "reservationNumber": "1120456794",
  "guestName": "이*윤",
  "roomType": "4인실(기준2인, 1인추가2만원) 오션뷰카라반 예약(1)",
  "amount": 180000,
  "checkin": "2026-01-18",
  "checkout": "2026-01-19",
  "category": "ROOM"
}

// OPTION 요청
{
  "reservationNumber": "1120456794",
  "guestName": "이*윤",
  "roomType": "[알림,저장이벤트] 오로라2개(1)",
  "amount": 0,
  "checkin": "2026-01-18",
  "checkout": "2026-01-19",
  "category": "OPTION"
}
```

### 현재 처리 로직:

1. **컨트롤러 (`createReservationHandler`)**:
   - `amount`가 없으면 기본값 0 사용
   - `category` 확인 (ROOM 또는 OPTION)
   - `createOrUpdateReservationItem` 호출

2. **서비스 (`createOrUpdateReservationItem`)**:
   - 기존 예약 조회
   - **ROOM인 경우**: `roomType`, `amount` 업데이트
   - **OPTION인 경우**: `options` 배열에 추가

## ⚠️ 발견된 문제점

### 1. ROOM amount가 0으로 저장되는 경우
- **원인**: n8n에서 ROOM 요청 시 `amount`가 전송되지 않거나 0으로 전송됨
- **현재 처리**: 컨트롤러에서 `amount`가 없으면 0으로 설정
- **문제**: ROOM의 amount가 0이면 실제 금액 정보가 손실됨

### 2. OPTION이 먼저 오는 경우
- **현재 처리**: 임시 예약 생성 ("객실 정보 대기 중", amount: "0")
- **문제**: ROOM이 나중에 와도 amount가 제대로 업데이트되지 않을 수 있음

### 3. 동시 요청 처리
- **현재 처리**: `ON CONFLICT`로 중복 방지
- **문제**: 동시에 여러 요청이 오면 일부가 실패할 수 있음

## ✅ 수정 사항

### 1. 컨트롤러 개선
- ROOM인 경우 `amount`가 0이면 경고 로그 출력
- `amount` 처리 로직 개선

### 2. 서비스 레이어 개선
- ROOM 업데이트 시 amount 처리 로직 개선:
  - 새 amount가 유효한 값이면 업데이트
  - 기존 amount가 0이면 새 값으로 업데이트 (0이어도)
  - 기존 amount가 유효한 값이면 유지

### 3. 프론트엔드 개선
- `amount`가 0인 경우 "금액 정보 없음" 표시
- 총 결제금액 계산 시 0 처리

## 🔧 권장 사항

### 1. n8n 워크플로우 확인
- ROOM 요청 시 `amount`가 제대로 전송되는지 확인
- `amount` 필드가 비어있지 않은지 확인

### 2. 데이터 검증 강화
- ROOM 요청 시 `amount` 필수 검증 추가 (선택사항)
- 또는 n8n에서 `amount`가 없으면 기본값 설정

### 3. 로깅 개선
- 각 단계별 상세 로그 추가
- `amount` 값 추적

## 📊 예상 결과

### 정상적인 경우:
```json
{
  "reservationNumber": "1120456794",
  "roomType": "4인실(기준2인, 1인추가2만원) 오션뷰카라반 예약(1)",
  "amount": "180000",
  "options": [
    {
      "optionName": "[알림,저장이벤트] 오로라2개(1)",
      "optionPrice": 0,
      "category": "OPTION"
    }
  ]
}
```

### 문제가 있는 경우 (현재):
```json
{
  "reservationNumber": "1120456794",
  "roomType": "4인실(기준2인, 1인추가2만원) 오션뷰카라반 예약(1)",
  "amount": "0",  // ❌ 문제
  "options": [
    {
      "optionName": "[알림,저장이벤트] 오로라2개(1)",
      "optionPrice": 0,
      "category": "OPTION"
    }
  ]
}
```

## 🎯 다음 단계

1. **n8n 워크플로우 확인**: ROOM 요청 시 `amount`가 제대로 전송되는지 확인
2. **Railway 로그 확인**: `[CREATE_RESERVATION]` 및 `[createOrUpdateReservationItem]` 로그 확인
3. **데이터 재전송**: 문제가 있는 예약 데이터 재전송 테스트
4. **프론트엔드 개선**: amount가 0인 경우 사용자에게 명확히 표시
