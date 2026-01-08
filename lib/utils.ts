import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDateToKorean, formatDateTimeToKorean } from './utils/date';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(time: string): string {
  return time;
}

/**
 * 날짜를 한국어 형식으로 포맷팅
 * @deprecated Use formatDateToKorean from '@/lib/utils/date' instead
 */
export function formatDate(date: string | null): string {
  return formatDateToKorean(date);
}

/**
 * 날짜와 시간을 한국어 형식으로 포맷팅
 * @deprecated Use formatDateTimeToKorean from '@/lib/utils/date' instead
 */
export function formatDateTime(date: string | null): string {
  return formatDateTimeToKorean(date);
}
