/* eslint-disable react/no-unescaped-entities */
'use client';

import {
  FirstAidKit,
  ShieldCheck,
  Hospital,
  Storefront,
  Phone,
  ArrowRight,
} from '@phosphor-icons/react';
import { EMERGENCY_CONTACTS } from '@/lib/constants';

// 긴급 연락처 Row — “행동=전화”를 명확히
function EmergencyRow({
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
  const tint = variant === 'fire' ? 'bg-red-50/40' : 'bg-blue-50/40';
  const iconTint = variant === 'fire' ? 'text-red-600' : 'text-blue-600';

  return (
    <a
      href={href}
      className={`
        group flex items-center gap-4
        rounded-xl px-4 py-3
        border border-neutral-200/70
        ${tint}
        hover:bg-neutral-50
        transition-colors duration-200
        active:scale-[0.99] motion-reduce:transform-none
      `}
      aria-label={`${description} ${number}번으로 전화하기`}
    >
      {/* 아이콘 */}
      <div
        className="
          w-10 h-10 rounded-lg
          bg-white
          border border-neutral-200/70
          flex items-center justify-center
          shrink-0
        "
      >
        <Icon size={18} weight="duotone" className={iconTint} />
      </div>
      
      {/* 텍스트 */}
      <div className="flex-1 min-w-0">
        <p className="text-base font-semibold text-neutral-900 tracking-tight">{number}</p>
        <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
      </div>

      {/* 행동(전화) */}
      <div className="h-9 w-9 rounded-full bg-neutral-900 text-white flex items-center justify-center shrink-0">
        <Phone size={16} weight="regular" aria-hidden="true" />
      </div>
    </a>
  );
}

// 주변 시설 카드 — “행동=지도 열기”
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
    <div className="space-y-6">
      <div className="space-y-2.5">
        <EmergencyRow
          number="119"
          description="소방서 · 응급 구조"
          href={`tel:${EMERGENCY_CONTACTS.fire.number}`}
          variant="fire"
        />
        <EmergencyRow
          number="112"
          description="경찰서"
          href={`tel:${EMERGENCY_CONTACTS.police.number}`}
          variant="police"
        />
      </div>

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
    </div>
  );
}
