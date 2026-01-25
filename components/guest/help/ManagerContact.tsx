'use client';

import { ChatCircle, CaretRight } from '@phosphor-icons/react';
import { EMERGENCY_CONTACTS } from '@/lib/constants';

export function ManagerContact() {
  return (
    <section aria-labelledby="manager-contact-title">
      <h2 id="manager-contact-title" className="sr-only">관리자 연락</h2>
      
      <a
        href={`tel:${EMERGENCY_CONTACTS.manager.number}`}
        className="
          block
          p-5 rounded-2xl
          bg-neutral-100
          border border-neutral-200/50
          hover:bg-neutral-150
          active:scale-[0.99]
          transition-all duration-150
        "
        aria-label={`관리자에게 전화하기 ${EMERGENCY_CONTACTS.manager.number}`}
      >
        <div className="flex items-start gap-3">
          <div className="
            w-10 h-10 rounded-full
            bg-neutral-200
            flex items-center justify-center
            shrink-0
          ">
            <ChatCircle size={20} weight="regular" className="text-neutral-500" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm text-neutral-500 mb-1">
              추가 문의가 필요하신가요?
            </p>
            <p className="font-semibold text-neutral-800">
              관리자에게 연락하기
            </p>
            <p className="text-sm text-neutral-600 mt-1">
              {EMERGENCY_CONTACTS.manager.number}
            </p>
          </div>
          
          <CaretRight size={20} weight="bold" className="text-neutral-400 mt-2 shrink-0" />
        </div>
      </a>
    </section>
  );
}
