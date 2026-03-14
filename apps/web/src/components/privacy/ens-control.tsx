"use client";

import { useAccount } from "wagmi";
import { useEnsIdentity, useEnsPreferences } from "@/hooks/useEnsIdentity";

export function EnsControl() {
  const { address } = useAccount();
  const { ensName, isLoading: nameLoading } = useEnsIdentity(address);
  const prefs = useEnsPreferences(ensName);

  const records = [
    { key: "defi.risk", label: "Risk Tolerance", value: prefs.risk },
    { key: "defi.assets", label: "Allowed Assets", value: prefs.assets },
    { key: "defi.maxTrade", label: "Max Trade (USD)", value: prefs.maxTrade },
    { key: "agent.killswitch", label: "Kill Switch", value: prefs.killswitch ? "ACTIVE" : "inactive" },
  ];

  const isKilled = prefs.killswitch;

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
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            {nameLoading ? "RESOLVING..." : ensName ? `ENS: ${ensName}` : "NO_ENS_NAME"}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {!address ? (
          <div className="py-12 text-center">
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em]">
              CONNECT_WALLET_TO_VIEW_POLICY
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {records.map((record) => (
                <div key={record.key} className="space-y-2">
                  <label className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest pl-1">
                    {record.label}
                  </label>
                  <div className="h-11 bg-[#07080a] border border-white/[0.06] rounded-xl px-4 flex items-center">
                    <span className="text-sm font-mono text-zinc-300">
                      {record.value || "—"}
                    </span>
                  </div>
                  <p className="text-[8px] font-mono text-zinc-700 pl-1">
                    TEXT_RECORD: {record.key}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 p-6 rounded-2xl bg-[#ff0033]/[0.02] border border-[#ff0033]/10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-500 ${
                  !isKilled
                    ? "bg-green-500/10 border-green-500/20 text-green-500"
                    : "bg-[#ff0033]/10 border-[#ff0033]/20 text-[#ff0033]"
                }`}>
                  <span className="text-xl">{!isKilled ? "✓" : "!"}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white uppercase tracking-tight">Emergency Kill Switch</p>
                  <p className="text-[10px] font-mono text-zinc-600 uppercase mt-0.5">
                    {!isKilled
                      ? "SIGNAL_CLEAR :: AGENTS ARE ACTIVE"
                      : "SIGNAL_BLOCKED :: ALL AGENTS HALTED"}
                  </p>
                </div>
              </div>
              <a
                href={`https://sepolia.app.ens.domains/${ensName || ""}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 px-8 font-black uppercase tracking-[0.15em] rounded-xl bg-gradient-to-b from-zinc-100/10 to-transparent border border-white/10 text-white hover:border-[#ff0033]/40 transition-all flex items-center text-xs"
              >
                Edit on ENS App
              </a>
            </div>

            <div className="flex items-center justify-center pt-4">
              <span className="text-[9px] text-zinc-800 font-mono uppercase tracking-[0.2em]">
                Live data from ENS text records on Ethereum Sepolia
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
