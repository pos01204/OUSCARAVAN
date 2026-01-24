import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GuestMotionCardProps extends React.HTMLAttributes<HTMLDivElement> {
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
      whileHover={allowMotion && hoverLift ? { y: -2 } : undefined}
      whileTap={allowMotion && pressScale ? { scale: 0.99 } : undefined}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
