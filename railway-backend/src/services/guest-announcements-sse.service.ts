import type { Request, Response } from 'express';

const clients = new Set<Response>();

export function setupGuestAnnouncementsSSE(req: Request, res: Response, initial?: unknown) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  clients.add(res);

  req.on('close', () => {
    clients.delete(res);
  });

  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);
  if (initial !== undefined) {
    res.write(`data: ${JSON.stringify({ type: 'snapshot', data: initial })}\n\n`);
  }

  const keepAliveInterval = setInterval(() => {
    try {
      res.write(`: keep-alive\n\n`);
    } catch {
      clearInterval(keepAliveInterval);
      clients.delete(res);
    }
  }, 30000);

  req.on('close', () => {
    clearInterval(keepAliveInterval);
  });
}

export function broadcastGuestAnnouncementsEvent(payload: unknown): number {
  let sent = 0;
  for (const res of clients) {
    try {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
      sent += 1;
    } catch {
      clients.delete(res);
    }
  }
  return sent;
}

