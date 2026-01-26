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
    <section className="text-center py-6" aria-label="마무리">
      {/* 발자국 장식 */}
      <div className="flex items-center justify-center gap-3 mb-4" aria-hidden="true">
        <PawPrintSimple className="w-3 h-3 text-cat-brown/20" />
        <div className="w-1 h-1 rounded-full bg-cat-brown/15" />
        <PawPrintSimple className="w-4 h-4 text-cat-brown/25" />
        <div className="w-1 h-1 rounded-full bg-cat-brown/15" />
        <PawPrintSimple className="w-3 h-3 text-cat-brown/20" />
      </div>

      {/* 감성 메시지 */}
      <p className="font-cat text-sm text-brand-dark leading-relaxed whitespace-pre-line mb-4">
        {footer.message}
      </p>

      {/* 고양이 일러스트 */}
      <div className="mb-5">
        <CatSilhouette className="w-10 h-10 mx-auto text-cat-brown/40" />
      </div>

      {/* 닫기 버튼 */}
      <Button
        variant="outline"
        onClick={onClose}
        className="px-6 py-2 rounded-full border-brand-cream-dark/40 text-brand-dark hover:bg-cat-cream/20 text-sm"
      >
        닫기
      </Button>
    </section>
  );
}
