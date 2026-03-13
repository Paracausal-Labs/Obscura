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
    <div className="relative rounded-2xl border border-white/[0.06] bg-[#0c0d12] p-5 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff0033]/30 to-transparent" />
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[#ff0033] text-[10px] font-semibold uppercase tracking-widest mb-1">
            ENS
          </p>
          <h3 className="text-lg font-light text-white tracking-tight">ENS Control Panel</h3>
        </div>
        <span className="text-[10px] text-zinc-600 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-lg">
          Preview — set via ENS app
        </span>
      </div>
      <div className="space-y-3">
        {records.map((record, i) => (
          <div key={record.key} className="flex items-center gap-3">
            <label className="text-xs text-zinc-600 w-32 shrink-0">{record.label}</label>
            <Input
              value={record.value}
              onChange={(e) => updateRecord(i, e.target.value)}
              className="bg-[#0a0b0f] border-white/[0.06] text-sm h-8 focus:border-[#ff0033]/30"
            />
          </div>
        ))}

        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
          <div>
            <p className="text-sm font-medium text-white">Kill Switch</p>
            <p className="text-xs text-zinc-600">
              {killswitch ? "All agents are STOPPED" : "Agents are active"}
            </p>
          </div>
          <Button
            onClick={() => setKillswitch(!killswitch)}
            size="sm"
            className={killswitch
              ? "bg-green-600 hover:bg-green-700 rounded-xl"
              : "bg-[#ff0033] hover:bg-[#ff1a40] rounded-xl"
            }
          >
            {killswitch ? "Resume Agents" : "Activate Kill Switch"}
          </Button>
        </div>
      </div>
    </div>
  );
}
