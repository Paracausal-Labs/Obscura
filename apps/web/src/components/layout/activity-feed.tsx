"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ActivityEvent, AgentRole } from "@obscura/shared";

const AGENT_COLORS: Record<AgentRole, string> = {
  scout: "text-[#aaaaaa]",
  analyst: "text-[#888888]",
  ghost: "text-[#ff0033]",
  sentinel: "text-[#cccccc]",
};

const AGENT_GLOWS: Record<AgentRole, string> = {
  scout: "shadow-[0_0_8px_#aaaaaa44]",
  analyst: "shadow-[0_0_8px_#88888844]",
  ghost: "shadow-[0_0_8px_#ff003344]",
  sentinel: "shadow-[0_0_8px_#cccccc44]",
};

const TYPE_ICONS: Record<string, string> = {
  pickup: "◈",
  tool_call: "⚡",
  submit: "⤴",
  evaluate: "◈",
  complete: "✓",
  reject: "✕",
  error: "⚠",
  killswitch: "⛔",
};

export function ActivityFeed() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    const eventSource = new EventSource("/api/agents");
    eventSource.onmessage = (e) => {
      try {
        const event: ActivityEvent = JSON.parse(e.data);
        setEvents((prev) => [event, ...prev].slice(0, 50));
      } catch { /* ignore */ }
    };
    return () => eventSource.close();
  }, []);

  return (
    <div className="relative rounded-[2rem] border border-white/[0.05] bg-[#0c0d12]/40 backdrop-blur-xl overflow-hidden min-h-[500px] flex flex-col">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#ff0033] rounded-full blur-[100px] opacity-[0.02] pointer-events-none" />

      <div className="px-8 py-6 border-b border-white/[0.05] flex items-center justify-between">
        <div>
          <p className="text-[#ff0033] text-[9px] font-bold uppercase tracking-[0.2em] mb-2">
            Protocol Streams
          </p>
          <h3 className="text-2xl font-light text-white tracking-tight">System Decryption</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#ff0033] animate-pulse" />
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Live_Connect</span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-8 space-y-4">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 mb-4" />
              <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em]">
                Awaiting_Signal...
              </p>
            </div>
          ) : (
            events.map((event, idx) => (
              <div 
                key={event.id || idx} 
                className="group flex items-start gap-4 animate-in fade-in slide-in-from-top-1 duration-500"
              >
                <div className="flex flex-col items-center gap-1.5 mt-1">
                  <span className="text-zinc-700 tabular-nums text-[9px] font-mono tracking-tighter">
                   {new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                  <div className="w-px h-full min-h-[20px] bg-gradient-to-b from-white/[0.05] to-transparent" />
                </div>

                <div className="flex-1 flex items-start gap-3 p-3 rounded-2xl bg-white/[0.01] border border-white/[0.03] group-hover:border-white/[0.08] group-hover:bg-white/[0.02] transition-all">
                  <div className={`w-8 h-8 rounded-xl bg-[#07080a] border border-white/[0.05] flex items-center justify-center shrink-0 ${AGENT_GLOWS[event.agent]}`}>
                     <span className={`text-xs ${AGENT_COLORS[event.agent]}`}>
                      {TYPE_ICONS[event.type] || "◈"}
                     </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-1">
                      {event.agent} <span className="text-zinc-800">::</span> {event.type}
                    </p>
                    <p className={`text-[11px] leading-relaxed transition-colors group-hover:text-white ${AGENT_COLORS[event.agent]} opacity-90`}>
                      {event.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* footer detail */}
      <div className="px-8 py-4 border-t border-white/[0.05] bg-white/[0.01] flex items-center justify-between">
         <span className="text-[8px] font-mono text-zinc-700 tracking-tighter uppercase">Signal_Strength: 98.4%</span>
         <span className="text-[8px] font-mono text-zinc-700 tracking-tighter uppercase">Log_Buffer_Status: Optimized</span>
      </div>
    </div>
  );
}
