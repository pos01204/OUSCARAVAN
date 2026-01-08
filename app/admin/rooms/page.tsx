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
import { Loader2, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { formatDateTimeToKorean } from '@/lib/utils/date';
import { useNotificationStore } from '@/lib/store/notifications';
import { useNotificationStream } from '@/lib/hooks/useNotificationStream';

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

export default function RoomsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [rooms, setRooms] = useState<RoomWithReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completingOrderId, setCompletingOrderId] = useState<string | null>(null);
  const [blinkingRoomIds, setBlinkingRoomIds] = useState<Set<string>>(new Set());
  const { notifications } = useNotificationStore();
  const previousNotificationsRef = useRef<Set<string>>(new Set());
  
  // SSE 연결 (실시간 알림 수신)
  useNotificationStream();
  
  // 주문 완료 처리
  const handleCompleteOrder = useCallback(async (orderId: string, roomId: string) => {
    try {
      setCompletingOrderId(orderId);
      await updateOrderStatus(orderId, 'completed');
      
      // 주문 목록 새로고침
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
  }, [toast]);
  
  // 각 방의 주문 목록 조회
  const fetchOrdersForRooms = useCallback(async () => {
    try {
      // 모든 주문 조회 (오늘 날짜 기준)
      const today = new Date().toISOString().split('T')[0];
      const ordersData = await getAdminOrders({ date: today, limit: 1000 });
      
      // 예약 ID별로 주문 그룹화
      const ordersByReservationId = new Map<string, Order[]>();
      ordersData.orders.forEach(order => {
        if (!ordersByReservationId.has(order.reservationId)) {
          ordersByReservationId.set(order.reservationId, []);
        }
        ordersByReservationId.get(order.reservationId)!.push(order);
      });
      
      // 방 목록에 주문 정보 추가
      setRooms(prevRooms => prevRooms.map(room => {
        if (room.reservation?.id) {
          const orders = ordersByReservationId.get(room.reservation.id) || [];
          // createdAt이 오늘인 주문을 최우선 노출 (최신순 정렬)
          const sortedOrders = orders.sort((a, b) => {
            const aIsToday = new Date(a.createdAt).toDateString() === new Date().toDateString();
            const bIsToday = new Date(b.createdAt).toDateString() === new Date().toDateString();
            if (aIsToday && !bIsToday) return -1;
            if (!aIsToday && bIsToday) return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          return { ...room, orders: sortedOrders };
        }
        return { ...room, orders: [] };
      }));
    } catch (error) {
      logError('Failed to fetch orders', error, {
        component: 'RoomsPage',
      });
    }
  }, []);
  
  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const data = await getRooms();
      // getRooms()는 배열을 반환
      const roomsArray = Array.isArray(data) ? data : [];
      console.log('[RoomsPage] Fetched rooms:', roomsArray.length, roomsArray);
      
      if (roomsArray.length === 0) {
        console.warn('[RoomsPage] No rooms found. Check database migration.');
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
    }
  };
  
  // 방 목록 조회
  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
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
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">현장관리</h1>
          <p className="text-muted-foreground">
            객실별 실시간 상태(체크인 여부, 주문 현황) 모니터링
          </p>
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rooms
            .sort((a, b) => {
              // A1~A8, B1~B2 순서로 정렬
              const aMatch = a.name.match(/^([AB])(\d+)$/);
              const bMatch = b.name.match(/^([AB])(\d+)$/);
              if (aMatch && bMatch) {
                const aLetter = aMatch[1];
                const bLetter = bMatch[1];
                const aNum = parseInt(aMatch[2]);
                const bNum = parseInt(bMatch[2]);
                if (aLetter !== bLetter) {
                  return aLetter < bLetter ? -1 : 1;
                }
                return aNum - bNum;
              }
              return a.name.localeCompare(b.name);
            })
            .map((room) => {
              // 사용 가능 여부 배지 색상 결정
              const getAvailabilityBadge = () => {
                if (room.reservation) {
                  if (room.reservation.status === 'checked_in') {
                    return <Badge className="bg-red-500 text-white">사용 중</Badge>;
                  }
                  return <Badge variant="secondary">배정됨</Badge>;
                }
                const variants: Record<Room['status'], { label: string; className: string }> = {
                  available: { label: '사용 가능', className: 'bg-green-500 text-white' },
                  occupied: { label: '사용 중', className: 'bg-red-500 text-white' },
                  maintenance: { label: '점검 중', className: 'bg-gray-500 text-white' },
                };
                const { label, className } = variants[room.status];
                return <Badge className={className}>{label}</Badge>;
              };
              
              // 미완료 주문만 필터링 (completed 제외)
              const pendingOrders = (room.orders || []).filter(order => order.status !== 'completed');
              
              const isBlinking = blinkingRoomIds.has(room.id);
              
              return (
                <Card 
                  key={room.id}
                  className={`relative min-h-[350px] flex flex-col transition-all ${
                    isBlinking ? 'border-2 border-red-500' : ''
                  }`}
                  style={
                    isBlinking
                      ? {
                          animation: 'blink 1s infinite',
                        }
                      : undefined
                  }
                >
                  {/* Header: 객실 번호 및 사용 가능 여부 배지 */}
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{room.name}</CardTitle>
                      {getAvailabilityBadge()}
                    </div>
                    <CardDescription>{room.capacity}인실</CardDescription>
                  </CardHeader>
                  
                  {/* Body: 투숙객 정보 */}
                  <CardContent className="flex-1 space-y-3">
                    {room.reservation ? (
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-muted-foreground">투숙객</p>
                          <p className="font-medium text-base">{room.reservation.guestName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">체크인 상태</p>
                          <Badge 
                            variant={
                              room.reservation.status === 'checked_in' ? 'default' :
                              room.reservation.status === 'checked_out' ? 'secondary' :
                              'outline'
                            }
                            className="mt-1"
                          >
                            {room.reservation.status === 'checked_in' ? '체크인 완료' :
                             room.reservation.status === 'checked_out' ? '체크아웃 완료' :
                             '배정 완료'}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">인원수</p>
                          <p className="text-base">{room.capacity}인</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">미배정</p>
                      </div>
                    )}
                  </CardContent>
                  
                  {/* Footer: 실시간 주문 내역 */}
                  {room.reservation && (
                    <div className="border-t pt-3 px-6 pb-4">
                      <p className="text-sm font-medium mb-2">실시간 주문</p>
                      {pendingOrders.length > 0 ? (
                        <div className="space-y-2">
                          {pendingOrders.map((order) => (
                            <div
                              key={order.id}
                              className="flex items-center justify-between p-2 bg-muted rounded-md min-h-[44px]"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <ShoppingCart className="h-4 w-4 flex-shrink-0 text-primary" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {order.type === 'bbq' ? '바베큐' : '불멍'} 주문
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDateTimeToKorean(order.createdAt)}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCompleteOrder(order.id, room.id)}
                                disabled={completingOrderId === order.id}
                                className="h-8 px-3 text-xs flex-shrink-0"
                              >
                                {completingOrderId === order.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    완료
                                  </>
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          주문 없음
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
