// ═══════════════════════════════════════════════════
// 고양이 가이드 데이터
// ═══════════════════════════════════════════════════

export interface CatCharacter {
  id: string;
  name: string;
  trait: string;
  photoUrl?: string; // 실제 사진 URL (없으면 플레이스홀더 표시)
}

export interface TipStep {
  step: number;
  icon: string;
  title: string;
  description: string;
}

export interface WarningItem {
  icon: string;
  text: string;
  reason: string;
}

export const CAT_CHARACTERS: CatCharacter[] = [
  { id: 'cheese', name: '치즈', trait: '먹보' },
  { id: 'black', name: '까망이', trait: '호기심왕' },
  { id: 'calico', name: '삼색이', trait: '느긋이' },
  { id: 'tiger', name: '호피', trait: '수줍이' },
  { id: 'snow', name: '눈송이', trait: '우아함' },
];

export const CAT_GUIDE_DATA = {
  hero: {
    title: '오우스의 작은 주민들',
    subtitle: '카라반 단지를 자유롭게 거니는 야생 고양이들',
  },
  intro: {
    title: '우리 동네 고양이들',
    content: `약 10마리 이상의 고양이가
오우스 카라반을 집 삼아 살고 있어요.

각자의 개성을 가진 친구들이
가끔 객실 근처로 놀러 올 수도 있답니다.

반갑게 인사해 주세요!`,
  },
  tips: {
    title: '고양이와 친해지는 법',
    steps: [
      {
        step: 1,
        icon: '🚶',
        title: '천천히 다가가기',
        description: '갑자기 다가가면 놀랄 수 있어요',
      },
      {
        step: 2,
        icon: '✋',
        title: '손등 내밀기',
        description: '먼저 냄새를 맡게 해주세요',
      },
      {
        step: 3,
        icon: '🤲',
        title: '살살 쓰다듬기',
        description: '머리를 비비면 쓰다듬어 달라는 신호!',
      },
    ] as TipStep[],
  },
  warnings: {
    title: '함께 지켜주세요',
    items: [
      {
        icon: '🚫',
        text: '강제로 안거나 잡지 말아주세요',
        reason: '야생 고양이는 자유로운 영혼이에요',
      },
      {
        icon: '🍽️',
        text: '사람 음식은 주지 말아주세요',
        reason: '고양이에게 해로울 수 있어요',
      },
      {
        icon: '🏠',
        text: '객실 안으로 데려가지 말아주세요',
        reason: '밖에서 자유롭게 지내는 게 좋아요',
      },
      {
        icon: '🙅',
        text: '싫어하면 거리를 두어주세요',
        reason: '고양이도 기분이 있답니다',
      },
    ] as WarningItem[],
  },
  snack: {
    title: '간식 주고 싶다면?',
    content: '고양이 전용 츄르는 카페 1층 키오스크에서 구매 가능합니다.',
  },
  footer: {
    message: '고양이들도 여러분의 방문을\n기다리고 있어요',
  },
} as const;

export type CatGuideData = typeof CAT_GUIDE_DATA;
