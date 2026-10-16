import { NextRequest } from 'next/server';
import { subscribeToLiveEvents, getReignStatus } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection packet
      const initialReign = await getReignStatus();
      controller.enqueue(
        encoder.encode(`event: init\ndata: ${JSON.stringify({ status: 'connected', reign: initialReign })}\n\n`)
      );

      // Listener for real-time events from payments / lead changes
      const unsubscribe = subscribeToLiveEvents((event) => {
        try {
          const payload = `event: update\ndata: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch {
          // Client disconnected
        }
      });

      // Reign heartbeat every 5 seconds to keep ticker precise
      const interval = setInterval(async () => {
        try {
          const reign = await getReignStatus();
          controller.enqueue(
            encoder.encode(`event: reign_tick\ndata: ${JSON.stringify(reign)}\n\n`)
          );
        } catch {
          clearInterval(interval);
          unsubscribe();
        }
      }, 5000);

      // Handle abort / close
      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        unsubscribe();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
