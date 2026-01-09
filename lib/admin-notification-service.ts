/**
 * 관리자 알림 서비스
 * SSE로 받은 알림을 Service Worker를 통해 브라우저 알림으로 표시
 */

export interface AdminNotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  linkType?: string;
  linkId?: string;
}

export class AdminNotificationService {
  private static instance: AdminNotificationService;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private notificationPermission: NotificationPermission = 'default';

  private constructor() {
    if (typeof window !== 'undefined') {
      this.notificationPermission = Notification.permission;
    }
  }

  static getInstance(): AdminNotificationService {
    if (!AdminNotificationService.instance) {
      AdminNotificationService.instance = new AdminNotificationService();
    }
    return AdminNotificationService.instance;
  }

  /**
   * Service Worker 등록 및 초기화
   */
  async initialize(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('[AdminNotificationService] Service Worker is not supported');
      return false;
    }

    try {
      // Service Worker 등록 (이미 등록되어 있을 수 있음)
      const registration = await navigator.serviceWorker.ready;
      this.serviceWorkerRegistration = registration;
      return true;
    } catch (error) {
      console.error('[AdminNotificationService] Service Worker initialization failed:', error);
      return false;
    }
  }

  /**
   * 알림 권한 요청
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('[AdminNotificationService] Notifications are not supported');
      return false;
    }

    if (this.notificationPermission === 'granted') {
      return true;
    }

    if (this.notificationPermission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.notificationPermission = permission;
      return permission === 'granted';
    }

    return false;
  }

  /**
   * 알림 권한 상태 확인
   */
  getPermissionStatus(): NotificationPermission {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  }

  /**
   * 관리자 알림 표시
   */
  async showNotification(notification: AdminNotificationData): Promise<void> {
    // Service Worker 초기화 확인
    if (!this.serviceWorkerRegistration) {
      const initialized = await this.initialize();
      if (!initialized) {
        console.warn('[AdminNotificationService] Service Worker not initialized');
        return;
      }
    }

    // 알림 권한 확인
    if (this.notificationPermission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) {
        console.warn('[AdminNotificationService] Notification permission not granted');
        return;
      }
    }

    // Service Worker에 알림 표시 요청
    if (this.serviceWorkerRegistration?.active) {
      this.serviceWorkerRegistration.active.postMessage({
        type: 'ADMIN_NOTIFICATION',
        title: notification.title,
        body: notification.message,
        tag: `admin-${notification.id}`,
        priority: notification.priority,
        linkType: notification.linkType,
        linkId: notification.linkId,
      });
    } else {
      // Service Worker가 아직 활성화되지 않았으면 대기
      await navigator.serviceWorker.ready;
      const activeWorker = this.serviceWorkerRegistration?.active;
      if (activeWorker) {
        activeWorker.postMessage({
          type: 'ADMIN_NOTIFICATION',
          title: notification.title,
          body: notification.message,
          tag: `admin-${notification.id}`,
          priority: notification.priority,
          linkType: notification.linkType,
          linkId: notification.linkId,
        });
      }
    }
  }

  /**
   * Service Worker가 활성화되어 있는지 확인
   */
  isServiceWorkerActive(): boolean {
    return this.serviceWorkerRegistration?.active !== null;
  }
}

// 싱글톤 인스턴스 export
export const adminNotificationService = AdminNotificationService.getInstance();
