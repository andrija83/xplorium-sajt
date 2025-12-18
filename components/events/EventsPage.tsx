'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import type { Event } from './EventCard'
import { EventCardSkeleton } from '@/components/skeletons'

// Dynamically import EventCard to reduce initial bundle size
const EventCard = dynamic(
  () => import('./EventCard').then(mod => ({ default: mod.EventCard })),
  {
    loading: () => <EventCardSkeleton index={0} />,
    ssr: true, // Keep SSR for SEO
  }
)

interface EventsPageProps {
  events: Event[]
  isLoading?: boolean
}

export const EventsPage = memo(function EventsPage({ events, isLoading = false }: EventsPageProps) {
  return (
    <div className="min-h-screen w-full py-12 px-4 sm:px-6 lg:px-8">
      {/* Page Header with restored animations */}
      <motion.div
        className="relative max-w-7xl mx-auto text-center mb-16"
        layout={false} // Prevent layout animations
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Pulsing title animation restored */}
        <motion.h1
          className="font-bungee-shade text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-6"
          layout={false} // Prevent layout animations
          style={{
            background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            willChange: 'transform',
          }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: [0.34, 1.56, 0.64, 1] // Complex bouncy easing
          }}
        >
          Upcoming Adventures!
        </motion.h1>

        <p className="text-white/80 text-lg sm:text-xl md:text-2xl font-space-mono max-w-2xl mx-auto">
          Collect amazing memories at our special events! ✨
        </p>

        {/* Rotating emoji subtitle restored */}
        <motion.div
          className="mt-4 text-5xl"
          layout={false} // Prevent layout animations
          style={{ willChange: 'transform' }}
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: [0.34, 1.56, 0.64, 1] // Complex bouncy easing
          }}
        >
          🎪🎨🎭
        </motion.div>
      </motion.div>

      {/* Events Grid - Masonry style */}
      {isLoading ? (
        /* Loading State - Skeleton Cards */
        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {[...Array(6)].map((_, index) => (
              <EventCardSkeleton key={index} index={index} />
            ))}
          </div>
        </div>
      ) : events.length > 0 ? (
        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {events.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
            ))}
          </div>
        </div>
      ) : (
        /* Empty state hint (if no events) */
        <div className="text-center py-20">
          <div className="text-8xl mb-6">📅</div>
          <h2 className="font-orbitron text-3xl text-white mb-4">
            No Events Yet!
          </h2>
          <p className="text-white/70 font-space-mono text-lg">
            Check back soon for new adventures! 🚀
          </p>
        </div>
      )}
    </div>
  )
})

EventsPage.displayName = 'EventsPage'
