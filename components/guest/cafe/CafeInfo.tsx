'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { MapPin, Clock, Phone, Building2 } from 'lucide-react';
import { CAFE_INFO } from '@/lib/constants';

export function CafeInfo() {
  return (
    <section className="space-y-3" aria-label="카페 정보">
      <h3 className="text-sm font-semibold text-brand-dark-muted uppercase tracking-wider">
        카페 안내
      </h3>
      
      <Accordion type="single" collapsible className="space-y-2">
        {/* 운영시간 */}
        <AccordionItem value="hours" className="border border-brand-cream-dark/25 rounded-xl px-4 bg-white">
          <AccordionTrigger className="py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-brand-dark-muted" />
              <span className="font-medium text-brand-dark">운영시간</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-2 pl-7 text-sm text-brand-dark-muted">
              <p>평일: {CAFE_INFO.hours.weekday}</p>
              <p>주말: {CAFE_INFO.hours.weekend}</p>
              <p className="text-red-600 font-medium">{CAFE_INFO.hours.closed}</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 위치 */}
        <AccordionItem value="location" className="border border-brand-cream-dark/25 rounded-xl px-4 bg-white">
          <AccordionTrigger className="py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-brand-dark-muted" />
              <span className="font-medium text-brand-dark">위치 안내</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="pl-7 text-sm text-brand-dark-muted">
              <p>{CAFE_INFO.address}</p>
              <p className="text-xs text-brand-dark-muted/70 mt-1">(매장 방문 및 길 안내용)</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 연락처 */}
        <AccordionItem value="contact" className="border border-brand-cream-dark/25 rounded-xl px-4 bg-white">
          <AccordionTrigger className="py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-brand-dark-muted" />
              <span className="font-medium text-brand-dark">연락처</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="pl-7">
              <a
                href={`tel:${CAFE_INFO.phone.replace(/-/g, '')}`}
                className="text-base font-bold text-brand-dark hover:text-brand-dark-muted transition-colors"
              >
                {CAFE_INFO.phone}
              </a>
              <p className="text-xs text-brand-dark-muted/70 mt-1">
                {CAFE_INFO.business.phoneType}
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 사업자 정보 */}
        <AccordionItem value="business" className="border border-brand-cream-dark/25 rounded-xl px-4 bg-white">
          <AccordionTrigger className="py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-brand-dark-muted" />
              <span className="font-medium text-brand-dark">사업자 정보</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="pl-7 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-dark-muted">상호명</span>
                <span className="text-brand-dark font-medium">{CAFE_INFO.business.businessName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-dark-muted">대표자</span>
                <span className="text-brand-dark">{CAFE_INFO.business.representative}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-dark-muted">사업자번호</span>
                <span className="text-brand-dark font-mono">{CAFE_INFO.business.businessNumber}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
