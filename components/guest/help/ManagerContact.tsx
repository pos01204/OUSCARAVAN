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
            group flex items-center justify-between
            p-4 rounded-xl
            bg-neutral-50 hover:bg-neutral-100
            border border-neutral-200/80
            transition-all duration-200
            active:scale-[0.99] motion-reduce:transform-none
          "
          aria-label={`관리자에게 전화하기 ${EMERGENCY_CONTACTS.manager.number}`}
        >
          <div>
            <p className="text-xs text-neutral-400 mb-1">추가 문의가 필요하신가요?</p>
            <p className="font-medium text-neutral-800 tracking-tight">{EMERGENCY_CONTACTS.manager.number}</p>
          </div>

          <span className="text-xs font-medium text-neutral-500 group-hover:text-neutral-700 transition-colors">
            전화
          </span>
        </button>
      }
    />
  );
}
