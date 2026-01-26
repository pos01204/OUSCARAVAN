'use client';

import { cn } from '@/lib/utils';

interface IllustrationProps {
  className?: string;
}

/**
 * 고양이와 밥그릇 - 히어로/메인용
 */
export function CatWithBowl({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 120 100"
      fill="none"
      className={cn('w-24 h-20', className)}
      aria-hidden="true"
    >
      {/* 몸통 */}
      <ellipse cx="55" cy="70" rx="30" ry="20" stroke="currentColor" strokeWidth="2" />
      {/* 머리 */}
      <circle cx="75" cy="45" r="20" stroke="currentColor" strokeWidth="2" />
      {/* 귀 */}
      <path d="M62 30L67 15L75 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M88 30L83 15L75 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* 눈 */}
      <circle cx="70" cy="43" r="2" fill="currentColor" />
      <circle cx="80" cy="43" r="2" fill="currentColor" />
      {/* 코 */}
      <ellipse cx="75" cy="50" rx="2" ry="1.5" fill="currentColor" />
      {/* 입 */}
      <path d="M73 52C73 54 77 54 77 52" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* 수염 */}
      <path d="M62 47H68M62 50H66" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M88 47H82M88 50H84" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* 꼬리 */}
      <path d="M25 65C15 55 15 75 25 80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* 밥그릇 */}
      <ellipse cx="95" cy="78" rx="15" ry="8" stroke="currentColor" strokeWidth="2" />
      <ellipse cx="95" cy="75" rx="12" ry="5" stroke="currentColor" strokeWidth="1.5" />
      {/* 밥그릇 안 생선 */}
      <ellipse cx="95" cy="73" rx="6" ry="3" fill="currentColor" opacity="0.3" />
      <path d="M100 73L104 71L104 75L100 73Z" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

/**
 * 츄르 먹는 고양이 - 간식 섹션용
 */
export function CatWithChuru({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 80 100"
      fill="none"
      className={cn('w-16 h-20', className)}
      aria-hidden="true"
    >
      {/* 몸통 */}
      <ellipse cx="35" cy="75" rx="22" ry="15" stroke="currentColor" strokeWidth="2" />
      {/* 앞발 */}
      <path d="M48 68C55 65 60 70 58 78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* 머리 */}
      <circle cx="40" cy="45" r="18" stroke="currentColor" strokeWidth="2" />
      {/* 귀 */}
      <path d="M28 32L32 18L40 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M52 32L48 18L40 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* 눈 (행복하게 감은 눈) */}
      <path d="M33 42C35 40 37 42 35 44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M47 42C45 40 43 42 45 44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* 코 */}
      <ellipse cx="40" cy="49" rx="2" ry="1.5" fill="currentColor" />
      {/* 입 (츄르 먹는 중) */}
      <ellipse cx="40" cy="54" rx="3" ry="2" stroke="currentColor" strokeWidth="1.5" />
      {/* 수염 */}
      <path d="M28 47H34M28 50H32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M52 47H46M52 50H48" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* 츄르 */}
      <rect x="55" y="45" width="8" height="25" rx="3" stroke="currentColor" strokeWidth="2" />
      <text x="57" y="60" fontSize="6" fill="currentColor" opacity="0.6">C</text>
      <text x="57" y="66" fontSize="6" fill="currentColor" opacity="0.6">h</text>
    </svg>
  );
}

/**
 * 웃는 고양이 얼굴 + 발자국 + 하트 - 푸터/마무리용
 */
export function CatFaceHappy({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 100 80"
      fill="none"
      className={cn('w-20 h-16', className)}
      aria-hidden="true"
    >
      {/* 고양이 얼굴 */}
      <circle cx="40" cy="40" r="25" stroke="currentColor" strokeWidth="2" />
      {/* 귀 */}
      <path d="M22 22L27 5L38 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M58 22L53 5L42 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* 눈 (웃는 눈) */}
      <path d="M30 38C32 35 36 35 34 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M50 38C48 35 44 35 46 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* 코 */}
      <ellipse cx="40" cy="45" rx="3" ry="2" fill="currentColor" />
      {/* 입 (웃는 입) */}
      <path d="M35 50C38 54 42 54 45 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* 수염 */}
      <path d="M20 42H30M20 46H28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M60 42H50M60 46H52" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* 발자국 */}
      <ellipse cx="78" cy="55" rx="6" ry="5" fill="currentColor" opacity="0.4" />
      <circle cx="72" cy="48" r="2.5" fill="currentColor" opacity="0.4" />
      <circle cx="76" cy="45" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="80" cy="45" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="84" cy="48" r="2.5" fill="currentColor" opacity="0.4" />
      {/* 하트 */}
      <path d="M85 28C85 24 90 24 90 28C90 24 95 24 95 28C95 34 90 38 90 38C90 38 85 34 85 28Z" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

/**
 * 미니멀 고양이 실루엣 - 라인 아트 스타일 (헤더/아이콘용)
 */
export function CatSilhouette({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={cn('w-12 h-12', className)}
      aria-hidden="true"
    >
      {/* 귀 */}
      <path
        d="M18 28L22 12L30 24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M46 28L42 12L34 24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 얼굴 */}
      <circle
        cx="32"
        cy="36"
        r="18"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* 눈 */}
      <circle cx="26" cy="34" r="2" fill="currentColor" />
      <circle cx="38" cy="34" r="2" fill="currentColor" />
      {/* 코 */}
      <path
        d="M32 40L30 42H34L32 40Z"
        fill="currentColor"
      />
      {/* 수염 */}
      <path
        d="M20 38H26M20 42H24"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M44 38H38M44 42H40"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * 미니멀 발자국 - 단색 심플
 */
export function PawPrintSimple({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn('w-4 h-4', className)}
      aria-hidden="true"
    >
      {/* 메인 패드 */}
      <ellipse cx="12" cy="16" rx="5" ry="4" opacity="0.6" />
      {/* 발가락 */}
      <circle cx="7" cy="10" r="2.5" opacity="0.6" />
      <circle cx="11" cy="7" r="2" opacity="0.6" />
      <circle cx="13" cy="7" r="2" opacity="0.6" />
      <circle cx="17" cy="10" r="2.5" opacity="0.6" />
    </svg>
  );
}

/**
 * 고양이 사진 플레이스홀더 아이콘
 */
export function CatPhotoPlaceholder({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={cn('w-10 h-10', className)}
      aria-hidden="true"
    >
      {/* 귀 실루엣 */}
      <path
        d="M14 22L17 10L24 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.4"
      />
      <path
        d="M34 22L31 10L24 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.4"
      />
      {/* 얼굴 원 */}
      <circle
        cx="24"
        cy="28"
        r="14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        opacity="0.3"
      />
      {/* 카메라 아이콘 힌트 */}
      <circle cx="24" cy="28" r="4" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <path d="M22 26L24 28L26 26" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

/**
 * 간단한 하트 아이콘
 */
export function HeartSimple({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('w-4 h-4', className)}
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
