export type GuestHeroPreset = {
  eyebrow: string;
  subtitle: string;
  waveLineClass: string;
  patternClass: string;
};

type GuestStatus = 'checked_in' | 'checked_out' | string | undefined;

const BASE_EYEBROW = 'Welcome to OUSCARAVAN';

export function getGuestHeroPreset(status: GuestStatus): GuestHeroPreset {
  if (status === 'checked_out') {
    return {
      eyebrow: BASE_EYEBROW,
      subtitle: '오늘도 함께해 주셔서 감사합니다',
      waveLineClass: 'hero-rule',
      patternClass: 'ocean-wave-bg--soft',
    };
  }

  if (status === 'checked_in') {
    return {
      eyebrow: BASE_EYEBROW,
      subtitle: '편안한 스테이를 준비했어요',
      waveLineClass: 'hero-rule-animated',
      patternClass: 'ocean-wave-bg--soft',
    };
  }

  return {
    eyebrow: BASE_EYEBROW,
    subtitle: '체크인 안내를 준비하고 있어요',
    waveLineClass: 'hero-rule',
    patternClass: 'ocean-wave-bg--soft',
  };
}
