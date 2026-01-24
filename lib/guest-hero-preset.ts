export type GuestHeroPreset = {
  eyebrow: string;
  subtitle: string;
  accent?: string;
  waveLineClass: string;
  patternClass: string;
};

type GuestStatus = 'checked_in' | 'checked_out' | string | undefined;

const BASE_EYEBROW = 'Welcome to OUSCARAVAN';

export function getGuestHeroPreset(status: GuestStatus): GuestHeroPreset {
  if (status === 'checked_out') {
    return {
      eyebrow: BASE_EYEBROW,
      subtitle: '오늘의 추억을 간직해 주세요',
      waveLineClass: 'wave-line',
      patternClass: 'ocean-wave-bg--soft',
    };
  }

  if (status === 'checked_in') {
    return {
      eyebrow: BASE_EYEBROW,
      subtitle: '파도 소리와 함께하는',
      accent: '특별한 휴식',
      waveLineClass: 'wave-line-animated',
      patternClass: 'ocean-wave-bg--medium',
    };
  }

  return {
    eyebrow: BASE_EYEBROW,
    subtitle: '곧 입실 안내를 시작해요',
    waveLineClass: 'wave-line',
    patternClass: 'ocean-wave-bg--soft',
  };
}
