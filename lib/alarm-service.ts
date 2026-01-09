/**
 * 백그라운드 알람 서비스
 * Service Worker를 통해 브라우저가 닫혀도 알람이 작동하도록 함
 */

export interface Alarm {
  id: string;
  time: number; // Unix timestamp (milliseconds)
  title: string;
  body: string;
  tag?: string;
}

export class AlarmService {
  private static instance: AlarmService;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): AlarmService {
    if (!AlarmService.instance) {
      AlarmService.instance = new AlarmService();
    }
    return AlarmService.instance;
  }

  /**
   * Service Worker 등록 및 초기화
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized && this.serviceWorkerRegistration) {
      return true;
    }

    if (!('serviceWorker' in navigator)) {
      console.warn('[AlarmService] Service Worker is not supported');
      return false;
    }

    try {
      // Service Worker 등록
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('[AlarmService] Service Worker registered:', registration.scope);

      // Service Worker가 활성화될 때까지 대기
      await navigator.serviceWorker.ready;
      this.serviceWorkerRegistration = registration;
      this.isInitialized = true;

      // Service Worker 업데이트 확인
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[AlarmService] New Service Worker available');
              // 필요시 사용자에게 업데이트 안내
            }
          });
        }
      });

      return true;
    } catch (error) {
      console.error('[AlarmService] Service Worker registration failed:', error);
      return false;
    }
  }

  /**
   * 알람 스케줄링
   */
  async scheduleAlarm(
    time: Date,
    title: string,
    body: string,
    tag?: string
  ): Promise<string> {
    if (!this.serviceWorkerRegistration) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('Service Worker를 초기화할 수 없습니다.');
      }
    }

    const id = `alarm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const alarmTime = time.getTime();

    // Service Worker에 알람 스케줄링 요청
    if (this.serviceWorkerRegistration?.active) {
      this.serviceWorkerRegistration.active.postMessage({
        type: 'SCHEDULE_ALARM',
        id,
        time: alarmTime,
        title,
        body,
        tag: tag || 'default',
      });
    } else {
      // Service Worker가 아직 활성화되지 않았으면 대기
      await navigator.serviceWorker.ready;
      const activeWorker = this.serviceWorkerRegistration?.active;
      if (activeWorker) {
        activeWorker.postMessage({
          type: 'SCHEDULE_ALARM',
          id,
          time: alarmTime,
          title,
          body,
          tag: tag || 'default',
        });
      } else {
        throw new Error('Service Worker가 활성화되지 않았습니다.');
      }
    }

    // 로컬 스토리지에도 백업 저장 (Service Worker 재시작 시 복원용)
    this.saveAlarmToLocalStorage({
      id,
      time: alarmTime,
      title,
      body,
      tag: tag || 'default',
    });

    console.log(`[AlarmService] Alarm scheduled: ${title} at ${time.toLocaleString()}`);
    return id;
  }

  /**
   * 알람 취소
   */
  async cancelAlarm(id: string): Promise<void> {
    if (!this.serviceWorkerRegistration?.active) {
      return;
    }

    this.serviceWorkerRegistration.active.postMessage({
      type: 'CANCEL_ALARM',
      id,
    });

    // 로컬 스토리지에서도 제거
    this.removeAlarmFromLocalStorage(id);
  }

  /**
   * 모든 알람 취소
   */
  async clearAllAlarms(): Promise<void> {
    if (!this.serviceWorkerRegistration?.active) {
      return;
    }

    this.serviceWorkerRegistration.active.postMessage({
      type: 'CLEAR_ALL_ALARMS',
    });

    // 로컬 스토리지에서도 제거
    localStorage.removeItem('scheduled_alarms');
  }

  /**
   * 저장된 알람 목록 가져오기
   */
  async getScheduledAlarms(): Promise<Alarm[]> {
    return new Promise((resolve) => {
      if (!this.serviceWorkerRegistration?.active) {
        // Service Worker가 없으면 로컬 스토리지에서 가져오기
        resolve(this.getAlarmsFromLocalStorage());
        return;
      }

      const channel = new MessageChannel();
      channel.port1.onmessage = (event) => {
        resolve(event.data.alarms || []);
      };

      this.serviceWorkerRegistration.active.postMessage(
        { type: 'GET_ALARMS' },
        [channel.port2]
      );

      // 타임아웃 설정 (5초)
      setTimeout(() => {
        resolve(this.getAlarmsFromLocalStorage());
      }, 5000);
    });
  }

  /**
   * 로컬 스토리지에 알람 저장
   */
  private saveAlarmToLocalStorage(alarm: Alarm): void {
    try {
      const alarms = this.getAlarmsFromLocalStorage();
      alarms.push(alarm);
      localStorage.setItem('scheduled_alarms', JSON.stringify(alarms));
    } catch (error) {
      console.error('[AlarmService] Failed to save alarm to localStorage:', error);
    }
  }

  /**
   * 로컬 스토리지에서 알람 제거
   */
  private removeAlarmFromLocalStorage(id: string): void {
    try {
      const alarms = this.getAlarmsFromLocalStorage();
      const filtered = alarms.filter((alarm) => alarm.id !== id);
      localStorage.setItem('scheduled_alarms', JSON.stringify(filtered));
    } catch (error) {
      console.error('[AlarmService] Failed to remove alarm from localStorage:', error);
    }
  }

  /**
   * 로컬 스토리지에서 알람 목록 가져오기
   */
  private getAlarmsFromLocalStorage(): Alarm[] {
    try {
      const stored = localStorage.getItem('scheduled_alarms');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[AlarmService] Failed to get alarms from localStorage:', error);
      return [];
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
export const alarmService = AlarmService.getInstance();
