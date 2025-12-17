'use client'

import { motion } from 'framer-motion'

/**
 * NebulaBackground Component
 *
 * Multi-layered animated cosmic background with nebula clouds and aurora effects.
 * Designed to layer over the existing Starfield component for atmospheric depth.
 *
 * Features:
 * - Three animated nebula cloud layers (cyan, purple, pink)
 * - Slow rotation and scaling for organic movement
 * - Sweeping aurora light effect
 * - Optimized opacity for atmospheric presence without overwhelming
 *
 * @example
 * <NebulaBackground />
 */
export const NebulaBackground = () => {
  return (
    <div className="fixed inset-0 z-[1] overflow-hidden pointer-events-none">
      {/* Nebula Cloud Layer 1 - Purple */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse 800px 600px at 20% 30%,
              rgba(168, 85, 247, 0.45) 0%,
              rgba(168, 85, 247, 0.25) 30%,
              transparent 70%
            )
          `,
          opacity: 0.6
        }}
        animate={{
          scale: [1, 1.15, 1],
          rotate: [0, 8, 0],
          x: [0, 50, 0],
          y: [0, -30, 0]
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: 'easeInOut',
          times: [0, 0.5, 1]
        }}
      />

      {/* Nebula Cloud Layer 2 - Cyan */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse 700px 700px at 80% 70%,
              rgba(34, 211, 238, 0.4) 0%,
              rgba(34, 211, 238, 0.2) 35%,
              transparent 70%
            )
          `,
          opacity: 0.55
        }}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, -10, 0],
          x: [0, -40, 0],
          y: [0, 50, 0]
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: 'easeInOut',
          times: [0, 0.5, 1],
          delay: 5
        }}
      />

      {/* Nebula Cloud Layer 3 - Pink */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse 650px 800px at 50% 50%,
              rgba(236, 72, 153, 0.35) 0%,
              rgba(236, 72, 153, 0.18) 40%,
              transparent 75%
            )
          `,
          opacity: 0.5
        }}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, 0],
          x: [0, 30, 0],
          y: [0, -40, 0]
        }}
        transition={{
          duration: 45,
          repeat: Infinity,
          ease: 'easeInOut',
          times: [0, 0.5, 1],
          delay: 10
        }}
      />

      {/* Aurora Sweep Effect - Horizontal */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              90deg,
              transparent 0%,
              rgba(34, 211, 238, 0.25) 20%,
              rgba(168, 85, 247, 0.3) 40%,
              rgba(236, 72, 153, 0.25) 60%,
              rgba(34, 211, 238, 0.18) 80%,
              transparent 100%
            )
          `,
          opacity: 0.4,
          backgroundSize: '200% 100%'
        }}
        animate={{
          backgroundPosition: ['0% 0%', '200% 0%']
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'linear'
        }}
      />

      {/* Aurora Sweep Effect - Vertical (Subtle) */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              180deg,
              transparent 0%,
              rgba(168, 85, 247, 0.15) 30%,
              rgba(34, 211, 238, 0.18) 50%,
              rgba(168, 85, 247, 0.15) 70%,
              transparent 100%
            )
          `,
          opacity: 0.35,
          backgroundSize: '100% 200%'
        }}
        animate={{
          backgroundPosition: ['0% 0%', '0% 200%']
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'linear',
          delay: 7
        }}
      />

      {/* Cosmic Glow Centers - Adds depth */}
      <motion.div
        className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(34, 211, 238, 0.3) 0%, transparent 70%)',
          opacity: 0.5
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 0.7, 0.5]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      <motion.div
        className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, transparent 70%)',
          opacity: 0.45
        }}
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.45, 0.65, 0.45]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 5
        }}
      />
    </div>
  )
}
