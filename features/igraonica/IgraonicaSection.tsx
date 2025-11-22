'use client'

import { useState, memo, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NEON_COLORS } from '@/constants/animations'

/**
 * IgraonicaSection Component
 *
 * Playground section with two main options:
 * - Happy Birthday (cyan neon)
 * - Play Room (pink neon)
 *
 * Features:
 * - Large neon text options side by side
 * - Hover effects with glow intensification
 * - Click to navigate to subsections
 * - Dark starfield background with gradient overlay
 */
export const IgraonicaSection = memo(() => {
  const [selectedOption, setSelectedOption] = useState<'birthday' | 'playroom' | null>(null)
  const [hoveredOption, setHoveredOption] = useState<'birthday' | 'playroom' | null>(null)

  // Neon text shadow for Happy Birthday (cyan)
  const birthdayGlow = {
    default: '0 0 20px #22d3ee, 0 0 40px #22d3ee, 0 0 60px #06b6d4',
    hover: '0 0 30px #22d3ee, 0 0 60px #22d3ee, 0 0 90px #06b6d4, 0 0 120px #06b6d4'
  }

  // Neon text shadow for Play Room (pink)
  const playroomGlow = {
    default: '0 0 20px #ec4899, 0 0 40px #ec4899, 0 0 60px #db2777',
    hover: '0 0 30px #ec4899, 0 0 60px #ec4899, 0 0 90px #db2777, 0 0 120px #db2777'
  }

  // Generate random stars for hover effect
  const birthdayStars = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 50, // 0-50% from left (full left side)
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 0.3,
      duration: Math.random() * 2 + 1
    }))
  , [])

  const playroomStars = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 50 + 50, // 50-100% from left (full right side)
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 0.3,
      duration: Math.random() * 2 + 1
    }))
  , [])

  return (
    <AnimatePresence mode="wait">
      {!selectedOption ? (
        // Main menu with two options
        <>
          {/* Hover stars - Birthday (left side, cyan) - Full viewport */}
          <AnimatePresence mode="popLayout">
            {hoveredOption === 'birthday' && birthdayStars.map((star) => (
              <motion.div
                key={`birthday-star-${star.id}`}
                className="fixed rounded-full bg-cyan-400 pointer-events-none z-0"
                style={{
                  left: `${star.x}vw`,
                  top: `${star.y}vh`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  boxShadow: '0 0 10px #22d3ee, 0 0 20px #22d3ee'
                }}
                initial={{ opacity: 0, scale: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  scale: [0, 1, 1, 0],
                  y: [0, -20, -40, -60]
                }}
                exit={{
                  opacity: 0,
                  scale: 0,
                  transition: { duration: 0.5, delay: 1 }
                }}
                transition={{
                  duration: star.duration,
                  delay: star.delay,
                  repeat: Infinity,
                  ease: 'easeOut'
                }}
              />
            ))}
          </AnimatePresence>

          {/* Hover stars - Play Room (right side, pink) - Full viewport */}
          <AnimatePresence mode="popLayout">
            {hoveredOption === 'playroom' && playroomStars.map((star) => (
              <motion.div
                key={`playroom-star-${star.id}`}
                className="fixed rounded-full bg-pink-500 pointer-events-none z-0"
                style={{
                  left: `${star.x}vw`,
                  top: `${star.y}vh`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  boxShadow: '0 0 10px #ec4899, 0 0 20px #ec4899'
                }}
                initial={{ opacity: 0, scale: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  scale: [0, 1, 1, 0],
                  y: [0, -20, -40, -60]
                }}
                exit={{
                  opacity: 0,
                  scale: 0,
                  transition: { duration: 0.5, delay: 1 }
                }}
                transition={{
                  duration: star.duration,
                  delay: star.delay,
                  repeat: Infinity,
                  ease: 'easeOut'
                }}
              />
            ))}
          </AnimatePresence>

          <motion.div
            key="menu"
            className="w-full min-h-screen flex items-center justify-center relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
              {/* Happy Birthday Option */}
              <motion.button
                onClick={() => setSelectedOption('birthday')}
                onMouseEnter={() => setHoveredOption('birthday')}
                onMouseLeave={() => setHoveredOption(null)}
                className="group relative flex items-center justify-center py-20 md:py-32 outline-none"
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {/* Gradient background overlay */}
                <div
                  className="absolute inset-0 opacity-30 transition-opacity duration-500"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(34, 211, 238, 0.3) 0%, transparent 70%)'
                  }}
                />

                {/* Neon text */}
                <div className="relative z-10">
                  <h2
                    className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-center uppercase tracking-wider"
                    style={{
                      fontFamily: '"Neon Light", Monoton, sans-serif',
                      color: '#22d3ee',
                      textShadow: birthdayGlow.default,
                    }}
                  >
                    <div>HAPPY</div>
                    <div className="mt-2">BIRTHDAY</div>
                  </h2>
                </div>
              </motion.button>

              {/* Play Room Option */}
              <motion.button
                onClick={() => setSelectedOption('playroom')}
                onMouseEnter={() => setHoveredOption('playroom')}
                onMouseLeave={() => setHoveredOption(null)}
                className="group relative flex items-center justify-center py-20 md:py-32 outline-none"
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {/* Gradient background overlay */}
                <div
                  className="absolute inset-0 opacity-30 transition-opacity duration-500"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(236, 72, 153, 0.3) 0%, transparent 70%)'
                  }}
                />

                {/* Neon text */}
                <div className="relative z-10">
                  <h2
                    className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-center uppercase tracking-wider"
                    style={{
                      fontFamily: '"Neon Light", Monoton, sans-serif',
                      color: '#ec4899',
                      textShadow: playroomGlow.default,
                    }}
                  >
                    <div>PLAY</div>
                    <div className="mt-2">ROOM</div>
                  </h2>
                </div>
              </motion.button>
            </div>
          </div>
          </motion.div>
        </>
      ) : (
        // Subsection content (placeholder for now)
        <motion.div
          key={selectedOption}
          className="w-full min-h-screen flex items-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <h2
              className="text-4xl md:text-6xl font-bold mb-8"
              style={{
                color: selectedOption === 'birthday' ? '#22d3ee' : '#ec4899',
                textShadow: selectedOption === 'birthday' ? birthdayGlow.default : playroomGlow.default
              }}
            >
              {selectedOption === 'birthday' ? 'Happy Birthday' : 'Play Room'}
            </h2>
            <p className="text-white/70 text-lg">
              Content coming soon...
            </p>
            <button
              onClick={() => setSelectedOption(null)}
              className="mt-8 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg text-white transition-all"
            >
              Back to Menu
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

IgraonicaSection.displayName = 'IgraonicaSection'
