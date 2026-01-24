import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CARD_MOTION } from '@/lib/motion';

type MotionDivProps = React.ComponentPropsWithoutRef<typeof motion.div>;

interface GuestMotionCardProps extends MotionDivProps {
  interactive?: boolean;
  hoverLift?: boolean;
  pressScale?: boolean;
}

export function GuestMotionCard({
  children,
  className,
  interactive = true,
  hoverLift = true,
  pressScale = true,
  ...props
}: GuestMotionCardProps) {
  const reduceMotion = useReducedMotion();
  const allowMotion = interactive && !reduceMotion;

  return (
    <motion.div
      className={cn('will-change-transform', className)}
      whileHover={allowMotion && hoverLift ? CARD_MOTION.hover : undefined}
      whileTap={allowMotion && pressScale ? CARD_MOTION.tap : undefined}
      transition={CARD_MOTION.transition}
      {...props}
    >
      {children}
    </motion.div>
  );
}
