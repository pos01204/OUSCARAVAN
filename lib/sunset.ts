/**
 * 일몰 시간 계산 유틸리티
 * 속초 지역 (위도: 38.2070, 경도: 128.5918) 기준
 */

interface Coordinates {
  latitude: number;
  longitude: number;
}

// 속초 좌표 (기본값)
const DEFAULT_COORDS: Coordinates = {
  latitude: 38.2070,
  longitude: 128.5918,
};

/**
 * 일몰 시간 계산 (간단한 근사치)
 * 실제로는 더 정확한 알고리즘이나 API를 사용하는 것이 좋습니다.
 */
export function calculateSunset(date: Date = new Date()): string {
  // 속초 지역 기준 근사치 계산
  // 실제로는 suncalc 라이브러리나 API를 사용하는 것이 정확합니다.
  
  const dayOfYear = getDayOfYear(date);
  const declination = 23.45 * Math.sin((360 / 365) * (284 + dayOfYear) * (Math.PI / 180));
  const latitude = DEFAULT_COORDS.latitude * (Math.PI / 180);
  
  // 일몰 시간 계산 (간단한 근사치)
  const hourAngle = Math.acos(-Math.tan(latitude) * Math.tan(declination * Math.PI / 180));
  const sunsetHour = 12 + (hourAngle * 180 / Math.PI) / 15 + (128.5918 - 135) / 15; // 경도 보정
  
  const hours = Math.floor(sunsetHour);
  const minutes = Math.floor((sunsetHour - hours) * 60);
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * 연중 일수 계산
 */
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * 오늘의 일몰 시간 가져오기
 */
export function getTodaySunset(): string {
  return calculateSunset(new Date());
}

/**
 * 특정 날짜의 일몰 시간 가져오기
 */
export function getSunsetForDate(date: Date): string {
  return calculateSunset(date);
}
