"use client";

const sampleLog = [
  { job: "#12", policy: "research only", status: "approved", time: "14:23" },
  { job: "#13", signer: "BitGo wallet", status: "approved", time: "14:25" },
  { job: "#13", action: "tx hash submitted", status: "settled", time: "14:26" },
];

export function AddressLog() {
  return (
    <div className="relative rounded-2xl border border-white/[0.06] bg-[#0c0d12] p-5 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff0033]/30 to-transparent" />
      <p className="text-[#ff0033] text-[10px] font-semibold uppercase tracking-widest mb-1">
        Execution log
      </p>
      <h3 className="text-lg font-light text-white tracking-tight mb-3">Execution Intermediary Log</h3>
      <p className="text-[10px] text-zinc-600 italic mb-2">Illustrative example</p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-zinc-600 border-b border-white/[0.06]">
              <th className="text-left py-2 pr-4">Job</th>
              <th className="text-left py-2 pr-4">Details</th>
              <th className="text-left py-2 pr-4">Status</th>
              <th className="text-left py-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {sampleLog.map((entry, i) => (
              <tr key={i} className="border-b border-white/[0.03]">
                <td className="py-2 pr-4 font-mono text-white">{entry.job}</td>
                <td className="py-2 pr-4 text-zinc-500">
                  {entry.policy || entry.signer || entry.action}
                </td>
                <td className="py-2 pr-4">
                  <span className={entry.status === "approved" || entry.status === "settled" ? "text-green-400" : "text-red-400"}>
                    {entry.status}
                  </span>
                </td>
                <td className="py-2 text-zinc-600">{entry.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-6 mt-4 text-xs text-zinc-600">
        <span>User EOA on DEX: <strong className="text-white">0</strong></span>
        <span>Webhook denials: <strong className="text-white">3</strong></span>
        <span>Encrypted docs: <strong className="text-white">31</strong></span>
      </div>
    </div>
  );
}
