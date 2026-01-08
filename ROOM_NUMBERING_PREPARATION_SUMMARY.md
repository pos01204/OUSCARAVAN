# 방 번호 체계 변경 사전 작업 완료 요약

## 📋 작업 개요

방 이름을 **A1~A8, B1~B2**에서 **1호~10호**로 변경하고, 고객 페이지에서 호수 정보를 숨기는 사전 작업을 완료했습니다.

---

## ✅ 완료된 작업

### 1. 마이그레이션 파일 생성
**파일**: `railway-backend/migrations/006_update_rooms_to_numbered.sql`

**작업 내용**:
- 기존 방 이름 (A1~A8, B1~B2)을 1호~10호로 변경
- 예약 테이블의 `assigned_room`도 함께 업데이트
- 수용 인원 설정:
  - **6호, 10호**: 2인실
  - **나머지 (1~5, 7~9)**: 4인실
- 기존 방이 없는 경우 새로 생성

**매핑**:
- A1 → 1호 (4인실)
- A2 → 2호 (4인실)
- A3 → 3호 (4인실)
- A4 → 4호 (4인실)
- A5 → 5호 (4인실)
- A6 → 6호 (2인실)
- A7 → 7호 (4인실)
- A8 → 8호 (4인실)
- B1 → 9호 (4인실)
- B2 → 10호 (2인실)

### 2. 방 서비스 정렬 로직 수정
**파일**: `railway-backend/src/services/rooms.service.ts`

**변경 사항**:
- 기존: A1~A8, B1~B2 순서로 정렬
- 변경: 1호~10호 순서로 정렬 (숫자 기준)

```sql
ORDER BY 
  CASE 
    WHEN name ~ '^\\d+호$' THEN 
      CAST(SUBSTRING(name FROM '^(\\d+)') AS INTEGER)
    ELSE 999
  END ASC
```

### 3. 관리자 페이지 정렬 로직 수정
**파일**:
- `app/admin/reservations/[id]/page.tsx` (방 선택 드롭다운)
- `app/admin/rooms/page.tsx` (방 목록)

**변경 사항**:
- 기존: A1~A8, B1~B2 순서로 정렬
- 변경: 1호~10호 순서로 정렬 (숫자 기준)

### 4. 고객 페이지에서 호수 정보 제거
**파일**:
- `components/guest/GuestHomeContent.tsx`
- `components/guest/GuestReservationInfo.tsx`
- `components/guest/GuestCheckInOutContent.tsx`

**변경 사항**:
- 환영 메시지 섹션에서 "객실: {assignedRoom}" 제거
- 예약 정보 카드에서 호수 정보 제거
- 체크인/체크아웃 페이지에서 배정된 방 정보 제거
- 주석 추가: "호수 정보는 고객에게 노출하지 않음 (관리자 편의용)"

### 5. 약도 설정 파일 준비
**파일**: `lib/constants/floorPlan.ts`

**작업 내용**:
- 1호~10호 공간 정의
- 각 공간의 좌표, 수용 인원 설정
- `ROOM_TO_SPACE_MAP`: assignedRoom → spaceId 매핑
- `SPACE_TO_ROOM_MAP`: spaceId → assignedRoom 역매핑
- 유틸리티 함수: `getSpaceById`, `getSpaceByRoom`

**타입 정의**: `types/floorPlan.ts`
- `FloorPlanSpace` 인터페이스
- `FloorPlanConfig` 인터페이스

### 6. 마이그레이션 실행 로직 추가
**파일**: `railway-backend/src/migrations/run-migrations.ts`

**변경 사항**:
- `006_update_rooms_to_numbered` 마이그레이션 실행 로직 추가
- 파일 읽기 실패 시 무시 (선택적 마이그레이션)

---

## 📁 생성/수정된 파일 목록

### 신규 생성
1. `railway-backend/migrations/006_update_rooms_to_numbered.sql` - 방 이름 변경 마이그레이션
2. `lib/constants/floorPlan.ts` - 약도 설정 파일
3. `types/floorPlan.ts` - 약도 타입 정의

### 수정
1. `railway-backend/src/services/rooms.service.ts` - 정렬 로직 수정
2. `railway-backend/src/migrations/run-migrations.ts` - 마이그레이션 실행 로직 추가
3. `app/admin/reservations/[id]/page.tsx` - 방 선택 드롭다운 정렬 수정
4. `app/admin/rooms/page.tsx` - 방 목록 정렬 수정
5. `components/guest/GuestHomeContent.tsx` - 호수 정보 제거
6. `components/guest/GuestReservationInfo.tsx` - 호수 정보 제거
7. `components/guest/GuestCheckInOutContent.tsx` - 호수 정보 제거
8. `lib/store.ts` - 주석 추가

---

## 🎯 주요 변경 사항

### 방 번호 체계
- **이전**: A1~A8 (4인실), B1~B2 (2인실)
- **현재**: 1호~10호
  - 1~5호, 7~9호: 4인실
  - 6호, 10호: 2인실

### 고객 페이지
- **이전**: "객실: A1", "객실: B2" 등 호수 정보 표시
- **현재**: 호수 정보 숨김 (관리자 편의용으로만 사용)

### 관리자 페이지
- **이전**: A1~A8, B1~B2 순서로 정렬
- **현재**: 1호~10호 순서로 정렬

---

## ⚠️ 주의사항

### 마이그레이션 실행
1. Railway 백엔드에서 마이그레이션 실행 필요
2. 기존 예약 데이터의 `assigned_room`도 함께 업데이트됨
3. 마이그레이션 실행 전 백업 권장

### 약도 좌표
- `lib/constants/floorPlan.ts`의 좌표는 예시 값입니다
- 실제 약도 이미지에 맞춰 좌표 조정 필요
- TODO 주석으로 표시됨

### 데이터 호환성
- 기존 A1~A8, B1~B2 형식의 데이터는 자동으로 1호~10호로 변환됨
- 마이그레이션 실행 후 모든 방 이름이 1호~10호 형식으로 통일됨

---

## 📝 다음 단계

1. **마이그레이션 실행**: Railway 백엔드에서 `006_update_rooms_to_numbered` 마이그레이션 실행
2. **약도 좌표 조정**: 실제 약도 이미지에 맞춰 `lib/constants/floorPlan.ts`의 좌표 수정
3. **약도 컴포넌트 구현**: `GUEST_FLOOR_PLAN_FEATURE_DESIGN.md`에 따라 약도 컴포넌트 구현

---

**완료 일시**: 2026-01-XX  
**작성자**: AI Assistant  
**버전**: 1.0
