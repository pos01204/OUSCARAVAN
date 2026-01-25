'use client';

import { Hospital, Storefront, ArrowSquareOut } from '@phosphor-icons/react';
import { EMERGENCY_CONTACTS } from '@/lib/constants';
import { logHelpEvent } from '@/lib/help-telemetry';

function NearbyTile({
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
      onClick={() => logHelpEvent('help_jump', { to: 'map', target: title })}
      className="
        group flex items-center gap-3
        rounded-xl border border-brand-cream-dark/25 bg-brand-cream/15
        px-4 py-3
        hover:bg-white hover:border-brand-cream-dark/40 transition-all duration-200
        active:scale-[0.99] motion-reduce:transform-none
      "
      aria-label={`${title} 지도 열기`}
    >
      <div className="w-10 h-10 rounded-lg bg-white border border-brand-cream-dark/20 flex items-center justify-center shrink-0 shadow-soft-sm">
        <Icon size={18} weight="duotone" className="text-brand-dark-soft" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-brand-dark tracking-tight">{title}</p>
        <p className="text-xs text-brand-dark-muted truncate mt-0.5">{description}</p>
      </div>

      <ArrowSquareOut
        size={16}
        weight="regular"
        className="text-brand-dark-faint group-hover:text-brand-dark-muted transition-colors shrink-0"
        aria-hidden="true"
      />
    </a>
  );
}

export function NearbyFacilities() {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <NearbyTile
        title="응급실"
        description="인천강화의료원"
        href={EMERGENCY_CONTACTS.hospital.mapLink}
        variant="hospital"
      />
      <NearbyTile
        title="편의점"
        description="가장 가까운"
        href={EMERGENCY_CONTACTS.convenienceStore.mapLink}
        variant="store"
      />
    </div>
  );
}

