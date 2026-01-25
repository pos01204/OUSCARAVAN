'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flame, Clock, CheckCircle, Package, RotateCcw, BookOpen, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useGuestOrders } from '@/lib/hooks/useGuestOrders';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Order } from '@/lib/api';

interface BBQHistoryTabProps {
  token: string;
  onOrderClick?: () => void;
  onGuideClick?: () => void;
}

const STATUS_CONFIG = {
  pending: { label: '주문 접수', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
  preparing: { label: '준비 중', icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
  delivering: { label: '배송 중', icon: Package, color: 'text-purple-600', bg: 'bg-purple-100' },
  completed: { label: '완료', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
};

function getStatusIndex(status: Order['status']): number {
  const statusOrder = ['pending', 'preparing', 'delivering', 'completed'];
  return statusOrder.indexOf(status);
}

export function BBQHistoryTab({ token, onOrderClick, onGuideClick }: BBQHistoryTabProps) {
  const { orders, loading, refresh } = useGuestOrders(token);

  // BBQ/불멍 주문만 필터링
  const bbqOrders = useMemo(() => {
    return orders.filter((o) => o.type === 'bbq' || o.type === 'fire');
  }, [orders]);

  // 진행 중 / 완료 분류
  const activeOrders = useMemo(() => {
    return bbqOrders.filter((o) => o.status !== 'completed');
  }, [bbqOrders]);

  const pastOrders = useMemo(() => {
    return bbqOrders.filter((o) => o.status === 'completed');
  }, [bbqOrders]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-6 w-32 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // 빈 상태
  if (bbqOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4">
          <Flame className="h-8 w-8 text-orange-400" />
        </div>
        <h3 className="text-lg font-semibold text-brand-dark mb-2">
          아직 주문 내역이 없어요
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          오늘 밤 캠프파이어를 즐겨보세요!
        </p>
        <Button onClick={onOrderClick} className="bg-orange-500 hover:bg-orange-600">
          <ShoppingBag className="mr-2 h-4 w-4" />
          주문하러 가기
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 진행 중인 주문 */}
      {activeOrders.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-brand-dark mb-3 flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            진행 중
          </h3>
          <div className="space-y-3">
            {activeOrders.map((order) => (
              <ActiveOrderCard
                key={order.id}
                order={order}
                onGuideClick={onGuideClick}
              />
            ))}
          </div>
        </section>
      )}

      {/* 지난 주문 */}
      {pastOrders.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            지난 주문
          </h3>
          <div className="space-y-2">
            {pastOrders.map((order) => (
              <PastOrderCard key={order.id} order={order} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// 진행 중 주문 카드
function ActiveOrderCard({ 
  order, 
  onGuideClick 
}: { 
  order: Order; 
  onGuideClick?: () => void;
}) {
  const statusConfig = STATUS_CONFIG[order.status];
  const StatusIcon = statusConfig.icon;
  const currentIndex = getStatusIndex(order.status);

  const steps = [
    { key: 'pending', label: '접수' },
    { key: 'preparing', label: '준비중' },
    { key: 'delivering', label: '배송' },
    { key: 'completed', label: '완료' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-orange-200 bg-gradient-to-br from-orange-50/50 to-white">
        <CardContent className="p-4">
          {/* 상품 정보 */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-bold text-brand-dark">
                {order.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')}
              </h4>
              <p className="text-lg font-bold text-orange-600 mt-1">
                ₩{order.totalAmount.toLocaleString()}
              </p>
            </div>
            <div className={`px-2.5 py-1 rounded-full ${statusConfig.bg} ${statusConfig.color} text-xs font-semibold flex items-center gap-1`}>
              <StatusIcon className="h-3 w-3" />
              {statusConfig.label}
            </div>
          </div>

          {/* 진행 상태 바 */}
          <div className="mb-4">
            <div className="flex items-center gap-1">
              {steps.map((step, index) => {
                const isComplete = index <= currentIndex;
                const isCurrent = index === currentIndex;
                return (
                  <div key={step.key} className="flex-1 flex items-center">
                    <div
                      className={`flex-1 h-1.5 rounded-full transition-colors ${
                        isComplete ? 'bg-orange-500' : 'bg-gray-200'
                      } ${isCurrent ? 'animate-pulse' : ''}`}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-1.5">
              {steps.map((step, index) => (
                <span
                  key={step.key}
                  className={`text-[10px] ${
                    index <= currentIndex ? 'text-orange-600 font-medium' : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
              ))}
            </div>
          </div>

          {/* 배송 정보 */}
          <div className="flex items-center justify-between text-sm mb-4">
            <span className="text-muted-foreground">배송 예정</span>
            <span className="font-semibold text-brand-dark">{order.deliveryTime}</span>
          </div>

          {/* 버튼 */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={onGuideClick}
            >
              <BookOpen className="mr-1.5 h-3.5 w-3.5" />
              사용 가이드
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// 지난 주문 카드
function PastOrderCard({ order }: { order: Order }) {
  return (
    <Card className="bg-muted/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium text-brand-dark text-sm">
                {order.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                ₩{order.totalAmount.toLocaleString()} · {format(new Date(order.createdAt), 'M/d HH:mm', { locale: ko })}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-xs">
            <RotateCcw className="mr-1 h-3 w-3" />
            재주문
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
