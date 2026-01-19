'use client';

import { useEffect, useMemo, useState } from 'react';
import { getOrders, type Order } from '@/lib/api';
import { useGuestStore } from '@/lib/store';

export function useGuestOrders(token: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const localOrders = useGuestStore((state) => state.orders);

  useEffect(() => {
    let cancelled = false;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getOrders(token);
        if (cancelled) return;
        const fetched = response.orders || [];
        if (cancelled) return;
        const merged = [
          ...fetched,
          ...localOrders.filter((local) => !fetched.some((o) => o.id === local.id)),
        ];
        setOrders(merged);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        if (cancelled) return;
        setError('주문 내역을 불러오는데 실패했습니다.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOrders();
    return () => {
      cancelled = true;
    };
  }, [token, localOrders]);

  const statusCounts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      preparing: orders.filter((o) => o.status === 'preparing').length,
      delivering: orders.filter((o) => o.status === 'delivering').length,
      completed: orders.filter((o) => o.status === 'completed').length,
    };
  }, [orders]);

  return { orders, loading, error, statusCounts };
}

