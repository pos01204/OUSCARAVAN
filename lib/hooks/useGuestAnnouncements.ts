'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getGuestAnnouncements, type Announcement } from '@/lib/api';
import { API_CONFIG } from '@/lib/constants';

export function useGuestAnnouncements(token: string) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const isMountedRef = useRef(true);
  const inFlightRef = useRef(false);
  const pollTimeoutRef = useRef<number | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const lastUpdatedAtRef = useRef<Date | null>(null);

  const clearPollTimeout = () => {
    if (pollTimeoutRef.current) {
      window.clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  };

  const fetchAnnouncements = useCallback(
    async (opts?: { mode?: 'initial' | 'soft'; reason?: string }) => {
      const mode = opts?.mode ?? (lastUpdatedAtRef.current ? 'soft' : 'initial');
      try {
        if (!isMountedRef.current) return;
        if (inFlightRef.current) return;
        inFlightRef.current = true;
        if (mode === 'initial') setLoading(true);
        else setIsRefreshing(true);

        const data = await getGuestAnnouncements(token);
        if (!isMountedRef.current) return;
        setAnnouncements(data || []);
        setError(null);
        const now = new Date();
        lastUpdatedAtRef.current = now;
        setLastUpdatedAt(now);
      } catch (err) {
        console.error('Failed to fetch announcements:', err);
        if (!isMountedRef.current) return;
        setError('공지 정보를 불러오는데 실패했습니다.');
      } finally {
        if (!isMountedRef.current) return;
        inFlightRef.current = false;
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [token]
  );

  useEffect(() => {
    isMountedRef.current = true;
    clearPollTimeout();
    inFlightRef.current = false;

    const scheduleNext = (opts?: { immediate?: boolean }) => {
      if (!isMountedRef.current) return;
      if (typeof window === 'undefined') return;
      clearPollTimeout();

      const immediate = Boolean(opts?.immediate);
      if (immediate) {
        pollTimeoutRef.current = window.setTimeout(() => {
          void fetchAnnouncements({ mode: 'soft', reason: 'poll-immediate' }).finally(() => scheduleNext());
        }, 0);
        return;
      }

      const isVisible = typeof document !== 'undefined' ? document.visibilityState === 'visible' : true;
      const nextMs = isVisible ? 60_000 : 300_000; // visible: 60s, background: 5min
      pollTimeoutRef.current = window.setTimeout(() => {
        void fetchAnnouncements({ mode: 'soft', reason: 'poll' }).finally(() => scheduleNext());
      }, nextMs);
    };

    void fetchAnnouncements({ mode: 'initial', reason: 'mount' }).finally(() => scheduleNext());

    const handleFocus = () => scheduleNext({ immediate: true });
    const handleOnline = () => scheduleNext({ immediate: true });
    const handleVisibility = () => scheduleNext({ immediate: true });

    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibility);

    // SSE(가능하면): 공지 변경이 발생하면 즉시 soft refresh
    try {
      if (typeof window !== 'undefined' && typeof EventSource !== 'undefined') {
        const url = `${API_CONFIG.baseUrl}/api/guest/${token}/announcements/stream`;
        const es = new EventSource(url);
        eventSourceRef.current = es;

        es.onmessage = () => scheduleNext({ immediate: true });
        es.onerror = () => {
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
  }, [fetchAnnouncements]);

  const refresh = useCallback(() => {
    void fetchAnnouncements({ mode: 'soft', reason: 'manual' });
  }, [fetchAnnouncements]);

  return { announcements, loading, isRefreshing, error, lastUpdatedAt, refresh };
}
