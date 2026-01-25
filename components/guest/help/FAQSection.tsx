'use client';

import { Plus } from '@phosphor-icons/react';
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
      <h2 id="faq-title" className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">
        FAQ
      </h2>
      
      <div className="bg-neutral-50 rounded-xl border border-neutral-200/80 overflow-hidden">
        <Accordion type="single" collapsible className="divide-y divide-neutral-200/60">
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
                  font-normal text-neutral-700
                  hover:text-neutral-900 hover:bg-neutral-100/50
                  hover:no-underline
                  data-[state=open]:bg-neutral-100/50
                  data-[state=open]:text-neutral-900
                  [&[data-state=open]>div>svg]:rotate-45
                  transition-colors
                "
              >
                <span className="flex-1 pr-3 leading-relaxed">{faq.question}</span>
                <div className="shrink-0">
                  <Plus size={14} weight="regular" className="text-neutral-400 transition-transform duration-200" />
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-0">
                <p className="text-sm text-neutral-500 leading-relaxed whitespace-pre-wrap">
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
