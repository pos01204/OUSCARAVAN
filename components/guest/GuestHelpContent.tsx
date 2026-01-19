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
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { GuestPageHeader } from '@/components/guest/GuestPageHeader';

interface GuestHelpContentProps {
  token?: string;
}

export function GuestHelpContent({ token }: GuestHelpContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');

  // FAQ를 중요도 순으로 정렬
  const sortedFAQs = useMemo(() => {
    return [...FAQ_DATA].sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }, []);

  const categories = useMemo(() => {
    return ['전체', ...Array.from(new Set(FAQ_DATA.map((f) => f.category)))];
  }, []);

  const filteredFAQs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return sortedFAQs.filter((faq) => {
      const matchCategory = selectedCategory === '전체' || faq.category === selectedCategory;
      const matchQuery =
        !q ||
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q) ||
        faq.category.toLowerCase().includes(q);
      return matchCategory && matchQuery;
    });
  }, [sortedFAQs, searchQuery, selectedCategory]);

  const homeWifiHref = token ? `/guest/${token}#wifi` : '#';

  return (
    <main className="space-y-6" role="main" aria-label="도움말 페이지">
      <GuestPageHeader title="도움말" description="응급 연락처와 자주 묻는 질문을 확인하세요" />

      {/* Emergency FAB (Mobile only) */}
      <a
        href={`tel:${EMERGENCY_CONTACTS.manager.number}`}
        className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110 md:hidden"
        aria-label="관리자에게 전화하기"
      >
        <Phone className="h-6 w-6" aria-hidden="true" />
      </a>

      {/* 빠른 도움(상위 3개) */}
      <section aria-label="빠른 도움">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              자주 찾는 도움
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2">
            <a
              href={`tel:${EMERGENCY_CONTACTS.manager.number}`}
              className="flex items-center justify-between rounded-lg border bg-background px-4 py-3 hover:bg-muted/50 transition-colors"
              aria-label="관리자에게 전화하기"
            >
              <div>
                <p className="font-semibold">관리자 전화</p>
                <p className="text-xs text-muted-foreground">{EMERGENCY_CONTACTS.manager.number}</p>
              </div>
              <Phone className="h-4 w-4" aria-hidden="true" />
            </a>

            <a
              href={EMERGENCY_CONTACTS.hospital.mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg border bg-background px-4 py-3 hover:bg-muted/50 transition-colors"
              aria-label="응급실 지도 보기"
            >
              <div>
                <p className="font-semibold">응급실</p>
                <p className="text-xs text-muted-foreground">가장 가까운 병원</p>
              </div>
              <MapPin className="h-4 w-4" aria-hidden="true" />
            </a>

            <Link
              href={homeWifiHref}
              className="flex items-center justify-between rounded-lg border bg-background px-4 py-3 hover:bg-muted/50 transition-colors"
              aria-label="WiFi 비밀번호 확인하기"
            >
              <div>
                <p className="font-semibold">WiFi 비밀번호 찾기</p>
                <p className="text-xs text-muted-foreground">홈 화면에서 확인</p>
              </div>
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </Link>
          </CardContent>
        </Card>
      </section>

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
            {/* 검색/카테고리 */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="FAQ 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="FAQ 검색"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-1 [-webkit-overflow-scrolling:touch]">
                {categories.map((c) => (
                  <Button
                    key={c}
                    type="button"
                    size="sm"
                    variant={selectedCategory === c ? 'default' : 'outline'}
                    className="shrink-0"
                    onClick={() => setSelectedCategory(c)}
                    aria-label={`카테고리 ${c}`}
                  >
                    {c}
                  </Button>
                ))}
              </div>
            </div>

            {filteredFAQs.length === 0 ? (
              <div className="rounded-lg border bg-muted/30 p-6 text-center">
                <p className="text-sm text-muted-foreground">검색 결과가 없습니다.</p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {filteredFAQs.map((faq) => (
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
            )}
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
