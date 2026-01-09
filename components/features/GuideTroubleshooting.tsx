'use client';

import { Phone, MessageSquare, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { GuideTroubleshooting } from '@/types';

interface GuideTroubleshootingProps {
  items: GuideTroubleshooting[];
  onContactManager?: (method: 'phone' | 'message' | 'email') => void;
}

export function GuideTroubleshooting({
  items,
  onContactManager,
}: GuideTroubleshootingProps) {
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

  return (
    <Card className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
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
              {item.requiresContact && (
                <div className="pt-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="destructive" className="text-xs">
                      관리자 연락 필요
                    </Badge>
                    {item.contactMethod && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleContact(item.contactMethod!)}
                        className="h-7 text-xs"
                        aria-label={`${getContactLabel(item.contactMethod)}로 관리자에게 연락`}
                      >
                        {getContactIcon(item.contactMethod)}
                        <span className="ml-1">{getContactLabel(item.contactMethod)}</span>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
