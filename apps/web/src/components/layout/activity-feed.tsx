"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ActivityEvent, AgentRole } from "@obscura/shared";

const AGENT_COLORS: Record<AgentRole, string> = {
  scout: "text-blue-400",
  analyst: "text-emerald-400",
  ghost: "text-violet-400",
  sentinel: "text-amber-400",
};

const TYPE_ICONS: Record<string, string> = {
  pickup: "\u2192",
  tool_call: "\u26A1",
  submit: "\uD83D\uDCE4",
  evaluate: "\uD83D\uDD0D",
  complete: "\u2705",
  reject: "\u274C",
  error: "\u26A0\uFE0F",
  killswitch: "\uD83D\uDED1",
};

export function ActivityFeed() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    const eventSource = new EventSource("/api/agents");
    eventSource.onmessage = (e) => {
      try {
        const event: ActivityEvent = JSON.parse(e.data);
        setEvents((prev) => [event, ...prev].slice(0, 100));
      } catch { /* ignore parse errors */ }
    };
    return () => eventSource.close();
  }, []);

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50">
      <div className="px-4 py-3 border-b border-zinc-800">
        <h3 className="text-sm font-semibold">Live Activity</h3>
      </div>
      <ScrollArea className="h-64">
        <div className="p-3 space-y-2">
          {events.length === 0 && (
            <p className="text-xs text-zinc-600 text-center py-8">
              No activity yet. Post a job to get started.
            </p>
          )}
          {events.map((event) => (
            <div key={event.id} className="flex items-start gap-2 text-xs animate-in fade-in slide-in-from-top-1 duration-300">
              <span className="text-zinc-600 tabular-nums shrink-0">
                {new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              <span>{TYPE_ICONS[event.type] || "\u2022"}</span>
              <span className={AGENT_COLORS[event.agent]}>
                {event.message}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
