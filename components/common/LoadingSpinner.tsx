import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
  text?: string
}

/**
 * LoadingSpinner Component
 *
 * Animated loading spinner with optional text
 *
 * @param {string} size - Size of spinner: sm (24px), md (48px), lg (64px)
 * @param {string} color - Color of spinner (default: cyan-400)
 * @param {string} text - Optional loading text to display below spinner
 *
 * @example
 * <LoadingSpinner size="md" color="purple-400" text="Loading..." />
 */
export const LoadingSpinner = ({
  size = 'md',
  color = 'cyan-400',
  text
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4'
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        className={`${sizeClasses[size]} border-t-${color} border-r-${color} border-b-transparent border-l-transparent rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          borderTopColor: `var(--${color})`,
          borderRightColor: `var(--${color})`,
        }}
      />
      {text && (
        <motion.p
          className={`text-${color} text-sm font-['Great_Vibes']`}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}
