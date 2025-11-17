'use client'

import { motion } from 'framer-motion'
import type { TextAnimationProps } from '@/types'

/**
 * HandwritingText Component
 *
 * Creates a reveal animation using clipPath (horizontal wipe effect)
 * - inline-block: Makes element behave as inline with block properties
 * - relative: Positioning context for absolute children
 * - px-4 py-2: Padding horizontal 1rem, vertical 0.5rem
 * - clipPath animation: Reveals text from left to right
 *
 * @param text - The text content to animate
 * @param delay - Animation delay in seconds (default: 0)
 */
export const HandwritingText = ({ text, delay = 0 }: TextAnimationProps) => {
  return (
    <motion.span
      className="inline-block relative px-4 py-2"
      initial={{ clipPath: "inset(0% 100% 0% 0%)" }}
      animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
      transition={{
        duration: 3,
        delay: delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <motion.span
        className="inline-block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.5,
          delay: delay,
        }}
      >
        {text}
      </motion.span>
    </motion.span>
  )
}
