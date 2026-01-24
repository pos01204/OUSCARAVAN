'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { InfoInspector } from '@/components/guest/InfoInspector';
import { formatDateTimeToKorean } from '@/lib/utils/date';
import { getGuestAnnouncementReadIds, markGuestAnnouncementRead } from '@/lib/api';
import type { Announcement } from '@/types';
import { AlertTriangle, Bell } from 'lucide-react';
import { CardIconBadge } from '@/components/shared/CardIconBadge';

interface GuestAnnouncementsProps {
  token: string;
  announcements: Announcement[];
  loading: boolean;
  error?: string | null;
}

const STORAGE_KEY = 'guest-announcements-read';

function getLevelBadge(level: Announcement['level']) {
  switch (level) {
    case 'critical':
      return { label: '긴급', className: 'bg-background-muted text-status-error border-border' };
    case 'warning':
      return { label: '주의', className: 'bg-background-muted text-status-warning border-border' };
    default:
      return { label: '안내', className: 'bg-background-muted text-status-info border-border' };
  }
}

export function GuestAnnouncements({ token, announcements, loading, error }: GuestAnnouncementsProps) {
  const [selected, setSelected] = useState<Announcement | null>(null);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setReadIds(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  // 서버에 저장된 “읽음” 상태 동기화(가능하면). 실패해도 로컬스토리지 폴백 유지.
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const serverReadIds = await getGuestAnnouncementReadIds(token);
        if (cancelled) return;
        if (serverReadIds?.length) {
          setReadIds((prev) => Array.from(new Set([...prev, ...serverReadIds])));
        }
      } catch {
        // ignore
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const markRead = (id: string) => {
    if (readIds.includes(id)) return;
    const updated = [...readIds, id];
    setReadIds(updated);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
    // 서버에도 저장(비동기, 실패해도 UX는 유지)
    markGuestAnnouncementRead(token, id).catch(() => {});
  };

  if (loading) {
    return (
      <Card variant="muted">
        <CardContent className="py-4 text-sm text-muted-foreground">공지 불러오는 중...</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="alert">
        <CardContent className="py-4 text-sm text-destructive">{error}</CardContent>
      </Card>
    );
  }

  if (!announcements || announcements.length === 0) {
    return null;
  }

  const critical = announcements.find((item) => item.level === 'critical');
  const normalList = announcements.filter((item) => item.id !== critical?.id);
  const unreadCount = announcements.filter((item) => !readIds.includes(item.id)).length;
  const showCritical = critical && (!showUnreadOnly || !readIds.includes(critical.id));
  const filteredNormal = showUnreadOnly
    ? normalList.filter((item) => !readIds.includes(item.id))
    : normalList;
  const visibleNormal = expanded ? filteredNormal : filteredNormal.slice(0, 3);

  return (
    <section aria-label="공지 안내" className="space-y-3">
      {showCritical && (
        <Card variant="alert">
          <CardContent className="flex items-start gap-3 p-4">
            <CardIconBadge icon={AlertTriangle} tone="warning" size="sm" />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="bg-background-muted text-status-error border-border">
                  긴급 공지
                </Badge>
                {!readIds.includes(critical.id) && (
                  <Badge variant="secondary" className="bg-background-elevated text-muted-foreground border-border">
                    새 공지
                  </Badge>
                )}
              </div>
              <p className="text-sm font-semibold">{critical.title}</p>
              <p className="text-xs text-muted-foreground">{critical.content}</p>
              <Button
                variant="ghost"
                size="sm"
                className="px-0 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  if (critical) {
                    markRead(critical.id);
                    setSelected(critical);
                  }
                }}
              >
                자세히 보기
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card variant="info">
        <CardHeader className="flex flex-col gap-3 space-y-0 pb-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CardIconBadge icon={Bell} tone="info" size="sm" />
              전체 공지
            </CardTitle>
            <p className="text-xs text-muted-foreground">읽지 않은 공지 {unreadCount}건</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setExpanded(false);
              setShowUnreadOnly((prev) => !prev);
            }}
          >
            {showUnreadOnly ? '전체 보기' : '읽지 않은 공지만'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {visibleNormal.length === 0 ? (
            <EmptyState
              variant="compact"
              title="표시할 공지가 없습니다."
              description={showUnreadOnly ? '읽지 않은 공지가 없습니다.' : undefined}
            />
          ) : (
            visibleNormal.map((announcement) => {
            const level = getLevelBadge(announcement.level);
            const isRead = readIds.includes(announcement.id);
            return (
              <button
                key={announcement.id}
                type="button"
                onClick={() => {
                  markRead(announcement.id);
                  setSelected(announcement);
                }}
                className="w-full rounded-md border border-border/60 p-3 text-left transition hover:bg-muted/40"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={level.className}>
                    {level.label}
                  </Badge>
                  {!isRead && <Badge variant="secondary">새 공지</Badge>}
                  <span className="text-sm font-semibold">{announcement.title}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                  {announcement.content}
                </p>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {formatDateTimeToKorean(announcement.startsAt)}
                  {announcement.endsAt ? ` ~ ${formatDateTimeToKorean(announcement.endsAt)}` : ''}
                </p>
              </button>
            );
            })
          )}
          {filteredNormal.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setExpanded((prev) => !prev)}
            >
              {expanded ? '접기' : `더보기 (${filteredNormal.length - 3}건 더)`} 
            </Button>
          )}
        </CardContent>
      </Card>

      <InfoInspector
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={selected?.title || '공지 상세'}
        description={selected ? formatDateTimeToKorean(selected.startsAt) : undefined}
        contentClassName="max-w-lg"
      >
        {selected && (
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getLevelBadge(selected.level).className}>
                {getLevelBadge(selected.level).label}
              </Badge>
              {selected.endsAt && (
                <span className="text-xs text-muted-foreground">
                  종료: {formatDateTimeToKorean(selected.endsAt)}
                </span>
              )}
            </div>
            <p className="whitespace-pre-line text-foreground">{selected.content}</p>
          </div>
        )}
      </InfoInspector>
    </section>
  );
}
