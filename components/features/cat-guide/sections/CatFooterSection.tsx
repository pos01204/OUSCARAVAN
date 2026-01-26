'use client';

import { CAT_GUIDE_DATA } from '@/lib/catGuide';
import { Button } from '@/components/ui/button';
import { PawPrintSimple, CatSilhouette } from '../CatIllustrations';

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
    <section className="text-center py-8" aria-label="마무리">
      {/* 발자국 장식 */}
      <div className="flex items-center justify-center gap-4 mb-5" aria-hidden="true">
        <PawPrintSimple className="w-2.5 h-2.5 text-cat-brown/15" />
        <div className="w-0.5 h-0.5 rounded-full bg-cat-brown/10" />
        <PawPrintSimple className="w-3 h-3 text-cat-brown/20" />
        <div className="w-0.5 h-0.5 rounded-full bg-cat-brown/10" />
        <PawPrintSimple className="w-2.5 h-2.5 text-cat-brown/15" />
      </div>

      {/* 감성 메시지 - 온글잎 박다현체 */}
      <p className="font-cat-body text-[13px] text-brand-dark leading-[1.8] whitespace-pre-line mb-5">
        {footer.message}
      </p>

      {/* 고양이 일러스트 */}
      <div className="mb-6">
        <CatSilhouette className="w-9 h-9 mx-auto text-cat-brown/30" />
      </div>

      {/* 닫기 버튼 - Paperlogy */}
      <Button
        variant="outline"
        onClick={onClose}
        className="font-cat px-8 py-2.5 rounded-full border-brand-cream-dark/30 text-brand-dark hover:bg-cat-cream/15 text-[13px] font-medium"
      >
        닫기
      </Button>
    </section>
  );
}
