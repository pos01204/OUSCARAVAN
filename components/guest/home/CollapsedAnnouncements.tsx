'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardIconBadge } from '@/components/shared/CardIconBadge';
import { InfoInspector } from '@/components/guest/InfoInspector';
import { Bell, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDateTimeToKorean } from '@/lib/utils/date';
import { markGuestAnnouncementRead } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import type { Announcement } from '@/types';

interface CollapsedAnnouncementsProps {
  announcements: Announcement[];
  token: string;
  defaultExpanded?: boolean;
}

function getLevelBadge(level: Announcement['level']) {
  switch (level) {
    case 'warning':
      return { label: '주의', className: 'bg-background-muted text-status-warning border-status-warning/30' };
    default:
      return { label: '안내', className: 'bg-background-muted text-status-info border-status-info/30' };
  }
}

export function CollapsedAnnouncements({ 
  announcements, 
  token, 
  defaultExpanded = false 
}: CollapsedAnnouncementsProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [selected, setSelected] = useState<Announcement | null>(null);

  const handleSelect = (announcement: Announcement) => {
    markGuestAnnouncementRead(token, announcement.id).catch(() => {});
    setSelected(announcement);
  };

  if (announcements.length === 0) return null;

  return (
    <>
      <Card variant="muted">
        <CardHeader className="pb-2">
          <button
            type="button"
            className="flex items-center justify-between w-full"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
          >
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CardIconBadge icon={Bell} tone="info" size="sm" />
              공지사항
              <Badge variant="secondary" className="ml-1">
                {announcements.length}
              </Badge>
            </CardTitle>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </CardHeader>
        
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="space-y-2 pt-0">
                {announcements.map((announcement) => {
                  const level = getLevelBadge(announcement.level);
                  return (
                    <button
                      key={announcement.id}
                      type="button"
                      onClick={() => handleSelect(announcement)}
                      className="w-full rounded-lg border border-border/60 p-3 text-left transition hover:bg-muted/40"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={level.className}>
                          {level.label}
                        </Badge>
                        <span className="text-sm font-medium text-brand-dark truncate">
                          {announcement.title}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                        {announcement.content}
                      </p>
                    </button>
                  );
                })}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <InfoInspector
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
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
                <span className="text-xs">
                  종료: {formatDateTimeToKorean(selected.endsAt)}
                </span>
              )}
            </div>
            <p className="whitespace-pre-line text-foreground">{selected.content}</p>
          </div>
        )}
      </InfoInspector>
    </>
  );
}
