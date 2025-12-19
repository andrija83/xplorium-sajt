/**
 * Admin Loading State
 *
 * Displayed during page transitions in admin routes
 * Prevents white screen flash during navigation
 */

export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px] bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-white/60 text-sm">Loading...</p>
      </div>
    </div>
  )
}
