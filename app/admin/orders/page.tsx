'use client';

import { useState, useEffect } from 'react';
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

export default function OrdersPage() {
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
        status,
        date,
        search,
      });
      setOrders(data.orders || []);
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
    const variants: Record<Order['status'], { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: '대기', variant: 'outline' },
      preparing: { label: '준비 중', variant: 'secondary' },
      delivering: { label: '배송 중', variant: 'default' },
      completed: { label: '완료', variant: 'default' },
    };
    
    const { label, variant } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };
  
  const getNextStatus = (currentStatus: Order['status']): Order['status'] | null => {
    const statusFlow: Record<Order['status'], Order['status']> = {
      pending: 'preparing',
      preparing: 'delivering',
      delivering: 'completed',
      completed: 'completed',
    };
    
    const next = statusFlow[currentStatus];
    return next === currentStatus ? null : next;
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">주문 관리</h1>
          <p className="text-muted-foreground">
            주문 목록 및 상태 관리
          </p>
        </div>
        <Button variant="outline" onClick={fetchOrders}>
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
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
        <div className="space-y-4">
          {orders.map((order) => {
            const nextStatus = getNextStatus(order.status);
            
            return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        {order.type === 'bbq' ? '바베큐' : '불멍'} 주문
                      </CardTitle>
                      <CardDescription>
                        주문 ID: {order.id.substring(0, 8)}...
                      </CardDescription>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">주문 시간</p>
                      <p className="font-medium">{formatDate(order.createdAt)}</p>
                    </div>
                    {order.deliveryTime && (
                      <div>
                        <p className="text-sm text-muted-foreground">배송 예정 시간</p>
                        <p className="font-medium">{order.deliveryTime}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">주문 항목</p>
                      <div className="mt-1 space-y-1">
                        {order.items.map((item) => (
                          <p key={item.id} className="text-sm">
                            {item.name} × {item.quantity}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">총 금액</p>
                      <p className="font-medium text-lg">{formatPrice(order.totalAmount)}</p>
                    </div>
                    {order.notes && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-muted-foreground">요청사항</p>
                        <p className="text-sm">{order.notes}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetail(order)}
                    >
                      상세 보기
                    </Button>
                    {nextStatus && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, nextStatus)}
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            처리 중...
                          </>
                        ) : (
                          `다음 단계로 (${getStatusBadge(nextStatus).props.children})`
                        )}
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
                  <p className="text-sm text-muted-foreground">주문 ID</p>
                  <p className="font-medium font-mono text-sm">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">주문 타입</p>
                  <p className="font-medium">
                    {selectedOrder.type === 'bbq' ? '바베큐' : '불멍'}
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
                  {(['pending', 'preparing', 'delivering', 'completed'] as Order['status'][]).map((status) => (
                    <Button
                      key={status}
                      variant={selectedOrder.status === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusUpdate(selectedOrder.id, status)}
                      disabled={isUpdating || selectedOrder.status === status}
                    >
                      {getStatusBadge(status).props.children}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
