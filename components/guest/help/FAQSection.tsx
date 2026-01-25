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
      <div className="flex items-center gap-2 mb-4">
        <Question size={20} weight="regular" className="text-neutral-600" aria-hidden="true" />
        <h2 id="faq-title" className="text-lg font-bold text-neutral-900">자주 묻는 질문</h2>
      </div>
      
      <Accordion type="single" collapsible className="space-y-3">
        {topFAQs.map((faq) => (
          <AccordionItem 
            key={faq.id} 
            value={faq.id}
            className="
              border-none
              bg-white rounded-xl
              shadow-sm
              overflow-hidden
              data-[state=open]:shadow-md
              transition-shadow duration-200
            "
          >
            <AccordionTrigger 
              hideIcon
              className="
                px-5 py-4
                text-left
                font-medium text-neutral-800
                hover:bg-neutral-50 hover:no-underline
                data-[state=open]:bg-neutral-50
                [&[data-state=open]>svg]:rotate-45
                [&>svg]:shrink-0
                [&>svg]:transition-transform
                [&>svg]:duration-200
              "
            >
              <span className="pr-4">{faq.question}</span>
              <Plus size={16} weight="bold" className="text-neutral-400" />
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5 pt-0">
              <div className="border-t border-neutral-100 pt-4">
                <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">
                  {faq.answer}
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
