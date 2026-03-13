"use client";

import { useAgentReputation } from "@/hooks/useAgentReputation";
import { Card, CardContent } from "@/components/ui/card";

export function ReputationChart() {
  const { reputations, loading } = useAgentReputation();

  if (loading) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold mb-4">Agent Reputation</h3>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 bg-zinc-800 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold mb-4">Agent Reputation</h3>
        <div className="space-y-3">
          {reputations.map((rep) => (
            <div key={rep.agentId} className="flex items-center gap-3">
              <span className="text-xs text-zinc-400 w-20 shrink-0">{rep.name}.eth</span>
              <div className="flex-1 h-5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full transition-all duration-500"
                  style={{ width: `${rep.avgScore}%` }}
                />
              </div>
              <span className="text-xs font-mono text-zinc-300 w-8 text-right">{rep.avgScore}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
