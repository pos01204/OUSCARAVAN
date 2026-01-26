'use client';

import { CAT_GUIDE_DATA } from '@/lib/catGuide';
import { Button } from '@/components/ui/button';

interface CatFooterSectionProps {
  onClose: () => void;
}

/**
 * 마무리 섹션
 * - 감성 메시지 + 닫기 버튼
 */
export function CatFooterSection({ onClose }: CatFooterSectionProps) {
  const { footer } = CAT_GUIDE_DATA;

  return (
    <section className="text-center py-6" aria-label="마무리">
      {/* 구분선 */}
      <div className="mx-auto w-10 h-px bg-cat-brown/15 mb-6" />

      {/* 감성 메시지 - 온글잎 박다현체 */}
      <p className="font-cat-body text-[15px] text-brand-dark leading-[1.9] whitespace-pre-line mb-8">
        {footer.message}
      </p>

      {/* 닫기 버튼 - Paperlogy */}
      <Button
        variant="outline"
        onClick={onClose}
        className="font-cat px-8 py-2.5 rounded-full border-cat-brown/20 text-brand-dark hover:bg-cat-cream/20 text-sm font-medium"
      >
        닫기
      </Button>
    </section>
  );
}
