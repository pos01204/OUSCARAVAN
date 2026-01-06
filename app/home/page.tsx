import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

/**
 * 기존 /home 라우트 처리
 * 
 * URL 파라미터가 있으면 토큰으로 변환 시도
 * - token 파라미터가 있으면 직접 /guest/[token]으로 리다이렉트
 * - 기존 파라미터(guest, room 등)가 있으면 Railway API에서 토큰 조회 시도
 * - 파라미터가 없으면 관리자 로그인 페이지로 리다이렉트
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // token 파라미터가 있으면 직접 리다이렉트
  if (searchParams?.token && typeof searchParams.token === 'string') {
    redirect(`/guest/${searchParams.token}`);
  }
  
  // 기존 URL 파라미터가 있으면 Railway API에서 토큰 조회 시도
  // 주의: Railway API가 실제로 구현되어야 동작합니다
  if (searchParams) {
    const guest = searchParams.guest;
    const room = searchParams.room;
    const checkin = searchParams.checkin;
    const checkout = searchParams.checkout;
    
    // 필수 파라미터가 있으면 토큰 조회 시도
    if (guest || room || checkin || checkout) {
      try {
        // Railway API에서 예약 정보로 토큰 조회
        // TODO: Railway API 구현 후 활성화
        // const token = await findTokenByReservationParams({
        //   guest: typeof guest === 'string' ? guest : undefined,
        //   room: typeof room === 'string' ? room : undefined,
        //   checkin: typeof checkin === 'string' ? checkin : undefined,
        //   checkout: typeof checkout === 'string' ? checkout : undefined,
        // });
        // if (token) {
        //   redirect(`/guest/${token}`);
        // }
      } catch (error) {
        // 토큰 조회 실패 시 로그인 페이지로 리다이렉트
        console.error('Failed to find token from URL parameters:', error);
      }
    }
  }
  
  // 기본적으로 관리자 로그인 페이지로 리다이렉트
  redirect('/login');
}
