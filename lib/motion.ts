export const MOTION_EASE = [0.22, 1, 0.36, 1] as const;

export const PAGE_ENTER = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.22, ease: MOTION_EASE },
} as const;

export const CARD_MOTION = {
  hover: { y: -2 },
  tap: { scale: 0.99 },
  transition: { duration: 0.2, ease: MOTION_EASE },
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
