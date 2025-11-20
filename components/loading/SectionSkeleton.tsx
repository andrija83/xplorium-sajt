/**
 * SectionSkeleton - Loading skeleton for lazy-loaded sections
 * Displays while code-split sections are being loaded
 * Provides visual feedback to users during the loading process
 */
export function SectionSkeleton() {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-40">
      <div className="relative">
        {/* Pulsing circular loader */}
        <div className="w-16 h-16 rounded-full border-4 border-cyan-400/20 border-t-cyan-400 animate-spin" />

        {/* Glowing background effect */}
        <div
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            background: "radial-gradient(circle, rgba(34, 211, 238, 0.2) 0%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />
      </div>
    </div>
  )
}
