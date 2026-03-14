import { SplitView } from "@/components/privacy/split-view";
import { AddressLog } from "@/components/privacy/address-log";
import { EnsControl } from "@/components/privacy/ens-control";

export default function PrivacyPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <p className="text-[#ff0033] text-[9px] font-bold uppercase tracking-[0.3em] mb-2 opacity-80">
            ENCRYPTION_LAYER :: OBFUSCATION
          </p>
          <h1 className="text-4xl font-black text-white tracking-tight uppercase" style={{ fontFamily: "Impact, 'Arial Black', sans-serif" }}>
            Privacy
          </h1>
          <p className="text-xs text-zinc-600 mt-2 font-medium italic">&quot;Strategy remains private. Execution remains public.&quot;</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl border border-green-500/20 bg-green-500/5 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
          <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Shield_Status: ACTIVE</span>
        </div>
      </div>

      <SplitView />
      <AddressLog />
      <EnsControl />
    </div>
  );
}
