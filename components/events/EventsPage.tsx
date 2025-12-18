'use client'

import { motion } from 'framer-motion'
import { EventCard, type Event } from './EventCard'

interface EventsPageProps {
  events: Event[]
}

export function EventsPage({ events }: EventsPageProps) {
  return (
    <div className="min-h-screen w-full py-12 px-4 sm:px-6 lg:px-8">
      {/* Page Header with restored animations */}
      <motion.div
        className="relative max-w-7xl mx-auto text-center mb-16"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Pulsing title animation restored */}
        <motion.h1
          className="font-bungee-shade text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-6"
          style={{
            background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
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
      {events.length > 0 ? (
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
}
