/**
 * 고객(Guest) 브랜딩 에셋 슬롯
 * - 실제 사진/영상 반영 시 여기 값만 채우면 UI 레이아웃은 그대로 유지되도록 설계
 * - 에셋이 없어도(=null) 기존 UI/UX는 동일하게 동작해야 함
 */
export const GUEST_BRAND_MEDIA = {
  /**
   * 홈 Hero 배경 (선택)
   * 예: '/brand/hero.webp' 또는 '/brand/hero.mp4'
   */
  heroImageSrc: null as string | null,
  heroVideoSrc: null as string | null,

  /**
   * 쿠폰 플립 뒷면 배경 이미지 (선택)
   * - 카드 영역을 넘지 않도록 컴포넌트에서 강제 클리핑/리사이즈 처리
   */
  couponBackImageSrc: null as string | null,
};

