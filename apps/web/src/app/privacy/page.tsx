import { SplitView } from "@/components/privacy/split-view";
import { AddressLog } from "@/components/privacy/address-log";
import { EnsControl } from "@/components/privacy/ens-control";

export default function PrivacyPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl font-bold mb-1">Privacy</h1>
          <p className="text-sm text-zinc-500">Your strategy stays private. The chain sees execution through an intermediary.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-green-400">Privacy: ON</span>
        </div>
      </div>

      <SplitView />
      <AddressLog />
      <EnsControl />
    </div>
  );
}
