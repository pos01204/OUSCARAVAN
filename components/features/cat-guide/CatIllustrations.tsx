'use client';

import { cn } from '@/lib/utils';

interface IllustrationProps {
  className?: string;
}

// 고양이 얼굴 (다양한 표정)
type CatExpression = 'happy' | 'love' | 'sleepy' | 'curious';

interface CatFaceProps extends IllustrationProps {
  expression?: CatExpression;
  size?: number;
}

export function CatFace({ 
  expression = 'happy', 
  size = 80, 
  className 
}: CatFaceProps) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      width={size} 
      height={size}
      className={cn('text-cat-brown', className)}
      aria-hidden="true"
    >
      {/* 얼굴 */}
      <ellipse cx="50" cy="55" rx="35" ry="30" fill="currentColor" opacity="0.15" />
      <ellipse cx="50" cy="55" rx="33" ry="28" fill="#FEF3C7" stroke="currentColor" strokeWidth="2" />
      
      {/* 귀 */}
      <polygon points="18,38 28,8 42,35" fill="#FEF3C7" stroke="currentColor" strokeWidth="2" />
      <polygon points="58,35 72,8 82,38" fill="#FEF3C7" stroke="currentColor" strokeWidth="2" />
      {/* 귀 안쪽 */}
      <polygon points="24,35 30,15 38,33" fill="#FFE4E6" />
      <polygon points="62,33 70,15 76,35" fill="#FFE4E6" />
      
      {/* 눈 - 표정별 */}
      {expression === 'happy' && (
        <>
          <ellipse cx="36" cy="50" rx="5" ry="6" fill="white" />
          <ellipse cx="64" cy="50" rx="5" ry="6" fill="white" />
          <circle cx="36" cy="51" r="3.5" fill="#1A1714" />
          <circle cx="64" cy="51" r="3.5" fill="#1A1714" />
          <circle cx="37.5" cy="49.5" r="1.5" fill="white" />
          <circle cx="65.5" cy="49.5" r="1.5" fill="white" />
        </>
      )}
      {expression === 'love' && (
        <>
          <text x="36" y="54" textAnchor="middle" fontSize="14" fill="#F472B6">♥</text>
          <text x="64" y="54" textAnchor="middle" fontSize="14" fill="#F472B6">♥</text>
        </>
      )}
      {expression === 'sleepy' && (
        <>
          <line x1="30" y1="50" x2="42" y2="50" stroke="#1A1714" strokeWidth="2" strokeLinecap="round" />
          <line x1="58" y1="50" x2="70" y2="50" stroke="#1A1714" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {expression === 'curious' && (
        <>
          <circle cx="36" cy="50" r="6" fill="white" />
          <circle cx="64" cy="50" r="6" fill="white" />
          <circle cx="36" cy="50" r="4" fill="#1A1714" />
          <circle cx="64" cy="50" r="4" fill="#1A1714" />
          <circle cx="37.5" cy="48.5" r="2" fill="white" />
          <circle cx="65.5" cy="48.5" r="2" fill="white" />
        </>
      )}
      
      {/* 코 */}
      <ellipse cx="50" cy="62" rx="4" ry="3" fill="#FFB6C1" />
      
      {/* 입 - 표정별 */}
      {expression === 'happy' && (
        <path d="M44,67 Q50,73 56,67" stroke="#1A1714" fill="none" strokeWidth="1.5" strokeLinecap="round" />
      )}
      {expression === 'love' && (
        <path d="M44,68 Q50,74 56,68" stroke="#F472B6" fill="none" strokeWidth="2" strokeLinecap="round" />
      )}
      {expression === 'sleepy' && (
        <path d="M46,68 Q50,70 54,68" stroke="#1A1714" fill="none" strokeWidth="1.5" strokeLinecap="round" />
      )}
      {expression === 'curious' && (
        <circle cx="50" cy="70" r="3" fill="#1A1714" />
      )}
      
      {/* 수염 */}
      <g stroke="#1A1714" strokeWidth="1" opacity="0.6">
        <line x1="20" y1="58" x2="34" y2="60" />
        <line x1="20" y1="63" x2="34" y2="63" />
        <line x1="20" y1="68" x2="34" y2="66" />
        <line x1="66" y1="60" x2="80" y2="58" />
        <line x1="66" y1="63" x2="80" y2="63" />
        <line x1="66" y1="66" x2="80" y2="68" />
      </g>
    </svg>
  );
}

