'use client'

import { memo, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { PlanetOrb } from '@/components/animations'
import { ImageSkeleton } from '@/components/skeletons'
import type { GalleryImage } from '@/types'
import { useNavigationStore } from '@/stores/navigationStore'

/**
 * SensorySection Component
 *
 * Sensory room section with planet orb navigation and subsection galleries
 *
 * Features:
 * - Planet orb navigation (Floor/Wall/Ceiling)
 * - Different sizes, colors, and positions for each planet
 * - Floor planet uses custom image
 * - Subsection galleries with scroll behavior
 * - Smooth animations and transitions
 *
 * Now uses Zustand store for navigation - NO MORE PROP DRILLING! 🎉
 *
 * Optimized with React.memo and memoized constants
 *
 * Navigation Flow:
 * 1. Shows 3 planet orbs
 * 2. Click planet → Shows subsection title + gallery
 * 3. Gallery grid with 6 images
 */
export const SensorySection = memo(() => {
  // Get navigation state directly from Zustand store - no props needed!
  const { sensorySubView, setSensorySubView } = useNavigationStore()

  // Track which images have loaded
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())

  const SENSORY_PLANETS = useMemo(() => [
    {
      label: "Floor",
      section: "floor",
      color: "purple" as const,
      size: "md" as const,
      position: { top: "20%", left: "15%", transform: "translate(-50%, -50%)" },
      image: "/Untitled.jpg",
    },
    {
      label: "Wall",
      section: "wall",
      color: "orange" as const,
      size: "lg" as const,
      position: { top: "50%", right: "10%", transform: "translate(0%, -50%)" },
    },
    {
      label: "Ceiling",
      section: "ceiling",
      color: "pink" as const,
      size: "sm" as const,
      position: { bottom: "15%", left: "50%", transform: "translate(-50%, 0%)" },
    },
  ], [])

  const GALLERY_IMAGES: GalleryImage[] = useMemo(() => [
    { id: 1, query: "sensory room with bubble tubes and fiber optic lights" },
    { id: 2, query: "interactive sensory wall with colorful lights" },
    { id: 3, query: "children playing in sensory room with projection" },
    { id: 4, query: "glowing fiber optic sensory equipment" },
    { id: 5, query: "sensory room bubble tube column" },
    { id: 6, query: "interactive floor projection in sensory room" },
  ], [])
  return (
    <>
      {!sensorySubView ? (
        // Planet Orb Navigation
        <motion.nav
          className="relative w-full max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl aspect-square flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          aria-label="Sensory room navigation"
        >
          {SENSORY_PLANETS.map((planet, index) => (
            <PlanetOrb
              key={planet.section}
              label={planet.label}
              color={planet.color}
              size={planet.size}
              position={planet.position}
              delay={0.3 + index * 0.2}
              onClick={() => setSensorySubView(planet.section)}
              image={planet.image}
            />
          ))}
        </motion.nav>
      ) : (
        // Subsection Gallery View
        <div className="h-[80vh] overflow-y-auto scroll-smooth snap-y snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Title Screen */}
          <motion.div
            className="snap-start min-h-[80vh] flex items-center justify-center px-4 relative bg-transparent"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="text-center bg-transparent">
              <motion.h2
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-4 sm:mb-6 tracking-tight font-orbitron capitalize"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {sensorySubView}
              </motion.h2>
            </div>

            {/* Scroll Indicator */}
            <motion.div
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <motion.p
                className="text-white/60 text-sm font-orbitron"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              >
                Scroll for Gallery
              </motion.p>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              >
                <ChevronDown className="w-6 h-6 text-white/60" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Gallery Screen */}
          <motion.div
            className="snap-start min-h-[80vh] flex flex-col items-center justify-center px-4 pb-12"
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="max-w-4xl mx-auto w-full"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.p
                className="text-white/60 text-base sm:text-lg mb-6 font-orbitron text-center"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              >
                Gallery
              </motion.p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {GALLERY_IMAGES.map((image, i) => {
                  const isLoaded = loadedImages.has(image.id)

                  return (
                    <motion.div
                      key={image.id}
                      className="aspect-square rounded-lg overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 relative"
                      initial={{ opacity: 0, scale: 0.8, y: 30 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.3 }}
                      transition={{
                        duration: 0.6,
                        delay: i * 0.1,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      whileHover={{ scale: 1.05, borderColor: "rgba(255,255,255,0.3)" }}
                    >
                      {/* Show skeleton while image is loading */}
                      {!isLoaded && (
                        <div className="absolute inset-0">
                          <ImageSkeleton index={i} aspectRatio="square" />
                        </div>
                      )}

                      {/* Image with fade-in when loaded */}
                      <img
                        src={`/placeholder.svg?height=400&width=400&query=${encodeURIComponent(image.query)}`}
                        alt={`Sensory ${sensorySubView} ${image.id}`}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                          isLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => {
                          setLoadedImages(prev => new Set(prev).add(image.id))
                        }}
                      />
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </>
  )
})

SensorySection.displayName = 'SensorySection'
