'use client';

import { 
  FirstAidKit, 
  ShieldCheck, 
  Hospital, 
  Storefront,
  ArrowRight
} from '@phosphor-icons/react';
import { EMERGENCY_CONTACTS } from '@/lib/constants';

// 긴급 연락처 카드 - 럭셔리 미니멀 디자인
function EmergencyCard({
  number,
  description,
  href,
  variant,
}: {
  number: string;
  description: string;
  href: string;
  variant: 'fire' | 'police';
}) {
  const Icon = variant === 'fire' ? FirstAidKit : ShieldCheck;

  return (
    <a
      href={href}
      className="
        group flex items-center gap-4
        bg-neutral-900 hover:bg-neutral-800
        rounded-xl p-4
        transition-all duration-200
        active:scale-[0.99]
      "
      aria-label={`${description} ${number}번으로 전화하기`}
    >
      {/* 아이콘 */}
      <div className="
        w-11 h-11 rounded-lg
        bg-white/10
        flex items-center justify-center
        shrink-0
      ">
        <Icon size={22} weight="light" className="text-white/80" />
      </div>
      
      {/* 텍스트 */}
      <div className="flex-1 min-w-0">
        <p className="text-xl font-semibold text-white tracking-tight">{number}</p>
        <p className="text-xs text-white/50 mt-0.5">{description}</p>
      </div>

      {/* 화살표 */}
      <ArrowRight 
        size={18} 
        weight="regular" 
        className="text-white/40 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all shrink-0" 
      />
    </a>
  );
}

// 주변 시설 카드 - 미니멀 디자인
function NearbyFacilityCard({
  title,
  description,
  href,
  variant,
}: {
  title: string;
  description: string;
  href: string;
  variant: 'hospital' | 'store';
}) {
  const Icon = variant === 'hospital' ? Hospital : Storefront;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="
        group flex items-center gap-3
        p-3.5 rounded-xl
        bg-neutral-50 hover:bg-neutral-100
        border border-neutral-200/80
        transition-all duration-200
        active:scale-[0.99]
      "
      aria-label={`${title} 지도 보기`}
    >
      <div className="
        w-9 h-9 rounded-lg
        bg-white
        border border-neutral-200/80
        flex items-center justify-center
        shrink-0
      ">
        <Icon size={18} weight="light" className="text-neutral-500" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-neutral-800 text-sm">{title}</p>
        <p className="text-xs text-neutral-400 truncate">{description}</p>
      </div>
      
      <ArrowRight 
        size={14} 
        weight="regular" 
        className="text-neutral-300 group-hover:text-neutral-500 group-hover:translate-x-0.5 transition-all shrink-0" 
      />
    </a>
  );
}

export function EmergencyContacts() {
  return (
    <div className="space-y-8">
      {/* 긴급 연락처 섹션 */}
      <section aria-labelledby="emergency-title">
        <h2 id="emergency-title" className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">
          Emergency
        </h2>
        
        <div className="space-y-2.5">
          <EmergencyCard
            number="119"
            description="소방서 · 응급 구조"
            href={`tel:${EMERGENCY_CONTACTS.fire.number}`}
            variant="fire"
          />
          <EmergencyCard
            number="112"
            description="경찰서"
            href={`tel:${EMERGENCY_CONTACTS.police.number}`}
            variant="police"
          />
        </div>
      </section>

      {/* 주변 시설 섹션 */}
      <section aria-labelledby="nearby-title">
        <h2 id="nearby-title" className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">
          Nearby
        </h2>
        
        <div className="grid grid-cols-2 gap-2.5">
          <NearbyFacilityCard
            title="응급실"
            description="인천강화의료원"
            href={EMERGENCY_CONTACTS.hospital.mapLink}
            variant="hospital"
          />
          <NearbyFacilityCard
            title="편의점"
            description="가장 가까운"
            href={EMERGENCY_CONTACTS.convenienceStore.mapLink}
            variant="store"
          />
        </div>
      </section>
    </div>
  );
}
