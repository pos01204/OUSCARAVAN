'use client';

import { useEffect, useRef } from 'react';
import { useNotificationStore } from '@/lib/store/notifications';

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

      // Next.js API 라우트를 통한 프록시 사용
      // 쿠키가 자동으로 포함되므로 인증이 자동으로 처리됨
      const eventSource = new EventSource('/api/admin/notifications/stream');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('[NotificationStream] Connection opened');
        reconnectAttempts.current = 0; // 재연결 성공 시 카운터 리셋
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
        
        // 연결이 끊어진 경우
        if (eventSource.readyState === EventSource.CLOSED) {
          // 재연결 시도
          if (reconnectAttempts.current < maxReconnectAttempts) {
            const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts.current); // 지수 백오프
            reconnectAttempts.current += 1;
            
            console.log(`[NotificationStream] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`);
            
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
