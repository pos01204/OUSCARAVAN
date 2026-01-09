# 웹 앱 알람 기능 구현 가이드

## 📋 개요

웹 앱에서 실제 휴대전화 알람을 설정하는 것은 **보안상의 이유로 직접적으로는 불가능**합니다. 하지만 다음과 같은 대안을 통해 유사한 기능을 구현할 수 있습니다.

---

## 🔍 현재 구현 상태

### ✅ 이미 구현된 기능

1. **Web Notifications API** (`lib/notifications.ts`)
   - 브라우저 알림 권한 요청
   - 체크아웃 1시간 전 알림 스케줄링
   - `CheckoutReminder` 컴포넌트에서 사용 중

2. **PWA 설정** (`public/manifest.json`)
   - 앱처럼 설치 가능
   - Standalone 모드 지원

### ⚠️ 제한사항

- **시스템 알람 직접 설정 불가**: 웹 앱은 보안상의 이유로 OS 레벨의 알람을 직접 설정할 수 없습니다.
- **브라우저가 닫히면 알림 불가**: 현재 구현은 브라우저가 열려있을 때만 동작합니다.
- **백그라운드 알림 제한**: Service Worker가 없으면 백그라운드에서 알림을 받을 수 없습니다.

---

## 🚀 구현 가능한 솔루션

### 1. Web Notifications API (현재 구현됨) ⭐

**장점**:
- 브라우저가 열려있을 때 알림 수신 가능
- 사용자가 권한만 허용하면 바로 사용 가능
- 구현이 간단함

**단점**:
- 브라우저가 닫히면 알림 불가
- 앱이 백그라운드에 있어도 탭이 닫히면 동작 안 함

**현재 구현 위치**:
- `lib/notifications.ts`
- `components/features/CheckoutReminder.tsx`

---

### 2. PWA + Service Worker (권장) ⭐⭐⭐

**장점**:
- 브라우저가 닫혀도 백그라운드에서 동작 가능
- 앱처럼 설치 가능
- 네이티브 앱과 유사한 경험 제공

**단점**:
- Service Worker 구현 필요
- 브라우저별 지원 차이 (Chrome, Safari 등)

**구현 방법**:
```typescript
// Service Worker에서 백그라운드 알림 처리
self.addEventListener('message', (event) => {
  if (event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { time, title, body } = event.data;
    const delay = time - Date.now();
    
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon: '/icon-192x192.png',
        badge: '/icon-96x96.png',
        tag: 'checkout-reminder',
        requireInteraction: true, // 사용자가 직접 닫아야 함
        vibrate: [200, 100, 200], // 진동 패턴
        sound: '/notification-sound.mp3', // 소리 (선택사항)
      });
    }, delay);
  }
});
```

---

### 3. Web Share API + 네이티브 앱 연동 (제한적) ⭐

**장점**:
- 네이티브 앱의 알람 기능 활용 가능
- 시스템 알람과 동일한 경험

**단점**:
- 사용자가 네이티브 앱을 설치해야 함
- 모든 브라우저에서 지원하지 않음
- 구현이 복잡함

**구현 방법**:
```typescript
// 네이티브 앱으로 알람 설정 요청
if (navigator.share) {
  await navigator.share({
    title: '체크아웃 알람 설정',
    text: '체크아웃 시간까지 1시간 전에 알림을 받으시겠습니까?',
    url: `ouscaravan://alarm?time=${checkoutTime}&type=checkout`,
  });
}
```

---

## 💡 추천 구현 방안

### Phase 1: Service Worker 추가 (우선순위 높음)

**목표**: 브라우저가 닫혀도 백그라운드에서 알림 수신 가능

**구현 단계**:
1. Service Worker 파일 생성 (`public/sw.js`)
2. 알람 스케줄링 로직 추가
3. 백그라운드 동기화 구현
4. PWA 설치 안내 추가

**예상 효과**:
- 브라우저가 닫혀도 알림 수신 가능
- 네이티브 앱과 유사한 경험 제공
- 사용자 만족도 향상

---

### Phase 2: 알람 설정 UI 개선

**목표**: 사용자가 원하는 시간에 알람을 설정할 수 있도록

**구현 단계**:
1. 알람 설정 모달/페이지 추가
2. 시간 선택 UI 구현
3. 여러 알람 설정 가능하도록
4. 알람 목록 및 관리 기능

**예상 효과**:
- 사용자 맞춤형 알람 설정
- 체크아웃 외 다른 이벤트에도 알람 설정 가능

---

### Phase 3: 진동 및 소리 추가

**목표**: 알림을 더 눈에 띄게 만들기

**구현 단계**:
1. Vibration API 활용
2. 알림 소리 추가 (선택사항)
3. 알림 중요도에 따른 차별화

**예상 효과**:
- 알림 인지도 향상
- 사용자가 놓치지 않도록

---

## 📱 브라우저별 지원 현황

| 기능 | Chrome | Safari | Firefox | Edge |
|------|--------|--------|---------|------|
| Web Notifications | ✅ | ✅ (macOS/iOS 16.4+) | ✅ | ✅ |
| Service Worker | ✅ | ✅ (iOS 11.3+) | ✅ | ✅ |
| Vibration API | ✅ | ❌ | ✅ | ✅ |
| Web Share API | ✅ | ✅ | ❌ | ✅ |
| Background Sync | ✅ | ❌ | ✅ | ✅ |

---

## 🔧 구현 예시 코드

### Service Worker 기반 알람 스케줄링

```typescript
// lib/alarm-service.ts
export class AlarmService {
  private serviceWorker: ServiceWorkerRegistration | null = null;

