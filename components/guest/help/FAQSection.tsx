'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FAQ_DATA } from '@/lib/constants';
import { useMemo } from 'react';

export function FAQSection() {
  // 우선순위 상위 5개만 표시
  const topFAQs = useMemo(() => {
    return [...FAQ_DATA]
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
      .slice(0, 5);
  }, []);

  return (
    <section className="py-2">
      <h2 className="text-lg font-bold text-neutral-900 mb-4">자주 묻는 질문</h2>
      
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <Accordion type="single" collapsible className="w-full">
          {topFAQs.map((faq, index) => (
            <AccordionItem 
              key={faq.id} 
              value={faq.id}
              className={index !== topFAQs.length - 1 ? 'border-b border-neutral-100' : 'border-none'}
            >
              <AccordionTrigger className="px-4 py-4 text-left hover:no-underline hover:bg-neutral-50 text-sm font-medium text-neutral-900">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-0">
                <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">
                  {faq.answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
