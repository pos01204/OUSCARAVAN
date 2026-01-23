'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getRooms, getAdminOrders, updateOrderStatus, type Room, type Order } from '@/lib/api';
import { logError } from '@/lib/logger';
import { extractUserFriendlyMessage } from '@/lib/error-messages';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ShoppingCart, CheckCircle2, RefreshCw } from 'lucide-react';
import { formatDateTimeToKorean } from '@/lib/utils/date';
import { useNotificationStore } from '@/lib/store/notifications';
import { useNotificationStream } from '@/lib/hooks/useNotificationStream';
import { AdminRoomsSkeleton } from '@/components/admin/AdminRoomsSkeleton';
import { LastUpdatedAt } from '@/components/shared/LastUpdatedAt';

interface RoomWithReservation extends Room {
  reservation?: {
    id: string;
    guestName: string;
    checkin: string;
    checkout: string;
    status: string;
  } | null;
  orders?: Order[]; // 주문 목록 추가
}

const ROOM_AVAILABILITY_BADGE: Record<
  Room['status'],
  { label: string; className: string }
> = {
  available: { label: '사용 가능', className: 'bg-green-500 text-white hover:bg-green-600' },
  occupied: { label: '사용 중', className: 'bg-red-500 text-white hover:bg-red-600' },
  maintenance: { label: '점검 중', className: 'bg-gray-500 text-white hover:bg-gray-600' },
};

function getReservationOccupancyBadge(status?: string) {
  if (status === 'checked_in') {
    return { label: '사용 중', className: 'bg-red-500 text-white hover:bg-red-600' };
  }
  if (status === 'checked_out') {
    return { label: '체크아웃', className: 'bg-gray-500 text-white hover:bg-gray-600' };
  }
  return { label: '배정됨', className: 'bg-slate-500 text-white hover:bg-slate-600' };
}

