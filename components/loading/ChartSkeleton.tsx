/**
 * ChartSkeleton Component
 *
 * Loading placeholder for chart components
 * Shown while chart library is being dynamically imported
 */
export function ChartSkeleton() {
  return (
    <div className="w-full h-[300px] flex items-center justify-center bg-black/10 rounded-lg animate-pulse">
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
        <p className="text-sm text-cyan-400/60">Loading chart...</p>
      </div>
    </div>
  )
}
