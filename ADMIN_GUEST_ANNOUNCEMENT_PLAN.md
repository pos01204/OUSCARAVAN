# 숙박 고객 공지 기능 기획/설계 + 구현 작업 문서

> 목적: 비/눈, 차량 이동, 신발 보관 등 **운영 공지**를 관리자 페이지에서 작성하고, 고객 페이지에서 즉시 확인할 수 있도록 한다.
> 범위: 관리자 공지 생성/관리, 고객 공지 노출, 기본 알림 UX(배너/리스트)

---

## 1) 문제 정의 / 목표

### 1.1 현재 문제
- 단체 문자 발송이 분산되어 운영 기록이 남지 않음
- 고객이 공지를 놓치는 경우가 있음(체크인/안내 흐름 분리)

### 1.2 목표
- 관리자가 **한 곳에서 공지 작성 → 고객 화면에 노출**되는 구조 제공
- 고객은 **홈 진입 시 공지 존재 여부를 즉시 파악**
- 공지는 **유효기간/우선순위**로 운영 가능

---

## 2) 핵심 사용자 시나리오

### 2.1 관리자
1) 관리자 페이지에서 공지 생성
2) 중요도/노출 기간/대상 설정
3) 저장 즉시 고객 화면에 노출
4) 공지 수정/종료 처리

### 2.2 고객
1) 고객 홈 진입 시 상단 배너/리스트로 공지 확인
2) 상세 공지는 인스펙터로 보기
3) 읽음 처리(선택)로 중복 확인 피로 최소화

---

## 3) 기능 설계(요구사항)

### 3.1 공지 데이터 구조(초안)
- `id` (uuid)
- `title` (string, required)
- `content` (string, required, markdown 혹은 plain)
- `level` (enum: `info` | `warning` | `critical`)
- `startsAt` (datetime, required)
- `endsAt` (datetime, optional)
- `isActive` (boolean, default true)
- `createdBy` (string, admin id)
- `createdAt`, `updatedAt`

### 3.2 노출 규칙
- **현재 시간 기준** `startsAt <= now` AND (`endsAt` is null OR `now <= endsAt`)
- `isActive = true`인 공지만 노출
- `critical` 등급은 고객 홈 상단 **고정 배너**
- 나머지는 공지 리스트(최신순)

### 3.3 관리자 기능
- 공지 목록(상태 필터: 전체/진행/종료)
- 공지 생성/수정/비활성화
- 미리보기(고객 화면 기준)

### 3.4 고객 기능
- 홈 상단 공지 요약(최대 1~2개)
- 공지 상세 보기(InfoInspector 또는 Sheet)
- “읽음 표시”(선택): 현재 세션 또는 localStorage 기반

---

## 4) UI/UX 설계

### 4.1 관리자 페이지
- 위치: `/admin/announcements` 신규 탭 또는 `/admin/home` 내 카드
- 리스트 컬럼: 제목 / 레벨 / 노출 기간 / 상태 / 수정
- 공지 편집: 모달 대신 **Sheet** 권장(컨텍스트 유지)

### 4.2 고객 페이지
- 위치: `/guest/[token]/home` 상단
- `critical`은 배너 강조(아이콘 + 강조색)
- 상세는 `InfoInspector`로 통일

---

## 5) 시스템 설계(데이터/흐름)

### 5.1 데이터 흐름
- 관리자: `POST /api/admin/announcements`
- 고객: `GET /api/guest/announcements?token=...`
- 백엔드: 공지 리스트 필터링 후 반환

### 5.2 권한
- 관리자 인증 토큰 필요(Authorization 헤더)
- 고객 페이지는 예약 토큰으로 접근 권한 확인(기존 방식 동일)

---

## 6) 구현 작업 상세(체크리스트)

### 6.1 백엔드(railway-backend)
- [ ] 공지 테이블 생성 마이그레이션
- [ ] 공지 CRUD API 추가(`/api/admin/announcements`)
- [ ] 고객 공지 조회 API(`/api/guest/announcements`)

### 6.2 프론트엔드(Next.js)
- [ ] 관리자 공지 목록/작성 페이지 구현
- [ ] 공지 작성 폼(제목/내용/기간/레벨)
- [ ] 고객 홈 공지 배너/리스트 UI 추가
- [ ] 공지 상세 `InfoInspector` 적용
- [ ] 읽음 처리(로컬)

### 6.3 공통
- [ ] 타입 정의(`types/announcement.ts`)
- [ ] API 유틸 추가(`lib/api/announcements.ts`)
- [ ] 테스트/검증(권한/노출 규칙)

---

## 7) 수용 기준(완료 정의)
- 관리자가 공지를 저장하면 고객 홈에서 **즉시 확인 가능**
- 노출 기간이 끝난 공지는 고객 화면에서 자동 사라짐
- `critical` 공지는 시각적으로 명확하게 구분됨
- 공지 상세는 동일 패턴(`InfoInspector`)으로 열림

---

## 8) 리스크 및 대응
- 공지 과다 노출 → “고정 1개 + 리스트 제한” 규칙 적용
- 중요 공지가 묻힘 → `critical` 배너 + 색상 강조
- 권한 누락 → admin/guest API 분리

---

## 9) 구현 순서 제안
1) 백엔드 테이블/CRUD
2) 관리자 공지 페이지
3) 고객 공지 배너 + 상세
4) 읽음 처리/마감 처리

