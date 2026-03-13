"use client";

import { Card, CardContent } from "@/components/ui/card";

interface Transaction {
  from: string;
  to: string;
  amount: string;
  purpose: string;
}

const sampleTxns: Transaction[] = [
  { from: "0x7f3a...9c2e", to: "0x9bc2...8d4f", amount: "0.02 USDC", purpose: "HeyElsa API payment" },
  { from: "0xa14f...3b7c", to: "0x3d8e...1a2f", amount: "0.05 USDC", purpose: "Job escrow release" },
  { from: "0xBITGO...4e8a", to: "0xAAVE...7f2d", amount: "500 USDC", purpose: "Aave deposit" },
];

export function SplitView() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-green-400 mb-3">Your View (Decrypted)</h3>
          <div className="space-y-3 text-sm">
            <div className="p-3 rounded bg-zinc-800/50">
              <p className="font-medium">Job #12: Find yield</p>
              <p className="text-xs text-zinc-400">Agent: scout.eth</p>
              <p className="text-xs text-zinc-400">Found: Aave v3 4.2% APY on Base</p>
              <p className="text-xs text-zinc-400">Rec: Deposit 500 USDC</p>
              <p className="text-xs text-green-400 mt-1">Status: Completed</p>
            </div>
            <div className="p-3 rounded bg-zinc-800/50">
              <p className="font-medium">Job #13: Swap to ETH</p>
              <p className="text-xs text-zinc-400">Agent: ghost.eth</p>
              <p className="text-xs text-zinc-400">Executor: BitGo wallet</p>
              <p className="text-xs text-zinc-400">Amount: 500 USDC → Aave v3</p>
              <p className="text-xs text-green-400 mt-1">Status: Executed</p>
            </div>
            <p className="text-xs text-zinc-500 italic mt-2">
              &quot;You see the strategy. They see the result.&quot;
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-red-400 mb-3">Chain View (Public)</h3>
          <div className="space-y-2 text-sm">
            {sampleTxns.map((tx, i) => (
              <div key={i} className="p-3 rounded bg-zinc-800/50 font-mono text-xs">
                <p className="text-zinc-400">{tx.from} → {tx.to}</p>
                <p className="text-zinc-300">{tx.amount}</p>
                <p className="text-zinc-600">(unknown purpose)</p>
              </div>
            ))}
            <div className="mt-3 space-y-1 text-xs">
              <p className="text-red-400">No direct user EOA → DEX link</p>
              <p className="text-red-400">Cannot read encrypted report</p>
              <p className="text-zinc-500">Can see BitGo intermediary</p>
              <p className="text-red-400">Cannot see private preferences</p>
            </div>
            <p className="text-xs text-zinc-500 italic mt-2">
              &quot;The blockchain sees execution through an intermediary.&quot;
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
