'use client';

import { motion } from 'framer-motion';
import { Hospital, Storefront, ArrowSquareOut, Car } from '@phosphor-icons/react';
import { EMERGENCY_CONTACTS } from '@/lib/constants';
import { logHelpEvent } from '@/lib/help-telemetry';

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

function NearbyTile({
  title,
  subtitle,
  distance,
  href,
  variant,
  index,
}: {
  title: string;
  subtitle: string;
  distance: string;
  href: string;
  variant: 'hospital' | 'store';
  index: number;
}) {
  const Icon = variant === 'hospital' ? Hospital : Storefront;
  const iconBg = variant === 'hospital' ? 'bg-red-50' : 'bg-amber-50';
  const iconColor = variant === 'hospital' ? 'text-red-500' : 'text-amber-600';

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => logHelpEvent('help_jump', { to: 'map', target: title })}
      variants={ITEM_VARIANTS}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
      whileTap={{ scale: 0.98 }}
      className="
        group flex items-center gap-4
        rounded-xl border border-brand-cream-dark/25 bg-white
        px-4 py-4
        transition-colors duration-200
      "
      aria-label={`${title} 지도 열기`}
    >
      <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
        <Icon size={22} weight="duotone" className={iconColor} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-brand-dark tracking-tight">{title}</p>
        <p className="text-xs text-brand-dark-muted mt-0.5">{subtitle}</p>
        <div className="flex items-center gap-1 mt-1.5">
          <Car size={12} weight="regular" className="text-brand-dark-faint" />
          <span className="text-[11px] text-brand-dark-faint">{distance}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-brand-dark-muted group-hover:text-brand-dark transition-colors">
        <span className="text-xs font-medium">지도</span>
        <ArrowSquareOut size={14} weight="regular" aria-hidden="true" />
      </div>
    </motion.a>
  );
}

export function NearbyFacilities() {
  return (
    <div className="space-y-2.5">
      <NearbyTile
        title="응급실"
        subtitle={EMERGENCY_CONTACTS.hospital.fullName}
        distance={EMERGENCY_CONTACTS.hospital.distance}
        href={EMERGENCY_CONTACTS.hospital.mapLink}
        variant="hospital"
        index={0}
      />
      <NearbyTile
        title="편의점"
        subtitle={EMERGENCY_CONTACTS.convenienceStore.fullName}
        distance={EMERGENCY_CONTACTS.convenienceStore.distance}
        href={EMERGENCY_CONTACTS.convenienceStore.mapLink}
        variant="store"
        index={1}
      />
    </div>
  );
}

