'use client';

import { EMERGENCY_CONTACTS } from '@/lib/constants';
import { ManagerCallSheet } from './ManagerCallSheet';

export function ManagerContact() {
  return (
    <ManagerCallSheet
      source="contact_card"
      trigger={
        <button
          type="button"
          className="
            w-full text-left
            group flex items-center justify-between gap-4
            rounded-xl border border-brand-cream-dark/25 bg-white
            px-4 py-3.5
            hover:bg-brand-cream/15 hover:border-brand-cream-dark/40 transition-all duration-200
            active:scale-[0.99] motion-reduce:transform-none
          "
          aria-label={`관리자에게 전화하기 ${EMERGENCY_CONTACTS.manager.number}`}
        >
          <div>
            <p className="text-xs text-brand-dark-muted mb-1">추가 문의가 필요하신가요?</p>
            <p className="text-base font-semibold text-brand-dark tracking-tight">
              {EMERGENCY_CONTACTS.manager.number}
            </p>
          </div>

          <span className="inline-flex items-center justify-center rounded-full bg-brand-cream text-brand-dark text-xs font-semibold px-3.5 py-1.5 group-hover:bg-brand-cream-dark transition-colors shadow-soft-sm">
            전화
          </span>
        </button>
      }
    />
  );
}
