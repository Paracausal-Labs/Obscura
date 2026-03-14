"use client";

const sampleLog = [
  { job: "#12", policy: "RESEARCH_SCAN_ONLY", status: "VERIFIED", time: "14:23:01" },
  { job: "#13", signer: "BITGO_VAULT_ENGINE", status: "VERIFIED", time: "14:25:12" },
  { job: "#13", action: "PUBLIC_TX_SETTLEMENT", status: "SETTLED", time: "14:26:45" },
];

export function AddressLog() {
  return (
    <div className="relative rounded-[2rem] border border-white/[0.05] bg-[#0c0d12]/40 backdrop-blur-xl p-8 overflow-hidden group hover:border-white/[0.12] transition-all duration-300">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#ff0033] rounded-full blur-[100px] opacity-[0.02] pointer-events-none" />

      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[#ff0033] text-[9px] font-bold uppercase tracking-[0.2em] mb-2">
            Intermediary Audit
          </p>
          <h3 className="text-2xl font-light text-white tracking-tight">Execution Trail</h3>
        </div>
        <div className="flex items-center gap-3">
           <div className="text-right">
              <p className="text-[8px] text-zinc-600 uppercase tracking-widest">Privacy Multiplier</p>
              <p className="text-sm font-black text-white">12.4x <span className="text-[9px] text-zinc-500">OBF</span></p>
           </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.05]">
              <th className="text-left py-3 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Protocol#</th>
              <th className="text-left py-3 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Internal Logic</th>
              <th className="text-left py-3 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Registry</th>
              <th className="text-right py-3 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02]">
            {sampleLog.map((entry, i) => (
              <tr key={i} className="group/row">
                <td className="py-4 font-mono text-[10px] text-[#ff0033] font-bold group-hover/row:text-white transition-colors">{entry.job}</td>
                <td className="py-4 text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">
                  {entry.policy || entry.signer || entry.action}
                </td>
                <td className="py-4">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border border-white/5 uppercase tracking-widest ${
                    entry.status === "VERIFIED" || entry.status === "SETTLED" ? "text-green-500 bg-green-500/5" : "text-red-500 bg-red-500/5"
                  }`}>
                    {entry.status}
                  </span>
                </td>
                <td className="py-4 text-right font-mono text-[10px] text-zinc-700">{entry.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-12 flex flex-wrap items-center gap-8 border-t border-white/[0.05] pt-6">
        <div className="flex flex-col">
          <span className="text-[8px] text-zinc-700 uppercase tracking-widest mb-1">DEX Direct Links</span>
          <span className="text-lg font-black text-white">0</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] text-zinc-700 uppercase tracking-widest mb-1">Webhook Refusals</span>
          <span className="text-lg font-black text-white">03</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] text-zinc-700 uppercase tracking-widest mb-1">Encrypted Payload</span>
          <span className="text-lg font-black text-white">31</span>
        </div>
        <div className="flex-1" />
        <div className="text-right">
           <p className="text-[8px] text-zinc-800 uppercase tracking-[0.3em] font-mono">ERC-8004_ENHANCED_AUDIT_ENABLED</p>
        </div>
      </div>
    </div>
  );
}
