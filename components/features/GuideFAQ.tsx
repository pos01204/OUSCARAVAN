'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { GuideFAQ } from '@/types';

interface GuideFAQProps {
  faqs: GuideFAQ[];
  searchable?: boolean;
  /** 기본 list(아코디언). 모바일 인스펙터에서는 pager로 한 화면에 맞춤 */
  mode?: 'list' | 'pager';
}

export function GuideFAQ({ faqs, searchable = false, mode = 'list' }: GuideFAQProps) {
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  if (faqs.length === 0) {
    return null;
  }

  const filteredFaqs = searchable
    ? faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  // pager 모드: 한 화면에 1개씩만 보여주고 이전/다음으로 이동
  if (mode === 'pager') {
    const safeFaqs = filteredFaqs.length > 0 ? filteredFaqs : faqs;
    const idx = Math.min(Math.max(currentIndex, 0), safeFaqs.length - 1);
    const faq = safeFaqs[idx];
    const progressText = `${idx + 1} / ${safeFaqs.length}`;

    return (
      <Card className="border-primary/20">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">FAQ</h3>
              <span className="text-xs text-muted-foreground">{progressText}</span>
            </div>

            <div className="rounded-xl border bg-background p-3">
              <p className="text-sm font-semibold text-foreground leading-snug">{faq.question}</p>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {faq.answer}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex-1 rounded-xl border bg-background px-3 py-2 text-sm font-medium disabled:opacity-50"
                onClick={() => setCurrentIndex((v) => Math.max(0, v - 1))}
                disabled={idx === 0}
                aria-label="이전 질문"
              >
                이전
              </button>
              <button
                type="button"
                className="flex-1 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                onClick={() => setCurrentIndex((v) => Math.min(safeFaqs.length - 1, v + 1))}
                disabled={idx === safeFaqs.length - 1}
                aria-label="다음 질문"
              >
                다음
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const toggleFaq = (faqId: string) => {
    setOpenFaqId(openFaqId === faqId ? null : faqId);
  };

  return (
    <Card className="border-primary/20">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">자주 묻는 질문</h3>
            <span className="text-sm text-muted-foreground">{faqs.length}개</span>
          </div>

          {searchable && (
            <div className="relative">
              <input
                type="text"
                placeholder="FAQ 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
                aria-label="FAQ 검색"
              />
            </div>
          )}

          {filteredFaqs.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">검색 결과가 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {filteredFaqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                <div
                  key={faq.id}
                  className="border rounded-lg overflow-hidden transition-all"
                >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${faq.id}`}
                    >
                      <span className="font-medium text-foreground pr-4">{faq.question}</span>
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div
                        id={`faq-answer-${faq.id}`}
                        className="px-4 pb-3 text-muted-foreground leading-relaxed"
                        role="region"
                        aria-labelledby={`faq-question-${faq.id}`}
                      >
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
