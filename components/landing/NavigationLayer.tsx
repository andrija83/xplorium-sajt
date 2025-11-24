'use client'

import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { PenStrokeReveal } from '@/components/animations'
import {
  ANIMATION_TIMING,
  PARTICLE_COLORS,
} from '@/constants/animations'

interface NavigationLayerProps {
  showBrand: boolean
  onNavigate: (section: string) => void
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
}

/**
 * NavigationLayer Component
 *
 * Displays the main navigation menu after brand reveal:
 * - Xplorium brand with liquid morph animation
 * - Three navigation buttons (Cafe, Sensory, Igraonica) with neon effects
 * - Positioned around the brand logo
 *
 * Optimized with React.memo to prevent unnecessary re-renders
 */
export const NavigationLayer = memo(function NavigationLayer({
  showBrand,
  onNavigate,
  liquidDripConfig,
}: NavigationLayerProps) {
  // Navigation tabs configuration
  const tabs = useMemo(() => [
    {
      label: "Cafe",
      section: "cafe",
      position: { top: "25%", left: "10%", transform: "translateY(-50%)" },
    },
    {
      label: "Sensory",
      section: "discover",
      position: { top: "25%", right: "10%", transform: "translateY(-50%)" },
    },
    {
      label: "Igraonica",
      section: "igraonica",
      position: { bottom: "15%", left: "50%", transform: "translateX(-50%)" },
    },
  ], [])

  if (!showBrand) return null

  return (
    <motion.div
      key="brand"
      className="relative w-full max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl aspect-square flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {/* Brand Logo + Tagline (Center) */}
      <motion.div
        className="absolute flex flex-col items-center gap-2 sm:gap-3 z-20"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* "Xplorium" branding with X logo */}
        <div className="flex items-center">
          {/* X logo - spins back from 180° to 0° */}
          <motion.div
            initial={{ rotate: 180, scale: 0.4 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="-mr-2 sm:-mr-3 md:-mr-4"
          >
            <div className="rounded-2xl overflow-hidden">
              <img
                src="/crystal-x-logo.jpg"
                alt="X Logo"
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28"
              />
            </div>
          </motion.div>

          {/* "plorium" text with liquid morph animation */}
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light text-white tracking-tight relative overflow-visible"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {"plorium".split("").map((char, index) => {
              return (
                <span key={index} className="relative inline-block">
                  {/* Letter with liquid morph animation */}
                  <motion.span
                    className="inline-block relative"
                    initial={{
                      opacity: 0,
                      scaleY: 0,
                      scaleX: 1.5,
                      y: -50,
                      filter: "blur(20px)",
                    }}
                    animate={{
                      opacity: 1,
                      scaleY: 1,
                      scaleX: 1,
                      y: 0,
                      filter: "blur(0px)",
                    }}
                    transition={{
                      duration: ANIMATION_TIMING.LIQUID_MORPH_DURATION,
                      delay: ANIMATION_TIMING.LIQUID_MORPH_BASE_DELAY + index * ANIMATION_TIMING.LIQUID_MORPH_LETTER_DELAY,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    {/* Colored layers for liquid effect */}
                    <motion.span
                      className="absolute inset-0 text-cyan-400"
                      initial={{ x: -3, y: -3, opacity: 0 }}
                      animate={{ x: 0, y: 0, opacity: 0.3 }}
                      transition={{
                        duration: 0.6,
                        delay: 0.4 + index * 0.1,
                      }}
                    >
                      {char}
                    </motion.span>
                    <motion.span
                      className="absolute inset-0 text-purple-400"
                      initial={{ x: 3, y: 3, opacity: 0 }}
                      animate={{ x: 0, y: 0, opacity: 0.3 }}
                      transition={{
                        duration: 0.6,
                        delay: 0.4 + index * 0.1 + 0.05,
                      }}
                    >
                      {char}
                    </motion.span>
                    <motion.span
                      className="relative z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.4 + index * 0.1 + 0.2,
                      }}
                    >
                      {char}
                    </motion.span>
                  </motion.span>

                  {/* Liquid drip particles */}
                  {liquidDripConfig[index]?.drips.map((dripConfig) => {
                    const dripColor = PARTICLE_COLORS.LIQUID_DRIP[dripConfig.colorIndex]

                    return (
                      <motion.div
                        key={`drip-${index}-${dripConfig.id}`}
                        className={`absolute ${dripColor} rounded-full blur-sm pointer-events-none`}
                        style={{
                          left: "50%",
                          top: "0%",
                          width: `${dripConfig.width}px`,
                          height: `${dripConfig.height}px`,
                        }}
                        initial={{
                          x: dripConfig.xOffset,
                          y: -30,
                          opacity: 0,
                          scaleY: 0.5,
                        }}
                        animate={{
                          x: dripConfig.xOffset,
                          y: 100,
                          opacity: [0, 0.8, 0],
                          scaleY: [0.5, 2, 0.2],
                        }}
                        transition={{
                          duration: ANIMATION_TIMING.LIQUID_MORPH_DRIP_DURATION,
                          delay: ANIMATION_TIMING.LIQUID_MORPH_BASE_DELAY + index * ANIMATION_TIMING.LIQUID_MORPH_LETTER_DELAY + dripConfig.id * ANIMATION_TIMING.LIQUID_MORPH_DRIP_DELAY,
                          ease: [0.4, 0, 0.6, 1],
                        }}
                      />
                    )
                  })}
                </span>
              )
            })}
          </motion.h1>
        </div>

        {/* Tagline */}
        <motion.p
          className="text-white/70 text-xs sm:text-sm md:text-base font-light tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Explore the Extraordinary
        </motion.p>
      </motion.div>

      {/* Navigation Menu with Neon Effects */}
      <nav aria-label="Main navigation">
        {tabs.map((tab, index) => {
          // Neon color definitions for each section
          const neonColors = {
            cafe: { main: "#22d3ee", glow: "0 0 10px #22d3ee, 0 0 20px #22d3ee, 0 0 30px #22d3ee, 0 0 40px #06b6d4", focusRing: "focus-visible:ring-cyan-400" },
            discover: { main: "#a855f7", glow: "0 0 10px #a855f7, 0 0 20px #a855f7, 0 0 30px #a855f7, 0 0 40px #7c3aed", focusRing: "focus-visible:ring-purple-400" },
            igraonica: { main: "#ec4899", glow: "0 0 10px #ec4899, 0 0 20px #ec4899, 0 0 30px #ec4899, 0 0 40px #db2777", focusRing: "focus-visible:ring-pink-400" },
          }
          const color = neonColors[tab.section as keyof typeof neonColors]

          return (
            <motion.button
              key={tab.section}
              aria-label={`Navigate to ${tab.label} section`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onNavigate(tab.section)
                }
              }}
              className={`absolute text-4xl sm:text-5xl md:text-6xl lg:text-7xl cursor-pointer z-10 px-6 py-6 leading-relaxed font-['Great_Vibes'] focus:outline-none focus-visible:ring-4 ${color.focusRing} focus-visible:ring-offset-4 focus-visible:ring-offset-black rounded-lg transition-shadow`}
              style={{
                ...tab.position,
                color: color.main,
                textShadow: color.glow,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.8 + index * 0.15 }}
              whileHover={{
                textShadow: color.glow.replace(/40px/g, "80px").replace(/30px/g, "60px").replace(/20px/g, "40px").replace(/10px/g, "20px"),
              }}
              onClick={() => onNavigate(tab.section)}
            >
              <PenStrokeReveal text={tab.label} delay={0.8 + index * 0.15} />
            </motion.button>
          )
        })}
      </nav>
    </motion.div>
  )
})

NavigationLayer.displayName = 'NavigationLayer'
