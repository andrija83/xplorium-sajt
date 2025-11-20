'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import {
  ANIMATION_TIMING,
  ANIMATION_EASING,
  PARTICLE_COLORS,
  STYLE_CONSTANTS,
} from '@/constants/animations'

interface HeroShellProps {
  isAnimating: boolean
  showBrand: boolean
  prefersReducedMotion: boolean
  starburstParticles: Array<{
    id: number
    angle: number
    distance: number
    size: number
    colorIndex: number
  }>
  liquidDripConfig: Array<{
    letterIndex: number
    drips: Array<{
      id: number
      xOffset: number
      width: number
      height: number
      colorIndex: number
    }>
  }>
  onXClick: () => void
}

/**
 * HeroShell Component
 *
 * The initial state of the landing page featuring:
 * - X logo with click animation
 * - Starburst explosion effect on click
 * - Brand reveal (Xplorium) with liquid morph animation
 *
 * This component handles the first visual experience users see
 * Optimized with React.memo to prevent unnecessary re-renders
 */
export const HeroShell = memo(function HeroShell({
  isAnimating,
  showBrand,
  prefersReducedMotion,
  starburstParticles,
  liquidDripConfig,
  onXClick,
}: HeroShellProps) {
  if (showBrand) return null

  return (
    <motion.button
      key="x-button"
      onClick={onXClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onXClick()
        }
      }}
      className="cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400 focus-visible:ring-offset-4 focus-visible:ring-offset-black rounded-3xl group relative transition-shadow"
      whileHover={!isAnimating ? { scale: 1.05 } : {}}
      whileTap={!isAnimating ? { scale: 0.95 } : {}}
      aria-label="Click to open Xplorium main menu"
      aria-pressed={isAnimating}
      tabIndex={0}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: 1,
        scale: isAnimating ? 0.4 : 1,
        rotate: isAnimating ? 180 : 0,
      }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {/* Starburst Explosion - Light Rays */}
      {isAnimating && !prefersReducedMotion && Array.from({ length: ANIMATION_TIMING.STARBURST_LIGHT_RAY_COUNT }, (_, i) => {
        const angle = (i * 360) / ANIMATION_TIMING.STARBURST_LIGHT_RAY_COUNT
        const color = PARTICLE_COLORS.STARBURST_GRADIENTS[i % PARTICLE_COLORS.STARBURST_GRADIENTS.length]

        return (
          <motion.div
            key={`starburst-${i}`}
            className={`absolute w-1 bg-gradient-to-r ${color} rounded-full`}
            style={{
              ...STYLE_CONSTANTS.CENTER_POSITION,
              transformOrigin: "0 50%",
              rotate: `${angle}deg`,
              height: "2px",
              willChange: "transform, opacity",
            }}
            initial={{
              width: 0,
              opacity: 0,
              x: 0,
            }}
            animate={{
              width: [0, ANIMATION_TIMING.STARBURST_LIGHT_RAY_MIN_WIDTH, ANIMATION_TIMING.STARBURST_LIGHT_RAY_MAX_WIDTH],
              opacity: [0, 1, 0],
              x: [0, 0, 0],
            }}
            transition={{
              duration: ANIMATION_TIMING.STARBURST_DURATION,
              ease: ANIMATION_EASING.EASE_OUT,
              delay: i * ANIMATION_TIMING.STARBURST_LIGHT_RAY_DELAY,
            }}
          />
        )
      })}

      {/* Starburst Explosion - Star Particles */}
      {isAnimating && !prefersReducedMotion && starburstParticles.map((particle, i) => {
        const color = PARTICLE_COLORS.STARBURST[particle.colorIndex]

        return (
          <motion.div
            key={`star-${particle.id}`}
            className={`absolute ${color} rounded-full`}
            style={{
              ...STYLE_CONSTANTS.CENTER_POSITION,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              marginLeft: "-2px",
              marginTop: "-2px",
              boxShadow: STYLE_CONSTANTS.PARTICLE_BASE_SHADOW,
              willChange: "transform, opacity",
            }}
            initial={{
              x: 0,
              y: 0,
              scale: 0,
              opacity: 0,
            }}
            animate={{
              x: Math.cos((particle.angle * Math.PI) / 180) * particle.distance,
              y: Math.sin((particle.angle * Math.PI) / 180) * particle.distance,
              scale: [0, 1.5, 0],
              opacity: [0, 1, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: ANIMATION_TIMING.STARBURST_DURATION + 0.1,
              ease: ANIMATION_EASING.EASE_OUT,
              delay: i * ANIMATION_TIMING.STARBURST_STAR_DELAY,
            }}
          />
        )
      })}

      {/* X Logo Image */}
      <div className="rounded-3xl overflow-hidden relative z-10">
        <img
          src="/crystal-x-logo.jpg"
          alt="X Logo"
          className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 group-hover:brightness-125 transition-all duration-300"
        />
      </div>
    </motion.button>
  )
})

HeroShell.displayName = 'HeroShell'
