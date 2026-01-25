'use client';

import { 
  FirstAidKit, 
  ShieldCheck, 
  Hospital, 
  Storefront,
  CaretRight 
} from '@phosphor-icons/react';
import { EMERGENCY_CONTACTS } from '@/lib/constants';

// 긴급 연락처 카드 (119, 112)
function EmergencyCard({
  number,
  title,
  description,
  href,
  variant,
}: {
  number: string;
  title: string;
  description: string;
  href: string;
  variant: 'fire' | 'police';
}) {
  const styles = {
    fire: {
      gradient: 'from-red-50 to-orange-50',
      border: 'border-red-200/60',
      shadowColor: 'shadow-red-100/50',
      iconBg: 'bg-red-500',
      iconShadow: 'shadow-red-500/30',
      numberColor: 'text-red-600',
      descColor: 'text-red-700/70',
      hintColor: 'text-red-500/80',
      lineColor: 'bg-red-300',
      decorColor: 'bg-red-100/40',
    },
    police: {
      gradient: 'from-blue-50 to-indigo-50',
      border: 'border-blue-200/60',
      shadowColor: 'shadow-blue-100/50',
      iconBg: 'bg-blue-500',
      iconShadow: 'shadow-blue-500/30',
      numberColor: 'text-blue-600',
      descColor: 'text-blue-700/70',
      hintColor: 'text-blue-500/80',
      lineColor: 'bg-blue-300',
      decorColor: 'bg-blue-100/40',
    },
  };

  const s = styles[variant];
  const Icon = variant === 'fire' ? FirstAidKit : ShieldCheck;

  return (
    <a
      href={href}
      className={`
        relative overflow-hidden
        block rounded-2xl
        bg-gradient-to-br ${s.gradient}
        border ${s.border}
        shadow-sm ${s.shadowColor}
        p-5
        active:scale-[0.98] transition-transform duration-150
      `}
      aria-label={`${title} ${number}번으로 전화하기`}
    >
      {/* 배경 장식 */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 ${s.decorColor} rounded-full blur-2xl`} />
      
      {/* 아이콘 */}
      <div className={`
        w-14 h-14 rounded-xl
        ${s.iconBg}
        flex items-center justify-center
        shadow-lg ${s.iconShadow}
        mb-3
      `}>
        <Icon size={28} weight="duotone" className="text-white" />
      </div>
      
      {/* 번호 */}
      <p className={`text-3xl font-black ${s.numberColor} tracking-tight`}>{number}</p>
      <p className={`text-sm ${s.descColor} mt-0.5`}>{description}</p>
      
      {/* CTA 힌트 */}
      <div className={`mt-4 flex items-center gap-2 text-xs ${s.hintColor}`}>
        <div className={`w-8 h-0.5 ${s.lineColor} rounded-full`} />
        <span>탭하여 즉시 전화</span>
      </div>
    </a>
  );
}

// 주변 시설 카드 (응급실, 편의점)
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
  const styles = {
    hospital: {
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    store: {
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  };

  const s = styles[variant];
  const Icon = variant === 'hospital' ? Hospital : Storefront;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="
        flex flex-col
        p-4 rounded-xl
        bg-white
        border border-neutral-200
        shadow-sm
        hover:shadow-md hover:border-neutral-300
        active:scale-[0.98]
        transition-all duration-150
      "
      aria-label={`${title} 지도 보기`}
    >
      <div className={`
        w-11 h-11 rounded-lg
        ${s.iconBg}
        flex items-center justify-center
        mb-3
      `}>
        <Icon size={22} weight="duotone" className={s.iconColor} />
      </div>
      
      <p className="font-semibold text-neutral-900">{title}</p>
      <p className="text-sm text-neutral-500 mt-0.5">{description}</p>
      
      <div className="mt-3 flex items-center text-xs text-neutral-400">
        <span>지도 보기</span>
        <CaretRight size={14} weight="bold" className="ml-auto" />
      </div>
    </a>
  );
}

export function EmergencyContacts() {
  return (
    <div className="space-y-8">
      {/* 긴급 연락처 섹션 */}
      <section aria-labelledby="emergency-title">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg" aria-hidden="true">🚨</span>
          <h2 id="emergency-title" className="text-lg font-bold text-neutral-900">긴급 연락처</h2>
        </div>
        
        <div className="space-y-3">
          <EmergencyCard
            number="119"
            title="소방서"
            description="소방서 · 응급 구조"
            href={`tel:${EMERGENCY_CONTACTS.fire.number}`}
            variant="fire"
          />
          <EmergencyCard
            number="112"
            title="경찰서"
            description="경찰서"
            href={`tel:${EMERGENCY_CONTACTS.police.number}`}
            variant="police"
          />
        </div>
      </section>

      {/* 주변 시설 섹션 */}
      <section aria-labelledby="nearby-title">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg" aria-hidden="true">📍</span>
          <h2 id="nearby-title" className="text-lg font-bold text-neutral-900">주변 시설</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
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