export default function RoomsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [rooms, setRooms] = useState<RoomWithReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [completingOrderId, setCompletingOrderId] = useState<string | null>(null);
  const [blinkingRoomIds, setBlinkingRoomIds] = useState<Set<string>>(new Set());
  const { notifications } = useNotificationStore();
  const previousNotificationsRef = useRef<Set<string>>(new Set());

  // SSE 연결 (실시간 알림 수신)
  useNotificationStream();

  // 각 방의 주문 목록 조회
  const fetchOrdersForRooms = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const ordersData = await getAdminOrders({ date: today, limit: 1000 });

      const ordersByReservationId = new Map<string, Order[]>();
      ordersData.orders.forEach((order) => {
        if (!ordersByReservationId.has(order.reservationId)) {
          ordersByReservationId.set(order.reservationId, []);
        }
        ordersByReservationId.get(order.reservationId)!.push(order);
      });

      setRooms((prevRooms) =>
        prevRooms.map((room) => {
          if (room.reservation?.id) {
            const orders = ordersByReservationId.get(room.reservation.id) || [];
            const sortedOrders = [...orders].sort((a, b) => {
              const aIsToday =
                new Date(a.createdAt).toDateString() === new Date().toDateString();
              const bIsToday =
                new Date(b.createdAt).toDateString() === new Date().toDateString();
              if (aIsToday && !bIsToday) return -1;
              if (!aIsToday && bIsToday) return 1;
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            return { ...room, orders: sortedOrders };
          }
          return { ...room, orders: [] };
        })
      );
      setLastUpdatedAt(new Date());
    } catch (error) {
      logError('Failed to fetch orders', error, {
        component: 'RoomsPage',
      });
    }
  }, []);

  // 주문 완료 처리
  const handleCompleteOrder = useCallback(
    async (orderId: string, roomId: string) => {
      try {
        setCompletingOrderId(orderId);
        await updateOrderStatus(orderId, 'completed');

        await fetchOrdersForRooms();

        toast({
          title: '주문 완료',
          description: '주문이 완료 처리되었습니다.',
        });
      } catch (error) {
        logError('Failed to complete order', error, {
          component: 'RoomsPage',
          orderId,
        });
        toast({
          title: '오류',
          description: extractUserFriendlyMessage(error),
          variant: 'destructive',
        });
      } finally {
        setCompletingOrderId(null);
      }
    },
    [toast, fetchOrdersForRooms]
  );

  const fetchRooms = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setIsLoading(true);
      const data = await getRooms();
      // getRooms()는 배열을 반환
      const roomsArray = Array.isArray(data) ? data : [];

      if (roomsArray.length === 0) {
        toast({
          title: '방 데이터 없음',
          description: '데이터베이스에 방이 없습니다. 마이그레이션을 실행해주세요.',
          variant: 'destructive',
        });
      }

      setRooms(roomsArray);

      // 주문 목록 조회
      await fetchOrdersForRooms();
    } catch (error) {
      logError('Failed to fetch rooms', error, {
        component: 'RoomsPage',
      });

      // 401 에러인 경우 로그인 페이지로 리다이렉트
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        // 쿠키 삭제
        document.cookie = 'admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        window.location.href = '/login';
        return;
      }

      toast({
        title: '오류',
        description: extractUserFriendlyMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [fetchOrdersForRooms, toast]);

  // 방 목록 조회
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // 주문 목록 주기적 새로고침 (30초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      if (rooms.length > 0) {
        fetchOrdersForRooms();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [rooms.length, fetchOrdersForRooms]);

  // SSE 알림 감지하여 실시간 하이라이트
  useEffect(() => {
    // 새로운 order_created 알림 감지
    const currentNotificationIds = new Set(notifications.map(n => n.id));
    const newNotifications = notifications.filter(
      n => !previousNotificationsRef.current.has(n.id) && n.type === 'order_created'
    );

    if (newNotifications.length > 0) {
      newNotifications.forEach(notification => {
        const metadata = notification.metadata as Record<string, unknown> | undefined;
        if (metadata?.room) {
          const roomName = String(metadata.room);
          // 방 이름으로 방 ID 찾기
          const room = rooms.find(r => r.name === roomName);
          if (room) {
            // 점멸 시작
            setBlinkingRoomIds(prev => new Set(prev).add(room.id));

            // 5초 후 점멸 제거
            setTimeout(() => {
              setBlinkingRoomIds(prev => {
                const next = new Set(prev);
                next.delete(room.id);
                return next;
              });
            }, 5000);
          }
        }
      });
    }

    previousNotificationsRef.current = currentNotificationIds;
  }, [notifications, rooms]);

  const getStatusBadge = (room: RoomWithReservation) => {
    // 배정 정보가 있으면 "사용 중"으로 표시
    if (room.reservation) {
      return <Badge variant="secondary">사용 중</Badge>;
    }

    // 배정 정보가 없으면 방의 실제 상태 표시
    const variants: Record<Room['status'], { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      available: { label: '사용 가능', variant: 'default' },
      occupied: { label: '사용 중', variant: 'secondary' },
      maintenance: { label: '점검 중', variant: 'destructive' },
    };

    const { label, variant } = variants[room.status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  // ... import moved to top

  // ... (inside component)

  if (isLoading) {
    return <AdminRoomsSkeleton />;
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-0 -mb-4 md:mb-0">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5 md:gap-1">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">현장관리</h1>
            <p className="text-xs md:text-sm text-muted-foreground font-medium">
              객실별 실시간 상태(체크인 여부, 주문 현황) 모니터링
            </p>
            <LastUpdatedAt value={lastUpdatedAt} />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 md:h-9"
            onClick={fetchRooms}
            aria-label="현장관리 새로고침"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            새로고침
          </Button>
        </div>
      </div>

      {rooms.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              방 데이터를 불러오는 중...
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {rooms
            .sort((a, b) => {
              // 1호~10호 순서로 정렬
              const aMatch = a.name.match(/^(\d+)호$/);
              const bMatch = b.name.match(/^(\d+)호$/);
              if (aMatch && bMatch) {
                const aNum = parseInt(aMatch[1]);
                const bNum = parseInt(bMatch[1]);
                return aNum - bNum;
              }
              return a.name.localeCompare(b.name);
            })
            .map((room) => {
              // 사용 가능 여부 배지 색상 결정
              const getAvailabilityBadge = () => {
                if (room.reservation) {
                  const meta = getReservationOccupancyBadge(room.reservation.status);
                  return <Badge className={`${meta.className} h-6`}>{meta.label}</Badge>;
                }
                const meta = ROOM_AVAILABILITY_BADGE[room.status];
                return <Badge className={`${meta.className} h-6`}>{meta.label}</Badge>;
              };

              const pendingOrders = (room.orders || []).filter(order => order.status !== 'completed');
              const isBlinking = blinkingRoomIds.has(room.id);

              return (
                <Card
                  key={room.id}
                  className={`relative flex flex-col transition-all active:scale-[0.99] touch-manipulation ${isBlinking ? 'border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : ''
                    }`}
                  style={
                    isBlinking
                      ? { animation: 'blink 1s infinite' }
                      : undefined
                  }
                >
                  {/* Header: 객실 번호 및 사용 가능 여부 배지 */}
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <CardTitle className="text-lg font-bold">{room.name}</CardTitle>
                        <CardDescription className="text-xs">{room.capacity}인실</CardDescription>
                      </div>
                      {getAvailabilityBadge()}
                    </div>
                  </CardHeader>

                  {/* Body: 투숙객 정보 */}
                  <CardContent className="p-4 pt-1 flex-1">
                    {room.reservation ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center py-1 border-b border-dashed">
                          <span className="text-muted-foreground">투숙객</span>
                          <span className="font-semibold text-base text-foreground">{room.reservation.guestName}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-muted-foreground">상태</span>
                          <span className={
                            room.reservation.status === 'checked_in' ? 'text-green-600 font-medium' :
                              room.reservation.status === 'checked_out' ? 'text-gray-500' :
                                'text-blue-600'
                          }>
                            {room.reservation.status === 'checked_in' ? '체크인 완료' :
                              room.reservation.status === 'checked_out' ? '체크아웃 완료' :
                                '배정 완료'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-3 bg-muted/30 rounded-md">
                        <p className="text-xs text-muted-foreground">현재 비어있음</p>
                      </div>
                    )}
                  </CardContent>

                  {/* Footer: 실시간 주문 내역 - Compact Mode */}
                  {room.reservation && (
                    <div className="border-t bg-muted/10 p-3">
                      {pendingOrders.length > 0 ? (
                        <div className="space-y-2">
                          {pendingOrders.map((order) => (
                            <div
                              key={order.id}
                              className="flex items-center justify-between p-2 bg-white border border-border/50 rounded-md shadow-sm"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                  <ShoppingCart className="h-3.5 w-3.5 text-orange-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {order.type === 'bbq' ? '바베큐' : order.type === 'kiosk' ? '키오스크' : '불멍'} 주문
                                  </p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {formatDateTimeToKorean(order.createdAt)}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCompleteOrder(order.id, room.id)}
                                disabled={completingOrderId === order.id}
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                {completingOrderId === order.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-5 w-5" />
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground text-center py-1">
                          대기 중인 주문 없음
                        </p>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
        </div>
      )}

    </div>
  );
}
