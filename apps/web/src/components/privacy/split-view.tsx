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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ──────── DECRYPTED VIEW ──────── */}
      <div className="relative rounded-[2rem] border border-white/[0.05] bg-[#0c0d12]/40 backdrop-blur-xl p-8 overflow-hidden group hover:border-green-500/20 transition-all duration-300">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-500/20 to-transparent" />
        <div className="absolute top-0 left-0 w-32 h-32 bg-green-500 rounded-full blur-[80px] opacity-[0.02] pointer-events-none" />
        
        <div className="flex items-center justify-between mb-8">
           <div>
            <p className="text-green-500 text-[9px] font-bold uppercase tracking-[0.2em] mb-2">
              User Identity
            </p>
            <h3 className="text-2xl font-light text-white tracking-tight">Decrypted View</h3>
           </div>
           <div className="px-3 py-1 rounded-full border border-green-500/10 bg-green-500/5">
              <span className="text-[9px] font-mono text-green-500 uppercase tracking-widest font-black">PRIVATE_ACCESS</span>
           </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] group/item hover:border-green-500/10 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-white text-sm uppercase tracking-tight">Job #12: Intelligence Scan</p>
              <span className="text-[10px] text-green-500 font-mono">ST_09</span>
            </div>
            <div className="space-y-1.5 pl-4 border-l border-white/5">
              <p className="text-xs text-zinc-500">Agent: <span className="text-zinc-300">scout.eth</span></p>
              <p className="text-xs text-zinc-500">Analysis: <span className="text-zinc-300">Aave v3 4.2% APY found on Base</span></p>
              <p className="text-xs text-zinc-500">Outcome: <span className="text-zinc-300">Deposit 500 USDC recommended</span></p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] group/item hover:border-green-500/10 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-white text-sm uppercase tracking-tight">Job #13: Protocol Execution</p>
              <span className="text-[10px] text-green-500 font-mono">ST_11</span>
            </div>
            <div className="space-y-1.5 pl-4 border-l border-white/5">
              <p className="text-xs text-zinc-500">Agent: <span className="text-zinc-300">ghost.eth</span></p>
              <p className="text-xs text-zinc-500">Intermediary: <span className="text-zinc-300">BitGo Policy Wallet</span></p>
              <p className="text-xs text-zinc-500">Action: <span className="text-zinc-300">500 USDC → Aave v3 Supply</span></p>
            </div>
          </div>
          
          <div className="mt-6 flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]" />
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
              You see the strategy. The chain sees the result.
            </p>
          </div>
        </div>
      </div>

      {/* ──────── PUBLIC VIEW ──────── */}
      <div className="relative rounded-[2rem] border border-white/[0.05] bg-[#0c0d12]/40 backdrop-blur-xl p-8 overflow-hidden group hover:border-[#ff0033]/20 transition-all duration-300">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff0033]/20 to-transparent" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff0033] rounded-full blur-[80px] opacity-[0.02] pointer-events-none" />

        <div className="flex items-center justify-between mb-8">
           <div>
            <p className="text-[#ff0033] text-[9px] font-bold uppercase tracking-[0.2em] mb-2">
              Blockchain Ledger
            </p>
            <h3 className="text-2xl font-light text-white tracking-tight">Chain View</h3>
           </div>
           <div className="px-3 py-1 rounded-full border border-[#ff0033]/10 bg-[#ff0033]/5">
              <span className="text-[9px] font-mono text-[#ff0033] uppercase tracking-widest font-black">PUBLIC_DATA</span>
           </div>
        </div>

        <div className="space-y-3">
          {sampleTxns.map((tx, i) => (
            <div key={i} className="p-4 rounded-xl bg-[#07080a] border border-white/[0.03] flex items-center justify-between group/item hover:border-white/10 transition-colors">
              <div className="min-w-0">
                <p className="text-[10px] text-zinc-600 font-mono truncate">{tx.from} <span className="text-zinc-800">→</span> {tx.to}</p>
                <p className="text-[10px] text-zinc-400 font-mono mt-1">{tx.amount}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[9px] font-mono text-zinc-800 uppercase tracking-widest italic">(unknown_purpose)</span>
              </div>
            </div>
          ))}

          <div className="mt-8 grid grid-cols-2 gap-2">
            {[
              "NO_USER_EOA_DEX_LINK",
              "ENCRYPTED_REPORT_LOCKED",
              "INTERMEDIARY_WALLET_OWNED",
              "PREFERENCES_REDACTED"
            ].map((tag) => (
              <div key={tag} className="p-2 border border-white/[0.02] bg-white/[0.01] rounded-lg">
                <p className="text-[8px] font-mono text-[#ff0033]/60 uppercase tracking-tighter">{tag}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3">
             <div className="w-1.5 h-1.5 bg-[#ff0033] rounded-full shadow-[0_0_8px_#ef4444]" />
             <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                The blockchain sees execution through an intermediary.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
