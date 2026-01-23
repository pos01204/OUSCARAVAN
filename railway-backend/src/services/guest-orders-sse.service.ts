import type { Request, Response } from 'express';

// reservationId -> clients
const clientsByReservationId = new Map<string, Set<Response>>();

function addClient(reservationId: string, res: Response) {
  const set = clientsByReservationId.get(reservationId) ?? new Set<Response>();
  set.add(res);
  clientsByReservationId.set(reservationId, set);
}

function removeClient(reservationId: string, res: Response) {
  const set = clientsByReservationId.get(reservationId);
  if (!set) return;
  set.delete(res);
  if (set.size === 0) clientsByReservationId.delete(reservationId);
}

export function setupGuestOrdersSSE(req: Request, res: Response, reservationId: string, initial?: unknown) {
  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  addClient(reservationId, res);

  // close handler
  req.on('close', () => {
    removeClient(reservationId, res);
  });

  // connected event
  res.write(`data: ${JSON.stringify({ type: 'connected', reservationId })}\n\n`);

  // optional initial snapshot
  if (initial !== undefined) {
    res.write(`data: ${JSON.stringify({ type: 'snapshot', data: initial })}\n\n`);
  }

  // keep-alive
  const keepAliveInterval = setInterval(() => {
    try {
      res.write(`: keep-alive\n\n`);
    } catch {
      clearInterval(keepAliveInterval);
      removeClient(reservationId, res);
    }
  }, 30000);

  req.on('close', () => {
    clearInterval(keepAliveInterval);
  });
}

export function sendGuestOrdersEvent(reservationId: string, payload: unknown): number {
  const clients = clientsByReservationId.get(reservationId);
  if (!clients || clients.size === 0) return 0;

  let sent = 0;
  for (const res of clients) {
    try {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
      sent += 1;
    } catch {
      removeClient(reservationId, res);
    }
  }

  return sent;
}

export function getGuestOrdersSseClientCount(): number {
  let count = 0;
  clientsByReservationId.forEach((set) => {
    count += set.size;
  });
  return count;
}

