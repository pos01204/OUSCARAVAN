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
      <div className="rounded-xl border border-neutral-200/70 overflow-hidden bg-white">
        <Accordion
          type="single"
          collapsible
          value={value}
          onValueChange={(next) => {
            setValue(next || undefined);
            logHelpEvent('help_faq_toggle', { id: next || null });
          }}
          className="divide-y divide-neutral-200/60"
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
                  font-normal text-neutral-700
                  hover:text-neutral-900 hover:bg-neutral-50
                  hover:no-underline
                  data-[state=open]:bg-neutral-50
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

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setExpanded((v) => !v);
            logHelpEvent('help_faq_toggle', { expanded: !expanded });
          }}
          className="text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors px-1"
        >
          {expanded ? '접기' : '더 보기'}
        </button>
      </div>
    </div>
  );
}
