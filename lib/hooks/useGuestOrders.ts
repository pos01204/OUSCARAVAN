'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getOrders, type Order } from '@/lib/api';
import { API_CONFIG } from '@/lib/constants';

export function useGuestOrders(token: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const isMountedRef = useRef(true);
  const inFlightRef = useRef(false);
  const failureCountRef = useRef(0);
  const pollTimeoutRef = useRef<number | null>(null);
  const runFetchRef = useRef<(mode: 'initial' | 'soft', reason: string) => void>(() => {});
  const eventSourceRef = useRef<EventSource | null>(null);

  const clearPollTimeout = () => {
    if (pollTimeoutRef.current) {
      window.clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  };

  const scheduleNextPoll = useCallback((opts?: { immediate?: boolean }) => {
    if (!isMountedRef.current) return;
    if (typeof window === 'undefined') return;
    clearPollTimeout();

    const immediate = Boolean(opts?.immediate);
    if (immediate) {
      pollTimeoutRef.current = window.setTimeout(() => {
        runFetchRef.current('soft', 'poll-immediate');
      }, 0);
      return;
    }

    const isVisible = typeof document !== 'undefined' ? document.visibilityState === 'visible' : true;
    const baseMs = isVisible ? 10_000 : 60_000; // visible: 10s, background: 60s
    const backoffMultiplier = Math.min(6, failureCountRef.current); // cap
    const backoffMs = Math.min(60_000, baseMs * Math.pow(2, backoffMultiplier));
    const nextMs = failureCountRef.current > 0 ? backoffMs : baseMs;

    pollTimeoutRef.current = window.setTimeout(() => {
      runFetchRef.current('soft', 'poll');
    }, nextMs);
  }, []);

  const fetchOrders = useCallback(async (opts?: { mode?: 'initial' | 'soft'; reason?: string }) => {
    const mode = opts?.mode ?? (lastUpdatedAt ? 'soft' : 'initial');
    try {
      if (!isMountedRef.current) return;
      if (inFlightRef.current) return;
      inFlightRef.current = true;

      if (mode === 'initial') {
        setIsInitialLoading(true);
      } else {
        setIsRefreshing(true);
      }
      const response = await getOrders(token);
      if (!isMountedRef.current) return;
      setOrders(response.orders || []);
      setError(null);
      setLastUpdatedAt(new Date());
      failureCountRef.current = 0;
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      if (!isMountedRef.current) return;
      failureCountRef.current += 1;
      setError('주문 내역을 불러오는데 실패했습니다.');
    } finally {
      if (!isMountedRef.current) return;
      inFlightRef.current = false;
      setIsInitialLoading(false);
      setIsRefreshing(false);
    }
  }, [token, lastUpdatedAt, scheduleNextPoll]);

  useEffect(() => {
    isMountedRef.current = true;
    clearPollTimeout();
    failureCountRef.current = 0;
    inFlightRef.current = false;

    runFetchRef.current = (mode, reason) => {
      void fetchOrders({ mode, reason }).finally(() => {
        scheduleNextPoll();
      });
    };

    runFetchRef.current('initial', 'mount');

    const handleFocus = () => scheduleNextPoll({ immediate: true });
    const handleOnline = () => scheduleNextPoll({ immediate: true });
    const handleVisibility = () => scheduleNextPoll({ immediate: true });

    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibility);

    // SSE(가능하면): 주문 변경이 발생하면 즉시 soft refresh
    try {
      if (typeof window !== 'undefined' && typeof EventSource !== 'undefined') {
        const url = `${API_CONFIG.baseUrl}/api/guest/${token}/orders/stream`;
        const es = new EventSource(url);
        eventSourceRef.current = es;

        es.onmessage = () => {
          scheduleNextPoll({ immediate: true });
        };
        es.onerror = () => {
          // SSE 실패 시에도 폴링으로 계속 동작 (조용히 닫고 폴링 유지)
          try {
            es.close();
          } catch {
            // ignore
          }
          eventSourceRef.current = null;
        };
      }
    } catch {
      // ignore
    }

    return () => {
      isMountedRef.current = false;
      clearPollTimeout();
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (eventSourceRef.current) {
        try {
          eventSourceRef.current.close();
        } catch {
          // ignore
        }
        eventSourceRef.current = null;
      }
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

  const refresh = useCallback(async () => {
    runFetchRef.current('soft', 'manual');
  }, []);

  return {
    orders,
    loading: isInitialLoading,
    isRefreshing,
    error,
    statusCounts,
    refresh,
    lastUpdatedAt,
  };
}

