'use client';

import { ChevronRight, Phone } from 'lucide-react';
import { EMERGENCY_CONTACTS } from '@/lib/constants';

export function ManagerContact() {
  return (
    <section className="py-2">
      <h2 className="text-lg font-bold text-neutral-900 mb-4">관리자 연락</h2>
      
      <a
        href={`tel:${EMERGENCY_CONTACTS.manager.number}`}
        className="block bg-white rounded-xl border border-neutral-200 p-4 hover:bg-neutral-50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
              <Phone className="h-5 w-5 text-neutral-500" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 mb-0.5">문의사항이 있으시면 연락주세요</p>
              <p className="font-semibold text-neutral-900">{EMERGENCY_CONTACTS.manager.number}</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-neutral-400" />
        </div>
      </a>
    </section>
  );
}
