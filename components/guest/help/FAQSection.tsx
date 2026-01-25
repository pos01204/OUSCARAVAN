'use client';

import { Plus } from '@phosphor-icons/react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FAQ_DATA } from '@/lib/constants';
import { logHelpEvent } from '@/lib/help-telemetry';
import { useEffect, useMemo, useState } from 'react';

const FAQ_OPEN_KEY = 'help:faq_open:v1';
const FAQ_EXPAND_KEY = 'help:faq_expand:v1';

export function FAQSection() {
  // 우선순위 상위 5개만 표시
  const topFAQs = useMemo(() => {
    return [...FAQ_DATA]
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
      .slice(0, 5);
  }, []);

  const [value, setValue] = useState<string | undefined>(undefined);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    try {
      const savedOpen = window.localStorage.getItem(FAQ_OPEN_KEY) ?? undefined;
      const savedExpanded = window.localStorage.getItem(FAQ_EXPAND_KEY);
      setValue(savedOpen || undefined);
      setExpanded(savedExpanded === '1');
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      if (value) window.localStorage.setItem(FAQ_OPEN_KEY, value);
      else window.localStorage.removeItem(FAQ_OPEN_KEY);
    } catch {
      // ignore
    }
  }, [value]);

  useEffect(() => {
    try {
      window.localStorage.setItem(FAQ_EXPAND_KEY, expanded ? '1' : '0');
    } catch {
      // ignore
    }
  }, [expanded]);

  const visible = expanded ? topFAQs : topFAQs.slice(0, 3);

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-brand-cream-dark/20 overflow-hidden bg-white">
        <Accordion
          type="single"
          collapsible
          value={value}
          onValueChange={(next) => {
            setValue(next || undefined);
            logHelpEvent('help_faq_toggle', { id: next || null });
          }}
          className="divide-y divide-brand-cream-dark/15"
        >
          {visible.map((faq) => (
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
                  font-normal text-brand-dark-soft
                  hover:text-brand-dark hover:bg-brand-cream/20
                  hover:no-underline
                  data-[state=open]:bg-brand-cream/30
                  data-[state=open]:text-brand-dark
                  [&[data-state=open]>div>svg]:rotate-45
                  transition-colors
                "
              >
                <span className="flex-1 pr-3 leading-relaxed">{faq.question}</span>
                <div className="shrink-0">
                  <Plus size={14} weight="regular" className="text-brand-dark-muted transition-transform duration-200" />
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-0 bg-brand-cream/10">
                <p className="text-sm text-brand-dark-muted leading-relaxed whitespace-pre-wrap">
                  {faq.answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setExpanded((v) => !v);
            logHelpEvent('help_faq_toggle', { expanded: !expanded });
          }}
          className="text-xs font-medium text-brand-dark-muted hover:text-brand-dark transition-colors px-1"
        >
          {expanded ? '접기' : '더 보기'}
        </button>
      </div>
    </div>
  );
}
