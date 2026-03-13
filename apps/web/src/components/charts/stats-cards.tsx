"use client";

import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
}

function StatCard({ label, value, change }: StatCardProps) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardContent className="p-4">
        <p className="text-xs text-zinc-500 mb-1">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
        {change && (
          <p className={`text-xs mt-1 ${change.startsWith("+") ? "text-green-400" : "text-red-400"}`}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Total Value" value="$12,847" change="+2.3%" />
      <StatCard label="Jobs Completed" value="47" change="+5 today" />
      <StatCard label="Agents Active" value="4/4" />
      <StatCard label="Savings" value="$847" change="+$42" />
    </div>
  );
}
