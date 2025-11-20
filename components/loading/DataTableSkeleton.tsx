/**
 * DataTableSkeleton Component
 *
 * Loading placeholder for DataTable components
 * Shown while DataTable is being dynamically imported
 */
export function DataTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-10 w-64 bg-cyan-400/10 rounded-lg animate-pulse" />
        <div className="h-10 w-32 bg-cyan-400/10 rounded-lg animate-pulse" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-lg border border-cyan-400/20 overflow-hidden">
        {/* Table header */}
        <div className="bg-black/40 p-4 border-b border-cyan-400/20 flex gap-4">
          <div className="h-6 w-32 bg-cyan-400/10 rounded animate-pulse" />
          <div className="h-6 w-48 bg-cyan-400/10 rounded animate-pulse flex-1" />
          <div className="h-6 w-24 bg-cyan-400/10 rounded animate-pulse" />
          <div className="h-6 w-16 bg-cyan-400/10 rounded animate-pulse" />
        </div>

        {/* Table rows */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="p-4 border-b border-cyan-400/10 flex gap-4 items-center"
          >
            <div className="h-5 w-32 bg-cyan-400/10 rounded animate-pulse" />
            <div className="h-5 w-48 bg-cyan-400/10 rounded animate-pulse flex-1" />
            <div className="h-5 w-24 bg-cyan-400/10 rounded animate-pulse" />
            <div className="h-5 w-16 bg-cyan-400/10 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-10 w-48 bg-cyan-400/10 rounded-lg animate-pulse" />
        <div className="flex gap-2">
          <div className="h-10 w-10 bg-cyan-400/10 rounded-lg animate-pulse" />
          <div className="h-10 w-10 bg-cyan-400/10 rounded-lg animate-pulse" />
          <div className="h-10 w-10 bg-cyan-400/10 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  )
}
