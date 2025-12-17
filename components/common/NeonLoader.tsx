import { motion } from 'framer-motion'

type LoaderColor = 'cyan' | 'purple' | 'pink'

interface NeonLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  color?: LoaderColor
  text?: string
}

/**
 * NeonLoader Component
 *
 * Advanced loading indicator with neon glow effects and orbiting particles.
 * Features:
 * - Rotating outer ring with neon glow
 * - Pulsing inner circle
 * - Orbiting particle effects
 * - Section-aware colors
 *
 * @param {string} size - Size of loader: sm (40px), md (80px), lg (120px)
 * @param {LoaderColor} color - Color theme (default: cyan)
 * @param {string} text - Optional loading text
 *
 * @example
 * <NeonLoader size="md" color="purple" text="Loading..." />
 */
export const NeonLoader = ({
  size = 'md',
  color = 'cyan',
  text
}: NeonLoaderProps) => {
  // Size configuration
  const sizeConfig = {
    sm: { container: 40, ring: 40, inner: 16, particle: 8, orbit: 20 },
    md: { container: 80, ring: 80, inner: 32, particle: 8, orbit: 40 },
    lg: { container: 120, ring: 120, inner: 48, particle: 12, orbit: 60 }
  }

  const config = sizeConfig[size]

  // Color configuration
  const colors = {
    cyan: {
      main: '#22d3ee',
      shadow: '0 0 20px #22d3ee, 0 0 40px #22d3ee'
    },
    purple: {
      main: '#a855f7',
      shadow: '0 0 20px #a855f7, 0 0 40px #a855f7'
    },
    pink: {
      main: '#ec4899',
      shadow: '0 0 20px #ec4899, 0 0 40px #ec4899'
    }
  }

  const colorConfig = colors[color]

  // Orbiting particles configuration
  const particles = [0, 120, 240] // 3 particles at 120° intervals

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Loader container */}
      <div
        className="relative"
        style={{
          width: config.container,
          height: config.container
        }}
      >
        {/* Outer rotating ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-transparent"
          style={{
            borderTopColor: colorConfig.main,
            borderRightColor: colorConfig.main,
            boxShadow: colorConfig.shadow
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear'
          }}
        />

        {/* Inner pulsing circle */}
        <motion.div
          className="absolute rounded-full"
          style={{
            backgroundColor: colorConfig.main,
            width: config.inner,
            height: config.inner,
            left: `calc(50% - ${config.inner / 2}px)`,
            top: `calc(50% - ${config.inner / 2}px)`
          }}
          animate={{
            scale: [0.8, 1, 0.8],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

        {/* Orbiting particles */}
        {particles.map((angle, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              backgroundColor: colorConfig.main,
              width: config.particle,
              height: config.particle,
              left: `calc(50% - ${config.particle / 2}px)`,
              top: `calc(50% - ${config.particle / 2}px)`,
              boxShadow: `0 0 10px ${colorConfig.main}`
            }}
            animate={{
              rotate: [angle, angle + 360],
              x: [
                0,
                config.orbit * Math.cos((angle * Math.PI) / 180),
                0
              ],
              y: [
                0,
                config.orbit * Math.sin((angle * Math.PI) / 180),
                0
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0.2
            }}
          />
        ))}
      </div>

      {/* Loading text */}
      {text && (
        <motion.p
          className="font-orbitron text-sm tracking-wider uppercase"
          style={{ color: colorConfig.main }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}
