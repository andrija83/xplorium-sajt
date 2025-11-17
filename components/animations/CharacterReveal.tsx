'use client'

import { motion } from 'framer-motion'
import type { TextAnimationProps } from '@/types'

/**
 * CharacterReveal Component
 *
 * Smooth character-by-character reveal with slide from left
 * - inline-block: Container for character animations
 * - opacity: 0→1: Fade in effect
 * - x: -10→0: Slide in from left (10px)
 * - delay: Staggered timing for sequential reveal
 * - \u00A0: Non-breaking space for proper spacing
 *
 * @param text - The text content to animate
 * @param delay - Animation delay in seconds (default: 0)
 */
export const CharacterReveal = ({ text, delay = 0 }: TextAnimationProps) => {
  const characters = text.split("")

  return (
    <span className="inline-block">
      {characters.map((char, index) => (
        <motion.span
          key={index}
          className="inline-block"
          style={{ display: char === " " ? "inline" : "inline-block" }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.3,
            delay: delay + index * 0.05,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  )
}
