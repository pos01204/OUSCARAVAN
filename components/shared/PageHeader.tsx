'use client';

interface PageHeaderProps {
  title: string;
  description?: string;
}

/**
 * 공통 페이지 헤더 컴포넌트
 * 배경색으로 헤더 영역을 시각적으로 구분하는 Option C 스타일
 */
export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="-mx-4 px-4 py-5 bg-neutral-50 border-b border-neutral-200/60 mb-4">
      <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
        {title}
      </h1>
      {description && (
        <p className="mt-1.5 text-sm text-neutral-500">
          {description}
        </p>
      )}
    </header>
  );
}
