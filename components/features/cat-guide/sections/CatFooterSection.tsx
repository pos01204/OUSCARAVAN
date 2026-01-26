'use client';

import { CAT_GUIDE_DATA } from '@/lib/catGuide';
import { Button } from '@/components/ui/button';
import { CatFaceHappy, PawPrintSimple } from '../CatIllustrations';

interface CatFooterSectionProps {
  onClose: () => void;
}

/**
 * 마무리 섹션
 * - 웃는 고양이 + 감성 메시지 + 닫기 버튼
 */
export function CatFooterSection({ onClose }: CatFooterSectionProps) {
  const { footer } = CAT_GUIDE_DATA;

  return (
    <section className="text-center py-8" aria-label="마무리">
      {/* 발자국 장식 */}
      <div className="flex items-center justify-center gap-4 mb-5" aria-hidden="true">
        <PawPrintSimple className="w-3 h-3 text-cat-brown/20" />
        <div className="w-1 h-1 rounded-full bg-cat-brown/15" />
        <PawPrintSimple className="w-3.5 h-3.5 text-cat-brown/25" />
        <div className="w-1 h-1 rounded-full bg-cat-brown/15" />
        <PawPrintSimple className="w-3 h-3 text-cat-brown/20" />
      </div>

      {/* 감성 메시지 - 온글잎 박다현체 (크기 키움) */}
      <p className="font-cat-body text-[15px] text-brand-dark leading-[1.9] whitespace-pre-line mb-6">
        {footer.message}
      </p>

      {/* 웃는 고양이 + 발자국 + 하트 일러스트 */}
      <div className="mb-7">
        <CatFaceHappy className="w-24 h-20 mx-auto text-cat-brown/50" />
      </div>

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
