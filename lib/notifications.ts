/**
 * 브라우저 알림 유틸리티
 */

/**
 * 브라우저 알림 권한 요청
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * 브라우저 알림 표시
 */
export function showNotification(
  title: string,
  options?: NotificationOptions
): Notification | null {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return null;
  }

  const notification = new Notification(title, {
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    ...options,
  });

  return notification;
}

/**
 * 체크아웃 알림 스케줄링
 */
export function scheduleCheckoutReminder(
  checkoutTime: string,
  onReminder: () => void
): () => void {
  // 체크아웃 시간 파싱 (예: "11:00")
  const [hours, minutes] = checkoutTime.split(':').map(Number);
  
  // 오늘 날짜로 체크아웃 시간 설정
  const today = new Date();
  const checkoutDate = new Date(today);
  checkoutDate.setHours(hours, minutes, 0, 0);
  
  // 체크아웃 시간이 이미 지났다면 내일로 설정
  if (checkoutDate < today) {
    checkoutDate.setDate(checkoutDate.getDate() + 1);
  }
  
  // 1시간 전 시간 계산
  const reminderTime = new Date(checkoutDate);
  reminderTime.setHours(reminderTime.getHours() - 1);
  
  const now = new Date();
  const timeUntilReminder = reminderTime.getTime() - now.getTime();
  
  // 이미 1시간 전이 지났다면 즉시 알림
  if (timeUntilReminder <= 0) {
    onReminder();
    return () => {}; // 빈 cleanup 함수
  }
  
  // 타이머 설정
  const timeoutId = setTimeout(() => {
    onReminder();
  }, timeUntilReminder);
  
  // cleanup 함수 반환
  return () => {
    clearTimeout(timeoutId);
  };
}
