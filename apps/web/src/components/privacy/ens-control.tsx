"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold mb-4">ENS Control Panel</h3>
        <div className="space-y-3">
          {records.map((record, i) => (
            <div key={record.key} className="flex items-center gap-3">
              <label className="text-xs text-zinc-500 w-32 shrink-0">{record.label}</label>
              <Input
                value={record.value}
                onChange={(e) => updateRecord(i, e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-sm h-8"
              />
            </div>
          ))}

          <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
            <div>
              <p className="text-sm font-medium">Kill Switch</p>
              <p className="text-xs text-zinc-500">
                {killswitch ? "All agents are STOPPED" : "Agents are active"}
              </p>
            </div>
            <Button
              onClick={() => setKillswitch(!killswitch)}
              variant={killswitch ? "default" : "destructive"}
              size="sm"
              className={killswitch ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {killswitch ? "Resume Agents" : "Activate Kill Switch"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
