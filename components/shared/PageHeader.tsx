'use client';

interface PageHeaderProps {
  title: string;
  subtitle?: string;  // 영문 서브타이틀 (HELP, GUIDE, BBQ & FIRE, CAFÉ)
}

/**
 * 공통 페이지 헤더 컴포넌트 (브랜드 톤 통일)
 * - 홈 페이지와 동일한 따뜻한 크림 톤
 * - 풀블리드 배경 제거로 가벼운 느낌
 * - 브랜드 색상 토큰 사용
 */
export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="mb-6 pt-1">
      {/* 영문 서브타이틀 */}
      {subtitle && (
        <span className="block text-[10px] font-semibold tracking-[0.18em] text-brand-cream-deep uppercase">
          {subtitle}
        </span>
      )}
      
      {/* 메인 타이틀 - Paperlogy 폰트 */}
      <h1 className={`font-heading text-xl font-bold text-brand-dark tracking-tight leading-tight ${subtitle ? 'mt-1' : ''}`}>
        {title}
      </h1>
      
      {/* 미니멀 구분선 - 브랜드 톤 */}
      <div className="mt-2 h-0.5 w-8 rounded-full bg-brand-cream-dark/50" />
    </header>
  );
}
