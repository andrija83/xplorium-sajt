'use client'

import { useState, memo, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NEON_COLORS } from '@/constants/animations'
import { BirthdayBookingForm } from './BirthdayBookingForm'
import { PlayRoomBookingForm } from './PlayRoomBookingForm'

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

  // Generate firework particles
  const birthdayFireworks = useMemo(() =>
    Array.from({ length: 3 }, (_, i) => ({
      id: i,
      x: Math.random() * 40 + 5, // 5-45% from left
      y: Math.random() * 50 + 10, // 10-60% from top
      delay: i * 0.4,
      particles: Array.from({ length: 20 }, (_, p) => ({
        angle: (p / 20) * 360,
        distance: Math.random() * 100 + 50
      }))
    }))
    , [])

  const playroomFireworks = useMemo(() =>
    Array.from({ length: 3 }, (_, i) => ({
      id: i,
      x: Math.random() * 40 + 55, // 55-95% from left
      y: Math.random() * 50 + 10, // 10-60% from top
      delay: i * 0.4,
      particles: Array.from({ length: 20 }, (_, p) => ({
        angle: (p / 20) * 360,
        distance: Math.random() * 100 + 50
      }))
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

          {/* Fireworks - Birthday (left side, cyan) */}
          <AnimatePresence>
            {hoveredOption === 'birthday' && birthdayFireworks.map((firework) => (
              <div key={`birthday-firework-${firework.id}`} className="fixed pointer-events-none z-10" style={{ left: `${firework.x}vw`, top: `${firework.y}vh` }}>
                {firework.particles.map((particle, i) => {
                  const rad = (particle.angle * Math.PI) / 180
                  const x = Math.cos(rad) * particle.distance
                  const y = Math.sin(rad) * particle.distance
                  return (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-cyan-400"
                      style={{
                        boxShadow: '0 0 10px #22d3ee, 0 0 20px #22d3ee'
                      }}
                      initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                      animate={{
                        x: x,
                        y: y,
                        opacity: [0, 1, 1, 0],
                        scale: [0, 1.5, 1, 0]
                      }}
                      transition={{
                        duration: 1.5,
                        delay: firework.delay,
                        ease: 'easeOut'
                      }}
                    />
                  )
                })}
              </div>
            ))}
          </AnimatePresence>

          {/* Fireworks - Play Room (right side, pink) */}
          <AnimatePresence>
            {hoveredOption === 'playroom' && playroomFireworks.map((firework) => (
              <div key={`playroom-firework-${firework.id}`} className="fixed pointer-events-none z-10" style={{ left: `${firework.x}vw`, top: `${firework.y}vh` }}>
                {firework.particles.map((particle, i) => {
                  const rad = (particle.angle * Math.PI) / 180
                  const x = Math.cos(rad) * particle.distance
                  const y = Math.sin(rad) * particle.distance
                  return (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-pink-500"
                      style={{
                        boxShadow: '0 0 10px #ec4899, 0 0 20px #ec4899'
                      }}
                      initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                      animate={{
                        x: x,
                        y: y,
                        opacity: [0, 1, 1, 0],
                        scale: [0, 1.5, 1, 0]
                      }}
                      transition={{
                        duration: 1.5,
                        delay: firework.delay,
                        ease: 'easeOut'
                      }}
                    />
                  )
                })}
              </div>
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
      ) : selectedOption === 'birthday' ? (
        // Birthday Booking Form
        <BirthdayBookingForm onBack={() => setSelectedOption(null)} />
      ) : (
        // Play Room Booking Form
        <PlayRoomBookingForm onBack={() => setSelectedOption(null)} />
      )}
    </AnimatePresence>
  )
})

IgraonicaSection.displayName = 'IgraonicaSection'
