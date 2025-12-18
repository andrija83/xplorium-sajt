'use client'

import { useMemo, memo } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Users, MapPin, Ticket } from 'lucide-react'
import { format } from 'date-fns'
import type { EventCategory } from '@prisma/client'

export interface Event {
  id: string
  slug: string
  title: string
  description: string
  date: Date
  time: string
  endTime: string | null
  image: string | null
  category: EventCategory
  capacity: number | null
  registeredCount: number
  price: number | null
  currency: string
  location: string | null
  tags: string[]
  theme: 'WINTER' | 'CHRISTMAS' | 'HALLOWEEN' | 'EASTER' | 'SUMMER' | 'SPACE' | 'UNICORN' | 'DINOSAUR' | 'DEFAULT' | null
}

interface EventCardProps {
  event: Event
  index: number
}

type VisualTheme = 'winter' | 'christmas' | 'halloween' | 'easter' | 'summer' | 'space' | 'unicorn' | 'dinosaur' | 'default'

/**
 * Determine visual theme based on tags and category
 * Tags take priority, then falls back to category-based mapping
 */
function getVisualTheme(event: Event): VisualTheme {
  const tags = event.tags.map(tag => tag.toLowerCase())

  // Check tags first for specific themes
  if (tags.some(tag => tag.includes('winter') || tag.includes('snow'))) return 'winter'
  if (tags.some(tag => tag.includes('christmas') || tag.includes('xmas'))) return 'christmas'
  if (tags.some(tag => tag.includes('halloween') || tag.includes('spooky'))) return 'halloween'
  if (tags.some(tag => tag.includes('easter') || tag.includes('spring'))) return 'easter'
  if (tags.some(tag => tag.includes('summer') || tag.includes('beach'))) return 'summer'
  if (tags.some(tag => tag.includes('space') || tag.includes('astronaut'))) return 'space'
  if (tags.some(tag => tag.includes('unicorn') || tag.includes('rainbow'))) return 'unicorn'
  if (tags.some(tag => tag.includes('dinosaur') || tag.includes('prehistoric'))) return 'dinosaur'

  // Fallback to category-based mapping
  switch (event.category) {
    case 'WORKSHOP':
    case 'CLASS':
      return 'space' // Educational/learning theme
    case 'PARTY':
      return 'unicorn' // Fun/magical theme
    case 'HOLIDAY': {
      // Try to detect from title/description
      const text = (event.title + ' ' + event.description).toLowerCase()
      if (text.includes('christmas')) return 'christmas'
      if (text.includes('halloween')) return 'halloween'
      if (text.includes('easter')) return 'easter'
      return 'default'
    }
    case 'SEASONAL':
      return 'summer'
    case 'TOURNAMENT':
      return 'dinosaur' // Competitive/adventure theme
    default:
      return 'default'
  }
}

/**
 * Extract age range from tags or provide default
 */
function getAgeRange(event: Event): string {
  const ageTag = event.tags.find(tag =>
    tag.toLowerCase().includes('ages') ||
    tag.toLowerCase().includes('age')
  )

  if (ageTag) return ageTag

  // Default age ranges based on category
  switch (event.category) {
    case 'WORKSHOP':
    case 'CLASS':
      return 'Ages 5-12'
    case 'PARTY':
      return 'Ages 3-10'
    default:
      return 'All Ages'
  }
}

