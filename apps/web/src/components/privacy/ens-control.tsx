"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EnsRecord {
  key: string;
  label: string;
  value: string;
}

export function EnsControl() {
  const [records, setRecords] = useState<EnsRecord[]>([
    { key: "defi.risk", label: "Risk Tolerance", value: "conservative" },
    { key: "defi.assets", label: "Allowed Assets", value: "ETH,USDC,WBTC" },
    { key: "defi.maxTrade", label: "Max Trade (USD)", value: "500" },
    { key: "defi.protocols", label: "Protocols", value: "aave,compound" },
  ]);
  const [killswitch, setKillswitch] = useState(false);

  function updateRecord(index: number, value: string) {
    setRecords((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], value };
      return updated;
    });
  }

  return (
    <div className="relative rounded-[2rem] border border-white/[0.05] bg-[#0c0d12]/40 backdrop-blur-xl p-8 overflow-hidden group hover:border-[#ff0033]/20 transition-all duration-300">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff0033]/20 to-transparent" />
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#ff0033] rounded-full blur-[100px] opacity-[0.02] pointer-events-none" />

      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[#ff0033] text-[9px] font-bold uppercase tracking-[0.2em] mb-2">
            Governance Node
          </p>
          <h3 className="text-2xl font-light text-white tracking-tight">Policy Management</h3>
        </div>
        <div className="px-3 py-1 rounded-full border border-white/5 bg-white/[0.02]">
           <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">MODE: SYSTEM_OVERRIDE</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {records.map((record, i) => (
            <div key={record.key} className="space-y-2">
              <label className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest pl-1">{record.label}</label>
              <div className="relative group">
                <Input
                  value={record.value}
                  onChange={(e) => updateRecord(i, e.target.value)}
                  className="h-11 bg-[#07080a] border-white/[0.06] focus:border-[#ff0033]/40 text-sm rounded-xl pl-4 font-mono"
                />
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <div className="w-1 h-1 rounded-full bg-white/10 group-hover:bg-[#ff0033]/40 transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 p-6 rounded-2xl bg-[#ff0033]/[0.02] border border-[#ff0033]/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-500 ${
              killswitch ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-[#ff0033]/10 border-[#ff0033]/20 text-[#ff0033]"
            }`}>
              <span className="text-xl">{killswitch ? "✓" : "!"}</span>
            </div>
            <div>
              <p className="text-sm font-bold text-white uppercase tracking-tight">Emergency Kill Switch</p>
              <p className="text-[10px] font-mono text-zinc-600 uppercase mt-0.5">
                {killswitch ? "SIGNAL_RESUMING :: AGENTS ARE ACTIVE" : "SIGNAL_BLOCKING :: AGENTS ARE LOCKED"}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setKillswitch(!killswitch)}
            className={`relative h-11 px-8 font-black uppercase tracking-[0.15em] rounded-xl transition-all backdrop-blur-md overflow-hidden group/kb ${
              killswitch
                ? "bg-gradient-to-b from-green-500/10 to-transparent border border-green-500/40 text-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:border-green-500"
                : "bg-gradient-to-b from-zinc-100/10 to-transparent border border-[#ff0033]/40 text-white hover:shadow-[0_0_20px_rgba(255,0,51,0.2)] hover:border-[#ff0033]"
            }`}
          >
            <span className="relative z-10">
              {killswitch ? "Re-Authorize Agents" : "Engage Kill Switch"}
            </span>
            <div className={`absolute bottom-0 left-0 w-full h-px opacity-30 group-hover/kb:opacity-100 transition-opacity ${
              killswitch ? "bg-green-500" : "bg-[#ff0033]"
            }`} />
          </Button>
        </div>

        <div className="flex items-center justify-center pt-4">
           <span className="text-[9px] text-zinc-800 font-mono uppercase tracking-[0.2em]">All changes are synchronized with ENS Registry :: eth.link</span>
        </div>
      </div>
    </div>
  );
}
