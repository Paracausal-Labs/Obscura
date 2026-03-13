import { StatsCards } from "@/components/charts/stats-cards";
import { PortfolioChart } from "@/components/charts/portfolio-chart";
import { ReputationChart } from "@/components/charts/reputation-chart";
import { PnlChart } from "@/components/charts/pnl-chart";
import { ActivityFeed } from "@/components/layout/activity-feed";

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <p className="text-[#ff0033] text-[10px] font-semibold uppercase tracking-widest mb-1">
          Overview
        </p>
        <h1 className="text-3xl font-light text-white tracking-tight">Dashboard</h1>
        <p className="text-sm text-zinc-600 mt-1">
          Private-by-default agent commerce with public reputation
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

      <ActivityFeed />
    </div>
  );
}
