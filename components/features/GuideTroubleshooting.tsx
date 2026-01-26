'use client';

import { useState } from 'react';
import { Phone, MessageSquare, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { GuideTroubleshooting } from '@/types';

interface GuideTroubleshootingProps {
  items: GuideTroubleshooting[];
  onContactManager?: (method: 'phone' | 'message' | 'email') => void;
  /** 기본 list. 모바일 인스펙터에서는 pager로 한 화면에 맞춤 */
  mode?: 'list' | 'pager';
}

export function GuideTroubleshooting({
  items,
  onContactManager,
  mode = 'list',
}: GuideTroubleshootingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  if (items.length === 0) {
    return null;
  }

  const handleContact = (method: 'phone' | 'message' | 'email') => {
    if (onContactManager) {
      onContactManager(method);
    } else {
      // 기본 동작
      if (method === 'phone') {
        window.location.href = 'tel:0507-1335-5154';
      } else if (method === 'message') {
        // 메시지 앱 열기 (선택사항)
        window.open('sms:0507-1335-5154');
      } else if (method === 'email') {
        window.location.href = 'mailto:info@ouscaravan.com';
      }
    }
  };

  const getContactIcon = (method?: 'phone' | 'message' | 'email') => {
    switch (method) {
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getContactLabel = (method?: 'phone' | 'message' | 'email') => {
    switch (method) {
      case 'phone':
        return '전화';
      case 'message':
        return '메시지';
      case 'email':
        return '이메일';
      default:
        return '연락';
    }
  };

  if (mode === 'pager') {
    const idx = Math.min(Math.max(currentIndex, 0), items.length - 1);
    const item = items[idx];
    const isSingleItem = items.length === 1;

    return (
      <Card variant="alert">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-status-warning" />
              <CardTitle className="text-base font-bold text-foreground">
                {isSingleItem ? '문제가 있으신가요?' : '해결'}
              </CardTitle>
            </div>
            {/* 단일 항목일 때는 페이지 표시 숨김 */}
            {!isSingleItem && (
              <span className="text-xs text-muted-foreground">{idx + 1} / {items.length}</span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-xl border bg-background p-3 space-y-2">
            <p className="text-sm font-semibold text-foreground leading-snug">{item.problem}</p>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">{item.solution}</p>
            </div>

            {item.steps && item.steps.length > 0 && (
              <ol className="list-decimal list-inside space-y-1 pl-1 text-sm text-muted-foreground">
                {item.steps.slice(0, 3).map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
                {item.steps.length > 3 && (
                  <li className="text-xs text-muted-foreground/80">…다음에서 계속</li>
                )}
              </ol>
            )}

            {item.requiresContact && item.contactMethod && (
              <div className="pt-3 space-y-2">
                <Button
                  size="default"
                  variant="default"
                  onClick={() => handleContact(item.contactMethod!)}
                  className="w-full h-11 bg-brand-dark hover:bg-brand-dark/90 text-white font-medium"
                  aria-label={`${getContactLabel(item.contactMethod)}로 관리자에게 연락`}
                >
                  {getContactIcon(item.contactMethod)}
                  <span className="ml-2">관리자에게 전화하기</span>
                </Button>
                <p className="text-[11px] text-center text-muted-foreground">
                  문제가 해결되지 않으면 연락해주세요
                </p>
              </div>
            )}
          </div>

          {/* 단일 항목일 때는 이전/다음 버튼 숨김 */}
          {!isSingleItem && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setCurrentIndex((v) => Math.max(0, v - 1))}
                disabled={idx === 0}
                aria-label="이전 문제"
              >
                이전
              </Button>
              <Button
                variant="default"
                className="flex-1"
                onClick={() => setCurrentIndex((v) => Math.min(items.length - 1, v + 1))}
                disabled={idx === items.length - 1}
                aria-label="다음 문제"
              >
                다음
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="alert">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-status-warning" />
          <CardTitle className="text-lg font-bold text-foreground">문제 해결 가이드</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-lg border bg-background space-y-3"
            role="article"
            aria-labelledby={`trouble-problem-${item.id}`}
          >
            {/* 문제 */}
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4
                  id={`trouble-problem-${item.id}`}
                  className="font-semibold text-foreground mb-1"
                >
                  {item.problem}
                </h4>
              </div>
            </div>

            {/* 해결 방법 */}
            <div className="pl-7 space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground flex-1">{item.solution}</p>
              </div>

              {/* 단계별 해결 방법 */}
              {item.steps && item.steps.length > 0 && (
                <ol className="list-decimal list-inside space-y-1 pl-4 text-sm text-muted-foreground">
                  {item.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              )}

              {/* 예상 소요 시간 */}
              {item.estimatedTime && (
                <p className="text-xs text-muted-foreground pl-4">
                  ⏱️ 예상 소요 시간: {item.estimatedTime}
                </p>
              )}

              {/* 관리자 연락 필요 */}
              {item.requiresContact && item.contactMethod && (
                <div className="pt-3">
                  <Button
                    size="default"
                    variant="default"
                    onClick={() => handleContact(item.contactMethod!)}
                    className="w-full h-10 bg-brand-dark hover:bg-brand-dark/90 text-white font-medium"
                    aria-label={`${getContactLabel(item.contactMethod)}로 관리자에게 연락`}
                  >
                    {getContactIcon(item.contactMethod)}
                    <span className="ml-2">관리자에게 전화하기</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
