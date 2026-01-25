'use client';

interface PageHeaderProps {
  title: string;
  description?: string;
}

/**
 * 공통 페이지 헤더 컴포넌트 (모바일 최적화)
 * 배경색 + 하단 구분선으로 헤더 영역을 확실히 구분
 */
export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="-mx-4 -mt-4 px-4 pt-6 pb-8 bg-[#f5f3f0] border-b-2 border-[#e8e4df] shadow-[0_4px_12px_rgba(0,0,0,0.04)] mb-10">
      <h1 className="text-[22px] font-bold text-neutral-900 tracking-tight leading-tight">
        {title}
      </h1>
      {description && (
        <p className="mt-3 text-[13px] text-neutral-500 leading-relaxed">
          {description}
        </p>
      )}
    </header>
  );
}
