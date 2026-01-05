'use client';

import { Phone, AlertTriangle, MapPin, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FAQ_DATA, EMERGENCY_CONTACTS } from '@/lib/constants';
import { Button } from '@/components/ui/button';

export default function HelpPage() {
  return (
    <div className="space-y-6">
      {/* Emergency FAB (Mobile only) */}
      <a
        href={`tel:${EMERGENCY_CONTACTS.manager.number}`}
        className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110 md:hidden"
      >
        <Phone className="h-6 w-6" />
      </a>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            응급 연락처
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(EMERGENCY_CONTACTS).map(([key, contact]) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="font-medium">{contact.name}</p>
                {'description' in contact && contact.description && (
                  <p className="text-sm text-muted-foreground">
                    {contact.description}
                  </p>
                )}
              </div>
              <a
                href={`tel:${contact.number}`}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {contact.number}
              </a>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Safety Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            안전 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="mb-2 font-semibold">소화기 위치</h3>
            <div className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
              시설 레이아웃 이미지 (추가 예정)
            </div>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">시설 지도</h3>
            <div className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
              전체 시설 지도 (추가 예정)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            자주 묻는 질문
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {FAQ_DATA.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger>
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">
                      {faq.category}
                    </p>
                    <p className="font-medium">{faq.question}</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
