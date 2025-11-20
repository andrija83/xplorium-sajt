'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import type { SizeVariant, ColorVariant } from '@/types'

interface PlanetOrbProps {
  label: string
  color: ColorVariant
  size?: SizeVariant
  position: React.CSSProperties
  delay?: number
  onClick: () => void
  image?: string
}

/**
 * PlanetOrb Component (USED IN SENSORY SECTION)
 *
 * Creates neon ring orbs with glow effects (inspired by planets.jpg)
 * Size classes:
 * - sm: 24-28 (6rem-7rem)
 * - md: 32-40 (8rem-10rem)
 * - lg: 40-48 (10rem-12rem)
 *
 * Features:
 * - Multiple concentric neon rings
 * - Strong outer glow
 * - Semi-transparent glass center
 * - Floating animation (y: 0→-10→0)
 * - Optional image mode (overrides neon effect)
 *
 * Optimized with React.memo to prevent unnecessary re-renders
 *
 * @param label - Display text in the center
 * @param color - Color scheme (yellow, orange, green, blue, purple, pink)
 * @param size - Size variant (sm, md, lg)
 * @param position - CSS positioning object
 * @param delay - Animation delay in seconds
 * @param onClick - Click handler
 * @param image - Optional image URL (disables neon effect)
 */
export const PlanetOrb = memo(({
  label,
  color,
  size = "md",
  position,
  delay = 0,
  onClick,
  image,
}: PlanetOrbProps) => {
  const sizeClasses = {
    sm: "w-24 h-24 sm:w-28 sm:h-28",
    md: "w-32 h-32 sm:w-40 sm:h-40",
    lg: "w-40 h-40 sm:w-48 sm:h-48",
  }

  const neonColors = {
    yellow: { main: "#fbbf24", glow: "rgba(251, 191, 36, 1)", dark: "rgba(251, 191, 36, 0.3)" },
    orange: { main: "#fb923c", glow: "rgba(251, 146, 60, 1)", dark: "rgba(251, 146, 60, 0.3)" },
    green: { main: "#10b981", glow: "rgba(16, 185, 129, 1)", dark: "rgba(16, 185, 129, 0.3)" },
    blue: { main: "#22d3ee", glow: "rgba(34, 211, 238, 1)", dark: "rgba(34, 211, 238, 0.3)" },
    purple: { main: "#a855f7", glow: "rgba(168, 85, 247, 1)", dark: "rgba(168, 85, 247, 0.3)" },
    pink: { main: "#ec4899", glow: "rgba(236, 72, 153, 1)", dark: "rgba(236, 72, 153, 0.3)" },
    cyan: { main: "#22d3ee", glow: "rgba(34, 211, 238, 1)", dark: "rgba(34, 211, 238, 0.3)" },
  }

  const colors = neonColors[color]

  return (
    <motion.button
      className={`absolute ${sizeClasses[size]} rounded-full cursor-pointer group focus:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black transition-shadow`}
      style={position}
      aria-label={`Explore ${label} sensory experience`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 3 + Math.random() * 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        {image ? (
          // Simple image display without glow effects
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            {/* Label text */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <span
                className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-['Great_Vibes'] text-center px-2"
                style={{
                  textShadow: `0 2px 8px rgba(0,0,0,0.8)`,
                }}
              >
                {label}
              </span>
            </div>
          </div>
        ) : (
          // Neon planet with rings and glows
          <>
            {/* Outer massive glow */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                boxShadow: `0 0 40px 15px ${colors.glow}, 0 0 80px 30px ${colors.glow}, 0 0 120px 45px ${colors.dark}`,
                filter: "blur(8px)",
              }}
            />

            {/* Outer ring 1 */}
            <div
              className="absolute inset-0 rounded-full border-[3px]"
              style={{
                borderColor: colors.main,
                boxShadow: `0 0 20px ${colors.glow}, inset 0 0 20px ${colors.dark}`,
              }}
            />

            {/* Outer ring 2 */}
            <div
              className="absolute inset-[6px] rounded-full border-[2px]"
              style={{
                borderColor: colors.main,
                boxShadow: `0 0 15px ${colors.glow}, inset 0 0 15px ${colors.dark}`,
              }}
            />

            {/* Inner ring */}
            <div
              className="absolute inset-[12px] rounded-full border-[2px]"
              style={{
                borderColor: colors.main,
                boxShadow: `0 0 10px ${colors.glow}`,
              }}
            />

            {/* Glass center with radial gradient */}
            <div
              className="absolute inset-[18px] rounded-full overflow-hidden"
              style={{
                background: `radial-gradient(circle at 40% 40%, ${colors.dark}, rgba(0, 0, 0, 0.4) 60%, rgba(0, 0, 0, 0.8))`,
                backdropFilter: "blur(2px)",
              }}
            >
              {/* Subtle light reflection */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6) 0%, transparent 50%)`,
                }}
              />

              {/* Label text */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <span
                  className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-['Great_Vibes'] text-center px-2"
                  style={{
                    textShadow: `0 0 10px ${colors.glow}, 0 0 20px ${colors.glow}, 0 2px 8px rgba(0,0,0,0.8)`,
                  }}
                >
                  {label}
                </span>
              </div>
            </div>

            {/* Hover glow enhancement */}
            <motion.div
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                boxShadow: `0 0 60px 20px ${colors.glow}`,
              }}
            />
          </>
        )}
      </motion.div>
    </motion.button>
  )
})

PlanetOrb.displayName = 'PlanetOrb'
