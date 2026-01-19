import { createNotification, CreateNotificationData } from './notifications.service';
import { sendNotification } from './notifications-sse.service';
import { getReservationById } from './reservations.service';
import { getOrderById } from './orders.service';
import { parseJSONBArray } from '../utils/jsonb';

/**
 * 체크인 알림 생성
 */
export async function createCheckInNotification(reservationId: string): Promise<void> {
  try {
    const reservation = await getReservationById(reservationId);
    if (!reservation) return;

    const notification = await createNotification({
      type: 'checkin',
      title: '체크인 완료',
      message: `${reservation.guestName}님이 ${reservation.assignedRoom || '방 미배정'}에 체크인했습니다.`,
      priority: 'high',
      metadata: {
        reservationId: reservation.id,
        reservationNumber: reservation.reservationNumber,
        guestName: reservation.guestName,
        room: reservation.assignedRoom,
      },
      linkType: 'reservation',
      linkId: reservation.id,
    });

    // SSE로 실시간 전송
    sendNotification('admin', notification);
  } catch (error) {
    console.error('[Notification] Failed to create check-in notification:', error);
    // 알림 생성 실패는 체크인 프로세스를 중단하지 않음
  }
}

/**
 * 체크아웃 알림 생성
 */
export async function createCheckOutNotification(reservationId: string): Promise<void> {
  try {
    const reservation = await getReservationById(reservationId);
    if (!reservation) return;

    const notification = await createNotification({
      type: 'checkout',
      title: '체크아웃 완료',
      message: `${reservation.guestName}님이 ${reservation.assignedRoom || '방 미배정'}에서 체크아웃했습니다.`,
      priority: 'high',
      metadata: {
        reservationId: reservation.id,
        reservationNumber: reservation.reservationNumber,
        guestName: reservation.guestName,
        room: reservation.assignedRoom,
      },
      linkType: 'reservation',
      linkId: reservation.id,
    });

    // SSE로 실시간 전송
    sendNotification('admin', notification);
  } catch (error) {
    console.error('[Notification] Failed to create check-out notification:', error);
    // 알림 생성 실패는 체크아웃 프로세스를 중단하지 않음
  }
}

/**
 * 주문 생성 알림 생성
 */
export async function createOrderCreatedNotification(orderId: string): Promise<void> {
  try {
    const order = await getOrderById(orderId);
    if (!order) return;

    const reservation = await getReservationById(order.reservationId);
    if (!reservation) return;

    const orderTypeLabelMap: Record<string, string> = {
      bbq: '바베큐',
      fire: '불멍',
      kiosk: '키오스크',
    };
    const orderTypeLabel = orderTypeLabelMap[order.type] || order.type;
    const items = parseJSONBArray(order.items);
    const itemNames = items.map((item: any) => item.name).join(', ');

    const notification = await createNotification({
      type: 'order_created',
      title: '새 주문 접수',
      message: `${reservation.guestName}님이 ${orderTypeLabel} 주문을 접수했습니다. (${itemNames})`,
      priority: 'medium',
      metadata: {
        orderId: order.id,
        reservationId: reservation.id,
        reservationNumber: reservation.reservationNumber,
        guestName: reservation.guestName,
        room: reservation.assignedRoom,
        orderType: order.type,
        totalAmount: order.totalAmount,
      },
      linkType: 'order',
      linkId: order.id,
    });

    // SSE로 실시간 전송
    sendNotification('admin', notification);
  } catch (error) {
    console.error('[Notification] Failed to create order created notification:', error);
    // 알림 생성 실패는 주문 프로세스를 중단하지 않음
  }
}

/**
 * 주문 상태 변경 알림 생성
 */
export async function createOrderStatusChangedNotification(
  orderId: string,
  oldStatus: string,
  newStatus: string
): Promise<void> {
  try {
    const order = await getOrderById(orderId);
    if (!order) return;

    const reservation = await getReservationById(order.reservationId);
    if (!reservation) return;

    const statusLabels: Record<string, string> = {
      pending: '대기',
      preparing: '준비 중',
      delivering: '배송 중',
      completed: '완료',
      cancelled: '취소',
    };

    const notification = await createNotification({
      type: 'order_status_changed',
      title: '주문 상태 변경',
      message: `${reservation.guestName}님의 주문이 "${statusLabels[newStatus] || newStatus}" 상태로 변경되었습니다.`,
      priority: 'low',
      metadata: {
        orderId: order.id,
        reservationId: reservation.id,
        reservationNumber: reservation.reservationNumber,
        guestName: reservation.guestName,
        room: reservation.assignedRoom,
        oldStatus,
        newStatus,
      },
      linkType: 'order',
      linkId: order.id,
    });

    // SSE로 실시간 전송
    sendNotification('admin', notification);
  } catch (error) {
    console.error('[Notification] Failed to create order status changed notification:', error);
    // 알림 생성 실패는 주문 상태 변경 프로세스를 중단하지 않음
  }
}

/**
 * 주문 취소 알림 생성
 */
export async function createOrderCancelledNotification(orderId: string): Promise<void> {
  try {
    const order = await getOrderById(orderId);
    if (!order) return;

    const reservation = await getReservationById(order.reservationId);
    if (!reservation) return;

    const notification = await createNotification({
      type: 'order_cancelled',
      title: '주문 취소',
      message: `${reservation.guestName}님의 주문이 취소되었습니다.`,
      priority: 'medium',
      metadata: {
        orderId: order.id,
        reservationId: reservation.id,
        reservationNumber: reservation.reservationNumber,
        guestName: reservation.guestName,
        room: reservation.assignedRoom,
      },
      linkType: 'order',
      linkId: order.id,
    });

    // SSE로 실시간 전송
    sendNotification('admin', notification);
  } catch (error) {
    console.error('[Notification] Failed to create order cancelled notification:', error);
    // 알림 생성 실패는 주문 취소 프로세스를 중단하지 않음
  }
}

/**
 * 예약 배정 알림 생성
 */
export async function createReservationAssignedNotification(reservationId: string): Promise<void> {
  try {
    const reservation = await getReservationById(reservationId);
    if (!reservation) return;

    const notification = await createNotification({
      type: 'reservation_assigned',
      title: '방 배정 완료',
      message: `${reservation.guestName}님의 예약이 ${reservation.assignedRoom || '방 미배정'}에 배정되었습니다.`,
      priority: 'high',
      metadata: {
        reservationId: reservation.id,
        reservationNumber: reservation.reservationNumber,
        guestName: reservation.guestName,
        room: reservation.assignedRoom,
      },
      linkType: 'reservation',
      linkId: reservation.id,
    });

    // SSE로 실시간 전송
    sendNotification('admin', notification);
  } catch (error) {
    console.error('[Notification] Failed to create reservation assigned notification:', error);
    // 알림 생성 실패는 방 배정 프로세스를 중단하지 않음
  }
}
