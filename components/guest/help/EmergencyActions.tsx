'use client';

import { FirstAidKit, ShieldCheck, Phone } from '@phosphor-icons/react';
import { EMERGENCY_CONTACTS } from '@/lib/constants';
import { logHelpEvent } from '@/lib/help-telemetry';

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
  const tint = variant === 'fire' ? 'bg-red-50/50' : 'bg-blue-50/50';
  const iconTint = variant === 'fire' ? 'text-red-600' : 'text-blue-600';

  return (
    <a
      href={href}
      onClick={() => logHelpEvent('help_call_outbound', { target: number, source: 'emergency_row' })}
      className={`
        group flex items-center gap-4
        rounded-xl px-4 py-3
        border border-neutral-200/70
        ${tint}
        hover:bg-white
        transition-colors duration-200
        active:scale-[0.99] motion-reduce:transform-none
      `}
      aria-label={`${description} ${number}번으로 전화하기`}
    >
      <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200/70 flex items-center justify-center shrink-0">
        <Icon size={18} weight="duotone" className={iconTint} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-base font-semibold text-neutral-900 tracking-tight">{number}</p>
        <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
      </div>

      <div className="h-9 w-9 rounded-full bg-neutral-900 text-white flex items-center justify-center shrink-0">
        <Phone size={16} weight="regular" aria-hidden="true" />
      </div>
    </a>
  );
}

export function EmergencyActions() {
  return (
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
  );
}

