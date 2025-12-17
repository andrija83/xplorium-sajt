import { motion, AnimatePresence } from 'framer-motion'
import { NeonLoader } from './NeonLoader'

type TransitionColor = 'cyan' | 'purple' | 'pink'

interface PageTransitionProps {
  isLoading: boolean
  color?: TransitionColor
  text?: string
}

/**
 * PageTransition Component
 *
 * Full-screen loading transition with expanding neon circle effect.
 * Features:
 * - Fullscreen overlay with backdrop
 * - Expanding neon circle animation
 * - NeonLoader in the center
 * - Smooth fade in/out
 *
 * @param {boolean} isLoading - Whether the loading state is active
 * @param {TransitionColor} color - Color theme (default: cyan)
 * @param {string} text - Optional loading text
 *
 * @example
 * <PageTransition isLoading={loading} color="purple" text="Loading..." />
 */
export const PageTransition = ({
  isLoading,
  color = 'cyan',
  text
}: PageTransitionProps) => {
  const colors = {
    cyan: {
      main: '#22d3ee',
      shadow: '0 0 40px #22d3ee, 0 0 80px #22d3ee'
    },
    purple: {
      main: '#a855f7',
      shadow: '0 0 40px #a855f7, 0 0 80px #a855f7'
    },
    pink: {
      main: '#ec4899',
      shadow: '0 0 40px #ec4899, 0 0 80px #ec4899'
    }
  }

  const colorConfig = colors[color]

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Expanding neon circle effect */}
          <motion.div
            className="absolute rounded-full border-4"
            style={{
              borderColor: colorConfig.main,
              boxShadow: colorConfig.shadow
            }}
            initial={{ width: 0, height: 0, opacity: 1 }}
            animate={{
              width: [0, 400, 0],
              height: [0, 400, 0],
              opacity: [1, 0.5, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeOut'
            }}
          />

          {/* Secondary expanding circle (delayed) */}
          <motion.div
            className="absolute rounded-full border-4"
            style={{
              borderColor: colorConfig.main,
              boxShadow: colorConfig.shadow
            }}
            initial={{ width: 0, height: 0, opacity: 1 }}
            animate={{
              width: [0, 400, 0],
              height: [0, 400, 0],
              opacity: [1, 0.5, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeOut',
              delay: 0.75
            }}
          />

          {/* NeonLoader in center */}
          <div className="relative z-10">
            <NeonLoader size="lg" color={color} text={text} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
