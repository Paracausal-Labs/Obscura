"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

const data = [
  { name: "Mon", gain: 120, loss: 0 },
  { name: "Tue", gain: 0, loss: -45 },
  { name: "Wed", gain: 280, loss: 0 },
  { name: "Thu", gain: 190, loss: 0 },
  { name: "Fri", gain: 0, loss: -20 },
  { name: "Sat", gain: 340, loss: 0 },
  { name: "Sun", gain: 85, loss: 0 },
];

export function PnlChart() {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold mb-2">Weekly P&L</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <XAxis dataKey="name" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Bar dataKey="gain" fill="#22c55e" radius={[4, 4, 0, 0]} stackId="pnl" />
            <Bar dataKey="loss" fill="#ef4444" radius={[0, 0, 4, 4]} stackId="pnl" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