// Theme configurations with unique visual identities
const eventThemes = {
  winter: {
    gradient: 'from-blue-400 via-cyan-300 to-blue-200',
    borderColor: 'border-blue-300',
    glowColor: 'rgba(147, 197, 253, 0.5)',
    emoji: '❄️',
    decorations: ['❄️', '⛄', '🌨️', '❄️', '⭐'],
    particleColor: '#93C5FD',
    textColor: 'text-blue-900',
    buttonBg: 'bg-blue-500 hover:bg-blue-600',
    shadowColor: '0 0 30px rgba(59, 130, 246, 0.6)',
  },
  christmas: {
    gradient: 'from-red-500 via-green-400 to-red-400',
    borderColor: 'border-red-400',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    emoji: '🎄',
    decorations: ['🎄', '🎁', '⭐', '🔔', '🎅'],
    particleColor: '#F87171',
    textColor: 'text-red-900',
    buttonBg: 'bg-red-600 hover:bg-red-700',
    shadowColor: '0 0 30px rgba(239, 68, 68, 0.6)',
  },
  halloween: {
    gradient: 'from-orange-500 via-purple-500 to-orange-400',
    borderColor: 'border-orange-400',
    glowColor: 'rgba(251, 146, 60, 0.5)',
    emoji: '🎃',
    decorations: ['🎃', '👻', '🦇', '🍬', '🕷️'],
    particleColor: '#FB923C',
    textColor: 'text-orange-900',
    buttonBg: 'bg-orange-600 hover:bg-orange-700',
    shadowColor: '0 0 30px rgba(251, 146, 60, 0.6)',
  },
  easter: {
    gradient: 'from-pink-300 via-yellow-200 to-purple-300',
    borderColor: 'border-pink-300',
    glowColor: 'rgba(244, 114, 182, 0.5)',
    emoji: '🐰',
    decorations: ['🐰', '🥚', '🌸', '🐣', '🌷'],
    particleColor: '#F9A8D4',
    textColor: 'text-pink-900',
    buttonBg: 'bg-pink-500 hover:bg-pink-600',
    shadowColor: '0 0 30px rgba(244, 114, 182, 0.6)',
  },
  summer: {
    gradient: 'from-yellow-400 via-orange-300 to-cyan-400',
    borderColor: 'border-yellow-400',
    glowColor: 'rgba(250, 204, 21, 0.5)',
    emoji: '☀️',
    decorations: ['☀️', '🏖️', '🌊', '🍉', '🏄'],
    particleColor: '#FBBF24',
    textColor: 'text-yellow-900',
    buttonBg: 'bg-yellow-500 hover:bg-yellow-600',
    shadowColor: '0 0 30px rgba(250, 204, 21, 0.6)',
  },
  space: {
    gradient: 'from-indigo-600 via-purple-500 to-blue-600',
    borderColor: 'border-indigo-400',
    glowColor: 'rgba(129, 140, 248, 0.5)',
    emoji: '🚀',
    decorations: ['🚀', '🌟', '🪐', '👽', '🛸'],
    particleColor: '#818CF8',
    textColor: 'text-indigo-100',
    buttonBg: 'bg-indigo-600 hover:bg-indigo-700',
    shadowColor: '0 0 30px rgba(129, 140, 248, 0.6)',
  },
  unicorn: {
    gradient: 'from-pink-400 via-purple-400 to-blue-400',
    borderColor: 'border-pink-400',
    glowColor: 'rgba(244, 114, 182, 0.5)',
    emoji: '🦄',
    decorations: ['🦄', '🌈', '✨', '💖', '🎀'],
    particleColor: '#F472B6',
    textColor: 'text-pink-900',
    buttonBg: 'bg-pink-500 hover:bg-pink-600',
    shadowColor: '0 0 30px rgba(244, 114, 182, 0.6)',
  },
  dinosaur: {
    gradient: 'from-green-600 via-lime-500 to-green-500',
    borderColor: 'border-green-500',
    glowColor: 'rgba(34, 197, 94, 0.5)',
    emoji: '🦕',
    decorations: ['🦕', '🦖', '🌴', '🥚', '🌋'],
    particleColor: '#22C55E',
    textColor: 'text-green-900',
    buttonBg: 'bg-green-600 hover:bg-green-700',
    shadowColor: '0 0 30px rgba(34, 197, 94, 0.6)',
  },
  default: {
    gradient: 'from-purple-500 via-pink-500 to-purple-400',
    borderColor: 'border-purple-400',
    glowColor: 'rgba(168, 85, 247, 0.5)',
    emoji: '🎉',
    decorations: ['🎉', '🎊', '✨', '🎈', '🎁'],
    particleColor: '#A855F7',
    textColor: 'text-purple-900',
    buttonBg: 'bg-purple-600 hover:bg-purple-700',
    shadowColor: '0 0 30px rgba(168, 85, 247, 0.6)',
  },
}

