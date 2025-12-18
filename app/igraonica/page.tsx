'use client'

import { IgraonicaSection } from '@/features/igraonica/IgraonicaSection'
import { Starfield } from '@/components/common/Starfield'
import { NebulaBackground } from '@/components/backgrounds'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Dynamically import CosmicDust with SSR disabled
const CosmicDust = dynamic(() => import("@/components/effects").then(mod => mod.CosmicDust), {
  ssr: false
})

/**
 * Igraonica (Playground) Route Page
 *
 * Dedicated route for the playground section with:
 * - Typewriter text animation
 * - Playground description and features
 * - Same visual design as main landing page
 */
export default function IgraonicaPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen w-full bg-black overflow-hidden">
      {/* Skip to Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 focus:ring-offset-black"
      >
        Skip to main content
      </a>

      {/* Starfield Background */}
      <Starfield activeView="igraonica" />

      {/* Nebula Background */}
      <NebulaBackground />

      {/* Cosmic Dust Particles */}
      <CosmicDust density="medium" />

      {/* Back Button */}
      <AnimatePresence>
        <motion.button
          onClick={() => router.push('/')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              router.push('/')
            }
          }}
          aria-label="Go back to main menu"
          tabIndex={0}
          className="fixed top-6 left-6 sm:top-8 sm:left-8 z-50 p-3 sm:p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full text-white transition-all duration-300 flex items-center gap-2 focus:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
          <span className="text-sm font-light hidden sm:inline">Back</span>
        </motion.button>
      </AnimatePresence>

      {/* Main Content */}
      <div className="min-h-screen w-full flex items-center justify-center relative">
        <div
          id="main-content"
          className="relative z-10 flex flex-col items-center justify-center px-4 w-full min-h-[600px] sm:min-h-[700px] md:min-h-[800px]"
          role="main"
          style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 800px' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <IgraonicaSection />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