  async initialize() {
    if ('serviceWorker' in navigator) {
      this.serviceWorker = await navigator.serviceWorker.register('/sw.js');
    }
  }

  async scheduleAlarm(time: Date, title: string, body: string) {
    if (!this.serviceWorker) {
      throw new Error('Service Worker가 등록되지 않았습니다.');
    }

    // Service Worker에 알람 스케줄링 요청
    this.serviceWorker.active?.postMessage({
      type: 'SCHEDULE_ALARM',
      time: time.getTime(),
      title,
      body,
    });

    // 로컬 스토리지에 알람 정보 저장 (백업용)
    const alarms = this.getStoredAlarms();
    alarms.push({
      id: Date.now().toString(),
      time: time.getTime(),
      title,
      body,
    });
    localStorage.setItem('alarms', JSON.stringify(alarms));
  }

  getStoredAlarms() {
    const stored = localStorage.getItem('alarms');
    return stored ? JSON.parse(stored) : [];
  }
}
```

### Service Worker 구현

```javascript
// public/sw.js
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 알람 스케줄링 메시지 수신
self.addEventListener('message', (event) => {
  if (event.data.type === 'SCHEDULE_ALARM') {
    const { time, title, body } = event.data;
    const delay = time - Date.now();
    
    if (delay > 0) {
      setTimeout(() => {
        self.registration.showNotification(title, {
          body,
          icon: '/icon-192x192.png',
          badge: '/icon-96x96.png',
          tag: 'alarm',
          requireInteraction: true,
          vibrate: [200, 100, 200, 100, 200],
          actions: [
            { action: 'snooze', title: '10분 후 다시' },
            { action: 'dismiss', title: '닫기' },
          ],
        });
      }, delay);
    }
  }
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'snooze') {
    // 10분 후 다시 알림
    const newTime = Date.now() + 10 * 60 * 1000;
    setTimeout(() => {
      self.registration.showNotification(event.notification.title, {
        body: event.notification.body,
        icon: '/icon-192x192.png',
        tag: 'alarm',
        requireInteraction: true,
      });
    }, 10 * 60 * 1000);
  } else {
    // 앱 열기
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
```

---

## 🎯 실제 휴대전화 알람과의 차이점

| 기능 | 네이티브 앱 알람 | 웹 앱 알람 |
|------|----------------|-----------|
| 시스템 알람 설정 | ✅ 가능 | ❌ 불가능 |
| 브라우저 닫힌 상태 | ✅ 동작 | ⚠️ Service Worker 필요 |
| 백그라운드 실행 | ✅ 가능 | ⚠️ 제한적 |
| 진동 | ✅ 가능 | ⚠️ 브라우저별 차이 |
| 소리 | ✅ 가능 | ⚠️ 브라우저별 차이 |
| 반복 알람 | ✅ 가능 | ✅ 구현 가능 |

---

## 📝 결론

### 가능한 것 ✅
- **브라우저 알림**: Web Notifications API로 브라우저 알림 수신 가능
- **백그라운드 알림**: Service Worker로 브라우저가 닫혀도 알림 수신 가능 (PWA 설치 시)
- **진동**: Vibration API로 진동 패턴 설정 가능 (일부 브라우저)
- **소리**: 알림에 소리 추가 가능

### 불가능한 것 ❌
- **시스템 알람 직접 설정**: OS 레벨의 알람 앱처럼 직접 설정 불가
- **완전한 백그라운드 실행**: 네이티브 앱처럼 항상 백그라운드에서 실행 불가

### 권장 사항 💡
1. **Service Worker 추가**: 백그라운드 알림을 위해 필수
2. **PWA 설치 안내**: 사용자에게 앱 설치를 안내하여 더 나은 경험 제공
3. **브라우저별 대안 제공**: Safari 등 일부 브라우저에서는 제한이 있으므로 대안 제공

---

## 🔗 참고 자료

- [Web Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API)
- [PWA 가이드](https://web.dev/progressive-web-apps/)

---

**작성일**: 2024-01-XX  
**버전**: 1.0
