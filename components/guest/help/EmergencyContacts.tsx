'use client';

import { ChevronRight, Flame, Shield, Building2, Store } from 'lucide-react';
import { EMERGENCY_CONTACTS } from '@/lib/constants';

const CONTACT_ITEMS = [
  {
    key: 'fire',
    icon: Flame,
    iconColor: 'text-red-500',
    label: '119',
    description: '소방서 · 응급 구조',
    href: `tel:${EMERGENCY_CONTACTS.fire.number}`,
    type: 'tel',
  },
  {
    key: 'police',
    icon: Shield,
    iconColor: 'text-blue-500',
    label: '112',
    description: '경찰서',
    href: `tel:${EMERGENCY_CONTACTS.police.number}`,
    type: 'tel',
  },
  {
    key: 'hospital',
    icon: Building2,
    iconColor: 'text-emerald-500',
    label: '응급실',
    description: '인천강화의료원 (가장 가까운 병원)',
    href: EMERGENCY_CONTACTS.hospital.mapLink,
    type: 'map',
  },
  {
    key: 'convenienceStore',
    icon: Store,
    iconColor: 'text-amber-500',
    label: '편의점',
    description: '가장 가까운 편의점',
    href: EMERGENCY_CONTACTS.convenienceStore.mapLink,
    type: 'map',
  },
];

export function EmergencyContacts() {
  return (
    <section className="-mx-4 px-4 py-6 bg-neutral-50 border-y border-neutral-200/60">
      <h2 className="text-lg font-bold text-neutral-900 mb-1">응급 연락처</h2>
      <p className="text-sm text-neutral-500 mb-4">긴급 상황 시 바로 연락하세요</p>
      
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {CONTACT_ITEMS.map((item, index) => {
          const Icon = item.icon;
          const isLast = index === CONTACT_ITEMS.length - 1;
          
          return (
            <a
              key={item.key}
              href={item.href}
              target={item.type === 'map' ? '_blank' : undefined}
              rel={item.type === 'map' ? 'noopener noreferrer' : undefined}
              className={`flex items-center justify-between px-4 py-4 hover:bg-neutral-50 transition-colors ${
                !isLast ? 'border-b border-neutral-100' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center ${item.iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">{item.label}</p>
                  <p className="text-sm text-neutral-500">{item.description}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-neutral-400" />
            </a>
          );
        })}
      </div>
    </section>
  );
}
