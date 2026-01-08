'use client';

import { useEffect, useRef } from 'react';
import { useNotificationStore } from '@/lib/store/notifications';

export function useNotificationStream() {
  const { addNotification, updateUnreadCount } = useNotificationStore();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Next.js API 라우트를 통한 프록시 사용
    // 쿠키가 자동으로 포함되므로 인증이 자동으로 처리됨
    const eventSource = new EventSource('/api/admin/notifications/stream');

    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('[NotificationStream] Connection opened');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'connected') {
          console.log('[NotificationStream] Connected:', data.adminId);
        } else if (data.type === 'notification') {
          console.log('[NotificationStream] Received notification:', data.data);
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
      // 연결이 끊어지면 자동으로 재연결 시도
    };

    return () => {
      console.log('[NotificationStream] Cleaning up connection');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [addNotification, updateUnreadCount]);
}
