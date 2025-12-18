'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useIsMobile } from '@/hooks/use-mobile'

interface CosmicDustProps {
  count?: number
  density?: 'light' | 'medium' | 'heavy'
}

type ParticleType = 'micro' | 'small' | 'medium' | 'sparkle'
type ParticleColor = 'cyan' | 'purple' | 'pink' | 'white'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  type: ParticleType
  color: ParticleColor
  duration: number
  delay: number
  blur: number
  opacity: number
  drift: number
}

/**
 * CosmicDust Component
 *
 * Creates atmospheric floating dust particles with depth and color variation.
 * Features multiple particle types, subtle color tints, and organic movement.
 *
 * Particle Types:
 * - micro: Tiny dust motes (0.5-1px) - 60% of particles
 * - small: Small dust particles (1-2px) - 25% of particles
 * - medium: Medium particles (2-3px) - 12% of particles
 * - sparkle: Larger glimmers with twinkle effect (3-4px) - 3% of particles
 *
 * @param count - Total number of particles (default: 100, reduced on mobile)
 * @param density - Particle density preset (light: 50, medium: 100, heavy: 150)
 */
export const CosmicDust = ({
  count = 100,
  density = 'medium'
}: CosmicDustProps) => {
  const isMobile = useIsMobile()

  // Density presets (reduced by 50% on mobile for performance)
  const densityMap = {
    light: isMobile ? 25 : 50,
    medium: isMobile ? 50 : 100,
    heavy: isMobile ? 75 : 150
  }

  const particleCount = count || densityMap[density]

  // Generate particles with weighted distribution
  const particles = useMemo<Particle[]>(() => {
    const getParticleType = (random: number): ParticleType => {
      if (random < 0.60) return 'micro'      // 60%
      if (random < 0.85) return 'small'      // 25%
      if (random < 0.97) return 'medium'     // 12%
      return 'sparkle'                        // 3%
    }

    const getParticleColor = (type: ParticleType): ParticleColor => {
      // Sparkles are always white, others have color variation
      if (type === 'sparkle') return 'white'

      const rand = Math.random()
      if (rand < 0.40) return 'white'   // 40% white (neutral)
      if (rand < 0.65) return 'cyan'    // 25% cyan
      if (rand < 0.85) return 'purple'  // 20% purple
      return 'pink'                      // 15% pink
    }

    const getParticleSize = (type: ParticleType): number => {
      switch (type) {
        case 'micro':
          return Math.random() * 0.5 + 0.5  // 0.5-1px
        case 'small':
          return Math.random() * 1 + 1      // 1-2px
        case 'medium':
          return Math.random() * 1 + 2      // 2-3px
        case 'sparkle':
          return Math.random() * 1 + 3      // 3-4px
      }
    }

    return Array.from({ length: particleCount }, (_, i) => {
      const type = getParticleType(Math.random())
      const color = getParticleColor(type)

      return {
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: getParticleSize(type),
        type,
        color,
        duration: Math.random() * 20 + 15,  // 15-35 seconds
        delay: Math.random() * 10,          // 0-10 second delay
        blur: type === 'sparkle' ? 0 : Math.random() * 0.5, // Slight blur for depth
        opacity: type === 'sparkle' ? 0.8 : Math.random() * 0.3 + 0.2, // 0.2-0.5 (sparkles brighter)
        drift: (Math.random() - 0.5) * 80   // -40 to +40 horizontal drift
      }
    })
  }, [particleCount])

  // Color mapping with subtle tints
  const colorMap = {
    white: 'rgba(255, 255, 255, 0.6)',
    cyan: 'rgba(34, 211, 238, 0.7)',
    purple: 'rgba(168, 85, 247, 0.7)',
    pink: 'rgba(236, 72, 153, 0.7)'
  }

  return (
    <div className="fixed inset-0 z-[2] overflow-hidden pointer-events-none">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: colorMap[particle.color],
            filter: particle.blur > 0 ? `blur(${particle.blur}px)` : 'none',
            boxShadow: particle.type === 'sparkle'
              ? `0 0 ${particle.size * 2}px ${colorMap[particle.color]}`
              : 'none'
          }}
          animate={{
            // Vertical float (up and down)
            y: [0, -150, 0],

            // Horizontal drift (organic side-to-side)
            x: [0, particle.drift, 0],

            // Opacity fade (in and out)
            opacity: [0, particle.opacity, 0],

            // Sparkle twinkle effect
            ...(particle.type === 'sparkle' && {
              scale: [1, 1.3, 1],
              filter: [
                `blur(0px) brightness(1)`,
                `blur(0.5px) brightness(1.5)`,
                `blur(0px) brightness(1)`
              ]
            })
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.5, 1]
          }}
        />
      ))}
    </div>
  )
}
