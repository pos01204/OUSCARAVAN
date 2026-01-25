'use client';

import { motion } from 'framer-motion';
import { BrandMediaLayer } from '@/components/guest/BrandMediaLayer';
import { GUEST_BRAND_MEDIA } from '@/lib/brand';
import { WELCOME_MESSAGE } from '@/lib/constants';
import { PAGE_ENTER } from '@/lib/motion';
import { formatYmd } from '@/lib/utils/date';

interface HeroSectionProps {
  guestName: string;
  checkin?: string;
  checkout?: string;
  eyebrow: string;
  subtitle: string;
  waveLineClass: string;
}

export function HeroSection({
  guestName,
  checkin,
  checkout,
  eyebrow,
  subtitle,
  waveLineClass,
}: HeroSectionProps) {
  const stayRange =
    checkin && checkout
      ? `${formatYmd(checkin)} — ${formatYmd(checkout)}`
      : null;

  return (
    <motion.section
      initial={PAGE_ENTER.initial}
      animate={PAGE_ENTER.animate}
      transition={PAGE_ENTER.transition}
      className="hero-card relative overflow-hidden rounded-2xl p-8 md:p-10 text-center"
      aria-label="환영 메시지"
    >
      <BrandMediaLayer
        imageSrc={GUEST_BRAND_MEDIA.heroImageSrc}
        videoSrc={GUEST_BRAND_MEDIA.heroVideoSrc}
        alt="OUS 브랜드 히어로"
        fit="cover"
        overlayClassName="bg-white/10"
        priority
      />
      
      <p className="text-[11px] font-medium tracking-[0.25em] text-muted-foreground uppercase relative z-10 mb-3">
        {eyebrow}
      </p>
      
      <h1 className="font-heading text-2xl md:text-3xl font-bold text-brand-dark relative z-10 tracking-tight">
        {WELCOME_MESSAGE.korean.replace('{name}', guestName)}
      </h1>
      
      <div className={`mx-auto ${waveLineClass} relative z-10`} aria-hidden="true" />
      
      <p className="mt-4 text-sm text-muted-foreground relative z-10 leading-relaxed">
        {subtitle}
      </p>
      
      {stayRange && (
        <div className="mt-4 relative z-10">
          <span className="hero-date-badge">
            {stayRange}
          </span>
        </div>
      )}
    </motion.section>
  );
}
