'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { GuideFAQ } from '@/types';

interface GuideFAQProps {
  faqs: GuideFAQ[];
  searchable?: boolean;
}

export function GuideFAQ({ faqs, searchable = false }: GuideFAQProps) {
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
