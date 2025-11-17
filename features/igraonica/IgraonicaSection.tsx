'use client'

import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { TypewriterText } from '@/components/animations'
import type { GalleryImage } from '@/types'

const GALLERY_IMAGES: GalleryImage[] = [
  { id: 1, query: "children playing with interactive floor projection" },
  { id: 2, query: "kids enjoying interactive wall games" },
  { id: 3, query: "colorful playground with projection technology" },
  { id: 4, query: "children playing interactive motion games" },
  { id: 5, query: "modern indoor playground with digital games" },
  { id: 6, query: "kids having fun in interactive play area" },
]

/**
 * IgraonicaSection Component
 *
 * Interactive playground section with typewriter description and scroll gallery
 *
 * Features:
 * - TypewriterText animation for description
 * - Scroll indicator with animation
 * - 2x3 or 3x3 grid gallery layout
 * - WhileInView animations for scroll-triggered effects
 * - Snap scroll behavior
 *
 * Layout:
 * - First screen: Title + Description + Scroll indicator
 * - Second screen: Gallery grid (6 images)
 */
export const IgraonicaSection = () => {
  return (
    <div className="h-[80vh] overflow-y-auto scroll-smooth snap-y snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Title & Description Screen */}
      <motion.div
        className="snap-start min-h-[80vh] flex items-center justify-center px-4 relative bg-transparent"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="text-center bg-transparent">
          <motion.h2
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-4 sm:mb-6 tracking-tight font-['Great_Vibes']"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Igraonica
          </motion.h2>
          <motion.p
            className="text-xl sm:text-2xl md:text-3xl text-white/90 leading-relaxed max-w-3xl mx-auto font-['Great_Vibes']"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <TypewriterText
              text="Dobrodošli u interaktivnu igraonicu gde se tehnologija i zabava spajaju! Deca će uživati u igrama sa projekcijom na podu i zidovima."
              delay={0.5}
              speed={30}
            />
          </motion.p>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 8 }}
        >
          <motion.p
            className="text-white/60 text-sm font-['Great_Vibes']"
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
            className="text-white/60 text-base sm:text-lg mb-6 font-['Great_Vibes'] text-center"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            Gallery
          </motion.p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {GALLERY_IMAGES.map((image, i) => (
              <motion.div
                key={image.id}
                className="aspect-square rounded-lg overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10"
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
                <img
                  src={`/placeholder.svg?height=400&width=400&query=${encodeURIComponent(image.query)}`}
                  alt={`Igraonica ${image.id}`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
