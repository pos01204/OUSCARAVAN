// Service Worker for Background Notifications
const CACHE_NAME = 'ouscaravan-v1';
const ALARM_STORAGE_KEY = 'scheduled_alarms';

// 설치 이벤트
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  self.skipWaiting(); // 즉시 활성화
});

// 활성화 이벤트
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  event.waitUntil(self.clients.claim()); // 모든 클라이언트 제어
});

// 메시지 수신 (알람 스케줄링 및 관리자 알림)
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);

  if (event.data.type === 'SCHEDULE_ALARM') {
    const { id, time, title, body, tag } = event.data;
    scheduleAlarm(id, time, title, body, tag);
  } else if (event.data.type === 'CANCEL_ALARM') {
    const { id } = event.data;
    cancelAlarm(id);
  } else if (event.data.type === 'CLEAR_ALL_ALARMS') {
    clearAllAlarms();
  } else if (event.data.type === 'GET_ALARMS') {
    event.ports[0].postMessage({ alarms: getStoredAlarms() });
  } else if (event.data.type === 'ADMIN_NOTIFICATION') {
    // 관리자 알림 표시
    const { title, body, tag, priority, linkType, linkId } = event.data;
    showAdminNotification(title, body, tag, priority, linkType, linkId);
  }
});

// 알람 스케줄링 함수
function scheduleAlarm(id, time, title, body, tag = 'default') {
  const alarmTime = new Date(time).getTime();
  const now = Date.now();
  const delay = alarmTime - now;

  console.log(`[Service Worker] Scheduling alarm: ${title} at ${new Date(time).toLocaleString()}`);

  if (delay <= 0) {
    // 이미 시간이 지났으면 즉시 알림
    showNotification(title, body, tag);
    return;
  }

  // 알람 정보 저장
  const alarms = getStoredAlarms();
  alarms.push({
    id,
    time: alarmTime,
    title,
    body,
    tag,
  });
  saveAlarms(alarms);

  // 타이머 설정
  const timeoutId = setTimeout(() => {
    showNotification(title, body, tag);
    // 알람 실행 후 저장된 알람에서 제거
    removeAlarm(id);
  }, delay);

  // 타이머 ID 저장 (나중에 취소할 수 있도록)
  if (!self.alarmTimers) {
    self.alarmTimers = new Map();
  }
  self.alarmTimers.set(id, timeoutId);
}

// 알람 취소 함수
function cancelAlarm(id) {
  console.log(`[Service Worker] Canceling alarm: ${id}`);
  
  if (self.alarmTimers && self.alarmTimers.has(id)) {
    clearTimeout(self.alarmTimers.get(id));
    self.alarmTimers.delete(id);
  }
  
  removeAlarm(id);
}

// 모든 알람 취소
function clearAllAlarms() {
  console.log('[Service Worker] Clearing all alarms');
  
  if (self.alarmTimers) {
    self.alarmTimers.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    self.alarmTimers.clear();
  }
  
  saveAlarms([]);
}

// 알림 표시 함수
function showNotification(title, body, tag = 'default') {
  console.log(`[Service Worker] Showing notification: ${title}`);
  
  const notificationOptions = {
    body,
    icon: '/icon-192x192.png',
    badge: '/icon-96x96.png',
    tag,
    requireInteraction: true, // 사용자가 직접 닫아야 함
    vibrate: [200, 100, 200, 100, 200], // 진동 패턴 (모바일)
    data: {
      timestamp: Date.now(),
      tag,
    },
    actions: [
      {
        action: 'open',
        title: '앱 열기',
      },
      {
        action: 'dismiss',
        title: '닫기',
      },
    ],
  };

  return self.registration.showNotification(title, notificationOptions);
}

