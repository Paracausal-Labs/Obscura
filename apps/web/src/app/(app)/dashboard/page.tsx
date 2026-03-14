import { StatsCards } from "@/components/charts/stats-cards";
import { PortfolioChart } from "@/components/charts/portfolio-chart";
import { ReputationChart } from "@/components/charts/reputation-chart";
import { PnlChart } from "@/components/charts/pnl-chart";
import { ActivityFeed } from "@/components/layout/activity-feed";
import { JobHistory } from "@/components/jobs/job-history";

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <p className="text-[#ff0033] text-[9px] font-bold uppercase tracking-[0.3em] mb-2 opacity-80">
          SYSTEM_OVERVIEW
        </p>
        <h1 className="text-4xl font-black text-white tracking-tight uppercase" style={{ fontFamily: "Impact, 'Arial Black', sans-serif" }}>
          Dashboard
        </h1>
        <p className="text-xs text-zinc-600 mt-2 font-medium">
          Secure node operations :: Private agent commerce with public reputation
        </p>
      </div>

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PortfolioChart />
        <div className="space-y-4">
          <ReputationChart />
          <PnlChart />
        </div>
      </div>

      <JobHistory />

      <ActivityFeed />
    </div>
  );
}
