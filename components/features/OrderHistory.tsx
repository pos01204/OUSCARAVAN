'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { getOrders, type Order } from '@/lib/api';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Clock, Package, Truck, CheckCircle, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface OrderHistoryProps {
  token: string;
}

const STATUS_CONFIG: Record<Order['status'], { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; icon: typeof Clock }> = {
  pending: { label: '대기 중', variant: 'outline', icon: Clock },
  preparing: { label: '준비 중', variant: 'secondary', icon: Package },
  delivering: { label: '배송 중', variant: 'default', icon: Truck },
  completed: { label: '완료', variant: 'default', icon: CheckCircle },
};

const TYPE_LABELS: Record<Order['type'], string> = {
  bbq: '바베큐',
  fire: '불멍',
  kiosk: '키오스크',
};

export function OrderHistory({ token }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getOrders(token);
        setOrders(response.orders || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('주문 내역을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  // 필터링된 주문 목록
  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') {
      return orders;
    }
    return orders.filter(order => order.status === statusFilter);
  }, [orders, statusFilter]);

  // 상태별 주문 개수
  const statusCounts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      preparing: orders.filter(o => o.status === 'preparing').length,
      delivering: orders.filter(o => o.status === 'delivering').length,
      completed: orders.filter(o => o.status === 'completed').length,
    };
  }, [orders]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-32 mb-3" />
              <div className="space-y-2 pt-3 border-t">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="mt-3 pt-3 border-t flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            주문 내역이 없습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4" role="region" aria-label="주문 내역">
        {/* 상태 필터 */}
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as Order['status'] | 'all')}>
          <TabsList className="grid w-full grid-cols-5 h-auto p-1.5 bg-muted/40 border border-border/50 rounded-lg shadow-sm overflow-x-auto">
            <TabsTrigger 
              value="all" 
              className="text-xs py-2.5 min-w-[60px] transition-all duration-200 data-[state=active]:scale-[1.02] focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="전체 주문 보기"
            >
              전체 ({statusCounts.all})
            </TabsTrigger>
            <TabsTrigger 
              value="pending" 
              className="text-xs py-2.5 min-w-[60px] transition-all duration-200 data-[state=active]:scale-[1.02] focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="대기 중 주문 보기"
            >
              대기 ({statusCounts.pending})
            </TabsTrigger>
            <TabsTrigger 
              value="preparing" 
              className="text-xs py-2.5 min-w-[60px] transition-all duration-200 data-[state=active]:scale-[1.02] focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="준비 중 주문 보기"
            >
              준비 ({statusCounts.preparing})
            </TabsTrigger>
            <TabsTrigger 
              value="delivering" 
              className="text-xs py-2.5 min-w-[60px] transition-all duration-200 data-[state=active]:scale-[1.02] focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="배송 중 주문 보기"
            >
              배송 ({statusCounts.delivering})
            </TabsTrigger>
            <TabsTrigger 
              value="completed" 
              className="text-xs py-2.5 min-w-[60px] transition-all duration-200 data-[state=active]:scale-[1.02] focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="완료된 주문 보기"
            >
              완료 ({statusCounts.completed})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* 주문 목록 */}
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                해당 상태의 주문이 없습니다.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => {
        const statusConfig = STATUS_CONFIG[order.status];
        const StatusIcon = statusConfig.icon;
        const typeLabel = TYPE_LABELS[order.type] || order.type;

            return (
              <Card
                key={order.id}
                className="transition-all duration-200 hover:shadow-lg hover:border-primary/30 cursor-pointer group active:scale-[0.98] focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
                onClick={() => setSelectedOrder(order)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedOrder(order);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`${typeLabel} 주문 상세보기, ${statusConfig.label}, ${order.totalAmount.toLocaleString()}원`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge 
                          variant={statusConfig.variant} 
                          className="flex items-center gap-1 transition-transform group-hover:scale-105"
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {typeLabel}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.createdAt), 'yyyy년 M월 d일 HH:mm', { locale: ko })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary transition-transform group-hover:scale-105">
                        {order.totalAmount.toLocaleString()}원
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-3 border-t border-border/50">
                    {order.items.slice(0, 2).map((item, index) => (
                      <div 
                        key={index} 
                        className="flex justify-between text-sm py-0.5"
                      >
                        <span className="text-muted-foreground">
                          {item.name} × {item.quantity}
                        </span>
                        <span className="font-medium">
                          {(item.price * item.quantity).toLocaleString()}원
                        </span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-xs text-muted-foreground pt-1">
                        외 {order.items.length - 2}개 항목
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                    <div className="flex-1">
                      {order.deliveryTime && (
                        <p className="text-xs text-muted-foreground">
                          배송 시간: <span className="font-medium">{order.deliveryTime}</span>
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-8 px-3 transition-all hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(order);
                      }}
                      aria-label="주문 상세보기"
                    >
                      <Info className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                      상세보기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* 주문 상세 모달 */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader className="pb-4 border-b">
                <DialogTitle className="text-xl">주문 상세</DialogTitle>
                <DialogDescription className="mt-2">
                  주문 번호: <span className="font-mono font-medium">{selectedOrder.id.substring(0, 8)}...</span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 pt-4">
                {/* 주문 정보 */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-2 font-medium">주문 타입</p>
                    <Badge variant="outline" className="text-sm font-semibold">
                      {TYPE_LABELS[selectedOrder.type] || selectedOrder.type}
                    </Badge>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-2 font-medium">주문 상태</p>
                    <Badge
                      variant={STATUS_CONFIG[selectedOrder.status].variant}
                      className="flex items-center gap-1.5 w-fit font-semibold"
                    >
                      {(() => {
                        const Icon = STATUS_CONFIG[selectedOrder.status].icon;
                        return (
                          <>
                            <Icon className="h-3.5 w-3.5" />
                            {STATUS_CONFIG[selectedOrder.status].label}
                          </>
                        );
                      })()}
                    </Badge>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-2 font-medium">주문 시간</p>
                    <p className="font-semibold text-sm">
                      {format(new Date(selectedOrder.createdAt), 'yyyy년 M월 d일 HH:mm', { locale: ko })}
                    </p>
                  </div>
                  {selectedOrder.deliveryTime && (
                    <div className="p-3 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-2 font-medium">배송 시간</p>
                      <p className="font-semibold text-sm">{selectedOrder.deliveryTime}</p>
                    </div>
                  )}
                </div>

                {/* 주문 항목 */}
                <div>
                  <p className="text-sm font-bold mb-4 flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary"></div>
                    주문 항목
                  </p>
                  <div className="space-y-2.5">
                    {selectedOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-lg border-2 border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-base mb-1">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.price.toLocaleString()}원 × {item.quantity}
                          </p>
                        </div>
                        <p className="font-black text-lg text-primary ml-4">
                          {(item.price * item.quantity).toLocaleString()}원
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 총액 */}
                <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-base">총 결제 금액</p>
                    <p className="text-3xl font-black text-primary">
                      {selectedOrder.totalAmount.toLocaleString()}원
                    </p>
                  </div>
                </div>

                {/* 요청사항 */}
                {selectedOrder.notes && (
                  <div>
                    <p className="text-sm font-bold mb-3 flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-primary"></div>
                      요청사항
                    </p>
                    <div className="p-4 rounded-lg border-2 border-border/50 bg-muted/20">
                      <p className="text-sm leading-relaxed">{selectedOrder.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
