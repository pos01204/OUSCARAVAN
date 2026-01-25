'use client';

import { Plus, Question } from '@phosphor-icons/react';
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
    <section aria-labelledby="faq-title">
      <div className="flex items-center gap-2 mb-3">
        <Question size={18} weight="bold" className="text-neutral-500" aria-hidden="true" />
        <h2 id="faq-title" className="text-base font-bold text-neutral-900">자주 묻는 질문</h2>
      </div>
      
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <Accordion type="single" collapsible className="divide-y divide-neutral-100">
          {topFAQs.map((faq) => (
            <AccordionItem 
              key={faq.id} 
              value={faq.id}
              className="border-none"
            >
              <AccordionTrigger 
                hideIcon
                className="
                  px-4 py-3.5
                  text-left text-sm
                  font-medium text-neutral-800
                  hover:bg-neutral-50 hover:no-underline
                  data-[state=open]:bg-neutral-50
                  [&[data-state=open]>div>svg]:rotate-45
                "
              >
                <span className="flex-1 pr-3 leading-snug">{faq.question}</span>
                <div className="shrink-0">
                  <Plus size={16} weight="bold" className="text-neutral-400 transition-transform duration-200" />
                </div>
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
