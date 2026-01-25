'use client';

interface PageHeaderProps {
  title: string;
  subtitle?: string;  // 영문 서브타이틀 (HELP, GUIDE, BBQ & FIRE, CAFÉ)
}

/**
 * 공통 페이지 헤더 컴포넌트 (모바일 최적화 브랜딩 버전)
 * - 모바일 safe area 고려한 충분한 상단 패딩
 * - 영문 서브타이틀로 세련된 국제적 감각
 * - 골드 악센트 바로 프리미엄 브랜드 아이덴티티 표현
 * - 하단 골드 그라데이션 라인으로 헤더 영역 구분
 */
export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="relative -mx-4 bg-[#f7f5f2] border-b border-[#e8e4df] mb-8">
      {/* 모바일 기준 정렬감 + 상단 여백 최소화 */}
      <div className="px-4 pt-1 pb-5">
        {/* 영문 서브타이틀 */}
        {subtitle && (
          <span className="block text-[10px] font-semibold tracking-[0.18em] text-[#9a7a3b] uppercase">
            {subtitle}
          </span>
        )}
        
        {/* 메인 타이틀 */}
        <h1 className={`text-[22px] font-bold text-[#2C2416] tracking-tight leading-tight ${subtitle ? 'mt-1.5' : ''}`}>
          {title}
        </h1>
        
        {/* 미니멀 구분선 */}
        <div className="mt-3 w-8 h-[2px] bg-[#c9b892]" />
        
      </div>
    </header>
  );
}
