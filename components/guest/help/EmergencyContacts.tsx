'use client';

import { 
  FirstAidKit, 
  ShieldCheck, 
  Hospital, 
  Storefront,
  Phone,
  MapPin
} from '@phosphor-icons/react';
import { EMERGENCY_CONTACTS } from '@/lib/constants';

// 긴급 연락처 카드 (119, 112) - 가로형 컴팩트 디자인
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
  const styles = {
    fire: {
      bg: 'bg-red-500',
      hoverBg: 'hover:bg-red-600',
      iconBg: 'bg-white/20',
      ring: 'ring-red-400/30',
    },
    police: {
      bg: 'bg-blue-500',
      hoverBg: 'hover:bg-blue-600',
      iconBg: 'bg-white/20',
      ring: 'ring-blue-400/30',
    },
  };

  const s = styles[variant];
  const Icon = variant === 'fire' ? FirstAidKit : ShieldCheck;

  return (
    <a
      href={href}
      className={`
        flex items-center gap-4
        ${s.bg} ${s.hoverBg}
        rounded-2xl p-4
        ring-1 ${s.ring}
        shadow-lg
        active:scale-[0.98] transition-all duration-150
      `}
      aria-label={`${description} ${number}번으로 전화하기`}
    >
      {/* 아이콘 */}
      <div className={`
        w-12 h-12 rounded-xl
        ${s.iconBg}
        flex items-center justify-center
        shrink-0
      `}>
        <Icon size={26} weight="fill" className="text-white" />
      </div>
      
      {/* 텍스트 */}
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold text-white tracking-tight">{number}</p>
        <p className="text-sm text-white/80">{description}</p>
      </div>

      {/* 전화 아이콘 */}
      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
        <Phone size={20} weight="fill" className="text-white" />
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
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      hoverBorder: 'hover:border-emerald-300',
    },
    store: {
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      hoverBorder: 'hover:border-amber-300',
    },
  };

  const s = styles[variant];
  const Icon = variant === 'hospital' ? Hospital : Storefront;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        flex items-center gap-3
        p-4 rounded-xl
        bg-white
        border border-neutral-200
        shadow-sm
        hover:shadow-md ${s.hoverBorder}
        active:scale-[0.98]
        transition-all duration-150
      `}
      aria-label={`${title} 지도 보기`}
    >
      <div className={`
        w-10 h-10 rounded-lg
        ${s.iconBg}
        flex items-center justify-center
        shrink-0
      `}>
        <Icon size={20} weight="duotone" className={s.iconColor} />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-neutral-900 text-sm">{title}</p>
        <p className="text-xs text-neutral-500 truncate">{description}</p>
      </div>
      
      <MapPin size={16} weight="bold" className="text-neutral-400 shrink-0" />
    </a>
  );
}

export function EmergencyContacts() {
  return (
    <div className="space-y-6">
      {/* 긴급 연락처 섹션 */}
      <section aria-labelledby="emergency-title">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base" aria-hidden="true">🚨</span>
          <h2 id="emergency-title" className="text-base font-bold text-neutral-900">긴급 연락처</h2>
        </div>
        
        <div className="space-y-3">
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
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base" aria-hidden="true">📍</span>
          <h2 id="nearby-title" className="text-base font-bold text-neutral-900">주변 시설</h2>
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
