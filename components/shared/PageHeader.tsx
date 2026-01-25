'use client';

interface PageHeaderProps {
  title: string;
  subtitle?: string;  // 영문 서브타이틀 (HELP, GUIDE, BBQ & FIRE, CAFÉ)
  description?: string;
}

/**
 * 공통 페이지 헤더 컴포넌트 (모바일 최적화 브랜딩 버전)
 * - 모바일 safe area 고려한 충분한 상단 패딩
 * - 영문 서브타이틀로 세련된 국제적 감각
 * - 골드 악센트 바로 프리미엄 브랜드 아이덴티티 표현
 * - 하단 골드 그라데이션 라인으로 헤더 영역 구분
 */
export function PageHeader({ title, subtitle, description }: PageHeaderProps) {
  return (
    <header className="relative -mx-4 bg-gradient-to-b from-[#faf8f5] to-[#f5f3f0] mb-12 sm:mb-16">
      {/* 모바일 중심 + 데스크톱 정렬감 보강 */}
      <div className="mx-auto w-full max-w-[680px] px-5 pt-3 pb-10 sm:px-8 sm:pt-6 sm:pb-12">
        {/* 영문 서브타이틀 */}
        {subtitle && (
          <span className="block text-[11px] font-semibold tracking-[0.2em] text-[#C9A962] uppercase sm:text-xs sm:tracking-[0.22em]">
            {subtitle}
          </span>
        )}
        
        {/* 메인 타이틀 */}
        <h1 className={`text-[24px] font-bold text-[#2C2416] tracking-tight leading-tight sm:text-[28px] ${subtitle ? 'mt-1.5' : ''}`}>
          {title}
        </h1>
        
        {/* 골드 악센트 바 */}
        <div className="mt-3 w-10 h-[2px] bg-gradient-to-r from-[#C9A962] to-[#D4B87A] rounded-full sm:mt-4 sm:w-12" />
        
        {/* 설명 텍스트 */}
        {description && (
          <p className="mt-3 text-[13px] text-[#8B7355] leading-relaxed sm:mt-4 sm:text-sm">
            {description}
          </p>
        )}
      </div>
      
      {/* 하단 구분선 - 골드 그라데이션 */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A962]/50 to-transparent" />
    </header>
  );
}
