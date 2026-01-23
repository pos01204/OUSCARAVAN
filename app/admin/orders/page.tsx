'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getAdminOrders, updateOrderStatus, type Order } from '@/lib/api';
import { logError } from '@/lib/logger';
import { extractUserFriendlyMessage } from '@/lib/error-messages';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { OrderFiltersClient } from './OrderFiltersClient';

function OrdersPageContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const status = searchParams.get('status') || undefined;
      const date = searchParams.get('date') || undefined;
      const search = searchParams.get('search') || undefined;

      const data = await getAdminOrders({
        status: status === 'pending' ? undefined : status,
        date,
        search,
      });

      let fetchedOrders = data.orders || [];

      // 예약 정보가 없는 경우 추가 조회
      if (fetchedOrders.length > 0) {
        const enrichedOrders = await Promise.all(
          fetchedOrders.map(async (order) => {
            if ((!order.guestName || !order.roomName) && order.reservationId) {
              try {
                const { getReservation } = await import('@/lib/api');
                const reservation = await getReservation(order.reservationId);
                return {
                  ...order,
                  guestName: reservation.guestName,
                  roomName: reservation.assignedRoom || reservation.roomType.split('(')[0],
                };
              } catch (e) {
                console.error(`Failed to fetch reservation for order ${order.id}`, e);
                return order;
              }
            }
            return order;
          })
        );
        fetchedOrders = enrichedOrders;
      }

      let normalizedOrders = fetchedOrders;
      if (status === 'pending') {
        normalizedOrders = fetchedOrders.filter((order) => order.status !== 'completed');
      } else if (status === 'completed') {
        normalizedOrders = fetchedOrders.filter((order) => order.status === 'completed');
      }

      setOrders(normalizedOrders);
    } catch (error) {
      const status = searchParams.get('status') || undefined;
      const date = searchParams.get('date') || undefined;
      const search = searchParams.get('search') || undefined;

      logError('Failed to fetch orders', error, {
        component: 'OrdersPage',
        filters: { status, date, search },
      });
      toast({
        title: '오류',
        description: '주문 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 주문 목록 조회 (쿼리 파라미터 변경 시 재조회)
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // 주문 상태 업데이트
  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    setIsUpdating(true);

    try {
      await updateOrderStatus(orderId, newStatus);

      toast({
        title: '상태 업데이트 완료',
        description: '주문 상태가 변경되었습니다.',
      });

      fetchOrders();
      setIsDialogOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      logError('Failed to update order status', error, {
        component: 'OrdersPage',
        orderId,
        newStatus,
      });

      // 사용자 친화적인 에러 메시지 추출
      const errorMessage = extractUserFriendlyMessage(error);

      toast({
        title: '업데이트 실패',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // 주문 상세 보기
  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: Order['status']) => {
    const isCompleted = status === 'completed';
    const label = isCompleted ? '완료' : '확인';
    const className = isCompleted
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-orange-100 text-orange-800 border-orange-200';

    return (
      <Badge variant="outline" className={className}>
        {label}
      </Badge>
    );
  };

  const getNextStatus = (currentStatus: Order['status']): Order['status'] | null => {
    if (currentStatus === 'completed') return null;
    return 'completed';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-0 -mb-4 md:mb-0">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 flex flex-col gap-0.5 md:gap-1">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">주문히스토리</h1>
          </div>
          <Button variant="outline" onClick={fetchOrders} size="sm" className="h-8 md:h-9">
            <RefreshCw className="mr-2 h-4 w-4" />
            새로고침
          </Button>
        </div>
      </div>

      <OrderFiltersClient />



      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              {searchParams.get('status') || searchParams.get('date') || searchParams.get('search')
                ? '검색 결과가 없습니다.'
                : '등록된 주문이 없습니다.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => {
            const nextStatus = getNextStatus(order.status);

            return (
              <Card key={order.id} className="flex flex-col">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <Badge
                          variant={order.type === 'bbq' ? 'secondary' : order.type === 'kiosk' ? 'outline' : 'default'}
                          className="rounded-sm"
                        >
                          {order.type === 'bbq' ? '바베큐' : order.type === 'kiosk' ? '키오스크' : '불멍'}
                        </Badge>
                        <span className="font-bold text-lg">{order.roomName || '방 미배정'}</span>
                        <span className="text-muted-foreground">{order.guestName}</span>
                      </div>
                      <h3 className="font-medium text-base text-muted-foreground leading-tight">
                        {order.items[0]?.name}
                        {order.items.length > 1 && ` 외 ${order.items.length - 1}건`}
                      </h3>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2 flex-1 flex flex-col justify-end">
                  <div className="text-sm text-muted-foreground mb-4">
                    <p>{formatDate(order.createdAt)}</p>
                    {order.notes && (
                      <p className="mt-1 text-orange-600 truncate">
                        🔔 {order.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleViewDetail(order)}
                    >
                      상세
                    </Button>
                    {nextStatus && (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleStatusUpdate(order.id, nextStatus)}
                        disabled={isUpdating}
                      >
                        {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : getStatusBadge(nextStatus).props.children}로 변경
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* 주문 상세 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>주문 상세</DialogTitle>
            <DialogDescription>
              주문 정보 및 상태 관리
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">객실 / 고객</p>
                  <p className="font-bold text-lg">
                    {selectedOrder.roomName || '미배정'}
                    <span className="text-base font-normal ml-2 text-muted-foreground">
                      {selectedOrder.guestName}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">주문 타입</p>
                  <p className="font-medium">
                    {selectedOrder.type === 'bbq' ? '바베큐' : selectedOrder.type === 'kiosk' ? '키오스크' : '불멍'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">주문 ID</p>
                  <p className="font-medium font-mono text-sm text-muted-foreground">
                    {selectedOrder.id.substring(0, 8)}...
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">주문 시간</p>
                  <p className="font-medium">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">상태</p>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                {selectedOrder.deliveryTime && (
                  <div>
                    <p className="text-sm text-muted-foreground">배송 예정 시간</p>
                    <p className="font-medium">{selectedOrder.deliveryTime}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">총 금액</p>
                  <p className="font-medium text-lg">{formatPrice(selectedOrder.totalAmount)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">주문 항목</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 bg-muted rounded-md"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">요청사항</p>
                  <p className="text-sm p-2 bg-muted rounded-md">{selectedOrder.notes}</p>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">상태 변경</p>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={selectedOrder.status === 'pending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'preparing')}
                    disabled={isUpdating || selectedOrder.status !== 'pending'}
                  >
                    확인
                  </Button>
                  <Button
                    variant={selectedOrder.status === 'completed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'completed')}
                    disabled={isUpdating || selectedOrder.status === 'completed'}
                  >
                    완료
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <OrdersPageContent />
    </Suspense>
  );
}
