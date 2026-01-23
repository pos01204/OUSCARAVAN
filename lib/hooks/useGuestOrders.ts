'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getOrders, type Order } from '@/lib/api';

export function useGuestOrders(token: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const isMountedRef = useRef(true);

  const fetchOrders = useCallback(async () => {
    try {
      if (!isMountedRef.current) return;
      setLoading(true);
      const response = await getOrders(token);
      if (!isMountedRef.current) return;
      setOrders(response.orders || []);
      setError(null);
      setLastUpdatedAt(new Date());
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      if (!isMountedRef.current) return;
      setError('주문 내역을 불러오는데 실패했습니다.');
    } finally {
      if (!isMountedRef.current) return;
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    isMountedRef.current = true;
    const run = async () => {
      await fetchOrders();
    };

    run();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchOrders]);

  const statusCounts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      preparing: orders.filter((o) => o.status === 'preparing').length,
      delivering: orders.filter((o) => o.status === 'delivering').length,
      completed: orders.filter((o) => o.status === 'completed').length,
    };
  }, [orders]);

  return { orders, loading, error, statusCounts, refresh: fetchOrders, lastUpdatedAt };
}

