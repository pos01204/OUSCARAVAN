'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNotificationStore } from '@/lib/store/notifications';
import { markNotificationAsRead, markAllNotificationsAsRead, getNotifications } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatDateTimeToKorean } from '@/lib/utils/date';
import { CheckCheck } from 'lucide-react';
import type { Notification } from '@/types';

interface NotificationDropdownProps {
  onClose: () => void;
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const { notifications, unreadCount, setNotifications, markAsRead, markAllAsRead, updateUnreadCount } = useNotificationStore();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 최근 알림 10개 로드
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await getNotifications({ limit: 10 });
        setNotifications(response.notifications);
        updateUnreadCount(response.unreadCount);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };

    loadNotifications();
  }, [setNotifications, updateUnreadCount]);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleNotificationClick = async (notification: Notification) => {
    // 읽음 처리
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification.id);
        markAsRead(notification.id);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    // 관련 페이지로 이동
    if (notification.linkType && notification.linkId) {
      if (notification.linkType === 'reservation') {
        router.push(`/admin/reservations/${notification.linkId}`);
      } else if (notification.linkType === 'order') {
        router.push(`/admin/orders`);
      }
      onClose();
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
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
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-orange-500';
      case 'low':
        return 'border-l-blue-500';
      default:
        return 'border-l-gray-500';
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full z-50 mt-2 w-80 md:w-96 rounded-lg border bg-card shadow-lg"
      role="menu"
      aria-label="알림 목록"
    >
      <Card className="border-0 shadow-none">
        <CardContent className="p-0">
          {/* 헤더 */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="font-semibold">알림</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-8 text-xs"
                aria-label="모든 알림 읽음 처리"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                모두 읽음
              </Button>
            )}
          </div>

          {/* 알림 목록 */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                알림이 없습니다
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left px-4 py-3 hover:bg-muted transition-colors border-l-4 ${getPriorityColor(notification.priority)} ${!notification.isRead ? 'bg-muted/50' : ''}`}
                    role="menuitem"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0" aria-hidden="true">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-sm">{notification.title}</p>
                          {!notification.isRead && (
                            <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" aria-label="읽지 않음" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDateTimeToKorean(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 푸터 */}
          <div className="border-t px-4 py-2">
            <Link
              href="/admin/notifications"
              className="block text-center text-sm text-primary hover:underline"
              onClick={onClose}
            >
              모든 알림 보기
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
