'use client';

import { motion } from 'framer-motion';
import { Clock, Phone } from '@phosphor-icons/react';
import { EMERGENCY_CONTACTS } from '@/lib/constants';
import { ManagerCallSheet } from './ManagerCallSheet';

export function ManagerContact() {
  return (
    <div className="space-y-3">
      {/* 응답 시간 안내 */}
      <div className="flex items-center gap-2 px-1">
        <Clock size={14} weight="regular" className="text-brand-dark-muted" />
        <p className="text-xs text-brand-dark-muted">
          응답 가능 시간: <span className="font-medium text-brand-dark">09:00 - 22:00</span>
        </p>
      </div>

      {/* 전화 버튼 */}
      <ManagerCallSheet
        source="contact_card"
        trigger={
          <motion.button
            type="button"
            whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
            whileTap={{ scale: 0.98 }}
            className="
              w-full text-left
              group flex items-center justify-between gap-4
              rounded-xl border border-brand-cream-dark/25 bg-white
              px-4 py-4
              transition-colors duration-200
            "
            aria-label={`관리자에게 전화하기 ${EMERGENCY_CONTACTS.manager.number}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-cream/50 flex items-center justify-center">
                <Phone size={18} weight="duotone" className="text-brand-dark-soft" />
              </div>
              <div>
                <p className="text-xs text-brand-dark-muted mb-0.5">추가 문의가 필요하신가요?</p>
                <p className="text-base font-semibold text-brand-dark tracking-tight">
                  {EMERGENCY_CONTACTS.manager.number}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center justify-center rounded-full bg-brand-dark text-white text-xs font-semibold px-4 py-2 group-hover:bg-brand-dark-soft transition-colors">
              전화
            </span>
          </motion.button>
        }
      />

      {/* FAQ 확인 유도 */}
      <p className="text-[11px] text-brand-dark-faint text-center">
        연락 전 상단의 자주 묻는 질문을 먼저 확인해주세요
      </p>
    </div>
  );
}