export const EventCard = memo(function EventCard({ event, index }: EventCardProps) {
  // Use manually selected theme if available, otherwise auto-detect
  const visualTheme = event.theme ? event.theme.toLowerCase() as VisualTheme : getVisualTheme(event)
  const theme = eventThemes[visualTheme]
  const ageRange = getAgeRange(event)
  const isFull = event.capacity ? event.registeredCount >= event.capacity : false
  const _spotsLeft = event.capacity ? event.capacity - event.registeredCount : null

  // Slight rotation for sticker effect
  const rotation = (index % 3 - 1) * 2 // -2, 0, or 2 degrees (reduced)

  // Memoize particle configurations to prevent recalculation on every render
  const particles = useMemo(() => {
    const count = 6 // Reduced from 8-15 to 6 for performance
    return Array.from({ length: count }, (_, i) => ({
      id: `${event.id}-particle-${i}`,
      left: Math.random() * 100,
      startY: Math.random() * 20 - 10, // -10% to 10%
      endX: (Math.random() - 0.5) * 40,
      duration: 3 + Math.random() * 2,
      delay: (i / count) * 2, // Stagger based on index instead of random
      rotateEnd: Math.random() * 360,
      scaleMax: 0.8 + Math.random() * 0.4,
    }))
  }, [event.id]) // Only recalculate when event changes

  return (
    <motion.div
      className="relative"
      layout={false} // Prevent layout animations
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1], // Smoother easing
      }}
      whileHover={{
        scale: 1.03,
        transition: { duration: 0.2 },
      }}
      style={{ rotate: rotation, willChange: 'transform, opacity' }}
    >
      {/* Main card with sticker-like border */}
      <motion.div
        className={`relative overflow-hidden rounded-2xl border-4 ${theme.borderColor} bg-white`}
        layout={false} // Prevent layout animations
        style={{
          boxShadow: theme.shadowColor,
          willChange: 'box-shadow',
        }}
        whileHover={{
          boxShadow: `${theme.shadowColor}, 0 0 50px ${theme.glowColor}`,
        }}
      >
        {/* Gradient header with theme emoji and optimized animations */}
        <div className={`relative h-32 bg-gradient-to-br ${theme.gradient} p-6 flex items-center justify-center overflow-hidden`}>
          {/* Optimized theme-specific animations - using memoized particles */}
          {particles.map((particle, i) => {
            // Get emoji based on theme and particle index
            let emoji = theme.emoji
            if (visualTheme === 'winter') emoji = '❄️'
            else if (visualTheme === 'christmas') emoji = i % 2 === 0 ? '⭐' : '❄️'
            else if (visualTheme === 'halloween') emoji = i % 3 === 0 ? '👻' : i % 3 === 1 ? '🦇' : '🕷️'
            else if (visualTheme === 'easter') emoji = i % 3 === 0 ? '🌸' : i % 3 === 1 ? '🥚' : '🐣'
            else if (visualTheme === 'summer') emoji = i % 2 === 0 ? '☀️' : '🌊'
            else if (visualTheme === 'space') emoji = i % 4 === 0 ? '⭐' : i % 4 === 1 ? '✨' : i % 4 === 2 ? '🌟' : '💫'
            else if (visualTheme === 'unicorn') emoji = i % 3 === 0 ? '✨' : i % 3 === 1 ? '💖' : '🌈'
            else if (visualTheme === 'dinosaur') emoji = i % 2 === 0 ? '🍃' : '🌿'
            else emoji = theme.decorations[i % theme.decorations.length]

            // Determine if particle floats up or falls down
            const floatsUp = ['halloween', 'easter', 'summer', 'unicorn'].includes(visualTheme)
            const startPos = floatsUp ? 'bottom' : 'top'
            const yStart = floatsUp ? '0%' : `${particle.startY}%`
            const yEnd = floatsUp ? '-150%' : '150%'

            return (
              <motion.div
                key={particle.id}
                className="absolute text-lg will-change-transform"
                layout={false} // Prevent layout animations
                style={{
                  left: `${particle.left}%`,
                  [startPos]: '-10%',
                  willChange: 'transform, opacity',
                }}
                initial={{ opacity: 0 }}
                animate={{
                  y: [yStart, yEnd],
                  x: [0, particle.endX],
                  rotate: [0, particle.rotateEnd],
                  opacity: [0, 0.6, 0],
                  scale: [0.8, particle.scaleMax, 0.8],
                }}
                transition={{
                  duration: particle.duration,
                  delay: particle.delay,
                  repeat: Infinity,
                  ease: 'linear',
                  times: [0, 0.5, 1],
                }}
              >
                {emoji}
              </motion.div>
            )
          })}

          {/* Large theme emoji - stays on top */}
          <div className="relative z-10 text-6xl filter drop-shadow-lg">
            {theme.emoji}
          </div>
        </div>

        {/* Card content */}
        <div className="p-6">
          {/* Event title */}
          <h3 className={`font-bungee-shade text-2xl mb-3 ${theme.textColor} leading-tight`}>
            {event.title}
          </h3>

          {/* Date, time, age */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="w-4 h-4" />
              <span className="font-space-mono text-sm">
                {format(event.date, 'EEEE, MMM d, yyyy')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-4 h-4" />
              <span className="font-space-mono text-sm">
                {event.time}
                {event.endTime && ` - ${event.endTime}`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Users className="w-4 h-4" />
              <span className="font-space-mono text-sm">{ageRange}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="w-4 h-4" />
                <span className="font-space-mono text-sm">{event.location}</span>
              </div>
            )}
            {event.price && (
              <div className="flex items-center gap-2 text-gray-700">
                <Ticket className="w-4 h-4" />
                <span className="font-space-mono text-sm font-bold">
                  {event.price} {event.currency}
                </span>
              </div>
            )}
            {event.capacity && (
              <div className="flex items-center gap-2 text-gray-700">
                <Users className="w-4 h-4" />
                <span className="font-space-mono text-sm">
                  {isFull ? (
                    <span className="text-red-600 font-bold">FULL</span>
                  ) : (
                    `${event.registeredCount}/${event.capacity} spots taken`
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 font-space-mono text-sm leading-relaxed mb-4">
            {event.description}
          </p>

          {/* Register button */}
          <motion.button
            className={`w-full ${isFull ? 'bg-gray-400 cursor-not-allowed' : theme.buttonBg} text-white font-orbitron font-bold py-3 px-6 rounded-xl transition-all duration-300`}
            whileHover={isFull ? {} : { scale: 1.05 }}
            whileTap={isFull ? {} : { scale: 0.95 }}
            disabled={isFull}
          >
            {isFull ? 'Event Full ✖️' : `Register Now! 🎫${event.price ? ` • ${event.price} ${event.currency}` : ''}`}
          </motion.button>
        </div>

      </motion.div>
    </motion.div>
  )
})

EventCard.displayName = 'EventCard'
