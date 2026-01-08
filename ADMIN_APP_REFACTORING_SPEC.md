# 🛠️ 숙박 관리 앱 리팩토링 상세 작업 명세서

## 📋 목차
1. [현재 상태 진단](#현재-상태-진단)
2. [전역 네비게이션 및 레이아웃 변경](#1-전역-네비게이션-및-레이아웃-변경-tab-bar)
3. [Tab 1: 홈 (실시간 오퍼레이션 피드) 구현](#2-tab-1-홈-실시간-오퍼레이션-피드-구현)
4. [Tab 2: 예약 및 방 배정 기능 고도화](#3-tab-2-예약-및-방-배정-기능-고도화)
5. [Tab 3: 현장 관리 (객실 상태판) 통합 구현](#4-tab-3-현장-관리-객실-상태판-통합-구현)
6. [Tab 4: 주문 히스토리 구현](#5-tab-4-주문-히스토리-구현)
7. [백엔드 API 개발](#6-백엔드-api-개발)
8. [데이터 핸들링 및 상태 관리](#7-데이터-핸들링-및-상태-관리)
9. [에러 처리 및 검증](#8-에러-처리-및-검증)
10. [개발 우선순위 및 일정](#9-개발-우선순위-및-일정)

---

## 현재 상태 진단

### ✅ 이미 구현된 기능
1. **알림 시스템**
   - SSE 기반 실시간 알림 (`lib/hooks/useNotificationStream.ts`)
   - Zustand 상태 관리 (`lib/store/notifications.ts`)
   - 알림 타입: `order_created`, `checkin`, `checkout`, `reservation_new`

2. **하단 네비게이션**
   - `components/admin/AdminBottomNav.tsx`에 4개 탭 존재
   - 현재: 대시보드, 예약, 방, 주문

3. **방 배정 기능**
   - 예약 상세 페이지에 방 배정 폼 존재 (`app/admin/reservations/[id]/page.tsx`)
   - 방 선택 드롭다운 구현됨
   - 전화번호 입력 필드 존재

4. **객실 관리**
   - 방 목록 조회 API (`railway-backend/src/services/rooms.service.ts`)
   - 방별 예약 정보 조회 기능

### ❌ 개선이 필요한 부분
1. **하단 네비게이션 구조**
   - 현재 구조를 업무 흐름에 맞게 재구성 필요
   - 탭 라벨 및 아이콘 변경 필요

2. **대시보드 페이지**
   - 통계 중심 → 실시간 액션 피드로 전환 필요
   - D-1 미배정 예약 배너 추가 필요

3. **예약 관리 페이지**
   - D-1 미배정 자동 필터링 미구현
   - 방 배정 폼이 상세 페이지에만 존재 (리스트에서 직접 배정 불가)

4. **객실 상태 모니터링**
   - 실시간 주문 내역 통합 미구현
   - SSE 기반 실시간 하이라이트 미구현

5. **주문 히스토리**
   - 별도 페이지로 분리 필요
   - 필터링 기능 강화 필요

---

## 1. 전역 네비게이션 및 레이아웃 변경 (Tab Bar)

### 1.1 하단 네비게이션 재구성

**파일**: `components/admin/AdminBottomNav.tsx`

**변경 사항**:
```typescript
// 기존
const navItems = [
  { href: '/admin', label: '대시보드', icon: LayoutDashboard },
  { href: '/admin/reservations', label: '예약', icon: Calendar },
  { href: '/admin/rooms', label: '방', icon: Home },
  { href: '/admin/orders', label: '주문', icon: ShoppingCart },
];

// 변경 후
const navItems = [
  { href: '/admin', label: '홈', icon: Home }, // Alert Feed
  { href: '/admin/reservations', label: '예약/배정', icon: Calendar }, // Management
  { href: '/admin/rooms', label: '현장관리', icon: LayoutDashboard }, // Live Board
  { href: '/admin/orders', label: '주문히스토리', icon: ShoppingCart }, // History
];
```

**작업 내용**:
- [ ] 아이콘 import 변경 (`lucide-react`)
- [ ] 라벨 텍스트 변경
- [ ] 활성 상태 스타일 유지
- [ ] 접근성 속성 유지 (`aria-label`, `aria-current`)

**예상 소요 시간**: 30분

---

## 2. Tab 1: 홈 (실시간 오퍼레이션 피드) 구현

### 2.1 페이지 구조 변경

**파일**: `app/admin/page.tsx`

**현재 구조**:
- 통계 카드 4개 (오늘 예약, 체크인, 체크아웃, 주문)
- 최근 예약 목록

**변경 후 구조**:
1. **상단 배너 (Critical Status)**
2. **실시간 피드 리스트 (SSE 연동)**

### 2.2 상단 배너 구현

**컴포넌트**: `components/admin/CriticalStatusBanner.tsx` (신규 생성)

**로직**:
```typescript
// D-1 미배정 예약 조회
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');

const unassignedCount = reservations.filter(r => 
  r.checkin === tomorrowStr && 
  !r.assignedRoom
).length;
```

**UI 디자인**:
- 배경색: 경고 색상 (예: `bg-yellow-100` 또는 `bg-orange-100`)
- 텍스트: "내일 체크인 예정인 미배정 예약이 N건 있습니다."
- 클릭 시: `/admin/reservations?view=list&filter=d1-unassigned`로 이동 (딥 링크)

**⚠️ 중요: 딥 링크 로직 구체화**

배너 클릭 시 단순 이동이 아닌, **특정 필터가 적용된 상태**로 예약 관리 페이지를 열어야 합니다.

**URL 구조**: `/admin/reservations?view=list&filter=d1-unassigned`

**예약 관리 페이지에서의 처리** (`app/admin/reservations/page.tsx`):
```typescript
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function ReservationsPage() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // searchParams 감지하여 자동 필터 적용
    const filter = searchParams.get('filter');
    const view = searchParams.get('view');
    
    if (filter === 'd1-unassigned') {
      // 내일 날짜 계산
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');
      
      // 즉시 필터 적용
      setFilters({
        checkin: tomorrowStr,
        assignedRoom: null, // 미배정만
        view: view || 'list',
      });
      
      // 리스트 뷰로 전환
      if (view === 'list') {
        setCurrentView('list');
      }
    }
  }, [searchParams]);
  
  // ... 나머지 로직
}
```

**작업 내용**:
- [ ] `components/admin/CriticalStatusBanner.tsx` 생성
- [ ] D-1 미배정 예약 조회 로직 구현
- [ ] 배너 스타일링
- [ ] 딥 링크 클릭 핸들러 구현 (`/admin/reservations?view=list&filter=d1-unassigned`)
- [ ] **예약 관리 페이지에서 searchParams 감지 로직 구현 (최우선)**
- [ ] 자동 필터 적용 로직 구현

**예상 소요 시간**: 3시간 (딥 링크 로직 포함)

### 2.3 실시간 피드 리스트 구현

**컴포넌트**: `components/admin/NotificationFeed.tsx` (신규 생성)

**알림 타입별 카드 디자인**:

#### 2.3.1 `order_created` 카드
```typescript
{
  type: 'order_created',
  title: '[방번호]에서 [항목명] 주문 발생',
  icon: ShoppingCart,
  color: 'blue',
  onClick: () => router.push(`/admin/orders/${orderId}`)
}
```

#### 2.3.2 `checkin` / `checkout` 카드
```typescript
{
  type: 'checkin' | 'checkout',
  title: '[고객명] 체크인/아웃 완료',
  icon: CheckCircle,
  color: 'green',
  onClick: () => router.push(`/admin/reservations/${reservationId}`)
}
```

#### 2.3.3 `reservation_new` 카드
```typescript
{
  type: 'reservation_new',
  title: '네이버 예약 신규 인입',
  icon: Calendar,
  color: 'purple',
  onClick: () => router.push(`/admin/reservations/${reservationId}`)
}
```

**기술 구현**:
- `useNotificationStream` 훅 사용
- `useNotificationStore`에서 알림 목록 가져오기
- 최신 알림을 상단에 추가 (시간순 정렬)
- 무한 스크롤 또는 페이지네이션 (선택사항)

**작업 내용**:
- [ ] `components/admin/NotificationFeed.tsx` 생성
- [ ] 알림 타입별 카드 컴포넌트 구현
- [ ] SSE 연동 (이미 구현됨, 활용)
- [ ] 클릭 핸들러 구현
- [ ] 스타일링 (모바일 최적화)

**예상 소요 시간**: 4시간

### 2.4 대시보드 페이지 통합

**파일**: `app/admin/page.tsx`

**변경 사항**:
- 통계 카드 제거
- `CriticalStatusBanner` 추가
- `NotificationFeed` 추가
- `useNotificationStream` 훅 추가

**작업 내용**:
- [ ] 기존 통계 카드 제거
- [ ] `CriticalStatusBanner` import 및 렌더링
- [ ] `NotificationFeed` import 및 렌더링
- [ ] `useNotificationStream` 훅 추가

**예상 소요 시간**: 1시간

---

## 3. Tab 2: 예약 및 방 배정 기능 고도화

### 3.1 D-1 미배정 필터링 (기본 설정)

**파일**: `app/admin/reservations/page.tsx`

**⚠️ 중요: searchParams 기반 자동 필터링**

페이지 진입 시 `searchParams`를 감지하여 자동으로 필터를 적용해야 합니다.

**로직**:
```typescript
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';

export default function ReservationsPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    checkin: null as string | null,
    assignedRoom: null as string | null,
    view: 'list' as 'list' | 'calendar' | 'grid' | 'timeline',
  });
  
  // searchParams 감지하여 자동 필터 적용 (최우선)
  useEffect(() => {
    const filter = searchParams.get('filter');
    const view = searchParams.get('view');
    
    if (filter === 'd1-unassigned') {
      // 내일 날짜 계산
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');
      
      // 즉시 필터 적용
      setFilters({
        checkin: tomorrowStr,
        assignedRoom: null, // 미배정만
        view: (view as any) || 'list',
      });
    }
  }, [searchParams]);
  
  // ... 나머지 로직
}
```

**작업 내용**:
- [ ] **searchParams 감지 로직 구현 (최우선)**
- [ ] `filter=d1-unassigned` 파라미터 감지
- [ ] 내일 날짜 자동 계산 및 필터 적용
- [ ] 미배정 필터 자동 활성화
- [ ] 리스트 뷰 자동 전환 (view=list일 경우)
- [ ] 필터 상태 관리 (URL 파라미터와 동기화)
- [ ] 필터 표시 UI (현재 적용된 필터 표시)

**예상 소요 시간**: 3시간 (searchParams 로직 포함)

### 3.2 상세 모달 리팩토링

**파일**: `app/admin/reservations/[id]/page.tsx` 또는 모달 컴포넌트

**데이터 바인딩 상단 배치**:
- 예약번호 (`reservationNumber`)
- 고객명 (`guestName`)
- 방 타입 (`roomType`)
- 옵션 (`options`)

**작업 내용**:
- [ ] 모달 레이아웃 재구성
- [ ] 상단 정보 섹션 구현
- [ ] 스타일링

**예상 소요 시간**: 2시간

### 3.3 방 배정 폼 강화

**파일**: `app/admin/reservations/[id]/page.tsx`

**현재 상태**: 방 배정 폼이 이미 존재하지만, 전화번호 필드가 별도로 있을 수 있음

**⚠️ 중요: 연락처 유효성 및 알림톡 트리거**

네이버 예약 데이터에는 연락처가 없으므로, 방 배정 단계가 고객 소통의 시작점이 됩니다.

**개선 사항**:

1. **연락처 입력 필드 (필수화)**
   ```typescript
   <div className="space-y-2">
     <Label htmlFor="phone">연락처 *</Label>
     <input 
       type="tel" 
       id="phone"
       placeholder="010-1234-5678"
       value={phoneNumber}
       onChange={(e) => setPhoneNumber(e.target.value)}
       required
       className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
     />
     {!phoneNumber && (
       <p className="text-sm text-destructive">연락처는 필수 입력 항목입니다.</p>
     )}
   </div>
   ```

2. **알림톡 발송 체크박스**
   ```typescript
   <div className="flex items-center space-x-2">
     <input
       type="checkbox"
       id="sendNotification"
       checked={sendNotification}
       onChange={(e) => setSendNotification(e.target.checked)}
       defaultChecked={true} // 기본 활성화
     />
     <Label htmlFor="sendNotification" className="text-sm">
       방 배정 안내 알림톡 즉시 발송
     </Label>
   </div>
   ```

3. **클라이언트 측 유효성 검사**
   ```typescript
   const handleAssign = async () => {
     // 전화번호 필수 검증
     if (!phoneNumber || phoneNumber.trim() === '') {
       toast.error('연락처를 입력해주세요.');
       return;
     }
     
     // 전화번호 형식 검증
     const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
     if (!phoneRegex.test(phoneNumber.replace(/-/g, ''))) {
       toast.error('올바른 전화번호 형식이 아닙니다.');
       return;
     }
     
     // 방 선택 검증
     if (!assignedRoom) {
       toast.error('방을 선택해주세요.');
       return;
     }
     
     try {
       const response = await fetch(`/api/admin/reservations/${id}/assign`, {
         method: 'PATCH',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           roomNumber: assignedRoom,
           phoneNumber: phoneNumber,
           sendNotification: sendNotification, // 알림톡 발송 여부
         }),
       });
       
       if (!response.ok) {
         throw new Error('방 배정에 실패했습니다.');
       }
       
       toast.success('방 배정이 완료되었습니다.');
       // 성공 후 페이지 새로고침 또는 리다이렉트
     } catch (error) {
       toast.error('방 배정 중 오류가 발생했습니다.');
     }
   };
   ```

4. **객실 선택 드롭다운**
   - 현재 가용 객실만 표시
   - 중복 배정 방지 로직

**백엔드 알림톡 트리거**:
- 방 배정 API 호출 시 `sendNotification: true`인 경우
- n8n 웹훅 또는 알림톡 API 호출
- 예약 정보와 방 배정 정보를 포함하여 발송

**작업 내용**:
- [ ] 전화번호 입력 필드 필수화 (required 속성)
- [ ] 전화번호 빈 값 검증 로직 추가
- [ ] 알림톡 발송 체크박스 추가 (기본 활성화)
- [ ] 클라이언트 측 유효성 검사 강화
- [ ] 가용 객실 필터링 로직 구현
- [ ] 중복 배정 검증 로직 추가
- [ ] API 호출 함수 구현 (sendNotification 파라미터 포함)
- [ ] 백엔드 알림톡 트리거 로직 구현
- [ ] 성공/실패 피드백 (Toast)

**예상 소요 시간**: 4시간 (알림톡 트리거 포함)

### 3.4 캘린더 뷰 간소화

**파일**: `app/admin/reservations/ReservationCalendarView.tsx`

**변경 사항**:
- 날짜 칸 내부의 '배정/크인/크아웃' 텍스트 제거
- 해당 날짜의 총 체크인 건수 배지(Badge) 하나만 표시

**작업 내용**:
- [ ] 이벤트 생성 로직 수정
- [ ] 체크인 건수만 계산하여 배지로 표시
- [ ] 스타일링

**예상 소요 시간**: 2시간

---

## 4. Tab 3: 현장 관리 (객실 상태판) 통합 구현

### 4.1 객실 카드 디자인 변경

**파일**: `app/admin/rooms/page.tsx`

**현재 구조**: 방 목록만 표시

**변경 후 구조**:

#### 4.1.1 Header
- 객실 번호 (A1, A2...)
- 현재 사용 가능 여부 배지
  - `available`: 초록색
  - `occupied`: 빨간색
  - `maintenance`: 회색

#### 4.1.2 Body
- 현재 투숙객 이름 (`guestName`)
- 체크인 상태 (`status`)
- 인원수 정보

#### 4.1.3 Footer (Live Section)
- 해당 객실에서 발생한 실시간 주문 내역
- 옵션 및 신규 주문 표시
- 작은 아이콘과 텍스트로 표시
- **⚠️ 중요: 주문 완료 처리 버튼 추가**

**주문 완료 처리 로직**:
```typescript
// 객실 카드 Footer에 주문 항목 표시
{room.orders?.map((order) => (
  <div key={order.id} className="flex items-center justify-between p-2 bg-muted rounded">
    <div className="flex items-center gap-2">
      <ShoppingCart className="h-4 w-4" />
      <span className="text-sm">{order.type === 'bbq' ? '바베큐' : '불멍'} 주문</span>
    </div>
    {order.status !== 'completed' && (
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleCompleteOrder(order.id)}
        className="h-7 px-2 text-xs"
      >
        완료
      </Button>
    )}
  </div>
))}
```

**완료 처리 핸들러**:
```typescript
const handleCompleteOrder = async (orderId: string) => {
  try {
    const response = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    });
    
    if (!response.ok) {
      throw new Error('주문 상태 업데이트 실패');
    }
    
    // SSE를 통해 실시간 업데이트 (자동)
    // 하이라이트 제거
    setBlinking(false);
    
    // 주문 목록 새로고침
    refetchOrders();
    
    toast.success('주문이 완료 처리되었습니다.');
  } catch (error) {
    toast.error('주문 완료 처리 중 오류가 발생했습니다.');
  }
};
```

**작업 내용**:
- [ ] 객실 카드 컴포넌트 리팩토링
- [ ] Header/Body/Footer 구조 구현
- [ ] 주문 내역 조회 로직 추가
- [ ] **주문 항목별 완료 버튼 추가**
- [ ] 완료 처리 핸들러 구현
- [ ] 주문 상태 업데이트 API 호출
- [ ] SSE 기반 실시간 업데이트 연동
- [ ] 하이라이트 제거 로직
- [ ] 스타일링

**예상 소요 시간**: 5시간 (완료 처리 로직 포함)

### 4.2 실시간 하이라이트 구현

**컴포넌트**: `components/admin/RoomCard.tsx` (신규 또는 수정)

**로직**:
```typescript
// SSE로 order_created 수신 시
useEffect(() => {
  const eventSource = new EventSource('/api/admin/notifications/stream');
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'notification' && data.data.type === 'order_created') {
      const roomNumber = data.data.metadata?.room;
      if (roomNumber === room.name) {
        // 빨간색 테두리 점멸
        setBlinking(true);
        setTimeout(() => setBlinking(false), 3000);
      }
    }
  };
}, [room.name]);
```

**CSS 애니메이션**:
```css
@keyframes blink {
  0%, 100% { border-color: transparent; }
  50% { border-color: red; }
}

.blinking {
  animation: blink 1s infinite;
  border: 2px solid red;
}
```

**작업 내용**:
- [ ] SSE 이벤트 리스너 추가
- [ ] 점멸 상태 관리
- [ ] CSS 애니메이션 구현
- [ ] 3초 후 자동 해제

**예상 소요 시간**: 3시간

---

## 5. Tab 4: 주문 히스토리 구현

### 5.1 주문 목록 페이지 개선

**파일**: `app/admin/orders/page.tsx`

**현재 상태**: 주문 목록 표시

**⚠️ 중요: 데이터 집계 및 가독성 강화**

단순 리스트 나열보다는 정산 및 통계의 기초 자료로 쓰일 수 있게 보완합니다.

**개선 사항**:

1. **상태 배지 세분화**
   ```typescript
   const getStatusBadge = (status: Order['status']) => {
     const variants = {
       pending: { label: '준비중', variant: 'destructive', color: 'bg-orange-100 text-orange-800' },
       preparing: { label: '준비중', variant: 'destructive', color: 'bg-orange-100 text-orange-800' },
       delivering: { label: '배송중', variant: 'default', color: 'bg-blue-100 text-blue-800' },
       completed: { label: '완료', variant: 'default', color: 'bg-green-100 text-green-800' },
       cancelled: { label: '취소', variant: 'secondary', color: 'bg-gray-100 text-gray-800' },
     };
     return variants[status] || variants.pending;
   };
   ```
   - **준비중 (Pending/Preparing)**: 주황색 (`bg-orange-100 text-orange-800`)
   - **완료 (Completed)**: 초록색 (`bg-green-100 text-green-800`)
   - **취소 (Cancelled)**: 회색 (`bg-gray-100 text-gray-800`)

2. **총액 요약 표시**
   ```typescript
   // 필터링된 주문들의 총 금액 계산
   const totalAmount = filteredOrders.reduce((sum, order) => {
     return sum + (order.totalAmount || 0);
   }, 0);
   
   // 리스트 최상단에 표시
   <div className="mb-4 p-4 bg-muted rounded-lg">
     <div className="flex items-center justify-between">
       <span className="text-sm text-muted-foreground">총 주문 금액</span>
       <span className="text-2xl font-bold">{formatAmount(totalAmount)}원</span>
     </div>
     <p className="text-xs text-muted-foreground mt-1">
       {filteredOrders.length}건의 주문
     </p>
   </div>
   ```

3. **필터링 기능 강화**
   - 날짜 범위 필터
   - 방 번호 필터
   - 주문 상태 필터
   - 주문 타입 필터 (bbq, fire)

4. **정렬 기능**
   - 최신순 (기본)
   - 오래된순
   - 금액순

5. **페이지네이션**
   - 무한 스크롤 또는 페이지 번호

**작업 내용**:
- [ ] **상태 배지 세분화 구현 (주황/초록/회색)**
- [ ] **총액 요약 표시 구현 (리스트 최상단)**
- [ ] 총액 계산 로직 구현
- [ ] 필터 UI 구현
- [ ] 필터 로직 구현
- [ ] 정렬 기능 구현
- [ ] 페이지네이션 구현
- [ ] 스타일링 (가독성 강화)

**예상 소요 시간**: 5시간 (데이터 집계 포함)

---

## 6. 백엔드 API 개발

### 6.1 방 배정 완료 API

**엔드포인트**: `PATCH /api/admin/reservations/{id}/assign`

**파일**: `railway-backend/src/routes/admin.routes.ts` (신규 라우트 추가)

**Request Body**:
```typescript
{
  roomNumber: string;
  phoneNumber: string;
  sendNotification?: boolean; // 알림톡 발송 여부 (기본: true)
}
```

**로직**:
1. 예약 존재 여부 확인
2. 방 중복 배정 검증
3. 전화번호 형식 검증
4. 전화번호 필수 검증 (빈 값 체크)
5. 예약 업데이트 (assignedRoom, phone 필드)
6. 알림톡 발송 (sendNotification이 true인 경우, n8n 연동)

**알림톡 트리거 명확화**:
```typescript
// 백엔드 컨트롤러에서
if (sendNotification !== false) { // 기본값 true
  // n8n 웹훅 호출 또는 알림톡 API 호출
  await sendNotificationToN8N({
    reservationId: reservation.id,
    guestName: reservation.guestName,
    roomNumber: roomNumber,
    phoneNumber: phoneNumber,
    reservationNumber: reservation.reservationNumber,
  });
}
```

**작업 내용**:
- [ ] 라우트 추가
- [ ] 컨트롤러 함수 구현
- [ ] 서비스 함수 구현
- [ ] 전화번호 필수 검증 로직 추가
- [ ] 검증 로직 추가 (중복 배정, 형식)
- [ ] 알림톡 트리거 로직 구현 (명확히 정의)
- [ ] n8n 웹훅 연동 또는 알림톡 API 호출
- [ ] 에러 처리

**예상 소요 시간**: 4시간 (알림톡 트리거 포함)

### 6.2 D-1 미배정 예약 조회 API

**엔드포인트**: `GET /api/admin/reservations?checkin=tomorrow&assignedRoom=null`

**파일**: `railway-backend/src/controllers/reservations.controller.ts` (기존 수정)

**로직**:
```sql
SELECT * FROM reservations
WHERE checkin::date = CURRENT_DATE + INTERVAL '1 day'
  AND assigned_room IS NULL
ORDER BY checkin ASC;
```

**작업 내용**:
- [ ] 필터 로직 추가
- [ ] 쿼리 최적화
- [ ] 테스트

**예상 소요 시간**: 1시간

### 6.3 객실별 주문 내역 조회 API

**엔드포인트**: `GET /api/admin/rooms/{roomName}/orders`

**파일**: `railway-backend/src/routes/admin.routes.ts` (신규 라우트 추가)

**Response**:
```typescript
{
  orders: Order[];
  total: number;
}
```

**작업 내용**:
- [ ] 라우트 추가
- [ ] 컨트롤러 함수 구현
- [ ] 서비스 함수 구현

**예상 소요 시간**: 2시간

### 6.4 주문 상태 업데이트 API

**엔드포인트**: `PATCH /api/admin/orders/{orderId}/status`

**파일**: `railway-backend/src/routes/admin.routes.ts` (기존 수정 또는 신규 추가)

**Request Body**:
```typescript
{
  status: 'pending' | 'preparing' | 'delivering' | 'completed' | 'cancelled';
}
```

**로직**:
1. 주문 존재 여부 확인
2. 상태 유효성 검증
3. 주문 상태 업데이트
4. SSE를 통해 실시간 알림 발송 (선택사항)

**작업 내용**:
- [ ] 라우트 추가/수정
- [ ] 컨트롤러 함수 구현
- [ ] 서비스 함수 구현
- [ ] 상태 검증 로직 추가
- [ ] SSE 알림 발송 (선택사항)

**예상 소요 시간**: 2시간

---

## 7. 데이터 핸들링 및 상태 관리

### 7.1 Zustand 스토어 활용

**이미 구현됨**: `lib/store/notifications.ts`

**추가 작업**:
- [ ] 전역 탭 배지에 `unreadCount` 반영
- [ ] 알림 읽음 처리 시 배지 업데이트

**예상 소요 시간**: 1시간

### 7.3 SSE 자동 재연결 로직 강화

**파일**: `lib/hooks/useNotificationStream.ts`

**⚠️ 중요: SSE 연결 유실 시 자동 재연결**

리팩토링의 성패는 **"관리자가 페이지를 새로고침하지 않고도 실시간 알림을 받고 바로 방 배정으로 이어지느냐"**에 달려 있습니다.

**현재 구현 확인 및 개선**:
```typescript
export function useNotificationStream() {
  const { addNotification, updateUnreadCount } = useNotificationStore();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000; // 1초

  useEffect(() => {
    const connect = () => {
      // 기존 연결이 있으면 정리
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const eventSource = new EventSource('/api/admin/notifications/stream');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('[NotificationStream] Connection opened');
        reconnectAttempts.current = 0; // 재연결 성공 시 카운터 리셋
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'notification') {
            addNotification(data.data);
            if (!data.data.isRead) {
              updateUnreadCount((prev) => prev + 1);
            }
          }
        } catch (error) {
          console.error('[NotificationStream] Error parsing message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('[NotificationStream] Connection error:', error);
        
        // 연결이 끊어진 경우
        if (eventSource.readyState === EventSource.CLOSED) {
          // 재연결 시도
          if (reconnectAttempts.current < maxReconnectAttempts) {
            const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts.current); // 지수 백오프
            reconnectAttempts.current += 1;
            
            console.log(`[NotificationStream] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              connect(); // 재연결
            }, delay);
          } else {
            console.error('[NotificationStream] Max reconnection attempts reached');
          }
        }
      };
    };

    // 초기 연결
    connect();

    // 정리 함수
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [addNotification, updateUnreadCount]);
}
```

**작업 내용**:
- [ ] 기존 `useNotificationStream` 훅 확인
- [ ] 자동 재연결 로직 추가 (지수 백오프)
- [ ] 최대 재연결 시도 횟수 제한
- [ ] 재연결 카운터 리셋 로직
- [ ] 에러 로깅 강화
- [ ] 테스트 (연결 끊김 시나리오)

**예상 소요 시간**: 2시간

### 7.2 Mobile First 디자인

**원칙**:
- 모든 카드는 최소 350px 너비의 모바일 화면에서 스크롤 없이 핵심 정보 표시
- Flex-box로 구현
- 터치 타겟 최소 44x44px

**작업 내용**:
- [ ] 모든 카드 컴포넌트 모바일 최적화
- [ ] Flex-box 레이아웃 적용
- [ ] 터치 타겟 크기 확인

**예상 소요 시간**: 2시간

---

## 8. 에러 처리 및 검증

### 8.1 방 배정 시 에러 처리

**검증 항목**:
1. 전화번호 형식 검증
   ```typescript
   const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
   if (!phoneRegex.test(phoneNumber)) {
     toast.error('올바른 전화번호 형식이 아닙니다.');
     return;
   }
   ```

2. 객실 중복 배정 검증
   ```typescript
   const existingReservation = await getReservationByRoom(roomNumber);
   if (existingReservation && existingReservation.id !== reservationId) {
     toast.error('이미 배정된 방입니다.');
     return;
   }
   ```

**작업 내용**:
- [ ] 전화번호 검증 로직 구현
- [ ] 중복 배정 검증 로직 구현
- [ ] Toast 메시지 구현
- [ ] 에러 핸들링

**예상 소요 시간**: 2시간

---

## 9. 개발 우선순위 및 일정

### Phase 1: 핵심 기능 (1주)
1. ✅ 하단 네비게이션 재구성 (30분)
2. ✅ Tab 1: 홈 - 상단 배너 (딥 링크 포함) (3시간)
3. ✅ Tab 1: 홈 - 실시간 피드 (4시간)
4. ✅ Tab 2: D-1 미배정 필터링 (searchParams 포함) (3시간)
5. ✅ Tab 2: 방 배정 폼 강화 (알림톡 트리거 포함) (4시간)
6. ✅ SSE 자동 재연결 로직 강화 (2시간)

**총 예상 시간**: 16.5시간

### Phase 2: 고급 기능 (1주)
1. ✅ Tab 2: 캘린더 뷰 간소화 (2시간)
2. ✅ Tab 3: 객실 카드 리팩토링 (완료 처리 포함) (5시간)
3. ✅ Tab 3: 실시간 하이라이트 (3시간)
4. ✅ Tab 4: 주문 히스토리 개선 (데이터 집계 포함) (5시간)

**총 예상 시간**: 15시간

### Phase 3: 백엔드 및 통합 (3일)
1. ✅ 방 배정 완료 API (알림톡 트리거 포함) (4시간)
2. ✅ D-1 미배정 조회 API (1시간)
3. ✅ 객실별 주문 내역 API (2시간)
4. ✅ 주문 상태 업데이트 API (2시간)
5. ✅ 에러 처리 및 검증 (2시간)
6. ✅ 통합 테스트 (4시간)

**총 예상 시간**: 15시간

### 전체 예상 소요 시간
- **Phase 1**: 16.5시간
- **Phase 2**: 15시간
- **Phase 3**: 15시간
- **총계**: 약 46.5시간 (약 2주)

---

## 10. 기술 스택 및 의존성

### 프론트엔드
- **Next.js 14**: App Router
- **React**: Hooks (useState, useEffect, useCallback)
- **Zustand**: 상태 관리
- **Tailwind CSS**: 스타일링
- **Lucide React**: 아이콘
- **Server-Sent Events (SSE)**: 실시간 알림

### 백엔드
- **Express.js**: API 서버
- **PostgreSQL**: 데이터베이스
- **JWT**: 인증

### 기타
- **Toast**: 에러 메시지 표시 (shadcn/ui 또는 react-hot-toast)

---

## 11. 체크리스트

### Phase 1
- [x] 하단 네비게이션 재구성 ✅
- [x] Tab 1: 상단 배너 구현 (딥 링크 포함) ✅
- [x] Tab 1: 실시간 피드 구현 ✅
- [x] Tab 2: D-1 미배정 필터링 (searchParams 감지) ✅
- [x] Tab 2: 방 배정 폼 강화 (연락처 필수화, 알림톡 체크박스) ✅
- [x] SSE 자동 재연결 로직 강화 ✅

### Phase 2
- [ ] Tab 2: 캘린더 뷰 간소화
- [ ] Tab 3: 객실 카드 리팩토링 (주문 완료 처리 포함)
- [ ] Tab 3: 실시간 하이라이트
- [ ] Tab 4: 주문 히스토리 개선 (상태 배지 세분화, 총액 요약)

### Phase 3
- [x] 방 배정 완료 API (알림톡 트리거 포함) ✅
- [x] D-1 미배정 조회 API 개선 ✅
- [x] 객실별 주문 내역 API ✅
- [x] 주문 상태 업데이트 API 검증 및 개선 ✅
- [x] 에러 처리 및 검증 강화 ✅

---

## 12. 참고 사항

### 기존 코드 활용
- 알림 시스템은 이미 구현되어 있으므로 재사용
- 방 배정 폼은 이미 존재하므로 개선만 진행
- SSE 연결은 `useNotificationStream` 훅 활용

### 주의사항
- 모바일 최적화 필수 (350px 최소 너비)
- 터치 타겟 최소 44x44px
- 에러 메시지는 Toast로 표시
- 모든 API 호출은 에러 핸들링 필수
- **SSE 자동 재연결 로직 필수 구현**

### 데이터 매핑 요약

**에이전트가 구현 시 참고할 데이터 매핑 요약**:

| 기능 | 핵심 데이터 소스 (JSON 기준) | 비고 |
|------|---------------------------|------|
| 방 배정 폼 | `reservationNumber`, `guestName`, `roomType` | 관리자가 `assignedRoom`과 `phoneNumber` 직접 기입 |
| 현장 관리 카드 | `status` (체크인여부), `options` (주문내역) | `updatedAt`이 오늘인 주문을 최우선 노출 |
| 알림 피드 | `type: 'order_created'`, `priority: 'high'` | SSE `metadata` 내의 `reservationId`로 모달 연결 |

### 향후 개선 사항
- 무한 스크롤 구현
- 오프라인 모드 지원
- 푸시 알림 연동
- 다국어 지원

### 업계 실무자 관점

**이 리팩토링의 성패는 "관리자가 페이지를 새로고침하지 않고도 실시간 알림을 받고 바로 방 배정으로 이어지느냐"에 달려 있습니다.**

- SSE 연결 유실 시 자동 재연결(Reconnection) 로직을 `useNotificationStream` 훅에 반드시 포함
- 실시간 피드와 방 배정 폼 간의 원활한 흐름 보장
- 사용자 경험 최우선 (새로고침 없이 모든 작업 가능)

---

---

## 13. 작업 진행 상황

### Phase 1: 핵심 기능 ✅ 완료
- [x] 하단 네비게이션 재구성 ✅
- [x] Tab 1: 상단 배너 구현 (딥 링크 포함) ✅
- [x] Tab 1: 실시간 피드 구현 ✅
- [x] Tab 2: D-1 미배정 필터링 (searchParams 감지) ✅
- [x] Tab 2: 방 배정 폼 강화 (연락처 필수화, 알림톡 체크박스) ✅
- [x] SSE 자동 재연결 로직 강화 ✅

**완료 일시**: 2026-01-XX
**상세 진행 상황**: `PHASE1_PROGRESS.md` 및 `PHASE1_COMPLETION_SUMMARY.md` 참조

### Phase 2: UI/UX 개선 ✅ 완료
- [x] Tab 2: 캘린더 뷰 간소화 ✅
- [x] Tab 3: 객실 카드 리팩토링 (주문 완료 처리 포함) ✅
- [x] Tab 3: 실시간 하이라이트 (SSE 기반 점멸) ✅
- [x] Tab 4: 주문 히스토리 개선 (상태 배지 세분화, 총액 요약) ✅

**완료 일시**: 2026-01-XX
**상세 진행 상황**: `PHASE2_PROGRESS.md` 참조

---

**작성일**: 2026-01-XX
**작성자**: AI Assistant
**버전**: 1.0
**최종 업데이트**: Phase 1 완료
