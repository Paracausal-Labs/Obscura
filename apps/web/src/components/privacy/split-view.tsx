"use client";

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
      <div className="relative rounded-2xl border border-white/[0.06] bg-[#0c0d12] p-5 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />
        <h3 className="text-sm font-medium text-green-400 mb-3">Your View (Decrypted)</h3>
        <div className="space-y-3 text-sm">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <p className="font-medium text-white">Job #12: Find yield</p>
            <p className="text-xs text-zinc-500">Agent: scout.eth</p>
            <p className="text-xs text-zinc-500">Found: Aave v3 4.2% APY on Base</p>
            <p className="text-xs text-zinc-500">Rec: Deposit 500 USDC</p>
            <p className="text-xs text-green-400 mt-1">Status: Completed</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <p className="font-medium text-white">Job #13: Swap to ETH</p>
            <p className="text-xs text-zinc-500">Agent: ghost.eth</p>
            <p className="text-xs text-zinc-500">Executor: BitGo wallet</p>
            <p className="text-xs text-zinc-500">Amount: 500 USDC → Aave v3</p>
            <p className="text-xs text-green-400 mt-1">Status: Executed</p>
          </div>
          <p className="text-xs text-zinc-600 italic mt-2">
            &quot;You see the strategy. They see the result.&quot;
          </p>
        </div>
      </div>

      <div className="relative rounded-2xl border border-white/[0.06] bg-[#0c0d12] p-5 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff0033]/30 to-transparent" />
        <h3 className="text-sm font-medium text-[#ff0033] mb-3">Chain View (Public)</h3>
        <div className="space-y-2 text-sm">
          {sampleTxns.map((tx, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] font-mono text-xs">
              <p className="text-zinc-500">{tx.from} → {tx.to}</p>
              <p className="text-zinc-300">{tx.amount}</p>
              <p className="text-zinc-700">(unknown purpose)</p>
            </div>
          ))}
          <div className="mt-3 space-y-1 text-xs">
            <p className="text-[#ff0033]">No direct user EOA → DEX link</p>
            <p className="text-[#ff0033]">Cannot read encrypted report</p>
            <p className="text-zinc-600">Can see BitGo intermediary</p>
            <p className="text-[#ff0033]">Cannot see private preferences</p>
          </div>
          <p className="text-xs text-zinc-600 italic mt-2">
            &quot;The blockchain sees execution through an intermediary.&quot;
          </p>
        </div>
      </div>
    </div>
  );
}
