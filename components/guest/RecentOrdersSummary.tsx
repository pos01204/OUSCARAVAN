'use client';

import Link from 'next/link';
import type { Order } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useGuestOrders } from '@/lib/hooks/useGuestOrders';

interface RecentOrdersSummaryProps {
  token: string;
  maxItems?: number;
}

const ORDER_STATUS_LABELS: Record<Order['status'], string> = {
  pending: '대기 중',
  preparing: '준비 중',
  delivering: '준비 중',
  completed: '완료',
};

export function RecentOrdersSummary({ token, maxItems = 2 }: RecentOrdersSummaryProps) {
  const { orders, loading, error } = useGuestOrders(token);
  const recent = [...orders].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, maxItems);
  const hasBbqGuide = recent.some((order) => order.type === 'bbq' || order.type === 'fire');
  const guideHref = `/guest/${token}/guide#guide-bbq`;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>최근 주문</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>최근 주문</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{error}</p>
          <Link href={`/guest/${token}/order`} className="block">
            <Button className="w-full" variant="outline">
              주문 페이지로 이동
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>최근 주문</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">아직 주문 내역이 없습니다.</p>
          <Link href={`/guest/${token}/order`} className="block">
            <Button className="w-full">주문하러 가기</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-3">
          <span>최근 주문</span>
          <Link href={`/guest/${token}/order`}>
            <Button size="sm" variant="outline">
              전체 보기
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recent.map((o) => (
          <div key={o.id} className="rounded-lg border border-border/60 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">
                  {o.items[0]?.name ?? '주문'} {o.items.length > 1 ? `외 ${o.items.length - 1}개` : ''}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(o.createdAt).toLocaleString('ko-KR')}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-primary">{o.totalAmount.toLocaleString()}원</p>
                <Badge variant="outline" className="mt-1 text-xs">
                  {ORDER_STATUS_LABELS[o.status]}
                </Badge>
              </div>
            </div>
          </div>
        ))}
        <div className="space-y-2">
          {hasBbqGuide && (
            <Link href={guideHref} className="block">
              <Button className="w-full" variant="outline">
                <BookOpen className="mr-2 h-4 w-4" aria-hidden="true" />
                불멍/바베큐 사용법 보기
              </Button>
            </Link>
          )}
          <Link href={`/guest/${token}/order`} className="block">
            <Button className="w-full" variant="secondary">
              주문 내역/상태 자세히 보기
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

