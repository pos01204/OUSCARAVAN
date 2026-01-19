'use client';

import { useEffect, useState } from 'react';
import { getGuestAnnouncements, type Announcement } from '@/lib/api';

export function useGuestAnnouncements(token: string) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const data = await getGuestAnnouncements(token);
        if (cancelled) return;
        setAnnouncements(data || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch announcements:', err);
        if (cancelled) return;
        setError('공지 정보를 불러오는데 실패했습니다.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAnnouncements();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return { announcements, loading, error };
}
