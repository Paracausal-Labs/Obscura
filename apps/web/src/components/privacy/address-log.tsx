"use client";

import { Card, CardContent } from "@/components/ui/card";

const sampleLog = [
  { job: "#12", policy: "research only", status: "approved", time: "14:23" },
  { job: "#13", signer: "BitGo wallet", status: "approved", time: "14:25" },
  { job: "#13", action: "tx hash submitted", status: "settled", time: "14:26" },
];

export function AddressLog() {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold mb-3">Execution Intermediary Log</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-800">
                <th className="text-left py-2 pr-4">Job</th>
                <th className="text-left py-2 pr-4">Details</th>
                <th className="text-left py-2 pr-4">Status</th>
                <th className="text-left py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {sampleLog.map((entry, i) => (
                <tr key={i} className="border-b border-zinc-800/50">
                  <td className="py-2 pr-4 font-mono">{entry.job}</td>
                  <td className="py-2 pr-4 text-zinc-400">
                    {entry.policy || entry.signer || entry.action}
                  </td>
                  <td className="py-2 pr-4">
                    <span className={entry.status === "approved" || entry.status === "settled" ? "text-green-400" : "text-red-400"}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="py-2 text-zinc-500">{entry.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-6 mt-4 text-xs text-zinc-500">
          <span>User EOA on DEX: <strong className="text-zinc-300">0</strong></span>
          <span>Webhook denials: <strong className="text-zinc-300">3</strong></span>
          <span>Encrypted docs: <strong className="text-zinc-300">31</strong></span>
        </div>
      </CardContent>
    </Card>
  );
}
