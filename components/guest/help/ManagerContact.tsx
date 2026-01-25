'use client';

import { ChatCircle, Phone } from '@phosphor-icons/react';
import { EMERGENCY_CONTACTS } from '@/lib/constants';

export function ManagerContact() {
  return (
    <section aria-labelledby="manager-contact-title">
      <h2 id="manager-contact-title" className="sr-only">관리자 연락</h2>
      
      <a
        href={`tel:${EMERGENCY_CONTACTS.manager.number}`}
        className="
          flex items-center gap-4
          p-4 rounded-2xl
          bg-neutral-100
          border border-neutral-200/60
          hover:bg-neutral-150
          active:scale-[0.99]
          transition-all duration-150
        "
        aria-label={`관리자에게 전화하기 ${EMERGENCY_CONTACTS.manager.number}`}
      >
        <div className="
          w-11 h-11 rounded-full
          bg-neutral-200
          flex items-center justify-center
          shrink-0
        ">
          <ChatCircle size={22} weight="fill" className="text-neutral-500" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-xs text-neutral-500 mb-0.5">
            추가 문의가 필요하신가요?
          </p>
          <p className="font-semibold text-neutral-800 text-sm">
            {EMERGENCY_CONTACTS.manager.number}
          </p>
        </div>
        
        <div className="w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center shrink-0">
          <Phone size={16} weight="fill" className="text-white" />
        </div>
      </a>
    </section>
  );
}
