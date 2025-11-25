import { motion } from 'framer-motion'

type SpinnerColor = 'cyan' | 'purple' | 'pink' | 'emerald' | 'yellow' | 'white'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: SpinnerColor
  text?: string
}

/**
 * LoadingSpinner Component
 *
 * Animated loading spinner with optional text
 *
 * @param {string} size - Size of spinner: sm (24px), md (48px), lg (64px)
 * @param {SpinnerColor} color - Color of spinner (default: cyan)
 * @param {string} text - Optional loading text to display below spinner
 *
 * @example
 * <LoadingSpinner size="md" color="purple" text="Loading..." />
 */
export const LoadingSpinner = ({
  size = 'md',
  color = 'cyan',
  text
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4'
  }

  // Color maps for Tailwind JIT - all classes must be complete strings
  const borderColorClasses = {
    cyan: 'border-t-cyan-400 border-r-cyan-400',
    purple: 'border-t-purple-400 border-r-purple-400',
    pink: 'border-t-pink-400 border-r-pink-400',
    emerald: 'border-t-emerald-400 border-r-emerald-400',
    yellow: 'border-t-yellow-400 border-r-yellow-400',
    white: 'border-t-white border-r-white',
  }

  const textColorClasses = {
    cyan: 'text-cyan-400',
    purple: 'text-purple-400',
    pink: 'text-pink-400',
    emerald: 'text-emerald-400',
    yellow: 'text-yellow-400',
    white: 'text-white',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        className={`${sizeClasses[size]} ${borderColorClasses[color]} border-b-transparent border-l-transparent rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      {text && (
        <motion.p
          className={`${textColorClasses[color]} text-sm font-['Great_Vibes']`}
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
