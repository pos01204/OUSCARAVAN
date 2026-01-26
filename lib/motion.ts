export const MOTION_EASE = [0.22, 1, 0.36, 1] as const;
export const MOTION_EASE_BOUNCE = [0.34, 1.56, 0.64, 1] as const;

export const PAGE_ENTER = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.22, ease: MOTION_EASE },
} as const;

// 기본 카드 모션
export const CARD_MOTION = {
  hover: { y: -2 },
  tap: { scale: 0.99 },
  transition: { duration: 0.2, ease: MOTION_EASE },
} as const;

// 스프링 기반 카드 모션 (더 자연스러운 느낌)
export const CARD_SPRING = {
  hover: { y: -3, transition: { type: 'spring', stiffness: 400, damping: 25 } },
  tap: { scale: 0.98, transition: { type: 'spring', stiffness: 500, damping: 30 } },
} as const;

// 부드러운 리프트 효과 (CTA 카드용)
export const CARD_LIFT = {
  hover: { 
    y: -4, 
    boxShadow: '0 12px 24px rgba(26, 23, 20, 0.1), 0 4px 8px rgba(26, 23, 20, 0.05)',
    transition: { duration: 0.25, ease: MOTION_EASE }
  },
  tap: { 
    y: -2, 
    scale: 0.99,
    transition: { duration: 0.1 }
  },
} as const;

// 프리미엄 카드 모션 (섬세한 반응)
export const CARD_PREMIUM = {
  hover: { 
    y: -2,
    transition: { type: 'spring', stiffness: 300, damping: 20 }
  },
  tap: { 
    scale: 0.995,
    transition: { type: 'spring', stiffness: 500, damping: 30 }
  },
} as const;

// 빠른 버튼/아이콘 피드백
export const QUICK_PRESS = {
  tap: { scale: 0.95 },
  transition: { duration: 0.1, ease: MOTION_EASE },
} as const;

// 아이콘 호버 효과
export const ICON_HOVER = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
  transition: { type: 'spring', stiffness: 400, damping: 17 },
} as const;

export const LIST_STAGGER = {
  container: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  },
  item: {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: MOTION_EASE } },
  },
} as const;

// 카드 그리드용 스태거 (더 느린 딜레이)
export const CARD_STAGGER = {
  container: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  },
  item: {
    hidden: { opacity: 0, y: 12 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring', stiffness: 300, damping: 24 } 
    },
  },
} as const;

// 섹션 스크롤 페이드인 (whileInView용)
export const SECTION_FADE_IN = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5, ease: MOTION_EASE },
} as const;

// ═══════════════════════════════════════════════════
// 고양이 가이드 전용 모션
// ═══════════════════════════════════════════════════

export const CAT_MOTION = {
  // 발자국 floating
  pawFloat: {
    animate: {
      y: [0, -8, 0],
      rotate: [-5, 5, -5],
      transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
    },
  },
  // 고양이 breathing
  catBreathing: {
    animate: {
      scale: [1, 1.03, 1],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
  },
  // 발자국 trail (stagger)
  pawTrail: {
    container: {
      animate: { transition: { staggerChildren: 0.3 } },
    },
    item: {
      animate: {
        opacity: [0.4, 1, 0.4],
        scale: [0.9, 1, 0.9],
        transition: { duration: 2, repeat: Infinity },
      },
    },
  },
  // 버튼 pulse
  buttonPulse: {
    animate: {
      scale: [1, 1.02, 1],
      transition: { duration: 2, repeat: Infinity },
    },
  },
  // 캐릭터 카드 bounce
  characterBounce: {
    whileTap: { scale: 0.92, rotate: [-3, 3, 0] },
    transition: { type: 'spring', stiffness: 500, damping: 15 },
  },
  // 스텝 카드 stagger
  stepContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.25, delayChildren: 0.1 },
    },
  },
  stepItem: {
    hidden: { opacity: 0, x: -20, scale: 0.95 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 100, damping: 15 },
    },
  },
  // 진입 카드 호버
  catCardHover: {
    whileHover: {
      y: -4,
      boxShadow: '0 12px 30px rgba(251, 146, 60, 0.2), 0 4px 12px rgba(244, 114, 182, 0.15)',
      transition: { duration: 0.3, ease: MOTION_EASE },
    },
    whileTap: {
      scale: 0.98,
      transition: { duration: 0.1 },
    },
  },
} as const;
