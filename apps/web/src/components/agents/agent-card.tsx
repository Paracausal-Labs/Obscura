"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AgentMetadata } from "@obscura/shared";

interface AgentCardProps {
  agent: AgentMetadata;
  reputation?: number;
  jobCount?: number;
}

export function AgentCard({ agent, reputation = 80, jobCount = 15 }: AgentCardProps) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold">{agent.name}</h3>
            <p className="text-xs text-zinc-500">{agent.ensName}</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-mono">{reputation}/100</div>
            <div className="text-xs text-zinc-500">{jobCount} jobs</div>
          </div>
        </div>
        <p className="text-xs text-zinc-400 mb-3">{agent.description}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {agent.skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="text-[10px] bg-zinc-800 text-zinc-400">
              {skill}
            </Badge>
          ))}
        </div>
        <div className="mb-3">
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${reputation}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>Base fee: {agent.baseFee} USDC</span>
          <span>ERC-8004 ID: #{agent.id}</span>
        </div>
      </CardContent>
    </Card>
  );
}
