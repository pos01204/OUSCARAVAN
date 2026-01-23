'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNotificationStore } from '@/lib/store/notifications';
import { useNotificationStream } from '@/lib/hooks/useNotificationStream';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/shared/ErrorState';
import { X } from 'lucide-react';
import { formatDateTimeToKorean } from '@/lib/utils/date';
import type { Notification } from '@/types';
import { getNotifications, markNotificationAsRead, deleteNotification as deleteNotificationApi } from '@/lib/api';
import { getNotificationTypeMeta } from '@/lib/utils/notification-meta';

export function NotificationFeed() {
  const router = useRouter();
  const { notifications, markAsRead, deleteNotification, setNotifications, updateUnreadCount } =
    useNotificationStore();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  
  // SSE 연결 (실시간 알림 수신)
  useNotificationStream();

  useEffect(() => {
    let cancelled = false;

    const loadNotifications = async () => {
      try {
        const response = await getNotifications({ limit: 50 });
        if (cancelled) return;
        setNotifications(response.notifications);
        updateUnreadCount(response.unreadCount);
        setLoadError(null);
        setLastUpdatedAt(new Date());
      } catch (error) {
        console.error('Failed to load notifications:', error);
        setLoadError('알림을 불러오지 못했어요. 다시 시도해주세요.');
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [setNotifications, updateUnreadCount]);
  
  // 최신 알림을 상단에 표시 (시간순 정렬)
  const sortedNotifications = [...notifications].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  const handleNotificationClick = async (notification: Notification) => {
    // 알림 읽음 처리
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification.id);
        markAsRead(notification.id);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
    
    // 링크 타입에 따라 페이지 이동
    if (notification.linkType && notification.linkId) {
      if (notification.linkType === 'order') {
        router.push(`/admin/orders`);
      } else if (notification.linkType === 'reservation') {
        router.push(`/admin/reservations/${notification.linkId}`);
      } else if (notification.linkType === 'dashboard') {
        router.push('/admin');
      }
    } else {
      // metadata에서 직접 링크 추출
      const metadata = notification.metadata as Record<string, unknown> | undefined;
      if (metadata) {
        if (metadata.orderId) {
          router.push(`/admin/orders`);
        } else if (metadata.reservationId) {
          router.push(`/admin/reservations/${metadata.reservationId}`);
        }
      }
    }
  };
  
  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    try {
      await deleteNotificationApi(notificationId);
      deleteNotification(notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };
  
  if (sortedNotifications.length === 0 && loadError) {
    return (
      <ErrorState
        title="알림을 불러오지 못했어요"
        description={loadError}
        onRetry={() => {
          setLoadError(null);
          getNotifications({ limit: 50 })
            .then((response) => {
              setNotifications(response.notifications);
              updateUnreadCount(response.unreadCount);
            })
            .catch((error) => {
              console.error('Failed to load notifications:', error);
              setLoadError('알림을 불러오지 못했어요. 다시 시도해주세요.');
            });
        }}
      />
    );
  }

  if (sortedNotifications.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            알림이 없습니다.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-3">
      {lastUpdatedAt ? (
        <p className="text-xs text-muted-foreground">
          마지막 업데이트: {formatDateTimeToKorean(lastUpdatedAt)}
        </p>
      ) : null}
      {sortedNotifications.map((notification) => {
        const meta = getNotificationTypeMeta(notification.type);
        const Icon = meta.icon;
        const colorClass = meta.colorClassName;
        
        return (
          <Card
            key={notification.id}
            className={`cursor-pointer hover:bg-muted/50 transition-colors ${
              !notification.isRead ? 'border-l-4 border-l-primary' : ''
            }`}
            onClick={() => handleNotificationClick(notification)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-1">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <Badge variant="default" className="flex-shrink-0">
                        새
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDateTimeToKorean(notification.createdAt)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => handleDelete(e, notification.id)}
                      aria-label="알림 삭제"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
