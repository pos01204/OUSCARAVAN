'use client';

import { cn } from '@/lib/utils';

interface IllustrationProps {
  className?: string;
}

/**
 * 미니멀 고양이 실루엣 - 라인 아트 스타일
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
