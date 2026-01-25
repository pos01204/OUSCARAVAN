'use client';

import { ArrowRight } from '@phosphor-icons/react';
import { EMERGENCY_CONTACTS } from '@/lib/constants';

export function ManagerContact() {
  return (
    <section aria-labelledby="manager-contact-title">
      <h2 id="manager-contact-title" className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">
        Contact
      </h2>
      
      <a
        href={`tel:${EMERGENCY_CONTACTS.manager.number}`}
        className="
          group flex items-center justify-between
          p-4 rounded-xl
          bg-neutral-50 hover:bg-neutral-100
          border border-neutral-200/80
          transition-all duration-200
          active:scale-[0.99]
        "
        aria-label={`관리자에게 전화하기 ${EMERGENCY_CONTACTS.manager.number}`}
      >
        <div>
          <p className="text-xs text-neutral-400 mb-1">
            추가 문의가 필요하신가요?
          </p>
          <p className="font-medium text-neutral-800 tracking-tight">
            {EMERGENCY_CONTACTS.manager.number}
          </p>
        </div>
        
        <ArrowRight 
          size={16} 
          weight="regular" 
          className="text-neutral-300 group-hover:text-neutral-500 group-hover:translate-x-0.5 transition-all shrink-0" 
        />
      </a>
    </section>
  );
}
