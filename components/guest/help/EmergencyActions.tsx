'use client';

import { motion } from 'framer-motion';
import { FirstAidKit, ShieldCheck, Phone } from '@phosphor-icons/react';
import { EMERGENCY_CONTACTS } from '@/lib/constants';
import { logHelpEvent } from '@/lib/help-telemetry';

const ITEM_VARIANTS = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

function EmergencyRow({
  number,
  description,
  href,
  variant,
  index,
}: {
  number: string;
  description: string;
  href: string;
  variant: 'fire' | 'police';
  index: number;
}) {
  const Icon = variant === 'fire' ? FirstAidKit : ShieldCheck;
  const tint = variant === 'fire' ? 'bg-red-50' : 'bg-blue-50';
  const iconBg = variant === 'fire' ? 'bg-red-100' : 'bg-blue-100';
  const iconTint = variant === 'fire' ? 'text-red-600' : 'text-blue-600';
  const borderTint = variant === 'fire' ? 'border-red-200/60' : 'border-blue-200/60';

  return (
    <motion.a
      href={href}
      onClick={() => logHelpEvent('help_call_outbound', { target: number, source: 'emergency_row' })}
      variants={ITEM_VARIANTS}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={{ scale: 1.01, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
      whileTap={{ scale: 0.98 }}
      className={`
        group flex items-center gap-4
        rounded-xl px-4 py-4
        border ${borderTint}
        ${tint}
        transition-colors duration-200
      `}
      aria-label={`${description} ${number}번으로 전화하기`}
    >
      <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
        <Icon size={22} weight="duotone" className={iconTint} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xl font-bold text-brand-dark tracking-tight">{number}</p>
        <p className="text-xs text-brand-dark-muted mt-0.5">{description}</p>
      </div>

      <motion.div 
        className="h-10 w-10 rounded-full bg-brand-dark text-white flex items-center justify-center shrink-0"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Phone size={18} weight="regular" aria-hidden="true" />
      </motion.div>
    </motion.a>
  );
}

export function EmergencyActions() {
  return (
    <div className="space-y-3">
      <EmergencyRow
        number="119"
        description="소방서 · 응급 구조"
        href={`tel:${EMERGENCY_CONTACTS.fire.number}`}
        variant="fire"
        index={0}
      />
      <EmergencyRow
        number="112"
        description="경찰서"
        href={`tel:${EMERGENCY_CONTACTS.police.number}`}
        variant="police"
        index={1}
      />
    </div>
  );
}
