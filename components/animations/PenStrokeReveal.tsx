'use client'

import { motion } from 'framer-motion'
import type { TextAnimationProps } from '@/types'

/**
 * PenStrokeReveal Component (CURRENTLY USED ON NAVIGATION)
 *
 * Mimics handwriting pen strokes - characters pop in with rotation
 * - inline-block: Container for animated characters
 * - origin-bottom-left: Transform origin point for natural pen stroke
 * - opacity: 0→1: Fade in
 * - scale: 0.3→1: Grows from 30% to 100% size
 * - rotate: -15°→0°: Rotates from tilted to upright
 * - delay + index * 0.20: 0.2s between each character (slower = more dramatic)
 * - ease: Bouncy curve for playful pen landing effect
 *
 * @param text - The text content to animate
 * @param delay - Animation delay in seconds (default: 0)
 */
export const PenStrokeReveal = ({ text, delay = 0 }: TextAnimationProps) => {
  const characters = text.split("")

  return (
    <span className="inline-block">
      {characters.map((char, index) => (
        <motion.span
          key={index}
          className="inline-block origin-bottom-left"
          style={{ display: char === " " ? "inline" : "inline-block" }}
          initial={{ opacity: 0, scale: 0.3, rotate: -15 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{
            duration: 0.4,
            delay: delay + index * 0.20,
            ease: [0.34, 1.56, 0.64, 1],
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  )
}
