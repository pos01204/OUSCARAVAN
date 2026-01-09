'use client';

import { Phone, AlertTriangle, HelpCircle, MapPin, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FAQ_DATA, EMERGENCY_CONTACTS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';

interface GuestHelpContentProps {
  token?: string;
}

export function GuestHelpContent({ token }: GuestHelpContentProps) {
  // FAQ를 중요도 순으로 정렬
  const sortedFAQs = useMemo(() => {
    return [...FAQ_DATA].sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }, []);

  return (
    <main className="space-y-6" role="main" aria-label="도움말 페이지">
      {/* Emergency FAB (Mobile only) */}
      <a
        href={`tel:${EMERGENCY_CONTACTS.manager.number}`}
        className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110 md:hidden"
        aria-label="관리자에게 전화하기"
      >
        <Phone className="h-6 w-6" aria-hidden="true" />
      </a>

      {/* 응급 연락처 */}
      <section aria-label="응급 연락처">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              응급 연락처
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(EMERGENCY_CONTACTS)
              .sort(([, a], [, b]) => (a.priority || 0) - (b.priority || 0))
              .map(([key, contact]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex-1">
                    <p className="font-medium">{contact.name}</p>
                    {'description' in contact && contact.description && (
                      <p className="text-sm text-muted-foreground">
                        {contact.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {'mapLink' in contact && contact.mapLink && (
                      <a
                        href={contact.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted flex items-center gap-1"
                        aria-label={`${contact.name} 지도 보기`}
                      >
                        <MapPin className="h-4 w-4" />
                        지도
                      </a>
                    )}
                    <a
                      href={`tel:${contact.number}`}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 flex items-center gap-1"
                      aria-label={`${contact.name}에 전화하기`}
                    >
                      <Phone className="h-4 w-4" />
                      전화
                    </a>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </section>

      {/* FAQ */}
      <section aria-label="자주 묻는 질문">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              자주 묻는 질문
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {sortedFAQs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                    {faq.id === 'early-checkin' && (
                      <div className="mt-3">
                        <a
                          href={`tel:${EMERGENCY_CONTACTS.manager.number}`}
                          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                          aria-label="관리자에게 연락"
                        >
                          <Phone className="h-4 w-4" />
                          관리자에게 연락
                        </a>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </section>

      {/* 안전 정보 */}
      <section aria-label="안전 정보">
        <Card>
          <CardHeader>
            <CardTitle>안전 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="font-medium mb-2">화재 예방</p>
              <p className="text-sm text-muted-foreground">
                바베큐 사용 시 반드시 지정된 장소에서만 사용하세요. 사용 후에는 완전히 꺼졌는지 확인하세요.
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="font-medium mb-2">응급 상황 시</p>
              <p className="text-sm text-muted-foreground">
                응급 상황 발생 시 즉시 관리자에게 연락하거나 119에 신고하세요.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
