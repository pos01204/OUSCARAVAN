import { Request, Response } from 'express';
import { getAdminStats } from '../services/stats.service';

export async function getStats(req: Request, res: Response) {
  try {
    const stats = await getAdminStats();
    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}
