/**
 * n8n 웹훅 호출 유틸리티
 */

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

/**
 * 예약 배정 알림톡 발송 (n8n 웹훅 호출)
 */
export async function sendReservationAssignedNotification(data: {
  reservationId: string;
  guestName: string;
  phone: string;
  uniqueToken: string;
  assignedRoom: string;
  checkin: string;
  checkout: string;
}): Promise<boolean> {
  if (!N8N_WEBHOOK_URL) {
    console.warn('[N8N] N8N_WEBHOOK_URL is not set, skipping notification');
    return false;
  }

  try {
    const webhookUrl = `${N8N_WEBHOOK_URL}/reservation-assigned`;
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error('[N8N] Webhook call failed:', response.status, response.statusText);
      return false;
    }

    console.log('[N8N] Reservation assigned notification sent successfully');
    return true;
  } catch (error) {
    console.error('[N8N] Failed to send reservation assigned notification:', error);
    return false;
  }
}
