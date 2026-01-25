'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardIconBadge } from '@/components/shared/CardIconBadge';
import { InfoInspector } from '@/components/guest/InfoInspector';
import { AlertTriangle } from 'lucide-react';
import { formatDateTimeToKorean } from '@/lib/utils/date';
import { markGuestAnnouncementRead } from '@/lib/api';
import type { Announcement } from '@/types';

interface CriticalAnnouncementProps {
  announcement: Announcement;
  token: string;
}

export function CriticalAnnouncement({ announcement, token }: CriticalAnnouncementProps) {
  const [showDetail, setShowDetail] = useState(false);

  const handleOpenDetail = () => {
    markGuestAnnouncementRead(token, announcement.id).catch(() => {});
    setShowDetail(true);
  };

  return (
    <>
      <Card variant="alert">
        <CardContent className="flex items-start gap-3 p-4">
          <CardIconBadge icon={AlertTriangle} tone="warning" size="sm" />
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="bg-background-muted text-status-error border-status-error/30">
                긴급 공지
              </Badge>
            </div>
            <p className="text-sm font-semibold text-brand-dark">{announcement.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-2">{announcement.content}</p>
            <Button
              variant="ghost"
              size="sm"
              className="px-0 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleOpenDetail}
            >
              자세히 보기
            </Button>
          </div>
        </CardContent>
      </Card>

      <InfoInspector
        open={showDetail}
        onOpenChange={setShowDetail}
        title={announcement.title}
        description={formatDateTimeToKorean(announcement.startsAt)}
        contentClassName="max-w-lg"
      >
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-background-muted text-status-error border-status-error/30">
              긴급 공지
            </Badge>
            {announcement.endsAt && (
              <span className="text-xs text-muted-foreground">
                종료: {formatDateTimeToKorean(announcement.endsAt)}
              </span>
            )}
          </div>
          <p className="whitespace-pre-line text-foreground">{announcement.content}</p>
        </div>
      </InfoInspector>
    </>
  );
}
