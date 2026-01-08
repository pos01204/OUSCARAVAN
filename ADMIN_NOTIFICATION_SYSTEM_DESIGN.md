# 관리자 알림 시스템 설계 문서

## 📋 문서 개요

고객 페이지에서 발생하는 체크인/체크아웃, 주문 등의 이벤트를 관리자 앱에서 실시간으로 확인하고 히스토리를 관리할 수 있는 알림 시스템 설계 문서입니다.

**작성일**: 2025-01-15  
**버전**: 1.0  
**상태**: 설계 단계

---

## 📑 목차

1. [기능 개요](#1-기능-개요)
2. [시스템 아키텍처](#2-시스템-아키텍처)
3. [데이터베이스 설계](#3-데이터베이스-설계)
4. [API 설계](#4-api-설계)
5. [프론트엔드 설계](#5-프론트엔드-설계)
6. [실시간 알림 구현](#6-실시간-알림-구현)
7. [UI/UX 설계](#7-uiux-설계)
8. [구현 단계](#8-구현-단계)
9. [보안 고려사항](#9-보안-고려사항)

---

## 1. 기능 개요

### 1.1 핵심 기능

#### 1.1.1 실시간 알림 수신
- 고객 페이지에서 발생하는 이벤트를 실시간으로 관리자에게 알림
- 알림 타입별 우선순위 및 중요도 구분
- 읽음/안 읽음 상태 관리

#### 1.1.2 알림 히스토리 관리
- 모든 알림의 히스토리 저장 및 조회
- 날짜별, 타입별, 상태별 필터링
- 검색 기능 (고객명, 방 번호 등)

#### 1.1.3 알림 설정
- 알림 타입별 수신 여부 설정
- 중요도별 알림 소리/진동 설정
- 알림 자동 삭제 기간 설정

### 1.2 알림 타입

| 타입 | 설명 | 우선순위 | 중요도 |
|------|------|---------|--------|
| `checkin` | 체크인 완료 | 높음 | 높음 |
| `checkout` | 체크아웃 완료 | 높음 | 높음 |
| `order_created` | 주문 생성 | 중간 | 중간 |
| `order_status_changed` | 주문 상태 변경 | 낮음 | 낮음 |
| `order_cancelled` | 주문 취소 | 중간 | 중간 |
| `reservation_assigned` | 방 배정 완료 | 낮음 | 낮음 |
| `reservation_cancelled` | 예약 취소 | 높음 | 높음 |

### 1.3 사용자 시나리오

#### 시나리오 1: 체크인 알림
1. 고객이 고객 페이지에서 체크인 버튼 클릭
2. Railway 백엔드에 체크인 로그 저장
3. 알림 시스템이 체크인 이벤트 감지
4. 관리자 페이지에 실시간 알림 표시
5. 관리자가 알림 클릭하여 예약 상세 페이지로 이동

#### 시나리오 2: 주문 알림
1. 고객이 고객 페이지에서 주문 생성
2. Railway 백엔드에 주문 저장
3. 알림 시스템이 주문 생성 이벤트 감지
4. 관리자 페이지에 실시간 알림 표시
5. 관리자가 알림 클릭하여 주문 관리 페이지로 이동

#### 시나리오 3: 알림 히스토리 확인
1. 관리자가 알림 히스토리 페이지 접속
2. 날짜별, 타입별 필터링
3. 특정 알림 클릭하여 상세 정보 확인

---

## 2. 시스템 아키텍처

### 2.1 전체 아키텍처

```
[고객 페이지]
    ↓
[체크인/체크아웃/주문 이벤트 발생]
    ↓
[Railway Backend API]
    ↓
[PostgreSQL Database]
    ├─ check_in_out_logs 테이블
    ├─ orders 테이블
    └─ notifications 테이블 (신규)
    ↓
[알림 서비스 (Railway Backend)]
    ├─ 이벤트 감지
    ├─ 알림 생성
    └─ 실시간 전송
    ↓
[관리자 페이지 (Next.js)]
    ├─ WebSocket/SSE 연결
    ├─ 실시간 알림 수신
    └─ 알림 히스토리 조회
```

### 2.2 구성 요소

#### 2.2.1 Backend (Railway)
- **알림 서비스**: 이벤트 감지 및 알림 생성
- **WebSocket/SSE 서버**: 실시간 알림 전송
- **알림 API**: 알림 조회, 읽음 처리, 설정 관리

#### 2.2.2 Frontend (Vercel)
- **알림 컴포넌트**: 실시간 알림 표시
- **알림 히스토리 페이지**: 알림 목록 및 필터링
- **알림 설정 페이지**: 알림 수신 설정

#### 2.2.3 Database (PostgreSQL)
- **notifications 테이블**: 알림 데이터 저장
- **notification_settings 테이블**: 관리자별 알림 설정

---

## 3. 데이터베이스 설계

### 3.1 notifications 테이블

```sql
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id VARCHAR(50) NOT NULL, -- 관리자 ID (현재는 단일 관리자이므로 'admin' 고정)
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'checkin',
    'checkout',
    'order_created',
    'order_status_changed',
    'order_cancelled',
    'reservation_assigned',
    'reservation_cancelled'
  )),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMP,
  
  -- 관련 데이터 (JSONB)
  metadata JSONB, -- 예: { reservationId, orderId, room, guestName 등 }
  
  -- 링크 정보
  link_type VARCHAR(50), -- 'reservation', 'order', 'dashboard'
  link_id VARCHAR(255), -- 관련 ID (예약 ID, 주문 ID)
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_notifications_admin_id ON notifications(admin_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_admin_read ON notifications(admin_id, is_read, created_at DESC);
```

### 3.2 notification_settings 테이블

```sql
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id VARCHAR(50) NOT NULL UNIQUE,
  
  -- 알림 타입별 수신 여부
  checkin_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  checkout_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  order_created_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  order_status_changed_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  order_cancelled_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  reservation_assigned_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  reservation_cancelled_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- 알림 설정
  sound_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  vibration_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  auto_delete_days INTEGER DEFAULT 30, -- 자동 삭제 기간 (일)
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 3.3 데이터 모델 (TypeScript)

```typescript
export type NotificationType =
  | 'checkin'
  | 'checkout'
  | 'order_created'
  | 'order_status_changed'
  | 'order_cancelled'
  | 'reservation_assigned'
  | 'reservation_cancelled';

export type NotificationPriority = 'low' | 'medium' | 'high';

export type NotificationLinkType = 'reservation' | 'order' | 'dashboard';

export interface Notification {
  id: string;
  adminId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  readAt?: string;
  metadata?: {
    reservationId?: string;
    orderId?: string;
    room?: string;
    guestName?: string;
    [key: string]: unknown;
  };
  linkType?: NotificationLinkType;
  linkId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  id: string;
  adminId: string;
  checkinEnabled: boolean;
  checkoutEnabled: boolean;
  orderCreatedEnabled: boolean;
  orderStatusChangedEnabled: boolean;
  orderCancelledEnabled: boolean;
  reservationAssignedEnabled: boolean;
  reservationCancelledEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoDeleteDays: number;
  createdAt: string;
  updatedAt: string;
}
```

---

## 4. API 설계

### 4.1 알림 조회 API

#### GET /api/admin/notifications
**설명**: 알림 목록 조회

**Query Parameters**:
- `page`: 페이지 번호 (기본: 1)
- `limit`: 페이지당 항목 수 (기본: 20)
- `type`: 알림 타입 필터
- `isRead`: 읽음 여부 필터 (true/false)
- `priority`: 우선순위 필터
- `startDate`: 시작 날짜 (YYYY-MM-DD)
- `endDate`: 종료 날짜 (YYYY-MM-DD)

**Response**:
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "checkin",
      "title": "체크인 완료",
      "message": "홍길동님이 A1호에 체크인했습니다.",
      "priority": "high",
      "isRead": false,
      "metadata": {
        "reservationId": "uuid",
        "room": "A1",
        "guestName": "홍길동"
      },
      "linkType": "reservation",
      "linkId": "uuid",
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ],
  "total": 100,
  "unreadCount": 5
}
```

### 4.2 알림 읽음 처리 API

#### PATCH /api/admin/notifications/:id/read
**설명**: 알림을 읽음으로 표시

**Response**:
```json
{
  "id": "uuid",
  "isRead": true,
  "readAt": "2025-01-15T10:35:00Z"
}
```

#### PATCH /api/admin/notifications/read-all
**설명**: 모든 알림을 읽음으로 표시

**Response**:
```json
{
  "updatedCount": 5
}
```

### 4.3 알림 삭제 API

#### DELETE /api/admin/notifications/:id
**설명**: 알림 삭제

**Response**:
```json
{
  "success": true
}
```

### 4.4 알림 설정 API

#### GET /api/admin/notifications/settings
**설명**: 알림 설정 조회

**Response**:
```json
{
  "checkinEnabled": true,
  "checkoutEnabled": true,
  "orderCreatedEnabled": true,
  "soundEnabled": true,
  "vibrationEnabled": true,
  "autoDeleteDays": 30
}
```

#### PATCH /api/admin/notifications/settings
**설명**: 알림 설정 업데이트

**Request Body**:
```json
{
  "checkinEnabled": true,
  "orderCreatedEnabled": false,
  "soundEnabled": false
}
```

### 4.5 알림 통계 API

#### GET /api/admin/notifications/stats
**설명**: 알림 통계 조회

**Response**:
```json
{
  "total": 100,
  "unread": 5,
  "byType": {
    "checkin": 20,
    "checkout": 15,
    "order_created": 30,
    "order_status_changed": 25,
    "order_cancelled": 10
  },
  "today": 10,
  "thisWeek": 50
}
```

---

## 5. 프론트엔드 설계

### 5.1 알림 컴포넌트 구조

```
components/
├── admin/
│   ├── notifications/
│   │   ├── NotificationBell.tsx          # 알림 벨 아이콘 (배지 포함)
│   │   ├── NotificationDropdown.tsx      # 알림 드롭다운 (최근 알림 목록)
│   │   ├── NotificationItem.tsx         # 알림 아이템
│   │   ├── NotificationList.tsx          # 알림 목록 페이지
│   │   ├── NotificationSettings.tsx      # 알림 설정 페이지
│   │   └── NotificationBadge.tsx         # 읽지 않은 알림 개수 배지
│   └── ...
```

### 5.2 알림 상태 관리

```typescript
// lib/store/notifications.ts
import { create } from 'zustand';

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  
  // Actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  updateUnreadCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications],
    unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1,
  })),
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) =>
      n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - 1),
  })),
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    unreadCount: 0,
  })),
  deleteNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id),
    unreadCount: state.notifications.find((n) => n.id === id && !n.isRead)
      ? Math.max(0, state.unreadCount - 1)
      : state.unreadCount,
  })),
  updateUnreadCount: (count) => set({ unreadCount: count }),
}));
```

---

## 6. 실시간 알림 구현

### 6.1 구현 방식 비교

| 방식 | 장점 | 단점 | 추천도 |
|------|------|------|--------|
| **WebSocket** | 양방향 통신, 실시간성 높음 | 서버 리소스 사용, 구현 복잡 | ⭐⭐⭐ |
| **Server-Sent Events (SSE)** | 단방향 통신, 구현 간단 | 서버 리소스 사용 | ⭐⭐⭐⭐ |
| **Polling** | 구현 매우 간단 | 서버 부하, 실시간성 낮음 | ⭐⭐ |

**권장**: **Server-Sent Events (SSE)** - 단방향 통신이면 충분하고, 구현이 간단하며, Next.js와 호환성이 좋음

### 6.2 SSE 구현 (권장)

#### 6.2.1 Backend (Railway)

```typescript
// railway-backend/src/routes/admin.routes.ts
import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { setupNotificationSSE } from '../services/notifications.service';

const router = express.Router();

router.use(authenticate);

// SSE 엔드포인트
router.get('/notifications/stream', setupNotificationSSE);
```

```typescript
// railway-backend/src/services/notifications.service.ts
import { Request, Response } from 'express';

const clients = new Map<string, Response>();

export function setupNotificationSSE(req: Request, res: Response) {
  const adminId = req.user?.id || 'admin';
  
  // SSE 헤더 설정
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Nginx 버퍼링 비활성화
  
  // 클라이언트 등록
  clients.set(adminId, res);
  
  // 연결 종료 시 클라이언트 제거
  req.on('close', () => {
    clients.delete(adminId);
  });
  
  // 초기 연결 메시지
  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);
}

export function sendNotification(adminId: string, notification: Notification) {
  const client = clients.get(adminId);
  if (client) {
    client.write(`data: ${JSON.stringify({ type: 'notification', data: notification })}\n\n`);
  }
}
```

#### 6.2.2 Frontend (Next.js)

```typescript
// lib/hooks/useNotificationStream.ts
import { useEffect } from 'react';
import { useNotificationStore } from '@/lib/store/notifications';
import { getAuthToken } from '@/lib/auth';

export function useNotificationStream() {
  const { addNotification, updateUnreadCount } = useNotificationStore();
  
  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    
    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_RAILWAY_API_URL}/api/admin/notifications/stream`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'notification') {
        addNotification(data.data);
        updateUnreadCount((prev) => prev + 1);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      eventSource.close();
    };
    
    return () => {
      eventSource.close();
    };
  }, [addNotification, updateUnreadCount]);
}
```

### 6.3 Polling 구현 (대안)

SSE가 불가능한 경우 Polling으로 대체:

```typescript
// lib/hooks/useNotificationPolling.ts
import { useEffect, useRef } from 'react';
import { useNotificationStore } from '@/lib/store/notifications';
import { getNotifications } from '@/lib/api';

export function useNotificationPolling(interval: number = 5000) {
  const { setNotifications, updateUnreadCount } = useNotificationStore();
  const intervalRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await getNotifications({ limit: 10, isRead: false });
        setNotifications(response.notifications);
        updateUnreadCount(response.unreadCount);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };
    
    // 초기 로드
    fetchNotifications();
    
    // 주기적 폴링
    intervalRef.current = setInterval(fetchNotifications, interval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [interval, setNotifications, updateUnreadCount]);
}
```

---

## 7. UI/UX 설계

### 7.1 알림 벨 아이콘 (헤더)

**위치**: 관리자 페이지 헤더 우측 상단

**디자인**:
- 벨 아이콘 (Lucide React)
- 읽지 않은 알림이 있으면 빨간 배지 표시
- 클릭 시 드롭다운 메뉴 표시

**컴포넌트**: `NotificationBell.tsx`

### 7.2 알림 드롭다운

**내용**:
- 최근 알림 10개 표시
- 각 알림 아이템:
  - 아이콘 (타입별)
  - 제목
  - 메시지 (일부)
  - 시간 (상대 시간: "5분 전")
  - 읽지 않은 알림은 배경색 다르게 표시
- "모두 읽음" 버튼
- "모든 알림 보기" 링크

**컴포넌트**: `NotificationDropdown.tsx`

### 7.3 알림 목록 페이지

**경로**: `/admin/notifications`

**기능**:
- 알림 목록 표시 (페이지네이션)
- 필터링:
  - 타입별 필터
  - 읽음/안 읽음 필터
  - 날짜 범위 필터
- 검색: 고객명, 방 번호
- 정렬: 최신순, 오래된순
- 알림 클릭 시 관련 페이지로 이동

**컴포넌트**: `NotificationList.tsx`

### 7.4 알림 설정 페이지

**경로**: `/admin/notifications/settings`

**기능**:
- 알림 타입별 수신 여부 토글
- 소리/진동 설정
- 자동 삭제 기간 설정

**컴포넌트**: `NotificationSettings.tsx`

---

## 8. 구현 단계

### Phase 1: 데이터베이스 및 백엔드 API (1주)

- [ ] `notifications` 테이블 생성
- [ ] `notification_settings` 테이블 생성
- [ ] 알림 서비스 구현 (이벤트 감지 및 알림 생성)
- [ ] 알림 조회 API 구현
- [ ] 알림 읽음 처리 API 구현
- [ ] 알림 설정 API 구현

### Phase 2: 실시간 알림 (1주)

- [ ] SSE 서버 구현 (Railway)
- [ ] SSE 클라이언트 구현 (Next.js)
- [ ] 알림 스토어 구현 (Zustand)
- [ ] 알림 벨 컴포넌트 구현
- [ ] 알림 드롭다운 구현

### Phase 3: 알림 히스토리 (1주)

- [ ] 알림 목록 페이지 구현
- [ ] 필터링 기능 구현
- [ ] 검색 기능 구현
- [ ] 페이지네이션 구현

### Phase 4: 알림 설정 및 최적화 (1주)

- [ ] 알림 설정 페이지 구현
- [ ] 알림 자동 삭제 기능 구현
- [ ] 성능 최적화
- [ ] 테스트 및 버그 수정

---

## 9. 보안 고려사항

### 9.1 인증 및 인가

- 모든 알림 API는 관리자 인증 필요 (JWT)
- SSE 연결 시에도 JWT 토큰 검증
- 관리자별 알림 분리 (현재는 단일 관리자)

### 9.2 데이터 보안

- 알림 메시지에 민감한 정보 포함 금지
- 개인정보 마스킹 처리
- 알림 자동 삭제로 데이터 보관 기간 제한

### 9.3 Rate Limiting

- 알림 생성 API에 Rate Limiting 적용
- SSE 연결 수 제한

---

## 10. 향후 확장 가능성

### 10.1 추가 알림 타입

- 예약 변경 알림
- 결제 완료 알림
- 리뷰 작성 알림

### 10.2 알림 채널 확장

- 이메일 알림
- SMS 알림
- 푸시 알림 (PWA)

### 10.3 알림 그룹화

- 같은 타입의 알림을 그룹화하여 표시
- 예: "5개의 새로운 주문이 있습니다"

---

## 11. 참고 사항

### 11.1 기존 시스템과의 통합

- 체크인/체크아웃: `check_in_out_logs` 테이블 이벤트 감지
- 주문: `orders` 테이블 이벤트 감지
- 예약: `reservations` 테이블 이벤트 감지

### 11.2 성능 고려사항

- 알림 데이터 인덱싱 최적화
- 읽지 않은 알림 개수 캐싱
- 알림 목록 페이지네이션

### 11.3 모바일 최적화

- 모바일에서도 알림 벨 표시
- 터치 친화적인 드롭다운 디자인
- 알림 목록 모바일 최적화

---

---

## 12. 구현 완료 현황

### 12.1 완료된 작업

#### 데이터베이스
- [x] `notifications` 테이블 생성
- [x] `notification_settings` 테이블 생성
- [x] 인덱스 생성
- [x] 자동 마이그레이션 로직 추가

#### 백엔드
- [x] 알림 서비스 구현 (`notifications.service.ts`)
- [x] 알림 컨트롤러 구현 (`notifications.controller.ts`)
- [x] SSE 서버 구현 (`notifications-sse.service.ts`)
- [x] 알림 헬퍼 서비스 구현 (`notifications-helper.service.ts`)
- [x] 체크인/체크아웃 알림 통합
- [x] 주문 생성/상태 변경 알림 통합
- [x] 알림 API 라우트 추가

#### 프론트엔드
- [x] 알림 타입 정의 (`types/index.ts`)
- [x] 알림 API 함수 구현 (`lib/api.ts`)
- [x] 알림 스토어 구현 (`lib/store/notifications.ts`)
- [x] SSE 클라이언트 훅 구현 (`lib/hooks/useNotificationStream.ts`)
- [x] 알림 벨 컴포넌트 구현 (`components/admin/notifications/NotificationBell.tsx`)
- [x] 알림 드롭다운 컴포넌트 구현 (`components/admin/notifications/NotificationDropdown.tsx`)
- [x] 알림 목록 페이지 구현 (`app/admin/notifications/page.tsx`)
- [x] 관리자 레이아웃에 알림 벨 통합

#### 통합
- [x] 기존 체크인/체크아웃 로직과 통합
- [x] 기존 주문 생성/상태 변경 로직과 통합
- [x] 기존 코드와의 호환성 유지

### 12.2 구현 세부 사항

#### 알림 생성 시점
1. **체크인**: `railway-backend/src/controllers/guest.controller.ts`의 `checkIn` 함수에서 알림 생성
2. **체크아웃**: `railway-backend/src/controllers/guest.controller.ts`의 `checkOut` 함수에서 알림 생성
3. **주문 생성**: `railway-backend/src/controllers/guest.controller.ts`의 `createGuestOrder` 함수에서 알림 생성
4. **주문 상태 변경**: `railway-backend/src/controllers/orders.controller.ts`의 `updateOrderStatus` 함수에서 알림 생성

#### 알림 전송 방식
- 알림 생성 후 SSE를 통해 실시간 전송
- 알림 생성 실패 시에도 원래 프로세스는 계속 진행 (비동기 처리)

#### 데이터 호환성
- 기존 `check_in_out_logs` 테이블 구조 유지
- 기존 `orders` 테이블 구조 유지
- 기존 API 응답 형식 유지
- 알림은 추가 기능으로만 작동 (기존 기능에 영향 없음)

### 12.3 남은 작업 (선택사항)

- [ ] 알림 설정 페이지 구현 (`/admin/notifications/settings`)
- [ ] 알림 자동 삭제 기능 구현
- [ ] 알림 통계 대시보드 통합
- [ ] 알림 소리/진동 기능 (PWA)

---

**작성일**: 2025-01-15  
**최종 업데이트**: 2025-01-15  
**작성자**: AI Assistant  
**검토자**: (검토 필요)
