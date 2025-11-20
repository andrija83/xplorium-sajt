'use client'

import { useMemo, useState, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { StarParticle } from '@/types'

interface StarfieldProps {
  /** Currently active section (null for main menu) */
  activeView: string | null
}

/**
 * Starfield Component
 *
 * Animated starfield background with base white stars and section-specific colored stars
 *
 * Features:
 * - 100 base white stars with pulsing animation
 * - 50 additional colored stars when entering a section
 * - Color matches section theme:
 *   - cafe = cyan (#22d3ee)
 *   - discover = purple (#a855f7)
 *   - igraonica = pink (#ec4899)
 * - All stars have random positions, sizes, and animation timings
 * - Fixed layer behind all content (z-0)
 * - Pointer events disabled (stars don't block clicks)
 * - PERSISTENCE: Star positions are saved to sessionStorage to remain consistent across reloads
 *
 * Optimized with React.memo and willChange CSS property
 *
 * @param activeView - The currently active section identifier
 */
export const Starfield = memo(({ activeView }: StarfieldProps) => {
  /**
   * stars: Background starfield animation
   * State is used instead of useMemo to allow client-side generation and persistence
   */
  const [stars, setStars] = useState<any[]>([])

  useEffect(() => {
    // Try to get stars from session storage
    const STORAGE_KEY = 'xplorium-starfield-config'

    try {
      const savedStars = sessionStorage.getItem(STORAGE_KEY)

      if (savedStars) {
        setStars(JSON.parse(savedStars))
      } else {
        // Generate new stars if none exist
        const newStars = Array.from({ length: 100 }, (_, i) => ({
          id: i,
          left: Math.random() * 100,
          top: Math.random() * 100,
          size: Math.random() * 2 + .5,
          opacity: Math.random() * 0.3 + 0.7,
          delay: Math.random() * 3,
          duration: Math.random() * 3 + 2,
        }))

        setStars(newStars)
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newStars))
      }
    } catch (e) {
      // Fallback if sessionStorage fails
      const newStars = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 2 + .5,
        opacity: Math.random() * 0.3 + 0.7,
        delay: Math.random() * 3,
        duration: Math.random() * 3 + 2,
      }))
      setStars(newStars)
    }
  }, [])

  /**
   * sectionStars: Colored stars that appear when entering a section
   * - Generated when activeView changes
   * - Color matches the active section
   */
  const [sectionStars, setSectionStars] = useState<Array<StarParticle & { color: string }>>([])

  /**
   * useEffect: Generate colored stars when entering a section
   * - 50 additional stars per section
   * - Color matches section theme
   * - Clears stars when returning to main menu
   */
  useEffect(() => {
    if (activeView) {
      // Determine color based on active section
      const sectionColors = {
        cafe: "#22d3ee",        // Cyan
        discover: "#a855f7",     // Purple
        igraonica: "#ec4899",    // Pink
      }
      const color = sectionColors[activeView as keyof typeof sectionColors] || "#ffffff"

      // Generate 50 new stars with section color
      const newStars = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1000, // Offset ID to avoid conflicts with base stars
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.3 + 0.7,
        delay: Math.random() * 0.5,
        duration: Math.random() * 3 + 2,
        color: color,
      }))
      setSectionStars(newStars)
    } else {
      // Clear section stars when returning to main menu
      setSectionStars([])
    }
  }, [activeView])

  return (
    <motion.div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Base white stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            boxShadow: `0 0 ${star.size * 2}px rgba(255,255,255,${star.opacity * 0.8})`,
            willChange: 'opacity, transform',
          }}
          animate={{
            opacity: [star.opacity * 0.7, star.opacity, star.opacity * 0.7],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Number.POSITIVE_INFINITY,
            delay: star.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Section-specific colored stars */}
      <AnimatePresence>
        {sectionStars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: star.color,
              boxShadow: `0 0 ${star.size * 3}px ${star.color}, 0 0 ${star.size * 6}px ${star.color}`,
              willChange: 'opacity, transform',
            }}
            initial={{
              opacity: 0,
              scale: 0,
              rotate: Math.random() * 360
            }}
            animate={{
              opacity: [0, star.opacity, star.opacity * 0.7, star.opacity],
              scale: [0, 1.5, 1, 1.2, 1],
              rotate: [Math.random() * 360, Math.random() * 360 + 360],
            }}
            exit={{
              opacity: 0,
              scale: 0,
              transition: { duration: 0.5 }
            }}
            transition={{
              duration: star.duration,
              repeat: Number.POSITIVE_INFINITY,
              delay: star.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  )
})

Starfield.displayName = 'Starfield'
