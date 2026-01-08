import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationSettings,
  updateNotificationSettings,
  getNotificationStats,
  NotificationFilters,
} from '../services/notifications.service';

/**
 * 알림 목록 조회
 */
export async function listNotifications(req: AuthRequest, res: Response) {
  try {
    const adminId = req.user?.id || 'admin';
    const filters: NotificationFilters = {
      type: req.query.type as any,
      isRead: req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined,
      priority: req.query.priority as any,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
    };

    const result = await getNotifications(adminId, filters);

    res.json(result);
  } catch (error) {
    console.error('List notifications error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}

/**
 * 알림 읽음 처리
 */
export async function markAsRead(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const adminId = req.user?.id || 'admin';

    const notification = await markNotificationAsRead(id, adminId);

    res.json(notification);
  } catch (error) {
    console.error('Mark notification as read error:', error);
    if (error instanceof Error && error.message === 'Notification not found') {
      res.status(404).json({
        error: 'Notification not found',
        code: 'NOT_FOUND',
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  }
}

/**
 * 모든 알림 읽음 처리
 */
export async function markAllAsRead(req: AuthRequest, res: Response) {
  try {
    const adminId = req.user?.id || 'admin';

    const updatedCount = await markAllNotificationsAsRead(adminId);

    res.json({ updatedCount });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}

/**
 * 알림 삭제
 */
export async function deleteNotificationHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const adminId = req.user?.id || 'admin';

    await deleteNotification(id, adminId);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete notification error:', error);
    if (error instanceof Error && error.message === 'Notification not found') {
      res.status(404).json({
        error: 'Notification not found',
        code: 'NOT_FOUND',
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  }
}

/**
 * 알림 설정 조회
 */
export async function getSettings(req: AuthRequest, res: Response) {
  try {
    const adminId = req.user?.id || 'admin';

    const settings = await getNotificationSettings(adminId);

    res.json(settings);
  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}

/**
 * 알림 설정 업데이트
 */
export async function updateSettings(req: AuthRequest, res: Response) {
  try {
    const adminId = req.user?.id || 'admin';
    const data = req.body;

    const settings = await updateNotificationSettings(adminId, data);

    res.json(settings);
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}

/**
 * 알림 통계 조회
 */
export async function getStats(req: AuthRequest, res: Response) {
  try {
    const adminId = req.user?.id || 'admin';

    const stats = await getNotificationStats(adminId);

    res.json(stats);
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}
