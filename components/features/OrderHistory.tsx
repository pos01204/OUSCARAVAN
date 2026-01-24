'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type Order } from '@/lib/api';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Clock, Package, CheckCircle, Info, RotateCcw, BookOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { InfoInspector } from '@/components/guest/InfoInspector';
import { StatusPill } from '@/components/shared/StatusPill';
import { ErrorState } from '@/components/shared/ErrorState';
import { getOrderStatusMeta } from '@/lib/utils/status-meta';

interface OrderHistoryProps {
  token: string;
  orders?: Order[];
  loading?: boolean;
  error?: string | null;
  onReorder?: (order: Order) => void;
  onRetry?: () => void;
}

const STATUS_ICON_MAP: Record<Order['status'], typeof Clock> = {
  pending: Clock,
  preparing: Package,
  delivering: Package,
  completed: CheckCircle,
};

const TYPE_LABELS: Record<Order['type'], string> = {
  bbq: '바베큐',
  fire: '불멍',
  kiosk: '키오스크',
};

const ORDER_STATUS_STEPS: Array<{ key: 'pending' | 'preparing' | 'completed'; label: string }> = [
  { key: 'pending', label: '대기' },
  { key: 'preparing', label: '준비' },
  { key: 'completed', label: '완료' },
];

function getStatusStepIndex(status: Order['status']) {
  const normalized: 'pending' | 'preparing' | 'completed' =
    status === 'completed' ? 'completed' : status === 'pending' ? 'pending' : 'preparing';
  return Math.max(0, ORDER_STATUS_STEPS.findIndex((s) => s.key === normalized));
}

function OrderStatusStepper({ status }: { status: Order['status'] }) {
  const activeIndex = getStatusStepIndex(status);

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        {ORDER_STATUS_STEPS.map((step, idx) => {
          const isDone = idx < activeIndex;
          const isActive = idx === activeIndex;
          return (
            <div key={step.key} className="flex items-center gap-2 flex-1 min-w-0">
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  isDone ? 'bg-primary' : isActive ? 'bg-primary/70' : 'bg-muted'
                }`}
                aria-hidden="true"
              />
              <span
                className={`text-[11px] font-semibold truncate ${
                  isDone ? 'text-primary' : isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
              {idx < ORDER_STATUS_STEPS.length - 1 ? (
                <div
                  className={`h-px flex-1 ${
                    isDone ? 'bg-primary/60' : 'bg-muted'
                  }`}
                  aria-hidden="true"
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function OrderHistory({
  token,
  orders = [],
  loading = false,
  error = null,
  onReorder,
  onRetry,
}: OrderHistoryProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const guideHref = `/guest/${token}/guide#guide-bbq`;

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
    return <ErrorState title="주문 내역을 불러오지 못했어요" description={error} onRetry={onRetry} />;
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
        {/* 주문 목록 */}
        {orders.map((order) => {
        const statusMeta = getOrderStatusMeta(order.status);
        const typeLabel = TYPE_LABELS[order.type] || order.type;
        const showGuide = order.type === 'bbq' || order.type === 'fire';

            return (
              <Card
                key={order.id}
                className="click-hint cursor-pointer group"
                onClick={() => setSelectedOrder(order)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedOrder(order);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`${typeLabel} 주문 상세보기, ${statusMeta.label}, ${order.totalAmount.toLocaleString()}원`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <StatusPill
                          label={statusMeta.label}
                          className={`flex items-center gap-1 transition-transform group-hover:scale-105 ${statusMeta.className}`}
                        />
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

                  <div className="mt-3 pt-3 border-t border-border/50">
                    <OrderStatusStepper status={order.status} />
                  </div>

                  <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between gap-2">
                    <div className="flex-1">
                      {order.deliveryTime && (
                        <p className="text-xs text-muted-foreground">
                          배송 시간: <span className="font-medium">{order.deliveryTime}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {showGuide && (
                        <Link
                          href={guideHref}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-8 px-3"
                            aria-label="불멍/바베큐 사용법 보기"
                          >
                            <BookOpen className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                            사용법
                          </Button>
                        </Link>
                      )}
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
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* 주문 상세 인스펙터 (모바일 Drawer / 데스크톱 Sheet) */}
      <InfoInspector
        open={!!selectedOrder}
        onOpenChange={(open) => {
          if (!open) setSelectedOrder(null);
        }}
        title="주문 상세"
        description={
          selectedOrder
            ? `주문 번호: ${selectedOrder.id.substring(0, 8)}…`
            : undefined
        }
        contentClassName="md:max-w-2xl"
      >
        {selectedOrder ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row">
              {/* 키오스크 주문은 현장 수령이므로 재주문 불가 */}
              {onReorder && selectedOrder.type !== 'kiosk' ? (
                <Button
                  type="button"
                  className="flex-1"
                  onClick={() => {
                    onReorder(selectedOrder);
                    setSelectedOrder(null);
                  }}
                  aria-label="이 주문으로 재주문하기"
                >
                  <RotateCcw className="h-4 w-4 mr-2" aria-hidden="true" />
                  재주문
                </Button>
              ) : null}
              {(selectedOrder.type === 'bbq' || selectedOrder.type === 'fire') && (
                <Link href={guideHref}>
                  <Button type="button" variant="outline" className="flex-1">
                    <BookOpen className="h-4 w-4 mr-2" aria-hidden="true" />
                    불멍/바베큐 사용법
                  </Button>
                </Link>
              )}
            </div>

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
                {(() => {
                  const meta = getOrderStatusMeta(selectedOrder.status);
                  const Icon = STATUS_ICON_MAP[selectedOrder.status];
                  return (
                    <Badge
                      variant="outline"
                      className={`flex items-center gap-1.5 w-fit font-semibold ${meta.className}`}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      {meta.label}
                    </Badge>
                  );
                })()}
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

            <div className="rounded-xl border bg-muted/20 p-4">
              <p className="text-sm font-bold mb-3 flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary"></div>
                진행 상태
              </p>
              <OrderStatusStepper status={selectedOrder.status} />
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
            <div className="rounded-xl bg-background-muted border border-border p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="font-bold text-base">총 결제 금액</p>
                <p className="text-3xl font-black text-primary">
                  {selectedOrder.totalAmount.toLocaleString()}원
                </p>
              </div>
            </div>

            {/* 요청사항 */}
            {selectedOrder.notes ? (
              <div>
                <p className="text-sm font-bold mb-3 flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-primary"></div>
                  요청사항
                </p>
                <div className="p-4 rounded-lg border-2 border-border/50 bg-muted/20">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedOrder.notes}</p>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </InfoInspector>
    </>
  );
}
