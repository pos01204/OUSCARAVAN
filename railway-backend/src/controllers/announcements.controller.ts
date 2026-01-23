import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { getReservationByToken } from '../services/reservations.service';
import {
  createAnnouncement,
  deleteAnnouncement,
  getActiveAnnouncements,
  getAnnouncements,
  updateAnnouncement,
  type AnnouncementFilters,
  type AnnouncementLevel,
} from '../services/announcements.service';
import { listAnnouncementReads, markAnnouncementRead } from '../services/announcement-reads.service';
import { broadcastGuestAnnouncementsEvent, setupGuestAnnouncementsSSE } from '../services/guest-announcements-sse.service';

const ANNOUNCEMENT_LEVELS: AnnouncementLevel[] = ['info', 'warning', 'critical'];

export async function listAnnouncements(req: AuthRequest, res: Response) {
  try {
    const adminId = req.user?.id || 'admin';
    const filters: AnnouncementFilters = {
      status: (req.query.status as any) || 'all',
      level: req.query.level as AnnouncementLevel,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
    };

    const result = await getAnnouncements(adminId, filters);
    res.json(result);
  } catch (error) {
    console.error('List announcements error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}

export async function createAnnouncementHandler(req: AuthRequest, res: Response) {
  try {
    const adminId = req.user?.id || 'admin';
    const { title, content, level, startsAt, endsAt, isActive } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: 'Missing required fields',
        code: 'MISSING_FIELDS',
        details: { required: ['title', 'content'] },
      });
    }

    if (level && !ANNOUNCEMENT_LEVELS.includes(level)) {
      return res.status(400).json({
        error: 'Invalid announcement level',
        code: 'VALIDATION_ERROR',
      });
    }

    const announcement = await createAnnouncement({
      adminId,
      title,
      content,
      level,
      startsAt,
      endsAt,
      isActive,
    });

    // 게스트 공지 SSE 브로드캐스트 (비동기, 실패해도 생성은 완료)
    try {
      broadcastGuestAnnouncementsEvent({ type: 'announcements_changed' });
    } catch {
      // ignore
    }

    res.status(201).json(announcement);
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}

export async function updateAnnouncementHandler(req: AuthRequest, res: Response) {
  try {
    const adminId = req.user?.id || 'admin';
    const { id } = req.params;
    const { title, content, level, startsAt, endsAt, isActive } = req.body;

    if (level && !ANNOUNCEMENT_LEVELS.includes(level)) {
      return res.status(400).json({
        error: 'Invalid announcement level',
        code: 'VALIDATION_ERROR',
      });
    }

    const announcement = await updateAnnouncement(id, adminId, {
      title,
      content,
      level,
      startsAt,
      endsAt,
      isActive,
    });

    try {
      broadcastGuestAnnouncementsEvent({ type: 'announcements_changed' });
    } catch {
      // ignore
    }

    res.json(announcement);
  } catch (error) {
    console.error('Update announcement error:', error);
    if (error instanceof Error && error.message === 'Announcement not found') {
      res.status(404).json({
        error: 'Announcement not found',
        code: 'NOT_FOUND',
      });
    } else if (error instanceof Error && error.message === 'No fields to update') {
      res.status(400).json({
        error: 'No fields to update',
        code: 'VALIDATION_ERROR',
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  }
}

export async function deleteAnnouncementHandler(req: AuthRequest, res: Response) {
  try {
    const adminId = req.user?.id || 'admin';
    const { id } = req.params;

    await deleteAnnouncement(id, adminId);

    try {
      broadcastGuestAnnouncementsEvent({ type: 'announcements_changed' });
    } catch {
      // ignore
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete announcement error:', error);
    if (error instanceof Error && error.message === 'Announcement not found') {
      res.status(404).json({
        error: 'Announcement not found',
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

export async function getGuestAnnouncements(req: Request, res: Response) {
  try {
    const { token } = req.params;
    const reservation = await getReservationByToken(token);

    if (!reservation) {
      return res.status(404).json({
        error: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
    }

    const announcements = await getActiveAnnouncements();
    res.json({ announcements });
  } catch (error) {
    console.error('Get guest announcements error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}

export async function streamGuestAnnouncements(req: Request, res: Response) {
  try {
    const { token } = req.params;
    const reservation = await getReservationByToken(token);

    if (!reservation) {
      return res.status(404).json({
        error: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
    }

    const announcements = await getActiveAnnouncements();
    setupGuestAnnouncementsSSE(req, res, { announcements });
  } catch (error) {
    console.error('Guest announcements SSE error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}

export async function getGuestAnnouncementReads(req: Request, res: Response) {
  try {
    const { token } = req.params;
    const reservation = await getReservationByToken(token);

    if (!reservation) {
      return res.status(404).json({
        error: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
    }

    const readIds = await listAnnouncementReads(reservation.id);
    res.json({ readIds });
  } catch (error) {
    console.error('Get guest announcement reads error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}

export async function markGuestAnnouncementRead(req: Request, res: Response) {
  try {
    const { token } = req.params;
    const { announcementId } = req.body as { announcementId?: string };

    if (!announcementId) {
      return res.status(400).json({
        error: 'announcementId is required',
        code: 'MISSING_FIELDS',
      });
    }

    const reservation = await getReservationByToken(token);
    if (!reservation) {
      return res.status(404).json({
        error: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
    }

    await markAnnouncementRead(reservation.id, announcementId);
    res.json({ success: true });
  } catch (error) {
    console.error('Mark guest announcement read error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}