// 발자국
export function PawPrint({ className }: IllustrationProps) {
  return (
    <svg 
      viewBox="0 0 32 32" 
      className={cn('w-6 h-6 text-cat-brown', className)}
      aria-hidden="true"
    >
      {/* 패드 */}
      <ellipse cx="16" cy="20" rx="7" ry="6" fill="currentColor" />
      {/* 발가락 */}
      <circle cx="8" cy="12" r="4" fill="currentColor" />
      <circle cx="14" cy="8" r="3.5" fill="currentColor" />
      <circle cx="18" cy="8" r="3.5" fill="currentColor" />
      <circle cx="24" cy="12" r="4" fill="currentColor" />
    </svg>
  );
}

// 츄르 (간식)
export function Churu({ className }: IllustrationProps) {
  return (
    <svg 
      viewBox="0 0 48 64" 
      className={cn('w-12 h-16', className)}
      aria-hidden="true"
    >
      {/* 패키지 그림자 */}
      <rect x="14" y="12" width="20" height="44" rx="4" fill="#E5A54A" opacity="0.3" />
      {/* 패키지 본체 */}
      <rect x="12" y="10" width="20" height="44" rx="4" fill="url(#churuGradient)" />
      {/* 상단 밀봉 부분 */}
      <rect x="12" y="10" width="20" height="10" rx="2" fill="#FB923C" />
      <rect x="14" y="12" width="16" height="6" rx="1" fill="#FEF3C7" opacity="0.8" />
      {/* 츄르 로고/텍스트 */}
      <rect x="15" y="26" width="14" height="20" rx="2" fill="white" opacity="0.9" />
      <text x="22" y="38" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#FB923C">츄르</text>
      <text x="22" y="44" textAnchor="middle" fontSize="4" fill="#B45309">맛있어요</text>
      {/* 그라데이션 정의 */}
      <defs>
        <linearGradient id="churuGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDBA74" />
          <stop offset="100%" stopColor="#FB923C" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// 걷는 고양이 실루엣
export function WalkingCat({ className }: IllustrationProps) {
  return (
    <svg 
      viewBox="0 0 80 40" 
      className={cn('w-20 h-10 text-cat-brown', className)}
      aria-hidden="true"
    >
      {/* 몸통 */}
      <ellipse cx="40" cy="22" rx="18" ry="10" fill="currentColor" opacity="0.8" />
      {/* 머리 */}
      <circle cx="60" cy="16" r="9" fill="currentColor" opacity="0.8" />
      {/* 귀 */}
      <polygon points="54,10 57,2 62,8" fill="currentColor" opacity="0.8" />
      <polygon points="62,8 67,2 70,10" fill="currentColor" opacity="0.8" />
      {/* 꼬리 */}
      <path d="M22,20 Q10,10 8,20 Q6,28 15,25" fill="currentColor" opacity="0.8" />
      {/* 다리 */}
      <rect x="30" y="28" width="4" height="10" rx="2" fill="currentColor" opacity="0.8" />
      <rect x="38" y="28" width="4" height="10" rx="2" fill="currentColor" opacity="0.8" />
      <rect x="46" y="28" width="4" height="10" rx="2" fill="currentColor" opacity="0.8" />
      <rect x="54" y="28" width="4" height="10" rx="2" fill="currentColor" opacity="0.8" />
    </svg>
  );
}

// 하트
export function Heart({ className }: IllustrationProps) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={cn('w-5 h-5 text-pink-400', className)}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

// 말풍선 꼬리 (CSS로 구현하기 어려운 경우)
export function SpeechBubbleTail({ className }: IllustrationProps) {
  return (
    <svg 
      viewBox="0 0 20 12" 
      className={cn('w-5 h-3 text-white', className)}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M0,0 L10,12 L20,0 Z" />
    </svg>
  );
}

// 스파클/별
export function Sparkle({ className }: IllustrationProps) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={cn('w-4 h-4 text-amber-400', className)}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
    </svg>
  );
}

// 웨이브 구분선
export function WaveDivider({ className }: IllustrationProps) {
  return (
    <svg 
      viewBox="0 0 200 20" 
      className={cn('w-full h-5', className)}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0,10 Q25,0 50,10 T100,10 T150,10 T200,10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  );
}
