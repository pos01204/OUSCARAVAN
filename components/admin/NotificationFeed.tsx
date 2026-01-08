'use client';

import { useRouter } from 'next/navigation';
import { useNotificationStore } from '@/lib/store/notifications';
import { useNotificationStream } from '@/lib/hooks/useNotificationStream';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  CheckCircle, 
  Calendar, 
  Clock,
  X 
} from 'lucide-react';
import { formatDateTimeToKorean } from '@/lib/utils/date';
import type { Notification } from '@/types';
import { markNotificationAsRead, deleteNotification as deleteNotificationApi } from '@/lib/api';

export function NotificationFeed() {
  const router = useRouter();
  const { notifications, markAsRead, deleteNotification } = useNotificationStore();
  
  // SSE 연결 (실시간 알림 수신)
  useNotificationStream();
  
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
  
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order_created':
        return ShoppingCart;
      case 'checkin':
      case 'checkout':
        return CheckCircle;
      case 'reservation_assigned':
      case 'reservation_cancelled':
        return Calendar;
      default:
        return Clock;
    }
  };
  
  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'order_created':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'checkin':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'checkout':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'reservation_assigned':
      case 'reservation_cancelled':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
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
      {sortedNotifications.map((notification) => {
        const Icon = getNotificationIcon(notification.type);
        const colorClass = getNotificationColor(notification.type);
        const metadata = notification.metadata as Record<string, unknown> | undefined;
        
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
