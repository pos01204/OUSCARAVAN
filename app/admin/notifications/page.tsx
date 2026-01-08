'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getNotifications, markNotificationAsRead, deleteNotification } from '@/lib/api';
import { useNotificationStore } from '@/lib/store/notifications';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDateTimeToKorean } from '@/lib/utils/date';
import { ArrowLeft, CheckCheck, Trash2 } from 'lucide-react';
import type { Notification, NotificationType } from '@/types';

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, setNotifications, markAsRead, deleteNotification: deleteFromStore, updateUnreadCount } = useNotificationStore();
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<{
    type?: NotificationType;
    isRead?: boolean;
  }>({});

  useEffect(() => {
    loadNotifications();
  }, [filters]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await getNotifications({
        ...filters,
        limit: 50,
      });
      setNotifications(response.notifications);
      updateUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification.id);
        markAsRead(notification.id);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    if (notification.linkType && notification.linkId) {
      if (notification.linkType === 'reservation') {
        router.push(`/admin/reservations/${notification.linkId}`);
      } else if (notification.linkType === 'order') {
        router.push(`/admin/orders`);
      }
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      deleteFromStore(id);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'checkin':
        return '🏠';
      case 'checkout':
        return '🚪';
      case 'order_created':
        return '🛒';
      case 'order_status_changed':
        return '📦';
      case 'order_cancelled':
        return '❌';
      default:
        return '🔔';
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            aria-label="뒤로 가기"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">알림 히스토리</h1>
            <p className="text-sm text-muted-foreground">모든 알림을 확인하고 관리하세요</p>
          </div>
        </div>
      </div>

      {/* 필터 */}
      <Card>
        <CardHeader>
          <CardTitle>필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filters.isRead === undefined ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters({ ...filters, isRead: undefined })}
            >
              전체
            </Button>
            <Button
              variant={filters.isRead === false ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters({ ...filters, isRead: false })}
            >
              읽지 않음
            </Button>
            <Button
              variant={filters.isRead === true ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters({ ...filters, isRead: true })}
            >
              읽음
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 알림 목록 */}
      <div className="space-y-2">
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              로딩 중...
            </CardContent>
          </Card>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              알림이 없습니다
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-colors hover:bg-muted border-l-4 ${
                !notification.isRead ? 'bg-muted/50 border-l-blue-500' : 'border-l-transparent'
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0" aria-hidden="true">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{notification.title}</h3>
                        <Badge variant="outline" className={getPriorityColor(notification.priority)}>
                          {notification.priority}
                        </Badge>
                        {!notification.isRead && (
                          <span className="h-2 w-2 rounded-full bg-blue-500" aria-label="읽지 않음" />
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => handleDelete(notification.id, e)}
                        aria-label="알림 삭제"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTimeToKorean(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
