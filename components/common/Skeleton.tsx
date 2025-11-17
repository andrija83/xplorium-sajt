import { motion } from 'framer-motion'

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string
  height?: string
  className?: string
}

/**
 * Skeleton Component
 *
 * Animated skeleton loader for placeholder content
 *
 * @param {string} variant - Shape of skeleton: text, circular, or rectangular
 * @param {string} width - Width (CSS value, e.g., "100%", "200px")
 * @param {string} height - Height (CSS value, e.g., "20px", "4rem")
 * @param {string} className - Additional Tailwind classes
 *
 * @example
 * // Text skeleton
 * <Skeleton variant="text" width="80%" height="1rem" />
 *
 * // Avatar skeleton
 * <Skeleton variant="circular" width="48px" height="48px" />
 *
 * // Card skeleton
 * <Skeleton variant="rectangular" width="100%" height="200px" />
 */
export const Skeleton = ({
  variant = 'rectangular',
  width = '100%',
  height = '1rem',
  className = ''
}: SkeletonProps) => {
  const baseClasses = 'bg-white/10 overflow-hidden'

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
    >
      <motion.div
        className="w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  )
}

/**
 * SkeletonGroup Component
 *
 * Group of skeleton loaders for common UI patterns
 *
 * @example
 * // Article skeleton
 * <SkeletonGroup type="article" />
 *
 * // Card grid skeleton
 * <SkeletonGroup type="card" count={3} />
 */
interface SkeletonGroupProps {
  type: 'article' | 'card' | 'list'
  count?: number
}

export const SkeletonGroup = ({ type, count = 1 }: SkeletonGroupProps) => {
  if (type === 'article') {
    return (
      <div className="space-y-4 w-full">
        <Skeleton variant="text" width="60%" height="2rem" />
        <Skeleton variant="text" width="100%" height="1rem" />
        <Skeleton variant="text" width="100%" height="1rem" />
        <Skeleton variant="text" width="80%" height="1rem" />
        <Skeleton variant="rectangular" width="100%" height="200px" />
      </div>
    )
  }

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton variant="rectangular" width="100%" height="150px" />
            <Skeleton variant="text" width="80%" height="1rem" />
            <Skeleton variant="text" width="60%" height="0.875rem" />
          </div>
        ))}
      </div>
    )
  }

  if (type === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton variant="circular" width="40px" height="40px" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" width="70%" height="1rem" />
              <Skeleton variant="text" width="50%" height="0.875rem" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return null
}
