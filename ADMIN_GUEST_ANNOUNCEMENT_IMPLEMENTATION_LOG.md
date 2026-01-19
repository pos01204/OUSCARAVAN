# 고객 공지 기능 구현 로그

> **작성일**: 2026-01-19  
> **근거 문서**: `ADMIN_GUEST_ANNOUNCEMENT_PLAN.md`  
> **목표**: 관리자 공지 생성 → 고객 홈 노출의 end-to-end 흐름 구축

---

## 1) 구현 범위 요약
- 관리자 공지 CRUD(목록/등록/수정/비활성/삭제)
- 고객 공지 노출(홈 상단 배너 + 리스트 + 상세 인스펙터)
- 공지 노출 규칙(시작/종료/활성 상태) 서버 필터링

---

## 2) 변경 사항(파일별)

### 2.1 백엔드
- `railway-backend/src/migrations/run-migrations.ts`
  - `announcements` 테이블 생성 마이그레이션 추가
  - 활성/기간 인덱스 및 updated_at 트리거 추가
- `railway-backend/src/services/announcements.service.ts` (신규)
  - 공지 생성/조회/수정/삭제/고객용 활성 공지 조회 로직 구현
- `railway-backend/src/controllers/announcements.controller.ts` (신규)
  - 관리자/고객용 API 핸들러 구현
- `railway-backend/src/routes/admin.routes.ts`
  - `/announcements` CRUD 라우팅 추가
- `railway-backend/src/routes/guest.routes.ts`
  - `/:token/announcements` 조회 라우트 추가

### 2.2 프론트엔드
- `types/index.ts`
  - 공지 타입(`Announcement`, `AnnouncementLevel`, `AnnouncementStatus`) 추가
- `lib/api.ts`
  - 관리자 공지 API(get/create/update/delete)
  - 고객 공지 API(getGuestAnnouncements)
- `app/api/admin/announcements/route.ts` (신규)
- `app/api/admin/announcements/[id]/route.ts` (신규)
  - Next.js API 프록시로 Railway 호출(쿠키 기반 인증 폴백)
- `app/admin/announcements/page.tsx` (신규)
  - 공지 등록 폼 + 목록 + 수정 Sheet + 활성/비활성 토글
- `components/guest/GuestAnnouncements.tsx` (신규)
  - 고객 홈 공지 배너/리스트/상세 뷰
- `lib/hooks/useGuestAnnouncements.ts` (신규)
  - 공지 조회 전용 훅
- `components/guest/GuestHomeContent.tsx`
  - 홈 상단에 공지 섹션 삽입
- `app/admin/layout.tsx`, `components/admin/AdminBottomNav.tsx`
  - 공지 관리 진입 링크 추가

---

## 3) 자체 진단(완성도/품질)

### 3.1 잘 된 점
- **관리자 → 고객** 공지 전달 흐름이 end-to-end로 연결됨
- 고객 홈에서 긴급 공지를 **즉시 인지 가능한 배너 형태**로 노출
- 시작/종료/활성 조건을 **서버에서 일관되게 필터링**하여 고객 노출 안정성 확보

### 3.2 리스크/후속 개선
- 공지 다건 발생 시 노출 피로 가능 → “최대 N개 노출/접기” 옵션 고려
- 고객 읽음 처리 현재 localStorage 기반 → 계정 기반 읽음 동기화는 향후 개선 가능
- 공지 내용의 서식(목록/굵게 등) 필요 시 markdown 렌더 추가 검토

---

## 4) 완료 기준 점검
- [x] 관리자 공지 저장 시 고객 홈에서 즉시 확인 가능
- [x] 기간 종료 공지는 고객 화면에서 자동 제외
- [x] 중요도(긴급/주의/일반)가 시각적으로 구분됨
- [x] 상세 정보는 `InfoInspector` 패턴으로 통일

---

## 5) 후속 사용성 개선(추가 작업)

### 5.1 관리자 UX
- 공지 작성 **템플릿 버튼** 추가(비/눈, 차량 이동, 신발 보관)
- 작성 폼에 **고객 노출 미리보기 카드** 제공
- 기존 공지를 **작성 폼으로 복사**하여 빠른 재공지 가능

### 5.2 고객 UX
- “읽지 않은 공지” 카운트 표시
- “읽지 않은 공지만” 토글 제공
- 공지 리스트 **더보기/접기**로 스크롤 피로 감소

### 5.3 자체 진단
- 반복 공지 작성 흐름이 단축됨(템플릿 + 복사)
- 고객이 필요한 공지만 빠르게 확인 가능(읽지 않은 공지 필터)
- 공지가 많을 때 홈이 과도하게 길어지는 문제 완화

