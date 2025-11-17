'use client'

import { motion } from 'framer-motion'
import type { TextAnimationProps } from '@/types'

/**
 * HandwritingEffect Component (NOT CURRENTLY USED - ALTERNATIVE OPTION)
 *
 * Character animation with slight drop and rotation
 * - inline: Container spans inline
 * - inline-block: Each word is inline-block
 * - mr-2: Margin-right 0.5rem for word spacing
 * - opacity: 0→1: Fade in
 * - y: 10→0: Slides up from 10px below
 * - rotate: -5°→0°: Slight rotation correction
 * - totalDelay: Calculated for sequential word+character reveal
 *
 * @param text - The text content to animate
 * @param delay - Animation delay in seconds (default: 0)
 */
export const HandwritingEffect = ({ text, delay = 0 }: TextAnimationProps) => {
  const words = text.split(" ")

  return (
    <span className="inline">
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block mr-2">
          {word.split("").map((char, charIndex) => {
            const totalDelay = delay + (wordIndex * word.length + charIndex) * 0.03
            return (
              <motion.span
                key={charIndex}
                className="inline-block"
                initial={{ opacity: 0, y: 10, rotate: -5 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{
                  duration: 0.2,
                  delay: totalDelay,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              >
                {char}
              </motion.span>
            )
          })}
        </span>
      ))}
    </span>
  )
}
