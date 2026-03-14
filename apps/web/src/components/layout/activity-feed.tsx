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
    <div className="relative rounded-[2rem] border border-white/[0.06] bg-[#0c0d12] overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff0033]/30 to-transparent" />
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <p className="text-[#ff0033] text-[10px] font-semibold uppercase tracking-widest mb-0.5">
          Activity
        </p>
        <h3 className="text-lg font-light text-white tracking-tight">Live Activity</h3>
      </div>
      <ScrollArea className="h-[400px]">
        <div className="p-4 space-y-2">
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
