import { StatsCards } from "@/components/charts/stats-cards";
import { PortfolioChart } from "@/components/charts/portfolio-chart";
import { ReputationChart } from "@/components/charts/reputation-chart";
import { PnlChart } from "@/components/charts/pnl-chart";
import { ActivityFeed } from "@/components/layout/activity-feed";

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-sm text-zinc-500">Private-by-default agent commerce with public reputation</p>
      </div>

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PortfolioChart />
        <div className="space-y-6">
          <ReputationChart />
          <PnlChart />
        </div>
      </div>

      <ActivityFeed />
    </div>
  );
}
