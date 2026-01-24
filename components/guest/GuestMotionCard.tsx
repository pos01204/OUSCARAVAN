import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CARD_MOTION, CARD_SPRING, CARD_LIFT, CARD_PREMIUM } from '@/lib/motion';

type MotionDivProps = React.ComponentPropsWithoutRef<typeof motion.div>;
type MotionMode = 'default' | 'spring' | 'lift' | 'premium';
type MotionPreset = {
  hover?: MotionDivProps['whileHover'];
  tap?: MotionDivProps['whileTap'];
  transition?: MotionDivProps['transition'];
};

interface GuestMotionCardProps extends MotionDivProps {
  interactive?: boolean;
  hoverLift?: boolean;
  pressScale?: boolean;
  /** 모션 모드: default(기본), spring(탄성), lift(리프트+그림자), premium(섬세) */
  motionMode?: MotionMode;
}

const motionPresets: Record<MotionMode, MotionPreset> = {
  default: CARD_MOTION,
  spring: CARD_SPRING,
  lift: CARD_LIFT,
  premium: CARD_PREMIUM,
};

export function GuestMotionCard({
  children,
  className,
  interactive = true,
  hoverLift = true,
  pressScale = true,
  motionMode = 'default',
  ...props
}: GuestMotionCardProps) {
  const reduceMotion = useReducedMotion();
  const allowMotion = interactive && !reduceMotion;
  const preset = motionPresets[motionMode];

  return (
    <motion.div
      className={cn('will-change-transform', className)}
      whileHover={allowMotion && hoverLift ? preset.hover : undefined}
      whileTap={allowMotion && pressScale ? preset.tap : undefined}
      transition={'transition' in preset ? preset.transition : CARD_MOTION.transition}
      {...props}
    >
      {children}
    </motion.div>
  );
}
