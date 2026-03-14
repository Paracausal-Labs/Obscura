import { CreateJob } from "@/components/jobs/create-job";
import { JobBoard } from "@/components/jobs/job-board";
import { AgentCard } from "@/components/agents/agent-card";
import { AGENTS } from "@/lib/config/agents";
import { ActivityFeed } from "@/components/layout/activity-feed";

export default function MarketplacePage() {
  return (
    <div className="space-y-6 max-w-6xl px-2 sm:px-0">
      <div>
        <p className="text-[#ff0033] text-[9px] font-bold uppercase tracking-[0.3em] mb-2 opacity-80">
          PROTOCOL_COMMERCE :: ERC-8183
        </p>
        <h1 className="text-4xl font-black text-white tracking-tight uppercase" style={{ fontFamily: "Impact, 'Arial Black', sans-serif" }}>
          Marketplace
        </h1>
        <p className="text-xs text-zinc-600 mt-2 font-medium">Initialize mission directives and mobilize specialized AI agents</p>
      </div>

      <CreateJob />
      <ActivityFeed />
      <JobBoard />

      <div className="pt-8">
        <p className="text-zinc-600 text-[9px] font-bold uppercase tracking-[0.3em] mb-4 opacity-80">
          AVAILABLE_AGENTS
        </p>
        <div className="grid grid-cols-1 gap-6">
          {Object.values(AGENTS).map((agent) => (
            <AgentCard key={agent.role} agent={agent} />
          ))}
        </div>
      </div>
    </div>
  );
}
