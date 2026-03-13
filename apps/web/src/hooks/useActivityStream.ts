"use client";

import { useEffect, useState, useCallback } from "react";
import type { ActivityEvent } from "@obscura/shared";

export function useActivityStream() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource("/api/agents");

    eventSource.onopen = () => setConnected(true);
    eventSource.onerror = () => setConnected(false);

    eventSource.onmessage = (e) => {
      try {
        const event: ActivityEvent = JSON.parse(e.data);
        setEvents((prev) => [event, ...prev].slice(0, 200));
      } catch {
        // Ignore parse errors (keepalive messages)
      }
    };

    return () => {
      eventSource.close();
      setConnected(false);
    };
  }, []);

  const clear = useCallback(() => setEvents([]), []);

  return { events, connected, clear };
}
