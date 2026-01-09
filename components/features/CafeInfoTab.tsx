'use client';

import { MenuCarousel } from './MenuCarousel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Clock, Phone, Info } from 'lucide-react';
import { CAFE_INFO } from '@/lib/constants';

export function CafeInfoTab() {
  return (
    <div className="space-y-6" role="tabpanel" aria-label="카페 이용 안내">
      {/* 안내 배너 */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-lg bg-primary/20 shrink-0">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-foreground mb-2 text-base">
                카페 이용 안내
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                카페는 직접 방문하여 주문 및 수령해주세요. 앱을 통한 주문은 불가합니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 카페 메뉴 소개 */}
      <section aria-label="카페 메뉴" className="pt-2">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-1 w-1 rounded-full bg-primary"></div>
          <h2 className="text-2xl md:text-3xl font-heading font-black">메뉴</h2>
        </div>
        <MenuCarousel />
      </section>

      {/* 카페 정보 */}
      <section aria-label="카페 정보" className="pt-2">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">카페 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-start gap-3.5 p-3 rounded-lg hover:bg-muted/30 transition-colors">
              <div className="p-2 rounded-lg bg-muted/50 shrink-0">
                <MapPin className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className="font-semibold mb-1.5 text-sm">매장 위치</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{CAFE_INFO.address}</p>
                <p className="text-xs text-muted-foreground mt-1.5">(매장 방문 및 길 안내용)</p>
              </div>
            </div>
            <div className="flex items-start gap-3.5 p-3 rounded-lg hover:bg-muted/30 transition-colors">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className="font-semibold mb-1.5 text-sm">운영 시간</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  평일: {CAFE_INFO.hours.weekday}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  주말: {CAFE_INFO.hours.weekend}
                </p>
                <p className="mt-2 text-sm font-bold text-destructive">
                  {CAFE_INFO.hours.closed}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3.5 p-3 rounded-lg hover:bg-muted/30 transition-colors">
              <div className="p-2 rounded-lg bg-muted/50 shrink-0">
                <Phone className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className="font-semibold mb-1.5 text-sm">대표 전화번호</p>
                <a
                  href={`tel:${CAFE_INFO.phone.replace(/-/g, '')}`}
                  className="text-base text-primary hover:underline font-bold transition-all hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
                  aria-label={`${CAFE_INFO.phone}로 전화하기`}
                >
                  {CAFE_INFO.phone}
                </a>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {CAFE_INFO.business.phoneType}
                </p>
              </div>
            </div>
            
            {/* 사업자 정보 */}
            <div className="pt-5 border-t border-border/50">
              <p className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-wide">사업자 정보</p>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-start py-2 border-b border-border/30 last:border-0">
                  <span className="text-muted-foreground font-medium">상호명</span>
                  <span className="font-semibold text-right max-w-[60%]">{CAFE_INFO.business.businessName}</span>
                </div>
                <div className="flex justify-between items-start py-2 border-b border-border/30 last:border-0">
                  <span className="text-muted-foreground font-medium">대표자</span>
                  <span className="font-semibold">{CAFE_INFO.business.representative}</span>
                </div>
                <div className="flex justify-between items-start py-2 border-b border-border/30 last:border-0">
                  <span className="text-muted-foreground font-medium">사업자등록번호</span>
                  <span className="font-semibold font-mono">{CAFE_INFO.business.businessNumber}</span>
                </div>
                <div className="flex justify-between items-start py-2 border-b border-border/30 last:border-0">
                  <span className="text-muted-foreground font-medium">업태/종목</span>
                  <span className="font-semibold text-right max-w-[60%] leading-snug">{CAFE_INFO.business.businessCategory}</span>
                </div>
                <div className="pt-2">
                  <p className="text-muted-foreground mb-2 font-medium">사업장 주소 (등록)</p>
                  <p className="font-semibold text-xs leading-relaxed">{CAFE_INFO.business.registeredAddress}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