// 관리자 알림 표시 함수
function showAdminNotification(title, body, tag = 'admin-notification', priority = 'medium', linkType = null, linkId = null) {
  console.log(`[Service Worker] Showing admin notification: ${title}`);
  
  // 우선순위에 따른 진동 패턴
  let vibratePattern = [200, 100, 200];
  if (priority === 'high') {
    vibratePattern = [300, 100, 300, 100, 300]; // 높은 우선순위는 더 강한 진동
  } else if (priority === 'low') {
    vibratePattern = [100, 50, 100]; // 낮은 우선순위는 약한 진동
  }
  
  const notificationOptions = {
    body,
    icon: '/icon-192x192.png',
    badge: '/icon-96x96.png',
    tag: tag || `admin-${Date.now()}`, // 고유 태그
    requireInteraction: priority === 'high', // 높은 우선순위는 사용자가 직접 닫아야 함
    vibrate: vibratePattern,
    data: {
      timestamp: Date.now(),
      tag,
      priority,
      linkType,
      linkId,
      isAdminNotification: true,
    },
    actions: [
      {
        action: 'view',
        title: '확인하기',
      },
      {
        action: 'dismiss',
        title: '닫기',
      },
    ],
  };

  return self.registration.showNotification(title, notificationOptions);
}

// 알림 클릭 이벤트
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.notification.tag);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const notificationData = event.notification.data || {};
  const isAdminNotification = notificationData.isAdminNotification;
  
  // 관리자 알림인 경우 관련 페이지로 이동
  let targetUrl = '/';
  if (isAdminNotification) {
    if (notificationData.linkType === 'reservation' && notificationData.linkId) {
      targetUrl = `/admin/reservations/${notificationData.linkId}`;
    } else if (notificationData.linkType === 'order' && notificationData.linkId) {
      targetUrl = `/admin/orders/${notificationData.linkId}`;
    } else {
      targetUrl = '/admin/notifications';
    }
  }

  // 앱 열기
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 이미 열려있는 클라이언트가 있으면 포커스
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      // 없으면 새로 열기
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// 알림 닫기 이벤트
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notification closed:', event.notification.tag);
});

// 저장된 알람 가져오기
function getStoredAlarms() {
  try {
    // IndexedDB나 다른 저장소를 사용할 수도 있지만, 
    // 간단하게 메모리에만 저장 (Service Worker 재시작 시 초기화됨)
    // 실제로는 IndexedDB를 사용하는 것이 좋지만, 
    // 여기서는 간단한 구현을 위해 메모리만 사용
    return self.storedAlarms || [];
  } catch (e) {
    console.error('[Service Worker] Error getting stored alarms:', e);
    return [];
  }
}

// 알람 저장
function saveAlarms(alarms) {
  self.storedAlarms = alarms;
}

// 알람 제거
function removeAlarm(id) {
  const alarms = getStoredAlarms();
  const filtered = alarms.filter((alarm) => alarm.id !== id);
  saveAlarms(filtered);
}

// Service Worker 시작 시 저장된 알람 복원
self.addEventListener('activate', (event) => {
  event.waitUntil(
    // 저장된 알람이 있으면 복원 (IndexedDB 사용 시)
    // 현재는 메모리 기반이므로 재시작 시 초기화됨
    // 실제 운영 환경에서는 IndexedDB를 사용하는 것을 권장
    Promise.resolve()
  );
});

// 주기적으로 알람 확인 (백그라운드 동기화)
setInterval(() => {
  const alarms = getStoredAlarms();
  const now = Date.now();
  
  alarms.forEach((alarm) => {
    const delay = alarm.time - now;
    // 1분 이내로 남은 알람이 있으면 즉시 알림 (타이머가 누락된 경우 대비)
    if (delay > 0 && delay < 60000) {
      console.log(`[Service Worker] Alarm ${alarm.id} is due soon, showing notification`);
      showNotification(alarm.title, alarm.body, alarm.tag);
      removeAlarm(alarm.id);
    }
  });
}, 60000); // 1분마다 확인
