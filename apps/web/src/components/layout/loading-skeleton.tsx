import { Skeleton } from "@/components/ui/skeleton";

function StatCardSkeleton() {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <Skeleton className="h-3 w-20 mb-2" />
      <Skeleton className="h-7 w-24 mb-1" />
      <Skeleton className="h-3 w-14" />
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <Skeleton className="h-7 w-40 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="space-y-6">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <Skeleton className="h-5 w-28 mb-4" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <Skeleton className="h-5 w-24 mb-4" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>

      {/* Activity feed */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
        <Skeleton className="h-5 w-28 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
