import { orchestrator } from "@/lib/agents/orchestrator";
import type { ActivityEvent } from "@obscura/shared";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Send last 50 events from log (not the full history)
      const log = orchestrator.getActivityLog();
      const recent = log.slice(-50);
      for (const event of recent) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }

      // Subscribe to new events
      const onEvent = (event: ActivityEvent) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          orchestrator.unsubscribeFromActivity(onEvent);
        }
      };

      orchestrator.subscribeToActivity(onEvent);

      // Cleanup on close
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          clearInterval(interval);
          orchestrator.unsubscribeFromActivity(onEvent);
        }
      }, 15000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
